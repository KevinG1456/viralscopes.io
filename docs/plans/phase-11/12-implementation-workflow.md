# Phase 11 — Implementation Workflow, Rollback Strategy, Production-Readiness Criteria, Definition of Done

**Status: proposal only. No feature branch exists. No implementation has started.**

---

## 1. Git workflow (proposed, matching Phase 9/10 precedent exactly)

- One shared feature branch for the whole phase, e.g. `feat/VS-phase11-admin-panel`, created only once Milestone 1 is explicitly approved to begin
- Each of the 9 milestones commits directly to that branch (not a separate branch per milestone), matching the exact pattern Phase 9 and Phase 10 both used
- One PR opened only at phase closeout (after Milestone 9), not per-milestone — same established rationale: milestone-level review happens via your explicit approval in conversation, not via GitHub PR review, since this is a solo-maintainer repo (BLK-003)
- Squash-merge via the REST API directly (`PUT /repos/.../pulls/{n}/merge`), per BLK-003's documented resolution — `gh pr merge --admin` does not correctly invoke the bypass on this repo
- `develop` fast-forwarded to match `main` post-merge; feature branch deleted (remote + local); an annotated `phase-11-complete` tag created **only if you request one**, matching the exact pattern from this session (Phase 10's tag was created on separate, explicit instruction after the merge, not assumed automatically)

## 2. The per-milestone discipline, restated once at the phase level

IDENTIFY → IMPLEMENT → VERIFY → REPRODUCE/FIX → RE-VERIFY → DOCUMENT → STOP, applied to every one of the 9 milestones individually (full detail already in `03-milestones.md` per milestone, and in `09-testing-verification.md` for the general verification approach). At the phase level, the meta-rule is: **no milestone begins until the previous one's STOP has been explicitly approved by you.** This document does not change that; it only extends it to describe what happens after Milestone 9's STOP.

## 3. Rollback strategy

### 3.1 Per-milestone rollback (already detailed in `03-milestones.md`)
Every milestone's rollback-impact was assessed individually. Summary:

| Milestone | Rollback profile |
|---|---|
| 1 — Foundation | Low (additive function + route + layout) |
| 2 — User Management | Medium (new migration, additive/nullable — safe rollback) |
| 3 — Organisation Management | Medium (new migration; plan-override rollback depends on chosen mechanism) |
| 4 — Impersonation | Medium-high (auth-adjacent; **feature-flag recommended** so it can be disabled instantly without a code rollback) |
| 5 — Billing & Quota | Medium (financial-data implications; recommend extra manual review before this milestone's work is considered final, independent of the general pipeline) |
| 6 — Job & Workflow | Low (additive route, existing schema) |
| 7 — Prompt Library | None to low (audit-wiring only, possibly no code change at all) |
| 8 — System Health | Low |
| 9 — Hardening | N/A (docs + regression fixes, inherits whatever it touches) |

### 3.2 Phase-level rollback
Because all 9 milestones share one branch and one PR, a phase-level rollback (post-merge) would mean reverting the single squash-merge commit on `main` — the same mechanism used for any other phase, nothing new invented. **Recommendation carried over from Milestone 4's own analysis:** the impersonation entry point specifically should be gated by its own feature flag (e.g., `ADMIN_IMPERSONATION_ENABLED`), independent of the rest of the phase, so that if a problem is found with impersonation specifically after the whole phase has merged, it can be disabled without rolling back the other 8 milestones' worth of otherwise-working admin functionality.

## 4. Production-readiness criteria

Phase 11 should be considered production-ready only when **all** of the following are true (assessed honestly at Milestone 9, not assumed):

1. Every milestone's live verification was actually performed and reported (not just "the code looks right")
2. `TD-027` is genuinely closed — every admin action, old and new, writes a real, confirmed `audit_logs` row
3. Impersonation's server-side write-rejection has been verified against multiple real mutating endpoints, not one
4. Suspend (both user and org) has been verified to take effect on an already-active session's very next request, not just on new logins
5. The full CI pipeline is green, including both independent CodeQL sources
6. `Security_Architecture.md` §18's `GET /api/v1/admin/audit-logs` claim matches what actually shipped (either the route now exists and the claim is accurate, or the claim is corrected to describe accurate current state)
7. Every genuinely-deferred item (YouTube quota display, full org/workspace management, MFA, IP allowlisting, the 14 real workflows) is explicitly documented as deferred in `PROJECT_STATUS.md`, not silently dropped
8. Billing mutations (reset-usage, apply-credits) are honestly labeled Verified / Partially Verified / Unable to Verify per what could actually be tested in this environment (no live Stripe account)
9. You have explicitly reviewed and approved the Milestone 9 final report

**Explicitly not a production-readiness requirement for Phase 11** (per `01-phase-11-overview.md` §6's out-of-scope list): MFA, IP allowlisting, full org/workspace management, YouTube quota data, the 14 real workflows. Their absence does not block Phase 11 from being considered "done" for what it actually set out to build — but they must be *named* as known gaps, not implied to be handled.

## 5. Definition of Done for the entire phase

Phase 11 is done when:
- All 9 milestones have individually reached their own stopping/checkpoint criteria (per `03-milestones.md`) and been explicitly approved
- Milestone 9's full regression pass confirms every prior milestone's functionality still works against the current state of the branch
- `ROADMAP.md`'s Phase 11 checkboxes are updated to reflect exactly what shipped (checked) vs. what was deliberately deferred (left unchecked, with a reason and TD/RISK cross-reference — matching the exact style Phase 10 Milestone 6 used for its own §23 checklist)
- `PROJECT_STATUS.md` has a "Phase 11 Completion Summary" section in the same format as Phase 9's and Phase 10's (Merged / Milestones / Deliverables / Security improvements / Tech debt / Blockers / Production-readiness)
- `CHANGELOG.md` has a Phase 11 entry
- `Security_Architecture.md` is reconciled (permissions matrix, audit taxonomy, §18's audit-log-access claim, and a new §-level or subsection describing impersonation's design, since it currently has zero mentions anywhere in the document)
- A PR is opened, CI is fully green (including the real possibility of a fresh CodeQL false-negative on new admin routes, per the Phase 10 PR #23 precedent — not assumed to pass cleanly on the first attempt), and you explicitly approve the merge
- You explicitly instruct the merge to happen — matching this exact session's own pattern, where Phase 10's merge only proceeded on your direct "whenever you're ready" instruction, not automatically once CI was green

## 6. What happens next (not started until you say so)

Per your explicit instruction: **this entire package is planning only.** No feature branch will be created, no code will be written, no PR will be opened, and no Dependabot PR will be touched until you review this package and explicitly approve Milestone 1.
