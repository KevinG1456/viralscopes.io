# Phase 11 — Architecture

**Status: planning only.** Every design below is a proposal pending your approval, not a decision already made. Where a genuine open architectural question exists, it is flagged as such rather than silently resolved.

---

## 1. Current architecture, verified

### 1.1 Backend admin surface today

`apps/api/src/routes/admin.routes.ts` — one route file, registered once in `server.ts`, gated end-to-end by:

```
preHandler = [authenticate, requireSuperAdmin, businessRateLimit]
```

- `authenticate` — standard JWT middleware, same as every other route
- `requireSuperAdmin` (`apps/api/src/middleware/require-super-admin.ts`) — live `SELECT` on `users.role` per request, per DEC-017. Never trusts the JWT for this claim.
- `businessRateLimit` — the existing per-user Redis rate limiter (see `Security_Architecture.md` §15)

Seven routes exist today, all real, all verified by direct code read: `GET /users`, `GET /organizations`, `GET /jobs`, `GET /dead-letter`, `POST /dead-letter/:id/retry`, `POST /jobs/:workflow/trigger`, `GET /metrics`. Business logic lives in `AdminService` (`apps/api/src/services/admin.service.ts`) backed by `apps/api/src/repositories/admin.repository.ts`.

Separately, `apps/api/src/routes/prompt-library.routes.ts` implements the full prompt CRUD/versioning/test-harness surface, using the identical `requireSuperAdmin` gating pattern.

**Architectural conclusion:** Phase 11 does not need a new admin subsystem — it needs to *extend* an already-correct, already-verified pattern (one route file per subsystem, `requireSuperAdmin` + `businessRateLimit` preHandler, service/repository split). Every new milestone should follow this exact shape for consistency, not invent a new convention.

### 1.2 Frontend admin surface today

`apps/web/src/app/(dashboard)/admin/prompts/page.tsx` and `[name]/page.tsx` are the **only** admin pages that exist. They live inside the same `(dashboard)` route group as ordinary user pages (`home`, `watchlists`, `alerts`, `settings/*`) — there is no dedicated admin layout, nav shell, or visual separation from the regular product UI.

Gating is **reactive, not preventive**: the pages call the admin API directly; on a `403` they render an `EmptyState` ("You don't have access to this page — restricted to platform admins"). Nothing on the client checks role before rendering or before firing the request. The main `Sidebar.tsx` nav renders the "AI Prompts" link unconditionally to every authenticated user, regardless of role — a non-admin user sees the link and only discovers they're blocked after clicking through.

This is a real, working pattern (server-side gate is authoritative, so it's not a security gap) but it does not scale cleanly to 5+ new admin sections. Phase 11 must decide whether to keep the fully-reactive pattern or add a cheap client-side signal — see §3 below.

### 1.3 Frontend auth/RBAC state today

`AuthProvider.tsx`'s `AuthState` exposes `user: PublicUser | null`, `orgId`, `orgRole`, `planTier` — all derived from the JWT plus a cached `PublicUser` for display. `PublicUser` (`apps/web/src/types/api.ts:36-42`) has **no `role`/`isSuperAdmin` field**. Per DEC-017, `super_admin` is deliberately never placed in the JWT. **Net effect: the frontend has zero way to know a user is a super admin today, except by hitting a gated endpoint and reading the response code.**

---

## 2. Proposed architecture additions

### 2.1 Admin panel frontend shell (Milestone 1)

**Proposal:** introduce `apps/web/src/app/(dashboard)/admin/layout.tsx` wrapping all admin routes (`admin/prompts`, and every new `admin/*` route Phase 11 adds), providing:
- A distinct nav (organisations, users, billing, jobs, prompts, system health) separate from the main product `Sidebar.tsx`
- A single place to apply whatever client-side admin-check signal is chosen (§2.2)

This is additive — it does not change `(dashboard)/layout.tsx`'s existing auth gate for regular users, and does not change how `/admin/prompts` behaves for non-admins today (still a real 403 from the server either way).

**Component reuse:** the existing `Card`/`Badge`/`Button`/`Select`/`Spinner`/`EmptyState` kit and TanStack Query hook pattern (`use-prompts.ts` as the template) should be reused for every new admin data hook (`use-admin-users.ts`, `use-admin-organizations.ts`, etc.) rather than introducing a new fetching pattern.

### 2.2 Cheap admin-check signal for the frontend (Milestone 1) — proposal, not a decision

Three options, to be decided with you before Milestone 1 begins:

| Option | Mechanism | Trade-off |
|---|---|---|
| A — Reactive only (status quo) | Keep today's pattern: render, let the request 403, show `EmptyState`. Extend the same pattern to nav filtering by attempting one cheap "am I admin" call at layout-mount. | Simplest, zero new backend surface. A logged-in non-admin briefly sees the layout chrome before the check resolves. |
| B — New lightweight endpoint | `GET /api/v1/admin/me` (or reuse `GET /users/me` and add a display-only `isSuperAdmin` boolean, still never in the JWT) — layout calls this once, gates nav rendering on the result | One new tiny endpoint; server-side `requireSuperAdmin` on every real action stays the actual security boundary regardless — this is a UX improvement, not a new trust boundary |
| C — Do nothing extra | Every non-admin who navigates to any `/admin/*` URL directly sees the same `EmptyState` per-page, as today, and no nav item ever appears for non-admins because the *main* `Sidebar.tsx` is updated to hide admin links via option B's signal | Same as B but scoped to fixing the specific `Sidebar.tsx` gap already identified in §1.2 |

**Recommendation:** Option B/C combined — a single `isSuperAdmin: boolean` display hint (clearly documented as non-authoritative), used both to filter `Sidebar.tsx` and to gate the new admin layout's nav rendering. This directly closes the unflagged `Sidebar.tsx` nav-leak gap found during this planning pass, at minimal cost. Final call deferred to Milestone 1 approval.

### 2.3 Audit-log write path fix (Milestone 1, prerequisite for everything else)

Current: `auditLog(db, tenant: TenantContext, input)` requires `TenantContext.orgId: string` (non-nullable). `account.service.ts` already works around this by skipping the call entirely when `orgId` is null (§4 of `01-phase-11-overview.md`).

**Proposal:** add a second, explicit entry point for org-less writes, rather than loosening `TenantContext` itself (which is used pervasively for genuinely org-scoped RLS queries and should stay strict):

```ts
// New, alongside the existing auditLog():
export async function auditLogPlatform(
  db: Database,
  input: AuditLogInput, // same shape, no tenant
): Promise<void> {
  // Runs OUTSIDE withTenant() -- no app.current_org_id session variable set.
  // Relies on migration 0012's WITH CHECK relaxation (org_id IS NULL permitted).
  // Per Phase 10 Milestone 2's own documented finding: RLS's USING clause
  // still applies even to RETURNING, so this must not call .returning().
  await db.insert(schema.auditLogs).values({
    orgId: null,
    userId: input.userId,
    action: input.action,
    resourceType: input.resourceType ?? null,
    resourceId: input.resourceId ?? null,
    metadata: input.metadata ?? {},
  });
}
```

This is a genuinely new function, not a schema change (migration 0012 already permits the write) — pure application-layer work. Every admin route that acts platform-wide (most of them — `users`/`organizations`/`dead_letter_jobs`/`job_logs` all have "no RLS" comments in their schema files, confirmed by direct read) will call `auditLogPlatform()`, not `auditLog()`.

**Open question for approval:** should `account.service.ts`'s existing null-org skip (the account-deletion gap found during this research) be fixed as part of Milestone 1, since it's the same root cause? Recommendation: yes — it's a one-line change once `auditLogPlatform()` exists, and leaving a known, newly-discovered audit gap unfixed while building the exact mechanism that fixes it would be inconsistent with this engagement's practice of fixing legitimate in-scope issues found during implementation (Phase 10's own precedent). Final call at Milestone 1 approval, not assumed here.

### 2.4 Shared types (`packages/shared`)

Today `packages/shared` contains only `plans.ts` (plan tiers/limits) and its barrel. Proposed additions, to keep `apps/api` and `apps/web` contract-consistent (matching how `PLAN_LIMITS` is already shared):

- An `AdminActionType` string-literal union (or const object) mirroring `Security_Architecture.md` §18's "Admin actions" taxonomy row, extended with an `impersonation.*` set once Milestone 4 designs it — used for both the API's `auditLogPlatform()` calls and the frontend's audit-log viewer labels
- No change to org-role types is proposed — `super_admin` stays intentionally absent from any JWT-adjacent shared type, per DEC-017

---

## 3. Database/schema architecture — see `04-database-impact.md` for full detail

Summary of what's architecturally new (not just "a column"):
- `users` and `organizations` both need a suspension concept that does not exist today (`deletedAt` is a different, irreversible GDPR concept — reusing it for admin suspend would be wrong and is explicitly rejected as an option)
- `organizations.plan` is a plain text column with a CHECK constraint; Phase 9 established `subscriptions` as the actual source of truth for billing state. An admin "plan override" must decide whether it writes `organizations.plan` directly (fast, but bypasses the Stripe-backed source of truth Phase 9 built) or drives a real subscription-provider-level change (correct, but couples admin overrides to Stripe's actual API). This is flagged as an open design decision, not resolved here.
- Impersonation has zero prior art in this schema or codebase — session shape, audit event shape, and time-boxing all need to be designed from scratch (Milestone 4)

## 4. API architecture — see `05-api-impact.md`

## 5. Frontend architecture — see `06-frontend-impact.md`

## 6. Security architecture — see `07-security-impact.md`

## 7. Infrastructure architecture — see `08-infrastructure-impact.md`
