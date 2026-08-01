import { type Database } from '@viralscopes/db';
import type { FastifyBaseLogger } from 'fastify';
import type Stripe from 'stripe';

import { auditLog } from '../lib/audit-log.js';
import type { BillingProvider } from '../lib/billing-provider.js';
import {
  findBillingEventByProviderEventId,
  findOrgWithOwnerEmail,
  findSubscriptionByProviderSubscriptionId,
  recordBillingEvent,
  updateOrganizationPlan,
  upsertInvoiceForOrg,
  upsertSubscriptionForOrg,
} from '../repositories/billing.repository.js';
import { createDeadLetterJob } from '../repositories/dead-letter.repository.js';

const PROVIDER = 'stripe';

// Events the approved architecture defines
// (docs/architecture/billing/06-webhook-design.md) -- exactly these six.
// Trial lifecycle events (trial started/ending/ended) are deliberately NOT
// implemented: Pricing_Strategy.md §5.3 and 07-subscription-lifecycle.md
// both state there is no trial in MVP, and "only implement events that
// exist in the approved architecture, do not invent additional events"
// applies here as much as anywhere else -- adding trial handlers would be
// exactly that. "Subscription created"/"subscription renewed" aren't
// separate Stripe events either: activation happens via
// checkout.session.completed (below), and renewal is invoice.paid firing
// again for the same subscription.
type HandledEventType =
  | 'checkout.session.completed'
  | 'customer.created'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

const HANDLED_EVENT_TYPES: ReadonlySet<string> = new Set<HandledEventType>([
  'checkout.session.completed',
  'customer.created',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export class SignatureVerificationError extends Error {}

export class WebhookService {
  constructor(
    private readonly db: Database,
    private readonly provider: BillingProvider,
    private readonly logger: FastifyBaseLogger,
  ) {}

  /**
   * Verifies the signature, checks idempotency, and dispatches to the
   * matching handler. Only ever throws SignatureVerificationError (the one
   * case the route must answer with 400, per Failure Handling in
   * 06-webhook-design.md) -- every other failure is caught internally,
   * recorded, and swallowed, because Stripe must always receive 200 for a
   * signature-valid event or it will retry unnecessarily for up to 72h.
   */
  async processEvent(rawBody: Buffer, signature: string | undefined): Promise<void> {
    if (!signature) {
      throw new SignatureVerificationError('Missing Stripe-Signature header.');
    }

    let event: Stripe.Event;
    try {
      event = this.provider.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      throw new SignatureVerificationError(
        err instanceof Error ? err.message : 'Webhook signature verification failed.',
      );
    }

    // Idempotency (docs/reviews/billing/02-consistency-review.md's
    // consolidated decision): a single durable table, checked before any
    // processing. Stripe's own 5-minute replay window (enforced inside
    // constructWebhookEvent) is layer one; this is the layer that survives
    // a legitimate retry days later.
    //
    // Only 'processed'/'skipped' are terminal, already-handled outcomes.
    // A 'failed' row must NOT short-circuit here (Milestone 6 hardening,
    // found during the reliability review): since this route always
    // answers Stripe 200 regardless of internal outcome, a processing
    // failure never gets a real Stripe-driven retry -- the only way a
    // failed event is ever reprocessed is a manual dead-letter replay or a
    // future automated retry, and both must be allowed to actually run the
    // handler again, not be silently swallowed as "already seen."
    const existing = await findBillingEventByProviderEventId(this.db, PROVIDER, event.id);
    if (existing && existing.status !== 'failed') {
      this.logger.info(
        { eventId: event.id, eventType: event.type },
        'Duplicate webhook event — skipping',
      );
      return;
    }

    if (!HANDLED_EVENT_TYPES.has(event.type)) {
      this.logger.info(
        { eventId: event.id, eventType: event.type },
        'Unhandled webhook event type — no action',
      );
      await recordBillingEvent(this.db, {
        provider: PROVIDER,
        providerEventId: event.id,
        eventType: event.type,
        orgId: null,
        subscriptionId: null,
        status: 'skipped',
        rawPayload: event,
      });
      return;
    }

    try {
      await this.dispatch(event);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing webhook.';
      this.logger.error(
        { eventId: event.id, eventType: event.type, err },
        'Webhook processing failed',
      );
      await recordBillingEvent(this.db, {
        provider: PROVIDER,
        providerEventId: event.id,
        eventType: event.type,
        orgId: null,
        subscriptionId: null,
        status: 'failed',
        errorMessage,
        rawPayload: event,
      });
      await createDeadLetterJob(this.db, {
        workflowName: `stripe-webhook:${event.type}`,
        originalPayload: event as unknown as Record<string, unknown>,
        errorMessage,
        retryAttempts: 0,
      });
    }
  }

  private async dispatch(event: Stripe.Event): Promise<void> {
    switch (event.type as HandledEventType) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event);
      case 'customer.created':
        return this.handleCustomerCreated(event);
      case 'invoice.paid':
        return this.handleInvoicePaid(event);
      case 'invoice.payment_failed':
        return this.handleInvoicePaymentFailed(event);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event);
      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event);
    }
  }

  private async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.client_reference_id ?? (session.metadata?.org_id as string | undefined);

    if (!orgId) {
      await this.skipUnresolvedOrg(event);
      return;
    }

    const org = await findOrgWithOwnerEmail(this.db, orgId);
    if (!org) {
      await this.skipUnresolvedOrg(event, orgId);
      return;
    }

    const tenant = { orgId: org.id, userId: org.ownerId };
    const plan = (session.metadata?.plan as string | undefined) ?? 'free';
    const billingCycle = (session.metadata?.billing_cycle as string | undefined) ?? 'monthly';
    const providerCustomerId =
      typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null);
    const providerSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription?.id ?? null);

    const subscription = await upsertSubscriptionForOrg(this.db, tenant, {
      plan,
      status: 'active',
      billingProvider: PROVIDER,
      billingCycle,
      providerCustomerId,
      providerSubscriptionId,
      checkoutSessionId: session.id,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
      canceledAt: null,
    });
    await updateOrganizationPlan(this.db, org.id, plan);

    await auditLog(this.db, tenant, {
      userId: null,
      action: 'billing.subscription.created',
      resourceType: 'subscription',
      resourceId: subscription.id,
      metadata: { stripeEventId: event.id, plan, billingCycle },
    });
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: org.id,
      subscriptionId: subscription.id,
      status: 'processed',
      rawPayload: event,
    });
  }

  // Stripe always creates (or reuses) a Customer for a subscription-mode
  // Checkout Session, but that auto-created Customer object carries no
  // metadata of its own -- only the Subscription object does (via
  // subscription_data.metadata). There is therefore no reliable way to
  // resolve org_id from a bare customer.created payload for a brand-new
  // customer, and nothing to look up either (no subscriptions row can
  // reference this customer yet -- checkout.session.completed is what
  // writes provider_customer_id, in the same transaction as everything
  // else). This is recorded for audit purposes only, with no org
  // attribution -- a deliberate scope decision found while implementing,
  // not an oversight.
  private async handleCustomerCreated(event: Stripe.Event): Promise<void> {
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: null,
      subscriptionId: null,
      status: 'skipped',
      rawPayload: event,
    });
  }

  private async handleInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const orgId = await this.resolveOrgIdForInvoice(invoice);
    if (!orgId) {
      await this.skipUnresolvedOrg(event);
      return;
    }

    const org = await findOrgWithOwnerEmail(this.db, orgId);
    if (!org) {
      await this.skipUnresolvedOrg(event, orgId);
      return;
    }
    const tenant = { orgId: org.id, userId: org.ownerId };

    const existingSubscription = await findSubscriptionByProviderSubscriptionId(
      this.db,
      tenant,
      this.invoiceSubscriptionId(invoice) ?? '',
    );

    const savedInvoice = await upsertInvoiceForOrg(this.db, tenant, {
      subscriptionId: existingSubscription?.id ?? null,
      providerInvoiceId: invoice.id ?? `${event.id}-no-invoice-id`,
      amountCents: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      paidAt: new Date(),
      hostedUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null,
    });

    if (existingSubscription) {
      const periods = this.invoicePeriod(invoice);
      await upsertSubscriptionForOrg(this.db, tenant, {
        plan: existingSubscription.plan,
        status: 'active',
        billingProvider: existingSubscription.billingProvider,
        billingCycle: existingSubscription.billingCycle,
        providerCustomerId: existingSubscription.providerCustomerId,
        providerSubscriptionId: existingSubscription.providerSubscriptionId,
        checkoutSessionId: existingSubscription.checkoutSessionId,
        currentPeriodStart: periods?.start ?? existingSubscription.currentPeriodStart,
        currentPeriodEnd: periods?.end ?? existingSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: existingSubscription.cancelAtPeriodEnd,
        // Grace period clearance: a prior invoice.payment_failed may have
        // set this; a successful payment always clears it.
        gracePeriodEndsAt: null,
        canceledAt: existingSubscription.canceledAt,
      });
      // Quota-counter reset on renewal (docs/architecture/billing/06-webhook-design.md's
      // "Quota reset on renewal") is deferred to Milestone 5: there is no
      // Redis quota-counter key to reset yet (checkQuota/emit don't exist
      // until Feature Enforcement is built), so there is nothing to do here
      // yet -- not a bug, a real ordering dependency on unbuilt Milestone 5
      // infrastructure.
    }

    await auditLog(this.db, tenant, {
      userId: null,
      action: 'billing.invoice.paid',
      resourceType: 'invoice',
      resourceId: savedInvoice.id,
      metadata: {
        stripeEventId: event.id,
        amountCents: invoice.amount_paid,
        currency: invoice.currency,
      },
    });
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: org.id,
      subscriptionId: existingSubscription?.id ?? null,
      status: 'processed',
      rawPayload: event,
    });
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const orgId = await this.resolveOrgIdForInvoice(invoice);
    if (!orgId) {
      await this.skipUnresolvedOrg(event);
      return;
    }

    const org = await findOrgWithOwnerEmail(this.db, orgId);
    if (!org) {
      await this.skipUnresolvedOrg(event, orgId);
      return;
    }
    const tenant = { orgId: org.id, userId: org.ownerId };

    const existingSubscription = await findSubscriptionByProviderSubscriptionId(
      this.db,
      tenant,
      this.invoiceSubscriptionId(invoice) ?? '',
    );

    const savedInvoice = await upsertInvoiceForOrg(this.db, tenant, {
      subscriptionId: existingSubscription?.id ?? null,
      providerInvoiceId: invoice.id ?? `${event.id}-no-invoice-id`,
      amountCents: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      paidAt: null,
      hostedUrl: invoice.hosted_invoice_url ?? null,
      pdfUrl: invoice.invoice_pdf ?? null,
    });

    if (existingSubscription) {
      if (existingSubscription.gracePeriodEndsAt) {
        // Grace period already active -- Stripe's own Smart Retries can
        // fire invoice.payment_failed more than once per invoice; only the
        // first sets the grace period.
        await recordBillingEvent(this.db, {
          provider: PROVIDER,
          providerEventId: event.id,
          eventType: event.type,
          orgId: org.id,
          subscriptionId: existingSubscription.id,
          status: 'skipped',
          rawPayload: event,
        });
        return;
      }

      const gracePeriodEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await upsertSubscriptionForOrg(this.db, tenant, {
        plan: existingSubscription.plan,
        status: existingSubscription.status,
        billingProvider: existingSubscription.billingProvider,
        billingCycle: existingSubscription.billingCycle,
        providerCustomerId: existingSubscription.providerCustomerId,
        providerSubscriptionId: existingSubscription.providerSubscriptionId,
        checkoutSessionId: existingSubscription.checkoutSessionId,
        currentPeriodStart: existingSubscription.currentPeriodStart,
        currentPeriodEnd: existingSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: existingSubscription.cancelAtPeriodEnd,
        gracePeriodEndsAt,
        canceledAt: existingSubscription.canceledAt,
      });

      await auditLog(this.db, tenant, {
        userId: null,
        action: 'billing.subscription.grace_period_started',
        resourceType: 'subscription',
        resourceId: existingSubscription.id,
        metadata: { stripeEventId: event.id, gracePeriodEndsAt: gracePeriodEndsAt.toISOString() },
      });
    }

    // Payment-failed email is explicitly out of Milestone 3's scope
    // ("Do NOT implement: email notifications") -- deferred, not dropped.

    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: org.id,
      subscriptionId: existingSubscription?.id ?? savedInvoice.subscriptionId,
      status: 'processed',
      rawPayload: event,
    });
  }

  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const orgId = subscription.metadata?.org_id;
    if (!orgId) {
      await this.skipUnresolvedOrg(event);
      return;
    }

    const org = await findOrgWithOwnerEmail(this.db, orgId);
    if (!org) {
      await this.skipUnresolvedOrg(event, orgId);
      return;
    }
    const tenant = { orgId: org.id, userId: org.ownerId };

    const existing = await findSubscriptionByProviderSubscriptionId(
      this.db,
      tenant,
      subscription.id,
    );
    const plan = subscription.metadata?.plan ?? existing?.plan ?? 'free';
    const periods = this.subscriptionPeriod(subscription);

    const updated = await upsertSubscriptionForOrg(this.db, tenant, {
      plan,
      status: subscription.status,
      billingProvider: PROVIDER,
      billingCycle: subscription.metadata?.billing_cycle ?? existing?.billingCycle ?? 'monthly',
      providerCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id,
      providerSubscriptionId: subscription.id,
      checkoutSessionId: existing?.checkoutSessionId ?? null,
      currentPeriodStart: periods?.start ?? existing?.currentPeriodStart ?? null,
      currentPeriodEnd: periods?.end ?? existing?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      gracePeriodEndsAt: existing?.gracePeriodEndsAt ?? null,
      canceledAt: subscription.status === 'canceled' ? new Date() : (existing?.canceledAt ?? null),
    });

    // Always sync organizations.plan to the subscription's *effective*
    // state -- not only when the plan text changed, and unconditional on
    // `existing` (Milestone 6 hardening: found this was a real
    // quota-bypass path, not just a theoretical one). Stripe's
    // subscription.status can transition to a terminal state (canceled,
    // unpaid, incomplete_expired, paused) via customer.subscription.updated
    // without the plan metadata field itself changing -- the previous
    // `if (existing && existing.plan !== plan)` guard meant
    // organizations.plan stayed stuck at the old paid tier in that case,
    // and getEnforcedPlanTier's fallback path (findActiveSubscriptionForOrg
    // excludes any non-'active'/'trialing' status) would then read that
    // stale value indefinitely. `past_due` is deliberately excluded from
    // this terminal set: the grace period it represents is enforced live
    // by getEnforcedPlanTier's own grace_period_ends_at check, and
    // organizations.plan must stay at the paid tier for the duration of
    // that grace period per "org retains current plan features" (see
    // 07-subscription-lifecycle.md's Grace Period Gating section).
    const TERMINAL_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired', 'paused']);
    const effectivePlan = TERMINAL_STATUSES.has(subscription.status) ? 'free' : plan;
    await updateOrganizationPlan(this.db, org.id, effectivePlan);

    await auditLog(this.db, tenant, {
      userId: null,
      action: subscription.cancel_at_period_end
        ? 'billing.subscription.downgraded'
        : 'billing.subscription.updated',
      resourceType: 'subscription',
      resourceId: updated.id,
      metadata: {
        stripeEventId: event.id,
        plan,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: org.id,
      subscriptionId: updated.id,
      status: 'processed',
      rawPayload: event,
    });
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const orgId = subscription.metadata?.org_id;
    if (!orgId) {
      await this.skipUnresolvedOrg(event);
      return;
    }

    const org = await findOrgWithOwnerEmail(this.db, orgId);
    if (!org) {
      await this.skipUnresolvedOrg(event, orgId);
      return;
    }
    const tenant = { orgId: org.id, userId: org.ownerId };

    const existing = await findSubscriptionByProviderSubscriptionId(
      this.db,
      tenant,
      subscription.id,
    );

    const updated = await upsertSubscriptionForOrg(this.db, tenant, {
      plan: 'free',
      status: 'canceled',
      billingProvider: PROVIDER,
      billingCycle: existing?.billingCycle ?? 'monthly',
      // provider_customer_id is kept (a returning customer re-subscribes
      // against the same Stripe Customer); provider_subscription_id is
      // cleared -- this specific subscription object no longer exists.
      providerCustomerId: existing?.providerCustomerId ?? null,
      providerSubscriptionId: null,
      checkoutSessionId: existing?.checkoutSessionId ?? null,
      currentPeriodStart: existing?.currentPeriodStart ?? null,
      currentPeriodEnd: existing?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: false,
      gracePeriodEndsAt: null,
      canceledAt: new Date(),
    });
    await updateOrganizationPlan(this.db, org.id, 'free');

    // No cancellation email here -- Stripe already sends its own, per
    // 06-webhook-design.md, and email sends are out of Milestone 3's scope
    // regardless.

    await auditLog(this.db, tenant, {
      userId: null,
      action: 'billing.subscription.canceled',
      resourceType: 'subscription',
      resourceId: updated.id,
      metadata: { stripeEventId: event.id },
    });
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: org.id,
      subscriptionId: updated.id,
      status: 'processed',
      rawPayload: event,
    });
  }

  private async skipUnresolvedOrg(event: Stripe.Event, orgId?: string): Promise<void> {
    this.logger.warn(
      { eventId: event.id, eventType: event.type, orgId },
      'Webhook event could not be attributed to an organisation — skipping',
    );
    await recordBillingEvent(this.db, {
      provider: PROVIDER,
      providerEventId: event.id,
      eventType: event.type,
      orgId: orgId ?? null,
      subscriptionId: null,
      status: 'skipped',
      rawPayload: event,
    });
  }

  private async resolveOrgIdForInvoice(invoice: Stripe.Invoice): Promise<string | undefined> {
    const directMetadataOrgId = (
      invoice as unknown as { subscription_details?: { metadata?: Record<string, string> } }
    ).subscription_details?.metadata?.org_id;
    if (directMetadataOrgId) return directMetadataOrgId;

    const subscriptionId = this.invoiceSubscriptionId(invoice);
    if (!subscriptionId) return undefined;

    const metadata = await this.provider.getSubscriptionMetadata(subscriptionId);
    return metadata.org_id;
  }

  private invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
    const raw = (invoice as unknown as { subscription?: string | { id: string } | null })
      .subscription;
    if (!raw) return undefined;
    return typeof raw === 'string' ? raw : raw.id;
  }

  private invoicePeriod(invoice: Stripe.Invoice): { start: Date; end: Date } | undefined {
    const line = invoice.lines?.data?.[0];
    if (!line?.period) return undefined;
    return {
      start: new Date(line.period.start * 1000),
      end: new Date(line.period.end * 1000),
    };
  }

  private subscriptionPeriod(
    subscription: Stripe.Subscription,
  ): { start: Date; end: Date } | undefined {
    const item = subscription.items.data[0];
    if (!item?.current_period_start || !item.current_period_end) return undefined;
    return {
      start: new Date(item.current_period_start * 1000),
      end: new Date(item.current_period_end * 1000),
    };
  }
}
