# Phase 11 — Milestone Breakdown

**Status: proposal, pending approval.** Nothing below has been started. Each milestone follows: IDENTIFY → IMPLEMENT → VERIFY → REPRODUCE/FIX → RE-VERIFY → DOCUMENT → STOP, matching the discipline used throughout Phases 4–10. No milestone begins until the previous one is verified, documented, and explicitly approved.

Nine milestones are proposed, one per subsystem, deliberately not combined to hit a lower count.

---

## Milestone 1 — Admin Foundation

**Objective:** Build the shared infrastructure every later milestone depends on: the audit-log null-org write path, the admin frontend shell, and the admin-check signal. No user-facing admin *feature* ships in this milestone — it is pure foundation.

**Prerequisites:** None beyond Phase 11 approval. This is milestone 1 of 9.

**Implementation scope:**
- `auditLogPlatform()` in `apps/api/src/lib/audit-log.ts` (new function, see `02-architecture.md` §2.3)
- Fix `account.service.ts`'s null-org audit-log skip using the new function (pending approval per §2.3's open question)
- `apps/web/src/app/(dashboard)/admin/layout.tsx` (new admin shell/nav)
- Admin-check signal (`GET /api/v1/admin/me` or equivalent — final shape decided at milestone kickoff, see `02-architecture.md` §2.2)
- `Sidebar.tsx` updated to hide admin nav items from non-admins using the new signal

**Files/subsystems likely affected:** `apps/api/src/lib/audit-log.ts`, `apps/api/src/services/account.service.ts`, `apps/api/src/routes/admin.routes.ts` (new `/me` route if Option B chosen), `apps/web/src/app/(dashboard)/admin/layout.tsx` (new), `apps/web/src/components/*/Sidebar.tsx`, `packages/shared` (new `AdminActionType` union)

**Security considerations:** The new admin-check signal must be documented as non-authoritative (display-only) — every real admin action keeps `requireSuperAdmin`'s live DB read as the actual gate, no exceptions. This must be stated in code comments and in `Security_Architecture.md`, matching DEC-017's existing rationale.

**Verification strategy:** Live-test `auditLogPlatform()` against the real running Postgres — insert with `orgId: null`, confirm the row lands (without `.returning()`, per the known RLS/RETURNING gotcha from Phase 10 Milestone 2), confirm a tenant-scoped read cannot see it, confirm a super-admin-scoped read (once Milestone 1's own read path exists, or via direct query if the read endpoint isn't built yet) can. Verify `account.service.ts`'s deletion audit log now fires for an org-less test account. Verify the frontend nav hides/shows correctly for a real super-admin vs. real regular-user session.

**Docker requirements:** No Dockerfile/Compose changes anticipated (pure application code). Rebuild and boot both `api`/`web` containers to confirm no startup regression, per the same discipline applied every prior milestone.

**CI requirements:** Full pipeline (lint, type-check, build, format, secretlint) plus both CodeQL checks (custom workflow + GitHub Advanced Security default) — Milestone 1 introduces new routes/middleware, exactly the category of change that surfaced the Phase 10 CodeQL rate-limiting finding, so this must be watched closely again.

**Rollback impact:** Low. New function + new route + new frontend layout are all additive; nothing existing is modified except the one-line `account.service.ts` fix, which is independently revertable.

**Dependencies on other milestones:** None (first milestone). Every subsequent milestone depends on this one.

**Stopping/checkpoint criteria:** `auditLogPlatform()` live-verified against real Postgres; admin nav shell live-verified in a real browser session for both an admin and non-admin account; full pipeline green; report delivered; explicit approval received before Milestone 2 begins.

---

## Milestone 2 — User Management Admin

**Objective:** Implement search, force-verify, force-password-reset, and suspend for the `users` table admin surface.

**Prerequisites:** Milestone 1 complete and approved (needs `auditLogPlatform()` and the admin shell).

**Implementation scope:**
- Schema: new `suspendedAt`/`suspendedBy`/`suspendedReason` columns on `users` (see `04-database-impact.md` §1 for exact migration proposal) — explicitly *not* reusing `deletedAt`
- `GET /api/v1/admin/users?search=` (extend existing `listUsers` with a search filter — verify current pagination/filter shape in `admin.repository.ts` before assuming a naive `LIKE` query is safe/indexed)
- `POST /api/v1/admin/users/:id/verify` (force-verify — sets `emailVerified: true` directly)
- `POST /api/v1/admin/users/:id/reset-password` (force-reset — proposal: reuses the existing `forgot-password` email-token flow rather than inventing a second mechanism, so the user still controls their own new password; open question: should it also revoke active sessions immediately, given a support/abuse scenario likely motivates this action)
- `POST /api/v1/admin/users/:id/suspend` / `POST /api/v1/admin/users/:id/unsuspend` — must also revoke active sessions and reject subsequent `authenticate` calls for a suspended user (this touches the auth middleware, not just a new route — flagged explicitly, not assumed trivial)
- Every mutating route above calls `auditLogPlatform()`
- Frontend: `apps/web/src/app/(dashboard)/admin/users/page.tsx` (new)

**Files/subsystems likely affected:** `packages/db/src/schema/users.ts` (+ new migration), `apps/api/src/repositories/admin.repository.ts` / `user.repository.ts`, `apps/api/src/services/admin.service.ts`, `apps/api/src/middleware/authenticate.ts` (must reject suspended users), `apps/api/src/routes/admin.routes.ts`, `apps/web/src/app/(dashboard)/admin/users/`

**Security considerations:** Suspend must be effective immediately (session revocation, not just "new logins blocked") — a suspended user with a live 15-minute access token must not retain access for its remaining lifetime, the same reasoning DEC-017 already applied to super-admin demotion. Force-password-reset must not leak whether an email exists differently than the existing `forgot-password` route already does (reuse that route's exact response shape). A super admin must not be able to suspend themself into a lockout with no other super admin able to reverse it — needs an explicit guard or documented acceptance of the risk.

**Verification strategy:** Live-test suspend against a real test account: confirm an active session is rejected on its very next request (not just on next login), confirm `unsuspend` restores access, confirm force-verify/force-password-reset work against the real email-sending path (or the existing dev-mode log-based stand-in, matching however Phase 4 currently verifies email flows without a real SendGrid/Resend account per TD-010). Confirm every action produces a real `audit_logs` row, read back and checked, not just assumed written.

**Docker requirements:** Rebuild `api` if `authenticate.ts` changes; verify a suspended-user request against a real containerized instance, not just `tsx` dev mode.

**CI requirements:** Full pipeline + CodeQL, as Milestone 1.

**Rollback impact:** Medium — a new migration is involved (additive columns only, safe to roll forward; rollback would need a down-migration dropping the new columns, no data-loss risk since they're nullable/new).

**Dependencies on other milestones:** Milestone 1 (audit logging, admin shell).

**Stopping/checkpoint criteria:** All four user-management actions live-verified end-to-end including session-revocation behavior; audit log entries confirmed real; full pipeline green; report delivered; approval received before Milestone 3.

---

## Milestone 3 — Organisation Management Admin

**Objective:** Implement list (already exists — verify only), plan override, and suspend for organisations.

**Prerequisites:** Milestone 1 complete. Not dependent on Milestone 2, but sequenced after it for consistency of session-revocation patterns already established there.

**Implementation scope:**
- Schema: new `suspendedAt`/`suspendedBy`/`suspendedReason` columns on `organizations` (parallel to Milestone 2's user columns)
- **Plan override — requires an explicit decision before implementation, not assumed here:** does the admin action write `organizations.plan` directly (fast, simple, but bypasses Phase 9's `subscriptions`-table source of truth and could desync from what Stripe actually reports), or does it drive a real change through the existing billing-provider abstraction (`billing-provider.ts`) so `subscriptions` stays authoritative? Recommendation: the latter, reusing Phase 9's existing provider abstraction rather than adding a second, competing write path — but this must be confirmed with you before Milestone 3 starts, not decided unilaterally mid-implementation.
- `POST /api/v1/admin/organizations/:id/suspend` / `unsuspend` — suspending an org should block all its members' access to org-scoped resources (needs to interact with the RLS/tenant-context layer, not just add a flag nobody checks)
- Frontend: `apps/web/src/app/(dashboard)/admin/organizations/page.tsx` (new)

**Files/subsystems likely affected:** `packages/db/src/schema/organizations.ts` (+ migration), `apps/api/src/lib/billing-provider.ts` (if the provider-driven override path is chosen), `apps/api/src/repositories/admin.repository.ts`, `apps/api/src/services/admin.service.ts`, likely `apps/api/src/middleware/` (org-suspend enforcement point — exact location depends on how org-scoped middleware currently resolves tenant context, needs to be identified during implementation, not assumed here), `apps/web/src/app/(dashboard)/admin/organizations/`

**Security considerations:** Org suspend must actually block org-scoped API access for all members, not just prevent new logins — this needs the same "immediate effect" rigor as Milestone 2's user suspend. Plan override is a direct financial-state mutation; it must be logged with enough metadata (previous plan, new plan, admin identity, reason) to support a billing dispute investigation later.

**Verification strategy:** Live-test org suspend against a real test org with a real member account — confirm the member's next org-scoped request is rejected. Live-test plan override end-to-end against whatever mechanism is chosen, confirming `subscriptions`/`organizations.plan` (whichever is authoritative) actually reflects the new state and that Phase 9's existing feature-enforcement logic (`plan-limits.ts`) picks it up correctly, not just that a row changed.

**Docker requirements:** Rebuild `api` if tenant-context/middleware changes; verify org-suspend enforcement against a real containerized instance.

**CI requirements:** Full pipeline + CodeQL.

**Rollback impact:** Medium (new migration, additive/nullable). If the provider-driven plan-override path is chosen, rollback of a *specific* override requires the same care as any other billing state change (Phase 9's own hardening precedent).

**Dependencies on other milestones:** Milestone 1. Loosely follows Milestone 2's suspend pattern for consistency.

**Stopping/checkpoint criteria:** Suspend and plan-override both live-verified with real access-control consequences confirmed, not just a DB row change; report delivered; approval received before Milestone 4.

---

## Milestone 4 — Read-Only Impersonation

**Objective:** Design and implement "read-only impersonation (logged)" for organisations — the single largest net-new security surface in Phase 11, isolated into its own milestone deliberately because of its risk profile, not combined with Milestone 3's other org tasks.

**Prerequisites:** Milestones 1–3 complete and approved. This milestone does not begin implementation until a design proposal (session shape, scope boundaries, time-boxing, audit event shape) is separately reviewed and approved by you — the design itself is a checkpoint inside this milestone, not assumed.

**Implementation scope (proposal, to be confirmed at milestone kickoff):**
- A time-boxed, explicitly-scoped "impersonation session" — proposed as a short-lived, separately-flagged token/claim (not a full re-login as the target user) that: (a) grants read-only access to the target org's data through existing org-scoped routes, (b) is rejected by any mutating endpoint outright at the middleware layer (not just "not exposed in the UI" — a defense-in-depth server-side block), (c) has a hard expiry (proposed: 30 minutes, configurable), (d) is visibly, unmissably indicated in the UI for the duration (e.g., a persistent banner), and (e) generates one `audit_logs` entry on start and one on end/expiry, with the impersonating admin's identity in every row touched during the session — not just a single log line
- New middleware or an extension of the existing tenant-context resolution to recognise an impersonation session and (1) scope it exactly like a normal member session for reads, (2) hard-reject writes regardless of what the underlying route would otherwise allow
- Frontend: an explicit "Impersonate (read-only)" action from the organisation admin page, a visible in-session banner, and an explicit "End impersonation" control

**Files/subsystems likely affected:** New middleware (exact name/location TBD at design time), `apps/api/src/lib/jwt.ts` or a parallel token mechanism (needs explicit decision: extend the existing access-token shape with an `impersonating` claim, vs. a fully separate short-lived token type — recommend the latter to avoid any risk of an impersonation claim surviving into a normal refreshed session), `packages/db` (if a dedicated `impersonation_sessions` tracking table is chosen over pure JWT-claim + audit-log — recommended, so an admin's active impersonation sessions can be listed/force-ended), `apps/web` (banner component, org admin page action)

**Security considerations — this is the core of the milestone, not a footnote:**
- Must be genuinely read-only, enforced server-side, not client-side-only
- Must be time-boxed and auto-expiring, not indefinite
- Must be unmissable to the admin while active (reduces the risk of an admin forgetting they're impersonating and treating it as their own session)
- Must be fully audited — every resource read during an impersonation session, or at minimum the session's start/end plus the target org, must be reconstructable later
- Must not be escalatable — an impersonation session must not be usable to obtain a normal, longer-lived session for the target org (no "upgrade path")
- No MFA exists for super admin accounts (per `01-phase-11-overview.md` §6, explicitly out of scope) — this makes impersonation-session issuance a single-factor-protected action gating access to every org's data. This residual risk must be explicitly written into `11-risk-register.md`, not silently accepted.

**Verification strategy:** Live-test against a real test org: start impersonation, confirm reads succeed and are correctly scoped to the target org, confirm every mutating endpoint tried during the session is rejected (attempt several, not just one, as a real reproduction), confirm the session expires on schedule, confirm both start and end are in `audit_logs` with correct actor/target metadata, confirm the banner renders and an "End impersonation" action works.

**Docker requirements:** Rebuild `api`/`web`; this milestone is exactly the kind of auth-adjacent change that needs a real containerized boot-test, not just local `tsx`, per the standing lesson from the BLK-level Docker-boot-crash precedent logged in `PROJECT_STATUS.md`.

**CI requirements:** Full pipeline + CodeQL — new auth-adjacent middleware is a high-attention area for both CodeQL passes given Phase 10's own CodeQL finding history on similar changes.

**Rollback impact:** Medium-high — this is new-token/session-adjacent code, the category of change most likely to have subtle regressions. Recommend feature-flagging the impersonation entry point itself (an env var or DB flag gating whether the "Impersonate" button/route is even reachable) so it can be disabled instantly in production without a code rollback if any issue surfaces.

**Dependencies on other milestones:** Milestones 1–3 (needs the admin shell, the org admin page, and the suspend/audit patterns already established).

**Stopping/checkpoint criteria:** Design proposal separately approved before implementation begins; every security consideration above live-verified with a real reproduction attempt (not just code review); full pipeline green; report delivered; approval received before Milestone 5.

---

## Milestone 5 — Billing & Quota Admin

**Objective:** View subscriptions, reset usage, apply credits.

**Prerequisites:** Milestone 1. Not dependent on Milestones 2–4, but sequenced after Milestone 3 since it's the next "view + mutate org-scoped state" subsystem.

**Implementation scope:**
- `GET /api/v1/admin/organizations/:id/billing` — reuses Phase 9's existing `subscriptions`/`invoices` repositories, read-only, no new billing logic
- **Reset usage — requires a design decision, not assumed:** `usage_events` is confirmed (by direct code comment read) to be an append-only, monthly-partitioned event log, "never updated." A literal reset (delete rows) would corrupt the historical record Phase 9's own analytics/limits logic depends on. Proposed approach: a compensating negative/override event (or a small `usage_overrides` table Phase 5's `plan-limits.ts` checks alongside the raw event count) rather than mutating history. This needs your sign-off before implementation, not a unilateral choice.
- **Apply credits — fully undefined today, needs a proposal, not assumed:** two real options — (a) drive Stripe's actual customer-balance/coupon API through the existing `billing-provider.ts` abstraction (correct source of truth, couples to Stripe's real API surface, unverifiable in this environment since no live Stripe account exists per Phase 9's own noted limitation), or (b) a new internal ledger table tracked in `packages/db` independent of Stripe (simpler to build and fully verifiable locally, but becomes a second source of truth for "what a customer is owed" that must be reconciled with Stripe manually). Recommendation: option (a) for correctness, with the explicit caveat that full verification will be "Partially Verified" at best in this environment (same honest limitation Phase 9 already documented for live Stripe traffic) — final choice deferred to milestone kickoff.
- Frontend: extend the org admin page (Milestone 3) with a billing tab/section

**Files/subsystems likely affected:** `apps/api/src/repositories/billing.repository.ts`, `apps/api/src/lib/billing-provider.ts`, possibly `packages/db/src/schema/` (new `usage_overrides` and/or credit-ledger table, pending the decisions above), `apps/web/src/app/(dashboard)/admin/organizations/[id]/billing/` (or similar)

**Security considerations:** Both reset-usage and apply-credits are direct financial/quota mutations — same audit-metadata rigor as Milestone 3's plan override (previous value, new value, admin identity, reason, timestamp).

**Verification strategy:** Live-test against a real test org's subscription data (synthetic/test-mode Stripe events, matching Phase 9's own established verification method — no live Stripe account exists in this environment, so real production Stripe credit application will be Unable to Verify / Partially Verified, stated honestly rather than assumed working).

**Docker requirements:** Rebuild `api` if `billing-provider.ts` changes; verify webhook/provider interaction still works post-change (regression check against Phase 9's existing hardening).

**CI requirements:** Full pipeline + CodeQL + dependency audit (Stripe SDK version is in the current dependency set — no known issue today, but worth re-checking at implementation time).

**Rollback impact:** Medium — any new billing-adjacent schema is additive; a bad credit/usage-override write has real financial-data implications, so this milestone should get the most careful manual review of any in Phase 11 before merging its branch work forward.

**Dependencies on other milestones:** Milestone 1 (audit logging), benefits from Milestone 3's org admin page existing first.

**Stopping/checkpoint criteria:** View-subscriptions live-verified against real data; reset-usage and apply-credits mechanisms explicitly approved *before* implementation, then live-verified against test-mode data; report delivered, explicitly distinguishing Verified vs Partially Verified vs Unable to Verify per your standing instruction; approval received before Milestone 6.

---

## Milestone 6 — Job & Workflow Admin

**Objective:** Complete the "view logs, inspect dead-letter, retry/dismiss, manually trigger workflows" task. Backend list/retry/trigger already exist and are verified real — this milestone is primarily frontend UI plus the one missing backend piece (dismiss).

**Prerequisites:** Milestone 1.

**Implementation scope:**
- `POST /api/v1/admin/dead-letter/:id/dismiss` — new route + repository method. **Zero schema migration needed**: `dead_letter_jobs.resolved`/`resolvedBy`/`resolvedAt`/`resolutionNotes` already exist (verified by direct schema read) — this is exactly the kind of "already provisioned, never wired" gap this milestone closes.
- Wire `auditLogPlatform()` into `retryDeadLetterJob` and the new `dismiss` action (currently unaudited — part of the same TD-027 gap)
- Frontend: `apps/web/src/app/(dashboard)/admin/jobs/page.tsx` (job log viewer) and `admin/dead-letter/page.tsx` (dead-letter inspector with retry/dismiss actions and a manual-trigger form for registered workflows)

**Files/subsystems likely affected:** `apps/api/src/repositories/admin.repository.ts`, `apps/api/src/services/admin.service.ts`, `apps/api/src/routes/admin.routes.ts`, `apps/web/src/app/(dashboard)/admin/jobs/`, `apps/web/src/app/(dashboard)/admin/dead-letter/`

**Security considerations:** Manual workflow trigger already exists and already correctly 404s unregistered workflow names (verified in `admin.routes.ts`) — the frontend must not silently allow submitting an unregistered name without surfacing that rejection clearly, since this is an admin-facing operational tool, not just a UI polish concern.

**Verification strategy:** Live-test dismiss against a real dead-letter row (seed one via a real workflow failure, not a fabricated DB row, consistent with the "reproduce before fix" / "verify against the running app" discipline). Confirm retry/trigger continue to work exactly as before (regression check — this milestone must not touch the working backend logic, only add the missing dismiss route alongside it).

**Docker requirements:** Rebuild `api`/`web`; no infra changes anticipated.

**CI requirements:** Full pipeline + CodeQL (new route again).

**Rollback impact:** Low — additive route, no schema change, no modification to existing working endpoints.

**Dependencies on other milestones:** Milestone 1.

**Stopping/checkpoint criteria:** Dismiss live-verified against a real dead-letter row; retry/trigger regression-checked; full pipeline green; report delivered; approval received before Milestone 7.

---

## Milestone 7 — Prompt Library Admin

**Objective:** Close the gap between what already exists (full prompt CRUD/versioning/test-harness, both backend and frontend) and Phase 11's stated task list, specifically audit-log wiring — the one piece not yet confirmed present.

**Prerequisites:** Milestone 1.

**Implementation scope:**
- Verify (do not assume) whether `prompt-library.routes.ts`'s mutating actions (create/edit/version/set-active) already call `auditLog()`/would need `auditLogPlatform()`. This must be checked directly at implementation time — it was not exhaustively verified during this planning pass (the planning research confirmed the routes exist and are gated, not their internal audit-logging status line-by-line).
- If missing, wire `auditLogPlatform()` into every mutating prompt-library action, matching the pattern established in Milestones 2, 3, and 6
- No other net-new functionality is anticipated — this milestone exists specifically because Phase 11's ROADMAP task list names "Prompt library: view/edit/version/set-active, run test harness" as in-scope, and the honest answer is "already built, just needs the audit-logging gap closed," which deserves verification and a real milestone report, not silent assumption that it's "already done."

**Files/subsystems likely affected:** `apps/api/src/routes/prompt-library.routes.ts`, possibly `apps/api/src/services/prompt-library.service.ts`

**Security considerations:** None beyond the existing, already-verified `requireSuperAdmin` gating.

**Verification strategy:** For each mutating action (create, edit, version, set-active), perform it against the real running app and confirm a corresponding `audit_logs` row exists afterward.

**Docker requirements:** Rebuild `api` only if changes are made; if the audit check reveals nothing is missing, this milestone may close with no code change at all — that is an acceptable, honestly-reported outcome, not a failure to find work.

**CI requirements:** Full pipeline if any change is made.

**Rollback impact:** None to low.

**Dependencies on other milestones:** Milestone 1.

**Stopping/checkpoint criteria:** Every mutating prompt-library action confirmed to produce (or now produces) a real audit-log row; report delivered explicitly stating which of the two outcomes occurred; approval received before Milestone 8.

---

## Milestone 8 — System Health Dashboard

**Objective:** Grafana panels, YouTube quota, Redis usage, dead-letter depth — surfaced in the admin panel.

**Prerequisites:** Milestones 1 and 6 (dead-letter depth is most meaningful once Milestone 6's dead-letter admin UI exists).

**Implementation scope:**
- Redis usage and dead-letter depth: extend the existing `GET /api/v1/admin/metrics` endpoint (already real, verified in `admin.routes.ts`) or add fields to it, surfaced on a new `apps/web/src/app/(dashboard)/admin/system/page.tsx`
- Grafana panels: proposal — embed or deep-link to existing Grafana dashboards (Grafana/Prometheus/Loki are already running per `docker-compose.yml`, confirmed in earlier Phase 10 infrastructure work) rather than rebuilding Grafana's visualisation inside the Next.js app. Exact embed mechanism (iframe with Grafana's own auth, vs. a signed link, vs. just an external-link button) needs a decision — Grafana is not deployed anywhere publicly yet (no production server provisioned, per `PROJECT_STATUS.md`), so this can only be locally verified against the dev-compose Grafana instance today.
- **YouTube quota: explicitly shown as "not configured" / "no data" state.** No quota manager exists (TD-014, blocked on RISK-01) — this milestone must not fabricate a fake quota display. This is a deliberate, honestly-reported partial delivery of the ROADMAP line item, not a silent scope drop (see `01-phase-11-overview.md` §3).

**Files/subsystems likely affected:** `apps/api/src/services/admin.service.ts` (`metrics()`), `apps/web/src/app/(dashboard)/admin/system/`

**Security considerations:** If Grafana is embedded via iframe, its own auth/access-control must not be bypassed or weakened to make the embed work — needs explicit verification, not assumption that "it's already internal-only so it's fine."

**Verification strategy:** Live-test against the real dev-compose stack — confirm Redis usage and dead-letter depth numbers match reality (cross-check against a manual `redis-cli`/DB query, not just trust the endpoint's own math). Confirm the YouTube-quota "not configured" state renders correctly rather than erroring or showing stale/fake data.

**Docker requirements:** No new services. Verify against the existing dev `docker-compose.yml` stack (Grafana/Prometheus/Loki/Redis already running, confirmed).

**CI requirements:** Full pipeline.

**Rollback impact:** Low.

**Dependencies on other milestones:** Milestones 1 and 6.

**Stopping/checkpoint criteria:** Redis/dead-letter-depth numbers live-verified as accurate; Grafana embed mechanism decided and verified against the local dev stack (explicitly noting it is unverified against any real production deployment, since none exists); YouTube quota's honest "not configured" state confirmed; report delivered; approval received before Milestone 9.

---

## Milestone 9 — Hardening & Final Verification

**Objective:** Full regression across every prior milestone, technical-debt reconciliation, documentation reconciliation, final production-readiness assessment — mirroring Phase 9 Milestone 6 and Phase 10 Milestone 6's own closing milestones exactly.

**Prerequisites:** Milestones 1–8 complete and individually approved.

**Implementation scope:** No new features. Re-verify every milestone's live behavior against the current state of `main` (not assumed still-correct after 8 milestones of subsequent changes — this exact assumption was explicitly checked and confirmed in both Phase 9 and Phase 10's own final milestones). Reconcile:
- `TD-027` marked resolved (admin actions now audited) — or explicitly not, if any gap remains
- `Security_Architecture.md` §18 corrected (the `GET /api/v1/admin/audit-logs` claim, per `01-phase-11-overview.md` §4) to match what actually shipped
- `Security_Architecture.md` §3's permissions matrix updated if any new admin capability changes it
- `ROADMAP.md`'s Phase 11 checkboxes updated to reflect exactly what shipped vs. what was explicitly deferred (YouTube quota display, full org/workspace management, MFA, IP allowlisting)
- `PROJECT_STATUS.md` Phase 11 completion summary, in the same format as Phase 9/10's

**Files/subsystems likely affected:** Documentation only, plus any bug fixes surfaced by the regression pass.

**Security considerations:** Re-run the impersonation security checks from Milestone 4 specifically — the highest-risk surface deserves a second look after everything else has landed around it, in case a later milestone introduced an interaction effect (e.g., Milestone 5's billing admin page accidentally becoming reachable during an active impersonation session — this specific interaction should be explicitly tested, not assumed safe).

**Verification strategy:** Same rigor as Phase 10 Milestone 6 — live regression of every admin action, not just a code-review pass. Full pipeline (lint/type-check/build/format/secretlint), both CodeQL checks, dependency audit.

**Docker requirements:** Full rebuild and boot verification of both `api`/`web` images, matching every prior phase-closeout milestone.

**CI requirements:** Everything green, including the two independent CodeQL sources — Phase 10's PR #23 experience (a real CodeQL finding on a genuinely-protected-but-unrecognized route) means this should not be assumed to pass on the first attempt.

**Rollback impact:** N/A (documentation + verification milestone; any code fixes found here carry the rollback profile of whatever they touch).

**Dependencies on other milestones:** All of 1–8.

**Stopping/checkpoint criteria:** Full Phase 11 report delivered (files changed, verification performed, issues found/fixed, remaining technical debt, rollback impact, production-readiness assessment, deferred gaps) — then **stop and wait for explicit approval before opening a PR / merging**, matching the exact Phase 9/10 closeout pattern.
