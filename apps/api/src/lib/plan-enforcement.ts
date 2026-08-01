import type { Database, TenantContext } from '@viralscopes/db';
import type { PlanTier } from '@viralscopes/shared';

import {
  findActiveSubscriptionForOrg,
  findOrgWithOwnerEmail,
} from '../repositories/billing.repository.js';

// Phase 9 Milestone 5 ("Subscription Enforcement"). Replaces trusting the
// JWT's `planTier` claim for authorization-critical checks (watchlist/alert
// rule counts, API-key access) with a live read of the actual subscription
// record -- per docs/architecture/billing/02-system-architecture.md's
// Option A ("JWT planTier claim is used only as a hint; the definitive
// check is always Redis/DB"). The JWT claim remains fine for display-only
// uses (GET /billing/plan, the Home dashboard) where a few minutes of
// staleness is harmless -- this function is specifically for the places
// that gate access or spend quota.
//
// Deliberately a plain DB read, not the Redis-cached `getPlanForGating()`
// sketched in docs/architecture/billing/07-subscription-lifecycle.md: that
// design assumes plan-gating runs on every request (like business-rate-limit.ts),
// which would justify a cache. The real call sites this feeds (watchlist/
// alert-rule/API-key creation) are low-frequency mutations, not a hot path --
// a cache here would trade a negligible performance gain for real
// invalidation-bug risk. Revisit if/when `checkQuota` middleware for a real
// high-frequency endpoint (video_analyzed, api_request) is eventually built.
//
// Grace period is checked live here, independent of `subscriptions.status`:
// this is the actual real-time security boundary. The daily
// `jobs/grace-period-expiry.job.ts` batch job that flips `status`/
// `organizations.plan` to match is about keeping those columns
// eventually-consistent for display and billing-history accuracy, not the
// enforcement boundary itself -- enforcement here is never more than one DB
// read behind the truth, regardless of when that job last ran.
export async function getEnforcedPlanTier(db: Database, tenant: TenantContext): Promise<PlanTier> {
  const subscription = await findActiveSubscriptionForOrg(db, tenant);

  if (!subscription) {
    // No real subscription row -- fall back to organizations.plan (the
    // seeded-dev-org / manual-override case Milestone 2 already established
    // as correct, not a bug: a free org with no subscription row is the
    // common case, and an org can have organizations.plan set independent
    // of a real subscription, e.g. by seed data or a future admin override).
    const org = await findOrgWithOwnerEmail(db, tenant.orgId);
    return (org?.plan as PlanTier | undefined) ?? 'free';
  }

  if (subscription.gracePeriodEndsAt && subscription.gracePeriodEndsAt < new Date()) {
    return 'free';
  }

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    // past_due (after the daily job has run) / paused all enforce as free.
    // 'canceled' is already excluded by findActiveSubscriptionForOrg itself.
    return 'free';
  }

  return subscription.plan as PlanTier;
}
