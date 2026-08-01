// Promoted from apps/api/src/lib/plan-limits.ts (Phase 5) per the Phase 9
// architecture review's decision 1 (docs/reviews/billing/02-consistency-review.md
// §1): apps/web needs the same plan constants (pricing page, PlanGate
// component) at build time, so this is a move of the existing, already-live
// definition -- not a new, parallel one. Field names and the `number | null`
// "no ceiling" sentinel are unchanged from the original so every existing
// apps/api call site (watchlist.service.ts, alert.service.ts,
// api-key.service.ts, usage.service.ts, business-rate-limit.ts) keeps working
// with only an import-path change.
//
// Source of truth: Pricing_Strategy.md §2.6/§3. `organizations.plan` / the
// JWT's `planTier` claim (Phase 4, buildAccessTokenPayload) is one of these
// five values (see the `organizations_plan_check` constraint). Enterprise
// limits are documented as "Custom" (quoted per-account, no fixed number) --
// represented here as `null` (no enforced ceiling), matching how the docs
// describe it, not an invented number.
export type PlanTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export const PLAN_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  business: 3,
  enterprise: 4,
};

export interface PlanLimits {
  videosPerMonth: number | null;
  watchlists: number | null;
  alertRules: number | null;
  apiAccess: boolean;
  /** Requests/minute for authenticated business-API traffic; null = no documented API access. */
  apiRateLimitPerMinute: number | null;
  /** Requests/day for authenticated business-API traffic; null = no documented API access. */
  apiRateLimitPerDay: number | null;

  // Added for Phase 9 (Billing). teamSeats/workspaces/promptLibraryAccess are
  // deliberately NOT included yet -- postponed per decision 6
  // (docs/architecture/billing/08-feature-gating.md): none of the three has
  // an underlying feature to gate (no multi-seat invite flow, no
  // multi-workspace flow, and the prompt library is currently a
  // super_admin-only platform tool with no org-facing view). Add them here
  // when those features ship, not before.
  exportsPerMonth: number | null;
  alertsPerMonth: number | null;
  projectsPerWorkspace: number | null;
  scheduledReports: boolean;
  priorityQueue: boolean;
  customWebhookAlerts: boolean;
  alertChannels: AlertChannel[];
  exportFormats: ExportFormat[];
  analysisQueue: 'standard' | 'high' | 'dedicated';
  /** null = no fixed retention ceiling (Enterprise: custom, up to 5 years per Pricing_Strategy.md). */
  dataRetentionDays: number | null;
}

export type AlertChannel = 'email' | 'discord' | 'slack' | 'telegram' | 'webhook';
export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    videosPerMonth: 20,
    watchlists: 1,
    alertRules: 2,
    apiAccess: false,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    exportsPerMonth: 0,
    alertsPerMonth: 50,
    projectsPerWorkspace: 3,
    scheduledReports: false,
    priorityQueue: false,
    customWebhookAlerts: false,
    alertChannels: ['email'],
    exportFormats: [],
    analysisQueue: 'standard',
    dataRetentionDays: 30,
  },
  starter: {
    videosPerMonth: 200,
    watchlists: 5,
    alertRules: 10,
    apiAccess: false,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    exportsPerMonth: 5,
    alertsPerMonth: 500,
    projectsPerWorkspace: 5,
    scheduledReports: false,
    priorityQueue: false,
    customWebhookAlerts: true,
    alertChannels: ['email', 'discord', 'slack', 'telegram', 'webhook'],
    exportFormats: ['csv', 'xlsx'],
    analysisQueue: 'standard',
    dataRetentionDays: 90,
  },
  professional: {
    videosPerMonth: 1000,
    watchlists: 20,
    alertRules: 50,
    apiAccess: true,
    apiRateLimitPerMinute: 50,
    apiRateLimitPerDay: 10_000,
    exportsPerMonth: 20,
    alertsPerMonth: 2500,
    projectsPerWorkspace: 10,
    scheduledReports: false,
    priorityQueue: true,
    customWebhookAlerts: true,
    alertChannels: ['email', 'discord', 'slack', 'telegram', 'webhook'],
    exportFormats: ['csv', 'xlsx', 'json', 'pdf'],
    analysisQueue: 'high',
    dataRetentionDays: 180,
  },
  business: {
    videosPerMonth: 5000,
    watchlists: null,
    alertRules: null,
    apiAccess: true,
    apiRateLimitPerMinute: 200,
    apiRateLimitPerDay: 100_000,
    exportsPerMonth: 100,
    alertsPerMonth: null,
    projectsPerWorkspace: null,
    scheduledReports: true,
    priorityQueue: true,
    customWebhookAlerts: true,
    alertChannels: ['email', 'discord', 'slack', 'telegram', 'webhook'],
    exportFormats: ['csv', 'xlsx', 'json', 'pdf'],
    analysisQueue: 'high',
    dataRetentionDays: 395,
  },
  enterprise: {
    videosPerMonth: null,
    watchlists: null,
    alertRules: null,
    apiAccess: true,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    exportsPerMonth: null,
    alertsPerMonth: null,
    projectsPerWorkspace: null,
    scheduledReports: true,
    priorityQueue: true,
    customWebhookAlerts: true,
    alertChannels: ['email', 'discord', 'slack', 'telegram', 'webhook'],
    exportFormats: ['csv', 'xlsx', 'json', 'pdf'],
    analysisQueue: 'dedicated',
    dataRetentionDays: null,
  },
};

// Free/Starter have no documented API rate limit (Pricing_Strategy.md §2.6:
// "API access: No"), but this API has no separate "web session" vs "API key"
// request path yet -- every authenticated request goes through the same
// business-rate-limit plugin. This is a deliberately conservative placeholder
// ceiling for those two tiers, not a documented product number; revisit once
// API-key-scoped traffic is actually distinguished from browser-session
// traffic (a real, currently-unlogged gap -- see docs/architecture/billing's
// "Deferred until TD-025" notes).
const UNDOCUMENTED_TIER_FALLBACK_PER_MINUTE = 20;
const NO_CEILING_FALLBACK_PER_MINUTE = 500;

export function requestsPerMinuteFor(planTier: string | null): number {
  const limits = planTier !== null ? PLAN_LIMITS[planTier as PlanTier] : undefined;
  if (!limits) return UNDOCUMENTED_TIER_FALLBACK_PER_MINUTE;
  if (limits.apiRateLimitPerMinute !== null) return limits.apiRateLimitPerMinute;
  // apiRateLimitPerMinute is null for two different reasons: no documented
  // API access at all (free/starter -- conservative fallback), or "Custom"
  // limits because the tier has no fixed ceiling (enterprise -- generous
  // fallback). Must not conflate the two, or free/starter silently inherit
  // enterprise's generous ceiling.
  return limits.apiAccess ? NO_CEILING_FALLBACK_PER_MINUTE : UNDOCUMENTED_TIER_FALLBACK_PER_MINUTE;
}

// ---------------------------------------------------------------------------
// Plan metadata (pricing, display name, Stripe Price ID env var names) --
// Phase 9 (Billing). Prices from Pricing_Strategy.md §2 (GBP, monthly +
// annual). Stripe Price IDs are looked up by env var name at runtime
// (apps/api/src/config.ts), never hard-coded here -- staging and production
// use different Stripe accounts/prices.
// ---------------------------------------------------------------------------

export interface PlanDefinition {
  id: PlanTier;
  displayName: string;
  /** Pence (GBP). null = Enterprise (custom, quoted per-account). */
  monthlyPricePence: number | null;
  annualPricePence: number | null;
  /** Env var name to resolve the real Stripe Price ID from, not the ID itself. */
  stripePriceIdMonthlyEnvVar: string | null;
  stripePriceIdAnnualEnvVar: string | null;
  limits: PlanLimits;
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: 'free',
    displayName: 'Free',
    monthlyPricePence: 0,
    annualPricePence: 0,
    stripePriceIdMonthlyEnvVar: null,
    stripePriceIdAnnualEnvVar: null,
    limits: PLAN_LIMITS.free,
  },
  starter: {
    id: 'starter',
    displayName: 'Starter',
    monthlyPricePence: 3900,
    annualPricePence: 37400,
    stripePriceIdMonthlyEnvVar: 'STRIPE_PRICE_ID_STARTER_MONTHLY',
    stripePriceIdAnnualEnvVar: 'STRIPE_PRICE_ID_STARTER_ANNUAL',
    limits: PLAN_LIMITS.starter,
  },
  professional: {
    id: 'professional',
    displayName: 'Professional',
    monthlyPricePence: 8900,
    annualPricePence: 85400,
    stripePriceIdMonthlyEnvVar: 'STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY',
    stripePriceIdAnnualEnvVar: 'STRIPE_PRICE_ID_PROFESSIONAL_ANNUAL',
    limits: PLAN_LIMITS.professional,
  },
  business: {
    id: 'business',
    displayName: 'Business',
    monthlyPricePence: 24900,
    annualPricePence: 239000,
    stripePriceIdMonthlyEnvVar: 'STRIPE_PRICE_ID_BUSINESS_MONTHLY',
    stripePriceIdAnnualEnvVar: 'STRIPE_PRICE_ID_BUSINESS_ANNUAL',
    limits: PLAN_LIMITS.business,
  },
  enterprise: {
    id: 'enterprise',
    displayName: 'Enterprise',
    monthlyPricePence: null,
    annualPricePence: null,
    stripePriceIdMonthlyEnvVar: null,
    stripePriceIdAnnualEnvVar: null,
    limits: PLAN_LIMITS.enterprise,
  },
};

/** Plans self-serve `POST /billing/checkout` accepts -- Free has no Stripe subscription, Enterprise is quote-only. */
export const SELF_SERVE_CHECKOUT_PLANS = ['starter', 'professional', 'business'] as const;
export type SelfServeCheckoutPlan = (typeof SELF_SERVE_CHECKOUT_PLANS)[number];

export type BillingCycle = 'monthly' | 'annual';
