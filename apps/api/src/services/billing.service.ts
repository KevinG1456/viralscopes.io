import { type Database, type TenantContext } from '@viralscopes/db';
import {
  PLAN_HIERARCHY,
  PLANS,
  type PlanTier,
  SELF_SERVE_CHECKOUT_PLANS,
} from '@viralscopes/shared';

import type { BillingProvider } from '../lib/billing-provider.js';
import { AppError } from '../lib/errors.js';
import { findActiveSubscriptionForOrg } from '../repositories/billing.repository.js';

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

export interface CreateCheckoutSessionInput {
  plan: string;
  billingCycle: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionInput {
  returnUrl: string;
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

  // Milestone 2 (docs/architecture/billing/12-implementation-plan.md M3):
  // creates a real Stripe Checkout Session, persists checkout_session_id for
  // idempotent retry, and is exercised against Stripe Test Mode. Left as an
  // explicit not-yet-implemented method for Milestone 1 -- the interface
  // shape is real and reviewable now; no route calls it yet, so nothing in
  // this environment can actually process a payment until Milestone 2 lands.
  createCheckoutSession(_tenant: TenantContext, _input: CreateCheckoutSessionInput): never {
    this.requireProvider();
    throw new AppError(
      'NOT_IMPLEMENTED',
      'Checkout session creation lands in Milestone 2, not Milestone 1.',
      501,
    );
  }

  // Same as createCheckoutSession above -- Milestone 2 scope.
  createPortalSession(_tenant: TenantContext, _input: CreatePortalSessionInput): never {
    this.requireProvider();
    throw new AppError(
      'NOT_IMPLEMENTED',
      'Billing portal session creation lands in Milestone 2, not Milestone 1.',
      501,
    );
  }
}
