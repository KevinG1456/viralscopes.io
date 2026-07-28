# 02-consistency-review.md
# Billing Architecture Review — Consistency With the Current System

Each section below checks the billing architecture against one real subsystem, cites the exact file(s) that establish the current convention, and states whether the architecture is consistent, inconsistent, or silent.

---

## 1. Plan-limit duplication (the single biggest finding in this review)

**Existing system:** `apps/api/src/lib/plan-limits.ts` already defines:
```typescript
export type PlanTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';
export interface PlanLimits {
  videosPerMonth: number | null;
  watchlists: number | null;
  alertRules: number | null;
  apiAccess: boolean;
  apiRateLimitPerMinute: number | null;
  apiRateLimitPerDay: number | null;
}
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = { /* all 5 tiers */ };
```
This is **already live and enforced**: `watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, and `business-rate-limit.ts` middleware all import and branch on `PLAN_LIMITS` today. `null` is the established "no ceiling" sentinel (used for Enterprise's uncapped fields).

**Proposed system:** `03-domain-model.md` and `08-feature-gating.md` both define a *second*, independent `PlanTier`/`FeatureLimits`/`PLAN_LIMITS` set in `packages/shared/src/plans.ts`, with:
- Different field names (`apiRequestsPerDay` vs. the real `apiRateLimitPerMinute`/`apiRateLimitPerDay`)
- New fields the real interface doesn't have (`teamSeats`, `workspaces`, `alertChannels`, `exportFormats`, `scheduledReports`, `priorityQueue`, `promptLibraryAccess`, `customWebhookAlerts`, `dataRetentionDays`, `analysisQueue`)
- A **different "unlimited" sentinel** (`-1` instead of the established `null`)

**Why this matters:** the user's own Phase 9 kickoff instruction was explicit — *"Reuse the existing plan-limit enforcement from Phase 5 rather than duplicating logic."* As designed, these documents do the opposite: two parallel, differently-shaped sources of truth for the same concept would exist in the same codebase, and every existing call site (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `business-rate-limit.ts`) would need to either keep reading the old one (making the new one dead weight) or be migrated to the new one (a much larger, riskier change than Phase 9's own scope implies).

**Recommended resolution (for `14-open-questions.md`, not decided here):**
- Extend the *existing* `apps/api/src/lib/plan-limits.ts` `PlanLimits` interface with the additional fields Phase 9 genuinely needs (team seats, workspaces, alert channels, export formats, feature flags), keeping the established `number | null` sentinel.
- If `apps/web` needs these constants at build time (it does, for a pricing page and `PlanGate` component), promote the *single, extended* file to `packages/shared/src/plans.ts` and have `apps/api` import it from there — a genuine move, not a duplicate.
- Either way, there must be exactly one `PLAN_LIMITS` constant in the repository when Phase 9 ships, not two.

---

## 2. Backend (Fastify routes/services/repositories)

**Existing system:** every one of the 13 real route files lives flat in `apps/api/src/routes/*.routes.ts` (e.g. `watchlist.routes.ts`, `alert.routes.ts`, `api-key.routes.ts`), is a thin layer that validates with an **inline** Zod schema and delegates to a same-named service (`watchlist.service.ts`), which in turn calls a same-named repository (`watchlist.repository.ts`). There is no `controllers/` layer and no shared `schemas/` package — this is a consistent 3-layer Route → Service → Repository pattern across all existing route files, services, and repositories.

**Note on REPOSITORY_STRUCTURE.md:** that document itself describes a *4th, aspirational* layer (`controllers/`, `routes/v1/`, `schemas/`) that has never actually been built in any of Phases 1–8. This is a pre-existing drift between documentation and reality, not something introduced by the billing architecture — but the billing documents consistently followed the **stale document** instead of the **real codebase**:
- `apps/api/src/routes/v1/billing.routes.ts` / `.../v1/webhooks.routes.ts` (all of `02`, `05`, `06`, `09`, `12`) — no `v1/` subdirectory exists anywhere in the real tree.
- `packages/shared/src/schemas/billing.schemas.ts` (`12-implementation-plan.md` M3) — no shared schemas package exists; every route keeps its Zod schemas inline.
- No `billing.controller.ts` is proposed (good — the documents didn't fully follow REPOSITORY_STRUCTURE.md's controller layer), but the `routes/v1/` path convention was still adopted from the same stale source.

**Recommendation:** billing routes/services/repositories should follow the real, consistently-used 3-layer flat convention — `apps/api/src/routes/billing.routes.ts`, `webhook.routes.ts`, `services/billing.service.ts`, `webhook.service.ts`, `repositories/billing.repository.ts` — registered with a `/api/v1/...` prefix in `server.ts`'s registration list exactly like every other route module today.

---

## 3. Authentication / RBAC

**Existing system:**
- JWT payload (`apps/api/src/lib/jwt.ts` `AccessTokenPayload`): `{ sub, userId, orgId, orgRole, planTier }`. **No `role` field.**
- Platform-level super-admin check (`apps/api/src/middleware/require-super-admin.ts`) is a **live database read** of `users.role`, with an explicit code comment: *"Deliberately NOT based on the JWT."*
- Org-level role check (`apps/api/src/middleware/require-role.ts`) reads `request.user.orgRole`, populated from the JWT, and is used via `requireRole('owner', 'admin')`-style calls.
- Every existing org-scoped route chains `preHandler: [authenticate, requireOrgContext, businessRateLimit]` before any role-specific check (confirmed in `watchlist.routes.ts`, `alert.routes.ts`).

**Billing architecture claims:**
- `09-security.md`: "Super Admin JWT includes `role = 'super_admin'`. The billing middleware must explicitly exclude Super Admin..." — **contradicts** the JWT shape and the existing, deliberate design of `require-super-admin.ts`.
- `03-domain-model.md` / `05-api-design.md` / `09-security.md` all say billing mutations require "owner or admin" — inconsistent with the stricter Owner-only rule documented in Security_Architecture.md's permission matrix.
- `05-api-design.md`'s Admin Endpoints section header ("`super_admin` or `admin`") directly contradicts the very next line for the same endpoint ("Auth: JWT (`super_admin` role)").
- None of the billing route/middleware sketches in `02`, `05`, `08`, `09` mention `requireOrgContext`, despite every existing org-scoped route requiring it.

**Recommendation:** re-derive the billing RBAC table from Security_Architecture.md's actual permission matrix (single source of truth), fix the self-contradiction in `05-api-design.md`, and add `requireOrgContext` to every billing `preHandler` chain that isn't the public plans endpoint or the webhook endpoint.

---

## 4. Row-Level Security

**Existing system:** RLS policies (`packages/db/src/migrations/0003_rls_policies.sql`) are written entirely against `current_setting('app.current_org_id', true)::uuid` / `current_setting('app.current_user_id', true)::uuid`, set per-transaction by `withTenant()` (`packages/db/src/client.ts`). There is no `authenticated` Postgres role and no `auth.uid()` function — this project does not use Supabase Auth, and `client.ts` documents this explicitly as a deliberate departure from Supabase's own RLS conventions.

**Billing architecture claims:** every RLS snippet in `04-database-design.md` and `09-security.md` is written as:
```sql
CREATE POLICY "subscriptions_select_own_org" ON subscriptions FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()));
```
This would not run against this schema — there is no `authenticated` role and `auth.uid()` does not exist. It also silently drops the `WITH CHECK` half of the policy that every existing `FOR ALL` policy in `0003_rls_policies.sql` carries.

**Recommendation:** rewrite every RLS statement in the billing documents against the real convention, e.g.:
```sql
CREATE POLICY subscriptions_tenant_isolation ON subscriptions FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
```
(`subscriptions` and `invoices` already have exactly this policy from `0003_rls_policies.sql` — no new RLS policy is actually needed for them; the documents' claim that new SELECT-only policies must be written is itself unnecessary rework of something already correctly in place.)

---

## 5. Redis

**Existing system:** `apps/api/src/plugins/redis.plugin.ts` (ioredis client), used today for rate limiting (`business-rate-limit.ts`, key pattern `ratelimit:{orgId}:{endpoint}:{windowKey}`) and account lockout.

**Billing architecture:** proposes `vs:plan:*`, `vs:quota:*`, `vs:webhook:*`, `vs:quota:warn:*` — a cleanly separated namespace with no collision against the existing `ratelimit:*` prefix. **Consistent**, no issues found.

---

## 6. n8n

**Existing system:** `infra/n8n-workflows/` contains exactly three workflow definitions — `foundation-demo.json`, `heartbeat.json`, `prompt-test.json`. The full business pipeline (WF-01 Video Discovery, WF-09 Viral Score Engine, WF-14 Alert Dispatch, etc.) is documented on paper in `n8n_Workflow_Diagrams.md` but not yet built (PROJECT_STATUS.md TD-020).

**Billing architecture:** `02-system-architecture.md`'s n8n Interactions table assumes WF-09 already exists and can be modified to call `UsageService.emit('video_analyzed')`, and that WF-01 already enforces a quota check. Neither workflow exists yet.

**Recommendation:** Phase 9's usage-tracking design for `video_analyzed` is correct in shape but cannot be wired into a real pipeline until the corresponding n8n workflow is actually built. This should be stated as a cross-phase dependency (Phase 9 blocked on the TD-020 workflows, at least for the video-analysis event type specifically — `export_created` and `api_request` do not have this dependency, since those already correspond to real, existing API-level actions).

---

## 7. Docker / CI/CD

**Existing system:** `.github/workflows/ci.yml` runs lint/type-check/build/format/**secretlint**/CodeQL/dependency-review/dependency-audit. Secret scanning is `.secretlintrc.json` + `.secretlintignore`, invoked via `npm run secretlint` and wired into both CI and (per `.husky`/`.lintstagedrc.json`) the pre-commit hook.

**Billing architecture:** `09-security.md` and `10-environment.md` both reference "the `detect-secrets` pre-commit hook." This tool is not present anywhere in the repository — the actual tool is secretlint.

**Recommendation:** trivial find-and-replace; also worth adding `sk_live_`/`sk_test_`/`whsec_` patterns to `.secretlintrc.json`'s configuration explicitly (the architecture correctly identifies *what* needs catching, just names the wrong tool).

**Docker:** no new services are proposed (correct — Stripe is an external HTTPS API, not a container), and no changes to `docker-compose.dev.yml`/`docker-compose.prod.yml` are claimed. Consistent.

---

## 8. Existing quota system (Phase 5)

**Existing system:** `apps/api/src/lib/plan-limits.ts`'s `requestsPerMinuteFor()` + `apps/api/src/middleware/business-rate-limit.ts` implement per-minute API rate limiting from the JWT's `planTier` claim, via a Redis `INCR`+`EXPIRE` sliding window — this is real, working code, not a `fastify-rate-limit`-plugin-based system (that plugin, `@fastify/rate-limit`, is a separate dependency registered in `server.ts` for a different, generic purpose — the plan-tier-aware limiter is bespoke).

**Billing architecture:** `08-feature-gating.md`'s "Existing Phase 5 Quota System Reuse" table correctly identifies the Redis-based, JWT-driven design and correctly avoids a key-namespace collision. This is one of the few places the architecture explicitly reasons about reuse-vs-duplication and gets it right — the analysis quality here should be the template applied to the plan-limits duplication problem in §1 above.

---

## 9. Response envelope / error handling

**Existing system:** `apps/api/src/lib/response.ts`'s `ok()` and `apps/api/src/lib/errors.ts`'s `AppError`/`toErrorEnvelope()` produce `{ success: true, data, meta? }` / `{ success: false, error: { code, message, details? } }` uniformly across every existing route.

**Billing architecture:** every JSON response sample in `05-api-design.md` correctly uses `{ success: true, data: {...} }`. **Consistent** — this is accidentally correct rather than explicitly cited, but it is correct.

---

## 10. Email service

**Existing system:** `apps/api/src/services/email.service.ts` exports only `createLoggingEmailService()` — a dev/test-only stub that **throws if called in staging or production** (TD-010, PROJECT_STATUS.md). There is no real SendGrid/Resend integration anywhere in this codebase.

**Billing architecture:** `01-overview.md`'s dependency table lists "Email service — Phase 4 — SendGrid/Resend configured; `emailService.send()` wrapper exists" as an available building block, and `12-implementation-plan.md` M8 plans three new email templates on top of it.

**Recommendation:** billing emails are blocked on the same real-provider gap every previous phase has logged (TD-010) — this needs to be named as a Phase 9 blocking dependency, not inherited silently. Building the templates/trigger logic against the existing logging-stub interface is fine for development, but "billing confirmation email sent" cannot be claimed as Verified in production terms until TD-010 is resolved independently of Phase 9.

---

## Summary of duplicated logic found

| Duplicated concept | Existing home | Proposed duplicate | Verdict |
|---|---|---|---|
| Plan tiers + limits | `apps/api/src/lib/plan-limits.ts` | `packages/shared/src/plans.ts` | **Must be unified before implementation** (§1) |
| RLS policy for `subscriptions`/`invoices` | Already exists, `0003_rls_policies.sql` | Re-specified (incorrectly) in `04`/`09` | **No new policy needed at all** — delete this section, cite the existing one |
| Idempotency mechanism | N/A (new) | Four separate mechanisms across `05`/`06` (Redis TTL, `stripe_webhook_events` table, `checkout_session_id` UNIQUE, `provider_invoice_id` UNIQUE, `vs:pending_customer:*`) | **Consolidate to one durable table + one short-TTL Redis fast-path**, not five |
