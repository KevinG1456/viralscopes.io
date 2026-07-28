# 08-feature-gating.md
# Billing Architecture — Feature Gating

---

## Principle

Feature gating is enforced at **three independent layers**. No single layer alone is sufficient.

| Layer | Where | What it enforces |
|---|---|---|
| 1. Plan middleware | Fastify `preHandler` | Plan tier minimum (e.g. "Professional only") |
| 2. Quota middleware | Fastify `preHandler` | Per-period quantity limits (e.g. "200 videos/month") |
| 3. Count check | Service layer | Resource count limits (e.g. "max 5 watchlists") |

The frontend renders upgrade prompts using `planTier` from `AuthContext`. This is UX only — never a security control.

---

## Plan Hierarchy

```typescript
// packages/shared/src/plans.ts
export const PLAN_HIERARCHY: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  business: 3,
  enterprise: 4,
};
```

**Decision (plan-limits location):** `packages/shared/src/plans.ts` is a promotion of the already-live `apps/api/src/lib/plan-limits.ts`, not a new parallel definition — see `03-domain-model.md`'s "Plan" section for the full resolution. Every existing call site (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, `business-rate-limit.ts`) is updated to import from here instead.

---

## Complete Limits Map

Derived from `Pricing_Strategy.md §3`. This is the single source of truth. All other references point here.

**Decision (sentinel corrected):** `null` is used for "no ceiling," matching the existing convention already established in `apps/api/src/lib/plan-limits.ts` (used today for Enterprise's uncapped fields) — not a new `-1` sentinel, which would be an inconsistent second convention for the same concept in the same codebase. **Decision (field names corrected):** API rate limits reuse the existing `apiRateLimitPerMinute`/`apiRateLimitPerDay` field names rather than introducing a differently-named `apiRequestsPerDay` for the same Pricing_Strategy.md numbers (§2.6: "50 req/min & 10,000 req/day" for Professional, etc.).

```typescript
export interface FeatureLimits {
  // Quota-based (tracked in Redis + usage_events)
  videosPerMonth: number | null;
  exportsPerMonth: number | null;
  apiRateLimitPerMinute: number | null;  // null = no documented API access, or no ceiling (Enterprise) — see plan-limits.ts's existing requestsPerMinuteFor() for how the two are disambiguated
  apiRateLimitPerDay: number | null;
  alertsPerMonth: number | null;

  // Count-based (checked via DB query at create time)
  watchlists: number | null;
  alertRules: number | null;
  projectsPerWorkspace: number | null;
  // teamSeats / workspaces intentionally omitted — see "Postponed" note below

  // Feature flags (binary)
  apiAccess: boolean;
  scheduledReports: boolean;
  priorityQueue: boolean;
  customWebhookAlerts: boolean;
  // promptLibraryAccess intentionally omitted — see "Postponed" note below

  // Enum-based
  alertChannels: AlertChannel[];  // subset of ['email','discord','slack','telegram','webhook']
  exportFormats: ExportFormat[];  // subset of ['csv','xlsx','json','pdf']
  analysisQueue: 'standard' | 'high' | 'dedicated';

  // Duration-based
  dataRetentionDays: number | null;
}

export const PLAN_LIMITS: Record<PlanTier, FeatureLimits> = {
  free: {
    videosPerMonth: 20,
    exportsPerMonth: 0,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    alertsPerMonth: 50,
    watchlists: 1,
    alertRules: 2,
    projectsPerWorkspace: 3,
    apiAccess: false,
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
    exportsPerMonth: 5,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    alertsPerMonth: 500,
    watchlists: 5,
    alertRules: 10,
    projectsPerWorkspace: 5,
    apiAccess: false,
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
    exportsPerMonth: 20,
    apiRateLimitPerMinute: 50,
    apiRateLimitPerDay: 10_000,
    alertsPerMonth: 2500,
    watchlists: 20,
    alertRules: 50,
    projectsPerWorkspace: 10,
    apiAccess: true,
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
    exportsPerMonth: 100,
    apiRateLimitPerMinute: 200,
    apiRateLimitPerDay: 100_000,
    alertsPerMonth: null,
    watchlists: null,
    alertRules: null,
    projectsPerWorkspace: null,
    apiAccess: true,
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
    exportsPerMonth: null,
    apiRateLimitPerMinute: null,
    apiRateLimitPerDay: null,
    alertsPerMonth: null,
    watchlists: null,
    alertRules: null,
    projectsPerWorkspace: null,
    apiAccess: true,
    scheduledReports: true,
    priorityQueue: true,
    customWebhookAlerts: true,
    alertChannels: ['email', 'discord', 'slack', 'telegram', 'webhook'],
    exportFormats: ['csv', 'xlsx', 'json', 'pdf'],
    analysisQueue: 'dedicated',
    dataRetentionDays: null,
  },
};
```

**Postponed (decision 6 — not Phase 9 scope):** `teamSeats`, `workspaces`, and `promptLibraryAccess` are omitted from this interface entirely rather than defined-but-unenforced, because none of the three has an underlying feature to gate yet: no multi-seat-invite flow, no multi-workspace flow, and the prompt library is currently a `super_admin`-only platform tool with no org-facing view at all (`server.ts`: `promptLibraryRoutes` registered under `/api/v1/admin/prompts`, "Platform-wide, super_admin-gated"). They will be added back to this interface when their underlying features ship — adding an unenforced field now would misleadingly suggest a plan-comparison table can display "10 seats" when there is no invite flow to actually reach that number.

---

## Backend Enforcement — Per Endpoint

### Quota-gated endpoints (Redis counter check)

| Endpoint | Quota key | Limit field | Status |
|---|---|---|---|
| Video analysis completion (WF-09 callback, not a synchronous user-facing endpoint — video discovery/analysis is n8n-pipeline-driven; see `02-system-architecture.md`) | `video_analyzed` | `videosPerMonth` | **Blocked on TD-020** — WF-09 doesn't exist yet (`infra/n8n-workflows/` has only 3 unrelated demo workflows) |
| `POST /exports` | `export_created` | `exportsPerMonth` | Ready — real, existing endpoint |
| API-key-authenticated requests only (not "all authenticated requests" — see decision below) | `api_request` | `apiRateLimitPerDay` | **Deferred until TD-025** — no API-key request-authentication path exists yet to distinguish this traffic from browser sessions |

**Decision (api_request quota scope):** opt-in and scoped to API-key traffic only, never applied to every authenticated call — see `02-system-architecture.md`'s UsageMiddleware section for the full reasoning (doubling Redis round-trips on every browser-session request for a limit that Pricing_Strategy.md only ever describes as an "API access" feature would be unjustified).

Middleware pattern:
```typescript
fastify.post('/api/v1/videos/analyze', {
  preHandler: [
    authenticate,
    requirePlan('starter'),          // Layer 1: plan minimum
    checkQuota('video_analyzed'),    // Layer 2: quota
  ],
  handler: videoController.analyze,
});
```

### Count-gated endpoints (DB count check)

| Endpoint | Count query | Limit field |
|---|---|---|
| `POST /watchlists` | `SELECT COUNT(*) FROM watchlists WHERE org_id=? AND deleted_at IS NULL` | `watchlists` (extends the count-check already live in `watchlist.service.ts`) |
| `POST /alerts/rules` | `SELECT COUNT(*) FROM alert_rules WHERE org_id=? AND deleted_at IS NULL` | `alertRules` (extends the count-check already live in `alert.service.ts`) |

**Postponed (decision 6):** `POST /organisations/invite` (`teamSeats`) and `POST /workspaces` (`workspaces`) rows removed — neither endpoint exists yet; see the "Postponed" note above.

Count check pattern (in service layer):
```typescript
async function createWatchlist(orgId: string, ...) {
  const limits = await getPlanLimits(orgId);
  if (limits.watchlists !== null) {
    const count = await db.select(count())
      .from(watchlistsTable)
      .where(and(eq(watchlistsTable.orgId, orgId), isNull(watchlistsTable.deletedAt)));
    if (count[0].count >= limits.watchlists) {
      throw new AppError('PLAN_LIMIT_EXCEEDED',
        `Your plan allows ${limits.watchlists} watchlists. Upgrade to add more.`, 403);
    }
  }
  // ... proceed with INSERT
}
```

(`null` check and `403` status corrected — see `03-domain-model.md`'s sentinel decision and `05-api-design.md`'s Error Codes table.)

### Feature-flag gated endpoints (plan minimum only)

| Endpoint | Minimum plan |
|---|---|
| `GET/POST /api-keys` | `professional` |
| `POST /exports` (PDF format) | `professional` |
| `POST /alerts/rules` (webhook channel) | `starter` |
| `POST /reports/schedule` (v1.5) | `business` — not built until v1.5; this row is aspirational, no Phase 9 action needed |

**Postponed (decision 6):** `GET /admin/prompts (read) | business` row removed — the prompt library is currently a `super_admin`-only, platform-wide tool with no org-facing view or plan dimension at all. Gating it by customer plan would require building that org-facing view first, which is out of Phase 9's scope.

---

## Frontend Behaviour

The `PlanGate` component (**documented as a spec in `Component_Library.md` with example usage, but not actually built in any phase** — confirmed by a direct search of `apps/web/src`, no matching file exists; must be built fresh, sized as its own small PR ahead of the billing UI milestone since it's a reusable component the whole app will lean on, not billing-specific) wraps features above the current plan:

```tsx
// Example: API Keys section in Settings
<PlanGate requiredPlan="professional"
  fallback={<UpgradePrompt feature="api_access" requiredPlan="professional" />}>
  <ApiKeySection />
</PlanGate>
```

`UpgradePrompt` component shows:
- What the feature does
- Which plan unlocks it
- "Upgrade to Professional" CTA → calls `POST /billing/checkout`

**Alert channel restriction (Starter+):** The alert rule creation form validates the channel selection against `planLimits.alertChannels`. If the user selects `discord` on Free plan, the form shows inline upgrade prompt.

---

## Existing Phase 5 Quota System Reuse

Phase 5 built a bespoke Redis `INCR`+`EXPIRE` sliding-window limiter (`apps/api/src/middleware/business-rate-limit.ts`, driven by `plan-limits.ts`'s `requestsPerMinuteFor()`) for per-plan API rate limiting — **not** the generic `@fastify/rate-limit` plugin (that's a separate dependency registered in `server.ts` for a different, generic purpose). Phase 9 **extends** the bespoke system:

| Existing (Phase 5) | New (Phase 9) |
|---|---|
| Per-minute API rate limiting | Per-month video analysis counting |
| Per-day API rate limiting | Per-month export counting |
| Plan tier from JWT `planTier` claim | Plan tier from Redis cache + grace period check |

The Redis key namespace is extended:
- Existing: `ratelimit:{orgId}:{endpoint}:{windowKey}`
- New: `vs:quota:{orgId}:{eventType}:{periodKey}`

These are different key patterns — no collision.

---

## Grace Period Gating

During grace period (`grace_period_ends_at` is set but not yet expired):
- Org retains current plan features
- No new quota resets (quota accrued against active plan)
- UI shows a persistent warning banner: "Your payment failed. Update your payment method by [date] to keep access."

After grace period expires:
- `status = 'past_due'` (set by the BullMQ repeatable job — see `07-subscription-lifecycle.md`'s resolved CRON decision)
- `getPlanForGating()` returns `'free'`
- Features above Free are blocked immediately
- User can re-subscribe via the same checkout flow

