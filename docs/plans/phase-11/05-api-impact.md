# Phase 11 — Backend / API Impact

**Status: proposal only. No route, service, or repository code has been written.**

All "already exists" claims below were verified by directly reading `apps/api/src/routes/admin.routes.ts` and `apps/api/src/routes/prompt-library.routes.ts` in full — not assumed from prior documentation.

---

## 1. Existing admin API surface (verified, to be reused/extended, not rebuilt)

All under `/api/v1/admin`, all gated by `[authenticate, requireSuperAdmin, businessRateLimit]`:

| Method | Path | Status |
|---|---|---|
| GET | `/users` | Real, paginated |
| GET | `/organizations` | Real, paginated |
| GET | `/jobs` | Real, paginated, filterable by `status`/`workflowName` |
| GET | `/dead-letter` | Real, paginated, filterable by `resolved` |
| POST | `/dead-letter/:id/retry` | Real — genuinely re-enqueues when a queue is registered for the workflow |
| POST | `/jobs/:workflow/trigger` | Real — 404s cleanly for unregistered workflow names |
| GET | `/metrics` | Real |

Plus, under `/api/v1/admin/prompts` (separate route file, same gating pattern): full CRUD, versioning, set-active, diff, and a test-harness endpoint (`POST /admin/prompts/:name/test`) dispatched through the existing queue→n8n pattern.

**None of these currently call `auditLog()` or any equivalent** — confirmed by reading the full route file; this is TD-027, and every milestone that touches these routes further must close it for the actions it adds or modifies.

---

## 2. New routes proposed, by milestone

### Milestone 1 — Foundation
- `GET /api/v1/admin/me` (or equivalent) — returns a display-only `{ isSuperAdmin: boolean }`, explicitly documented as non-authoritative. Exact shape decided at milestone kickoff per `02-architecture.md` §2.2.

### Milestone 2 — User Management
- `GET /api/v1/admin/users?search=` — extends existing `listUsers`; exact search implementation (indexed `ILIKE`, trigram index, or simple prefix match) to be decided at implementation time based on `email`/`name` column indexing already present (only `uq_users_email` exists today — a search-friendly index may be needed, see `04-database-impact.md` if full-text search is chosen over simple pattern match)
- `POST /api/v1/admin/users/:id/verify`
- `POST /api/v1/admin/users/:id/reset-password`
- `POST /api/v1/admin/users/:id/suspend`
- `POST /api/v1/admin/users/:id/unsuspend`

### Milestone 3 — Organisation Management
- `POST /api/v1/admin/organizations/:id/plan-override` (exact write path pending the decision in `04-database-impact.md` §3)
- `POST /api/v1/admin/organizations/:id/suspend`
- `POST /api/v1/admin/organizations/:id/unsuspend`

### Milestone 4 — Impersonation
- `POST /api/v1/admin/organizations/:id/impersonate` — issues a time-boxed, read-only-scoped session (mechanism per `02-architecture.md`/`07-security-impact.md`)
- `POST /api/v1/admin/impersonation/:id/end`
- `GET /api/v1/admin/impersonation/active` — if the tracked-session design is chosen, lets an admin see/force-end any active impersonation session (including one another admin started, for incident response)
- **Every other existing org-scoped route must be touched conceptually, even if not literally modified**: the impersonation-session-recognition logic has to sit in the shared tenant-context resolution path that all org-scoped routes already go through, so that a mutating request made under an impersonation session is rejected uniformly rather than requiring every route to remember to check for it individually. This is the single largest cross-cutting change in Phase 11 and is called out explicitly rather than understated as "just two new routes."

### Milestone 5 — Billing & Quota
- `GET /api/v1/admin/organizations/:id/billing` — read-only, reuses Phase 9 repositories
- `POST /api/v1/admin/organizations/:id/usage/reset` (mechanism pending `04-database-impact.md` §4)
- `POST /api/v1/admin/organizations/:id/credits` (mechanism pending `04-database-impact.md` §5)

### Milestone 6 — Job & Workflow
- `POST /api/v1/admin/dead-letter/:id/dismiss`
- Audit-log wiring added to the existing `retry` route

### Milestone 7 — Prompt Library
- No new routes anticipated; audit-log wiring added to existing mutating routes if the Milestone 7 verification step finds it's missing (unconfirmed at planning time, see `03-milestones.md` Milestone 7)

### Milestone 8 — System Health
- Extend `GET /api/v1/admin/metrics`'s response shape with Redis usage and dead-letter-depth fields (or confirm they're already present — `AdminService.metrics()` was not read line-by-line during this planning pass and should be checked fresh at Milestone 8 kickoff)

### Milestone 9 — Hardening
- No new routes; audit and regression only

---

## 3. Cross-cutting API concerns

### 3.1 Rate limiting
Every existing admin route already carries `businessRateLimit` (per-user, plan-tier-based — though "plan tier" is a slightly odd fit for a super-admin actor; worth confirming at Milestone 1 kickoff whether super-admin accounts get a sane effective limit or need their own carve-out, since `businessRateLimit` was designed for regular org members). Per the real CodeQL finding from Phase 10 (PR #23), GitHub Advanced Security's default CodeQL "Missing rate limiting" query does **not** recognize `businessRateLimit` as sufficient on its own — every new *sensitive* mutating admin route (suspend, plan-override, impersonate, credits) should carry an explicit `config: { rateLimit: {...} }` override matching the established `auth.routes.ts`/`account.routes.ts` convention, both for genuine defense-in-depth (these are high-impact actions) and to avoid re-triggering the same CI-blocking finding Phase 10 just resolved.

### 3.2 Validation
Every new route must use Zod request-schema validation, matching the existing convention throughout `admin.routes.ts` (e.g., `idParamsSchema`, `triggerParamsSchema`) — no exceptions proposed.

### 3.3 Error handling
Existing `AppError`/`ok()` response conventions must be reused unchanged.

### 3.4 OpenAPI
TD-018 (OpenAPI spec generation) is open and deferred. Phase 11 does not resolve it, but every new route should still be written in a way that's trivially describable later (Zod schemas already double as a natural source for this) — no action required now, just noted so Phase 11 doesn't make TD-018 harder to eventually close.

---

## 4. Service/repository layer

Following the existing `AdminService`/`admin.repository.ts` split:
- New methods added to `AdminService` per milestone (e.g., `suspendUser`, `overridePlan`, `startImpersonation`) rather than new service classes — consistent with how the file already aggregates "platform-wide, cross-org" operations in one place
- `admin.repository.ts` gains corresponding query methods; genuinely new subsystems (impersonation sessions, usage overrides, billing credits) get their own repository files, matching the existing one-repository-per-table-family convention seen elsewhere in `apps/api/src/repositories/`

No changes to non-admin routes/services are anticipated, with two exceptions already called out: `account.service.ts` (Milestone 1's null-org audit fix) and whatever org-scoped middleware needs to recognize impersonation sessions (Milestone 4).
