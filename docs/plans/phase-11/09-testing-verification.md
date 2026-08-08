# Phase 11 — Testing & Verification Strategy

**Status: proposal only.**

---

## 1. What exists today

No automated test suite exists yet anywhere in this repo. Phase 12 (Testing) — unit/integration/E2E/load testing — is a separate, later ROADMAP phase, currently 0% complete. Every prior phase's verification (Phase 4 through Phase 10) has relied on **live, manual verification against the real running application**, explicitly distinguished as Verified / Partially Verified / Unable to Verify, per your standing instruction across this entire engagement. Phase 11 continues this same discipline — it does not invent a test framework mid-phase, and it does not claim automated coverage that doesn't exist.

## 2. Per-milestone verification approach (detailed per-milestone strategy already in `03-milestones.md`)

The general pattern, applied to every milestone:
1. **IDENTIFY** — confirm the current real behavior before changing anything (e.g., confirm `auditLog()` really can't take a null org, confirm `dead_letter_jobs` really already has the resolved columns — both already confirmed during this planning pass, but re-confirmed fresh at implementation time since code may have moved)
2. **IMPLEMENT** — the milestone's scoped change
3. **VERIFY** — live-test against the real running app (dev Docker Compose stack, real Postgres/Redis, not mocks) — this includes actually performing the admin action (suspend a real test user, retry a real dead-letter row seeded by a real workflow failure, etc.), not just confirming the code compiles
4. **REPRODUCE/FIX** — if verification surfaces a gap, reproduce it first (matching the whole engagement's standing rule), then fix
5. **RE-VERIFY** — confirm the fix against the same live reproduction
6. **DOCUMENT** — update the relevant docs (`Security_Architecture.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`) to match what's actually true
7. **STOP** — report and wait for approval before the next milestone

## 3. Specific verification obligations by risk area

**Audit logging (every milestone):** every mutating action's report must include direct confirmation that a real `audit_logs` row was written and read back — not "the code calls `auditLogPlatform()`" as a substitute for "I queried the table and saw the row."

**Session/access revocation (Milestones 2, 3, 4):** suspend and impersonation both claim immediate effect. Verification must include a live reproduction: hold an active session/token, perform the admin action against that same account/org from a second session, then confirm the *first* session's very next request is rejected — not just that a new login is blocked. This is a meaningfully stronger bar than "the suspend endpoint returns 200," and should be treated as the actual pass/fail criterion.

**Impersonation write-rejection (Milestone 4):** verification must attempt multiple different mutating endpoints during an active impersonation session (not just one representative example) and confirm each is rejected server-side. This is the single highest-consequence verification item in Phase 11.

**Billing mutations (Milestone 5):** as Phase 9 itself already documented as a real, honest limitation, no live Stripe account exists in this environment. Reset-usage can be fully verified locally (no external dependency). Apply-credits, if built via the Stripe-driven option, can only be verified against Stripe's test mode — real production credit application will be explicitly reported as **Unable to Verify** in this environment, exactly as Phase 9's own billing hardening pass reported for live Stripe traffic. This must not be silently upgraded to "Verified" in the final report.

**Grafana embedding (Milestone 8):** verifiable only against the local dev Compose stack, since no production Grafana instance exists. The milestone report must state this explicitly rather than imply production-equivalence.

**YouTube quota display (Milestone 8):** verification is of the *absence* of fabricated data — confirming the UI correctly shows "not configured" rather than a fake number, since no real quota manager exists (TD-014/RISK-01).

## 4. Regression verification

Every milestone from 2 onward must include a regression check that the *existing* admin routes (verified real in `05-api-impact.md` §1) still work exactly as before — Phase 11 is extending a working system, and "did I break `/admin/dead-letter/:id/retry` while adding `/dismiss`" is a real, specific check, not a generic assumption of safety.

Milestone 9 (Hardening) repeats full live regression across every milestone's admin action, matching the exact discipline Phase 9 Milestone 6 and Phase 10 Milestone 6 both already used — nothing from Milestones 1–8 is assumed to still work correctly just because it worked when its own milestone shipped.

## 5. Docker verification

See `08-infrastructure-impact.md` §6 for the consolidated per-milestone Docker requirements (rebuild, boot-verify, exercise against the containerized instance for auth-adjacent milestones).

## 6. CI verification

Full pipeline (lint, type-check, build, format:check, secretlint) plus both CodeQL sources (custom `security.yml` job and GitHub Advanced Security's default setup — both must be checked independently, per the real, resolved discrepancy found in Phase 10 PR #23 where one passed and the other initially failed on the same code) plus the production-aware dependency audit gate, on every milestone that touches code.

## 7. What "Definition of Done" means per milestone (full phase-level DoD in `12-implementation-workflow.md`)

A milestone is not done when the code merges to the shared Phase 11 branch — it's done when: the live verification above has actually been performed and its real results (not assumed results) are in the milestone report; any gap found has been reproduced and fixed; the full pipeline is green; the relevant docs are updated; and you have explicitly approved moving to the next milestone.
