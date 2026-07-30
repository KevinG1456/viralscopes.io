import { type Database, type TenantContext } from '@viralscopes/db';
import {
  PLAN_HIERARCHY,
  PLAN_LIMITS,
  PLANS,
  type PlanLimits,
  type PlanTier,
  SELF_SERVE_CHECKOUT_PLANS,
} from '@viralscopes/shared';

import type { BillingProvider } from '../lib/billing-provider.js';
import { AppError } from '../lib/errors.js';
import {
  findActiveSubscriptionForOrg,
  findOrgWithOwnerEmail,
} from '../repositories/billing.repository.js';

export interface CurrentPlanSummary {
  plan: PlanTier;
  status: string;
  billingProvider: string;
  billingCycle: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
}

export interface PlanAndLimits {
  plan: PlanTier;
  limits: PlanLimits;
}

export interface CreateCheckoutSessionInput {
  plan: string;
  billingCycle: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface CreatePortalSessionInput {
  returnUrl: string;
}

export interface PortalSessionResponse {
  portalUrl: string;
}

// Business logic only -- no direct Stripe SDK usage anywhere in this class
// (architecture requirement 1, "keep provider-specific logic isolated behind
// a billing service"). All provider calls go through the BillingProvider
// interface (apps/api/src/lib/billing-provider.ts), injected here exactly
// like EmailService is injected into AuthService -- swappable, testable in
// isolation with a mock.
export class BillingService {
  constructor(
    private readonly db: Database,
    private readonly billingProvider: BillingProvider | null,
    private readonly stripePriceIds: Record<string, string | undefined>,
  ) {}

  // Read-only; no provider call, safe against the "no payment processing
  // yet" boundary Milestone 1 is scoped to. Q2 (docs/architecture/billing/
  // 14-open-questions.md) is resolved by existing behaviour, not a new
  // branch here: organizations.plan already defaults to 'free' with no
  // subscriptions row required, so a free org with no row correctly falls
  // through to the synthesized default below.
  async getCurrentPlanSummary(
    tenant: TenantContext,
    planTier: string | null,
  ): Promise<CurrentPlanSummary> {
    const subscription = await findActiveSubscriptionForOrg(this.db, tenant);

    if (!subscription) {
      return {
        plan: (planTier as PlanTier) ?? 'free',
        status: 'active',
        billingProvider: 'manual',
        billingCycle: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        gracePeriodEndsAt: null,
      };
    }

    return {
      plan: subscription.plan as PlanTier,
      status: subscription.status,
      billingProvider: subscription.billingProvider,
      billingCycle: subscription.billingCycle,
      currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      gracePeriodEndsAt: subscription.gracePeriodEndsAt?.toISOString() ?? null,
    };
  }

  // Resolves a plan+cycle to a real Stripe Price ID from configuration
  // (never hard-coded -- staging/production use different Stripe accounts).
  // Exposed now so Milestone 2's checkout implementation and its tests have
  // a single, already-reviewed place to resolve prices from.
  resolvePriceId(plan: string, billingCycle: 'monthly' | 'annual'): string {
    if (!this.isSelfServeCheckoutPlan(plan)) {
      throw new AppError(
        'ENTERPRISE_CUSTOM_ONLY',
        'Enterprise plans are quote-only. Contact sales to subscribe.',
        422,
      );
    }
    const definition = PLANS[plan as PlanTier];
    const envVarName =
      billingCycle === 'monthly'
        ? definition.stripePriceIdMonthlyEnvVar
        : definition.stripePriceIdAnnualEnvVar;
    const priceId = envVarName ? this.stripePriceIds[envVarName] : undefined;
    if (!priceId) {
      throw new AppError(
        'STRIPE_ERROR',
        `No Stripe Price ID configured for plan "${plan}" (${billingCycle}).`,
        502,
      );
    }
    return priceId;
  }

  isSelfServeCheckoutPlan(plan: string): plan is (typeof SELF_SERVE_CHECKOUT_PLANS)[number] {
    return (SELF_SERVE_CHECKOUT_PLANS as readonly string[]).includes(plan);
  }

  isUpgrade(currentPlan: PlanTier, requestedPlan: PlanTier): boolean {
    return PLAN_HIERARCHY[requestedPlan] > PLAN_HIERARCHY[currentPlan];
  }

  private requireProvider(): BillingProvider {
    if (!this.billingProvider) {
      throw new AppError(
        'STRIPE_ERROR',
        'Billing is not configured in this environment (STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET unset).',
        503,
      );
    }
    return this.billingProvider;
  }

  // Read-only, JWT-derived (no DB call): planTier is display-only outside
  // enforcement paths (docs/architecture/billing/02-system-architecture.md's
  // Option A decision -- Redis/DB is authoritative for enforcement, the JWT
  // is a hint elsewhere). Covers "Get current plan" and "Get feature limits"
  // together -- there is nothing more to compute than a constant lookup.
  getPlanAndLimits(planTier: string | null): PlanAndLimits {
    const plan = (planTier as PlanTier) ?? 'free';
    return { plan, limits: PLAN_LIMITS[plan] };
  }

  // Milestone 2. Validates organisation, plan, and upgrade-vs-current-plan
  // server-side before ever calling the provider -- every validation error
  // below is reachable and correctly reported even with no Stripe key
  // configured in this environment, since requireProvider() is deliberately
  // the LAST check, not the first.
  async createCheckoutSession(
    tenant: TenantContext,
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResponse> {
    if (!this.isSelfServeCheckoutPlan(input.plan)) {
      throw new AppError(
        input.plan === 'enterprise' ? 'ENTERPRISE_CUSTOM_ONLY' : 'INVALID_PLAN_TRANSITION',
        input.plan === 'enterprise'
          ? 'Enterprise plans are quote-only. Contact sales to subscribe.'
          : `"${input.plan}" is not a valid self-serve plan.`,
        422,
      );
    }

    // Validate organisation: re-confirmed against the database, not just
    // trusted from the JWT -- catches an org soft-deleted after the token
    // was issued (requireOrgContext only checks the JWT carries an orgId
    // at all, not that the org still exists).
    const org = await findOrgWithOwnerEmail(this.db, tenant.orgId);
    if (!org) {
      throw new AppError('NO_ORGANIZATION', 'Organisation not found.', 404);
    }

    const activeSubscription = await findActiveSubscriptionForOrg(this.db, tenant);
    const currentPlan = (activeSubscription?.plan as PlanTier | undefined) ?? 'free';

    // Prevent duplicate active subscriptions: a real (non-free), currently
    // paying subscription cannot check out into the same plan or a
    // downgrade -- that's the Customer Portal's job (Milestone 3+), not
    // checkout. The one-subscription-rule itself is additionally enforced
    // at the database level (uq_subscriptions_org_active).
    const hasRealPaidSubscription =
      !!activeSubscription &&
      ['active', 'trialing', 'past_due'].includes(activeSubscription.status);
    if (hasRealPaidSubscription && !this.isUpgrade(currentPlan, input.plan as PlanTier)) {
      throw new AppError(
        'INVALID_PLAN_TRANSITION',
        `Your organisation already has an active "${currentPlan}" subscription. Checkout only accepts upgrades; use the billing portal to change or cancel.`,
        422,
      );
    }

    const priceId = this.resolvePriceId(input.plan, input.billingCycle);
    const provider = this.requireProvider();

    // Reuse the existing Stripe Customer if this org already has one
    // (avoids creating a duplicate Customer object on a repeat checkout);
    // otherwise Stripe creates one lazily from customer_email during
    // Checkout itself (Customer objects are never pre-created at org
    // creation time -- see docs/architecture/billing/03-domain-model.md).
    const result = await provider.createCheckoutSession({
      orgId: tenant.orgId,
      plan: input.plan,
      billingCycle: input.billingCycle,
      priceId,
      customerEmail: org.ownerEmail,
      existingProviderCustomerId: activeSubscription?.providerCustomerId ?? null,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });

    // checkoutSessionId is deliberately not returned to the client (no
    // provider IDs leave the server) and deliberately not persisted here --
    // Stripe's own checkout.session.completed webhook (Milestone 3) is the
    // only source of truth for "the subscription actually started," per
    // "never trust the return URL alone."
    return { checkoutUrl: result.checkoutUrl };
  }

  // Milestone 2. Portal access requires an existing Stripe Customer -- an
  // org that has never subscribed has nothing to manage.
  async createPortalSession(
    tenant: TenantContext,
    input: CreatePortalSessionInput,
  ): Promise<PortalSessionResponse> {
    const activeSubscription = await findActiveSubscriptionForOrg(this.db, tenant);
    const providerCustomerId = activeSubscription?.providerCustomerId;
    if (!providerCustomerId) {
      throw new AppError(
        'NO_BILLING_ACCOUNT',
        'This organisation has never subscribed. Start a checkout first.',
        402,
      );
    }

    const provider = this.requireProvider();
    const result = await provider.createPortalSession({
      providerCustomerId,
      returnUrl: input.returnUrl,
    });
    return { portalUrl: result.portalUrl };
  }
}
