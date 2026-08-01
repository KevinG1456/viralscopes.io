import Stripe from 'stripe';

// Provider abstraction (Phase 9, architecture requirement 1 / PROJECT_RULES.md
// P10, "dependency on interfaces, not implementations"). Business logic
// (billing.service.ts) depends only on this interface, never on the `stripe`
// package directly -- swapping providers (Paddle, per Pricing_Strategy.md's
// documented v1.5 plan) means writing a new class here, not touching
// business logic or routes.
export interface CreateCheckoutSessionParams {
  orgId: string;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  priceId: string;
  customerEmail: string;
  existingProviderCustomerId: string | null;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface CreatePortalSessionParams {
  providerCustomerId: string;
  returnUrl: string;
}

export interface PortalSessionResult {
  portalUrl: string;
}

export interface BillingProvider {
  readonly name: string;
  createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult>;
  createPortalSession(params: CreatePortalSessionParams): Promise<PortalSessionResult>;
  /** Verifies the webhook signature and parses the raw body into a typed event. Throws on an invalid signature. */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event;
  /**
   * Fallback org_id resolution for invoice webhook events. Subscription
   * objects always carry `metadata.org_id` (stamped at creation via
   * `subscription_data.metadata` -- see createCheckoutSession above), but an
   * Invoice event's own payload does not reliably mirror that metadata
   * across every Stripe API version. Rather than depend on an
   * under-documented invoice field, this makes one live lookup of the
   * subscription's own metadata directly.
   */
  getSubscriptionMetadata(providerSubscriptionId: string): Promise<Record<string, string>>;
}

export class StripeBillingProvider implements BillingProvider {
  readonly name = 'stripe';

  constructor(
    private readonly client: Stripe,
    private readonly webhookSecret: string,
  ) {}

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResult> {
    // client_reference_id + metadata.org_id on both the Checkout Session AND
    // (via subscription_data) the Subscription object it creates: every
    // subsequent webhook event for this subscription then carries org_id
    // directly in its own payload. This is what lets billing.repository.ts's
    // writes go through withTenant() normally -- the webhook handler never
    // needs to look a provider id up in the database before it knows which
    // org the event belongs to (see billing.repository.ts's design note).
    const session = await this.client.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: params.orgId,
      customer: params.existingProviderCustomerId ?? undefined,
      customer_email: params.existingProviderCustomerId ? undefined : params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      subscription_data: {
        metadata: { org_id: params.orgId, plan: params.plan, billing_cycle: params.billingCycle },
      },
      metadata: { org_id: params.orgId, plan: params.plan, billing_cycle: params.billingCycle },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout Session URL.');
    }

    return { checkoutSessionId: session.id, checkoutUrl: session.url };
  }

  async createPortalSession(params: CreatePortalSessionParams): Promise<PortalSessionResult> {
    const session = await this.client.billingPortal.sessions.create({
      customer: params.providerCustomerId,
      return_url: params.returnUrl,
    });
    return { portalUrl: session.url };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    // Stripe computes the HMAC over the raw body bytes -- this must never be
    // called with a JSON-parsed-and-re-serialised body (key ordering could
    // differ and the signature would fail). See webhook.routes.ts, which
    // registers a raw-buffer content-type parser specifically for this route.
    return this.client.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  async getSubscriptionMetadata(providerSubscriptionId: string): Promise<Record<string, string>> {
    const subscription = await this.client.subscriptions.retrieve(providerSubscriptionId);
    return subscription.metadata;
  }
}

/**
 * Returns null when Stripe isn't configured (no `STRIPE_SECRET_KEY` /
 * `STRIPE_WEBHOOK_SECRET` in this environment) -- the same optional-until-
 * configured pattern already used for OAuth providers (config.ts). Callers
 * must handle the null case explicitly (503, not a crash at boot) rather
 * than assume a provider always exists.
 */
// Milestone 6 hardening: the Stripe SDK's own default timeout (80s) is far
// longer than any reasonable synchronous HTTP request should block for --
// a slow/hanging Stripe API call would otherwise tie up a request (and a
// connection-pool slot) for up to 80 seconds. 15s matches the general
// order of magnitude already used elsewhere in this codebase for an
// external-call timeout (lib/queue.ts's n8n dispatch: 25s). Automatic
// SDK-level retries are deliberately left at the SDK default (off) rather
// than enabled here: retrying a non-idempotent POST like
// checkout.sessions.create() without an Idempotency-Key risks creating a
// duplicate Checkout Session on a lost response -- enabling retries safely
// needs idempotency keys added first, which is a separate, larger change.
const STRIPE_CLIENT_TIMEOUT_MS = 15_000;

export function createBillingProvider(
  secretKey: string | null,
  webhookSecret: string | null,
): BillingProvider | null {
  if (!secretKey || !webhookSecret) return null;
  const client = new Stripe(secretKey, { timeout: STRIPE_CLIENT_TIMEOUT_MS });
  return new StripeBillingProvider(client, webhookSecret);
}
