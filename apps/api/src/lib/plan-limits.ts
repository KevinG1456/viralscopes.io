// Source of truth: Pricing_Strategy.md §2.6/§3. `organizations.plan` /
// the JWT's `planTier` claim (Phase 4, buildAccessTokenPayload) is one of
// these five values (see the `organizations_plan_check` constraint).
// Enterprise limits are documented as "Custom" (quoted per-account, no
// fixed number) -- represented here as `null` (no enforced ceiling),
// matching how the docs describe it, not an invented number.
export type PlanTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export interface PlanLimits {
  videosPerMonth: number | null;
  watchlists: number | null;
  alertRules: number | null;
  apiAccess: boolean;
  /** Requests/minute for authenticated business-API traffic; null = no documented API access. */
  apiRateLimitPerMinute: number | null;
  /** Requests/day for authenticated business-API traffic; null = no documented API access. */
  apiRateLimitPerDay: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    videosPerMonth: 20,
    watchlists: 1,
    alertRules: 2,
    apiAccess: false,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
  },
  starter: {
    videosPerMonth: 200,
    watchlists: 5,
    alertRules: 10,
    apiAccess: false,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
  },
  professional: {
    videosPerMonth: 1000,
    watchlists: 20,
    alertRules: 50,
    apiAccess: true,
    apiRateLimitPerMinute: 50,
    apiRateLimitPerDay: 10_000,
  },
  business: {
    videosPerMonth: 5000,
    watchlists: null,
    alertRules: null,
    apiAccess: true,
    apiRateLimitPerMinute: 200,
    apiRateLimitPerDay: 100_000,
  },
  enterprise: {
    videosPerMonth: null,
    watchlists: null,
    alertRules: null,
    apiAccess: true,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
  },
};

// Free/Starter have no documented API rate limit (Pricing_Strategy.md §2.6:
// "API access: No"), but this API has no separate "web session" vs "API key"
// request path yet (that split is Endpoints — API Keys' job, TD-014) -- every
// authenticated request goes through the same business-rate-limit plugin.
// This is a deliberately conservative placeholder ceiling for those two
// tiers, not a documented product number; revisit once API-key-scoped
// traffic is actually distinguished from browser-session traffic.
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
