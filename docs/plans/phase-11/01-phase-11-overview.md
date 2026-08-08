# Phase 11 — Super Admin Panel: Overview

**Status of this document:** Planning only. Nothing in Phase 11 has been implemented. No feature branch exists. No code, schema, or CI has been touched to produce this package.

**Prepared:** 2026-08-08, after Phase 10 (Security & Compliance) merged to `main` (`5114919`, tagged `phase-10-complete`).

---

## 1. Exact Phase 11 name and definition (from ROADMAP.md)

`ROADMAP.md` §5, line 694:

> ### Phase 11 — Super Admin Panel
> **Complexity:** Medium | **Duration:** 1–2 weeks | **Required within 30 days of launch**

**Deliverables** (verbatim):
- Internal management tool for the ViralScopes team
- All major admin operations accessible without database access

**Tasks** (verbatim, ROADMAP.md lines 702–708):
- [ ] Organisation management: list, plan override, suspend, read-only impersonation (logged)
- [ ] User management: search, force verify, force password reset, suspend
- [ ] Billing & quota: view subscriptions, reset usage, apply credits
- [ ] Job & workflow: view logs, inspect dead-letter, retry/dismiss, manually trigger workflows
- [ ] Prompt library: view/edit/version/set-active, run test harness
- [ ] System health: Grafana panels, YouTube quota, Redis usage, dead-letter depth
- [ ] All admin actions logged to `audit_logs`

**ROADMAP milestone definition:** "All management operations functional. Every admin action audited."

This is not invented or assumed from memory — it is transcribed directly from `ROADMAP.md` as it exists on `main` today.

---

## 2. Why Phase 11 is next, per ROADMAP.md

`ROADMAP.md` §6 (Dependency Graph, line 790–808):

```
Phase 11 (Admin Panel)    ← depends on Phase 5, 6, 9
```

Phase 11 is **not** gated on Phase 10, and not gated on strict numeric sequence. Its only stated dependencies are Phase 5 (Core Backend API), Phase 6 (n8n Workflow Engine), and Phase 9 (Subscription & Billing).

`PROJECT_STATUS.md` line 1787 independently states the same thing, in its own prioritised next-actions table:

> Phase 9/10 depend on Phase 5 only, independent of each other; Phase 11 depends on Phases 5/6/9, per `ROADMAP.md` §7

So `ROADMAP.md` and `PROJECT_STATUS.md` **agree** on the dependency structure. There is no disagreement to report on *that* point. See `03-milestones.md` and the discrepancy called out below for the one place the two documents' framing genuinely diverges.

---

## 3. Dependency status against Phase 5, 6, 9 — verified, not assumed

| Dependency | ROADMAP requires | Actual status (`PROJECT_STATUS.md` dashboard, verified against real code) |
|---|---|---|
| Phase 5 — Core Backend API | Complete | **36/57 tasks (63%), in progress.** Admin routes (`/api/v1/admin/*`) already exist and work: `GET /users`, `GET /organizations`, `GET /jobs`, `GET /dead-letter`, `POST /dead-letter/:id/retry`, `POST /jobs/:workflow/trigger`, `GET /metrics` — all gated by `requireSuperAdmin` (verified by reading `apps/api/src/routes/admin.routes.ts` directly). Missing: YouTube Quota Manager (TD-014, blocked on RISK-01), Search, Export, most webhooks, OpenAPI spec. |
| Phase 6 — n8n Workflow Engine | Complete | **9/28 tasks (32%), in progress.** Queue infrastructure, base workflow template, retry/dead-letter mechanics are real and working (same admin routes above prove this). The 14 real content-generation workflows (TD-020) are deferred, blocked on RISK-01/RISK-02 (YouTube quota strategy, AI cost model — both unresolved, both overdue). |
| Phase 9 — Subscription & Billing | Complete | **Complete, 6/6 milestones, verified and merged.** Billing repositories, Stripe provider abstraction, subscription/invoice data all real and live. |

**Conclusion: Phase 5 and Phase 6 are genuinely, substantially incomplete against their own ROADMAP task lists.** However — this is not a novel problem specific to Phase 11. `PROJECT_STATUS.md` line 1787 explicitly recommended starting Phase 9, 10, *and* 11 in parallel while Phase 5 sat at 36/57 and Phase 6 at 9/28, using the same established pattern Phase 9 and Phase 10 both already used successfully: **build what Phase 11 actually needs, explicitly scope out what depends on still-unresolved blockers (RISK-01, RISK-02, TD-011, TD-014, TD-020), and document the deferral rather than waiting or guessing.**

Concretely, this means:
- Phase 11's "Job & workflow" admin tasks (view logs, inspect dead-letter, retry/dismiss, manually trigger) do **not** require the 14 real content workflows to exist — they operate on whatever workflows are registered, and the admin surface for the *existing* foundation-template workflow is a complete, honest demonstration of the feature.
- Phase 11's "System health: YouTube quota" task **cannot** be built for real, because no quota data exists anywhere in the system (TD-014, blocked on RISK-01). This is called out explicitly as an in-scope-but-blocked item in `07-security-impact.md` §5 and `08-infrastructure-impact.md` — Phase 11 will build the panel with an honest "not configured" state rather than fabricate data or silently drop the task.

---

## 4. Discrepancy explicitly reported, per your instruction

You asked: *"If ROADMAP.md and PROJECT_STATUS.md disagree, explicitly report the discrepancy instead of silently choosing one."*

There is **one genuine, verified discrepancy**, and it is not between `ROADMAP.md` and `PROJECT_STATUS.md` — both agree on Phase 11's dependencies and scope. The real discrepancy is **inside `Security_Architecture.md` itself, between what it claims exists and what the actual code does**:

- `Security_Architecture.md` §18, line 1305: *"Users can view their own organisation's audit log via `GET /api/v1/admin/audit-logs` (Admin+ role)"* — stated as a fact, present tense.
- Verified directly by reading `apps/api/src/routes/admin.routes.ts` in full: **no such route exists.** The file has exactly seven routes (`/users`, `/organizations`, `/jobs`, `/dead-letter`, `/dead-letter/:id/retry`, `/jobs/:workflow/trigger`, `/metrics`) — none of them read `audit_logs`.
- Confirmed further by `Security_Architecture.md` §23's own checklist, line 1592 (written later, during Phase 10 Milestone 6): *"All admin actions logged to audit_logs — **not done.** `admin.routes.ts` never calls `auditLog()`. Newly tracked as TD-027."*

So §18 describes an aspirational/designed endpoint as if it were shipped, while §23 — written more recently and independently re-verified against real code — correctly says the underlying write path doesn't even exist yet, let alone a read endpoint. **This is not a Phase 11 blocker; it's a Phase 11 deliverable.** `GET /api/v1/admin/audit-logs` must be built as new work, not assumed to already exist. §18's text should be corrected as part of Phase 11's documentation milestone (not before — the correction and the build happen together, per this engagement's established practice of not silently editing inaccurate claims out of the record before the real fix lands).

A second, smaller, and previously-unflagged finding surfaced during this planning research (not a doc-vs-doc conflict, but a real code gap directly relevant to TD-027): `apps/api/src/lib/audit-log.ts`'s `TenantContext.orgId` is typed as `string` (`packages/db/src/client.ts:39`), not `string | null`. `auditLog()` therefore **cannot currently be called for org-less admin actions at all** — confirmed by reading `apps/api/src/services/account.service.ts:65`, which guards its own `auditLog()` call with `if (orgId)`, meaning a GDPR account deletion for a user with no organisation is **silently not audit-logged today**. Phase 11's admin actions (suspend a user with no org, force-verify, etc.) will hit the exact same wall. This must be fixed at the foundation layer before any admin action can be reliably audited — see `04-database-impact.md` §2 and `12-implementation-workflow.md` Milestone 1.

---

## 5. Features and deliverables (proposed Phase 11 scope)

Grounded in the verified "already exists" vs "genuinely missing" inventory (full detail in `02-architecture.md` and `04`–`08`):

**Already built, to be reused as-is (not rebuilt):**
- Admin route gating pattern (`requireSuperAdmin`, live DB read, DEC-017) — apply to every new route
- `GET /users`, `GET /organizations`, `GET /jobs`, `GET /dead-letter`, `POST /dead-letter/:id/retry`, `POST /jobs/:workflow/trigger`, `GET /metrics`
- Full prompt library CRUD/versioning/activation/test-harness (`prompt-library.routes.ts`) and its frontend (`/admin/prompts`, `/admin/prompts/[name]`)
- `dead_letter_jobs.resolved`/`resolvedBy`/`resolvedAt`/`resolutionNotes` columns (dismiss needs zero migration)
- `audit_logs.orgId` nullable at the schema level (Phase 10 Milestone 2, migration 0012) — the schema is ready; the application-layer helper is not (see §4 above)
- `packages/shared`'s `PlanTier`/`PLAN_HIERARCHY`/`PLAN_LIMITS`/`PLANS` for billing admin screens

**Genuinely new work this phase must deliver:**
- Fix `auditLog()`/`TenantContext` to support a null-org write path, and wire it into every mutating admin route (closes TD-027)
- An admin panel frontend shell (nav/layout) — today `/admin/prompts` is the *only* admin page and lives with no dedicated shell at all
- A cheap, non-authoritative "am I an admin" signal for the frontend (server-side gate stays authoritative per DEC-017 — see `07-security-impact.md`)
- User management: search, force-verify, force-password-reset, suspend (needs new schema + session-invalidation design)
- Organisation management: plan override (needs a design decision — see `04-database-impact.md` §3), suspend (needs new schema), read-only impersonation (fully new security design — no prior art anywhere in this codebase)
- Billing & quota admin: view subscriptions (mostly reuses Phase 9 repositories), reset usage (needs a designed mechanism — `usage_events` is an append-only log, "reset" is not a `DELETE`), apply credits (undefined today — needs a proposal)
- `GET /api/v1/admin/audit-logs` (genuinely new — see §4)
- System health dashboard (Grafana links/embeds, Redis usage, dead-letter depth; YouTube quota shown as "not configured" per §3 above)

---

## 6. Explicitly OUT OF SCOPE for Phase 11

- **The 14 real n8n content-generation workflows** (TD-020) — blocked on RISK-01/RISK-02, not a Phase 11 responsibility to unblock
- **YouTube API Quota Manager** (TD-014) — same blocker; Phase 11 only *displays* whatever quota data exists (none, today)
- **Full Organisation & Workspace Management** (TD-011: org CRUD, invite flow, member management, ownership transfer) — Phase 11's "Organisation management" tasks (list/suspend/plan-override/impersonation) do not require this and will not attempt to build it. Any accidental overlap (e.g., if impersonation design needs an ownership concept) will be called out explicitly as a byproduct, never assumed as in-scope.
- **MFA for Super Admin accounts** — `Security_Architecture.md` §6 defers this to v3.0/WebAuthn. Phase 11 will flag the resulting risk (a high-value, password-only account, see `11-risk-register.md`) but will not build MFA.
- **IP allowlisting / network-level restriction of the admin surface** — no such mechanism exists anywhere in `infra/traefik/` today, and `docker-compose.prod.yml` is not deployed to any real server yet. Proposed as a candidate for Phase 14 (Production Deployment) or a later infra hardening pass, not Phase 11 — see `08-infrastructure-impact.md`.
- **Merging, closing, or modifying any Dependabot PR** — covered separately in `10-technical-debt.md` and the final report; no PR action happens during planning.
- **Any code, schema, or CI change** — this entire package is planning only.

---

## 7. High-level milestone count (detail in `03-milestones.md`)

Nine sequential milestones are proposed, following the same one-subsystem-per-milestone discipline used in Phase 9 and Phase 10 (not combined to reduce count, per your explicit instruction):

1. Admin Foundation (audit-log null-org fix, frontend shell, admin-check signal)
2. User Management Admin
3. Organisation Management Admin (list/suspend/plan-override)
4. Read-Only Impersonation
5. Billing & Quota Admin
6. Job & Workflow Admin (dead-letter dismiss + UI)
7. Prompt Library Admin (gap closure + audit wiring)
8. System Health Dashboard
9. Hardening & Final Verification

This is a **proposal for your approval**, not a decision. See `12-implementation-workflow.md` for the full IDENTIFY → IMPLEMENT → VERIFY → REPRODUCE/FIX → RE-VERIFY → DOCUMENT → STOP discipline applied per milestone.
