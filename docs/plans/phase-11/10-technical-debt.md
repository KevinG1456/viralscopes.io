# Phase 11 — Technical Debt: Resolve vs. Defer, and Dependabot Review

**Status: proposal only. No TD item has been touched, no PR has been merged/closed/modified as part of this document.**

---

## 1. Technical debt Phase 11 should resolve

| TD | Description | Why Phase 11 |
|---|---|---|
| **TD-027** | Admin actions not written to `audit_logs` | This is the literal ROADMAP requirement "All admin actions logged to audit_logs" — Milestone 1 exists specifically to fix the root cause (null-org `auditLog()` gap), and every subsequent milestone wires into it. Cannot be honestly deferred; it's in-scope by definition. |
| **New finding, not previously logged** | `account.service.ts`'s GDPR-deletion audit log is silently skipped for org-less users (`if (orgId)` guard, found during this planning research) | Same root cause as TD-027, same fix (`auditLogPlatform()`). Proposed to fix as part of Milestone 1 rather than leave a known, newly-discovered gap sitting next to its own fix. Should be logged as a new TD (or folded into TD-027's resolution notes) at Milestone 1's documentation step. |
| **TD-009** (partial) | "Dead-letter admin endpoint... not built" | **Doc is stale** — list + retry are real (verified). Only "dismiss" and the Grafana panel are genuinely missing. Milestone 6 closes the dismiss gap; Milestone 8 addresses the Grafana panel. TD-009's text should be corrected to reflect actual state, not just marked resolved outright — the correction itself is part of Milestone 9's documentation reconciliation. |

## 2. Technical debt Phase 11 should explicitly touch but only partially resolve

| TD/Risk | Why only partial |
|---|---|
| **TD-011** (Org/Workspace Management) | Phase 11's org-suspend/plan-override/impersonation do not require full org CRUD, invite flows, or ownership transfer. If Milestone 4's impersonation design happens to need an ownership-adjacent concept, that overlap will be called out explicitly as a byproduct — not treated as TD-011 being resolved. |
| **RISK-01** (YouTube quota strategy) | Not resolved by Phase 11. Milestone 8's system-health panel explicitly displays "not configured" rather than pretending this risk is closed. |

## 3. Technical debt that should remain deferred, untouched

| TD | Reason to leave alone |
|---|---|
| **TD-014** | YouTube Quota Manager — blocked on RISK-01, not a Phase 11 responsibility to unblock |
| **TD-020** | 14 real n8n content workflows — same blocker chain (RISK-01/RISK-02) |
| **TD-010** | Transactional email service — Milestone 2's force-password-reset proposal reuses the *existing* forgot-password flow rather than building new email infrastructure, so this stays deferred |
| **TD-013** | Auth-event (not admin-action) audit-log wiring — same underlying `auditLog()` mechanism as TD-027, but a distinct, separately-scoped gap (login/logout/password-change events, not admin actions). Phase 11 fixes the *mechanism* (null-org support) that TD-013 could eventually reuse, but does not itself wire auth events — that remains TD-013's own, still-open item. |
| **TD-018** | OpenAPI spec generation — unaffected either way; new Zod-schema'd routes remain trivially describable later |
| **TD-025** | API-key request-auth path — unrelated to admin panel |
| **TD-021** | Dedicated n8n worker / Postgres-backed storage — unrelated, volume-driven, not a Phase 11 concern |

---

## 4. Dependabot review — open PRs #25–#30, analyzed individually

**No PR is merged, closed, or otherwise modified by this document.** Per-PR facts below verified directly (via `gh pr view`/`gh pr diff` and cross-checked against `package.json`/`package-lock.json` on `main` as of 2026-08-08), not assumed from memory.

### #25 — `chore(deps): Bump node from 22-alpine to 25-alpine` (`infra/docker`)
- **What it changes:** Docker base image for both `api`/`web`, major version bump (22 → 25)
- **Relevant to Phase 11?** Indirectly — Phase 11's code runs on whatever base image is active, but nothing in Phase 11's scope requires Node 25 specifically.
- **Merge before Phase 11?** **Not recommended before.** A Node major bump is exactly the kind of change that should be isolated and independently verified (full rebuild + boot-test of both images, full pipeline, real Docker verification) rather than landing in the middle of 9 sequential admin-panel milestones where a base-image regression would be hard to distinguish from an application bug.
- **Handle as part of a Phase 11 milestone?** No — unrelated subsystem.
- **Remain independent?** **Yes — recommend handling as its own, separate, isolated PR review** (either just before Phase 11 starts, if you want current tooling, or after Phase 11 Milestone 9 closes, if you'd rather not introduce a variable during the phase). Your call, not assumed here.
- **Compatibility/security concerns:** A Node major bump can affect native-module compatibility (e.g., anything using `bcrypt`/`node:crypto` behavior) — should get its own full regression pass, not be bundled with unrelated admin-panel work.

### #26 — `chore(deps-dev): Bump js-yaml from 3.15.0 to 3.15.1`
- **What it changes:** Dev-only dependency, patch bump. Per its own release notes: fixes quadratic-complexity behavior in `!!omap` duplicate-key detection (a security-adjacent but low-severity fix).
- **Relevant to Phase 11?** No — `js-yaml` isn't used by application code Phase 11 touches.
- **Merge before Phase 11?** Low-risk enough to merge anytime; not a blocker either way.
- **Handle as part of a Phase 11 milestone?** No.
- **Remain independent?** Yes.
- **Concerns:** None identified.

### #27 / #29 — `github/codeql-action/{init,analyze}` bump `4.37.4 → 4.37.6`
- **What they change:** CI-only, patch bump to a SHA-pinned GitHub Action (verified: current `main` pins a genuinely older SHA than these PRs propose — these are real forward bumps, not already-superseded, unlike Phase 10's #22/#24).
- **Relevant to Phase 11?** No — CI infrastructure only.
- **Merge before Phase 11?** Low-risk, no app-code interaction. Reasonable to merge independently at any time.
- **Handle as part of a Phase 11 milestone?** No — explicitly out of scope per your constraint ("Do not modify CI workflows" during planning; and structurally these aren't admin-panel work regardless of when they land).
- **Remain independent?** Yes.
- **Concerns:** None — patch-level CodeQL action bumps are routine.

### #28 — `chore(deps): Bump the production-dependencies group with 7 updates`
- **What it changes:** `@fastify/rate-limit` 11.1.0→11.2.0 (patch, **fixes a named security advisory GHSA-grpc-p53c-r64v** per its own release notes), `bullmq` 5.81.2→**6.0.7** (major), `fastify` 5.10.0→5.11.2 (minor), `ioredis` 5.11.1→**6.0.0** (major), `stripe` 22.3.2→22.4.0 (minor), `zod` 3.25.76→**4.4.3** (major), `lucide-react` 1.27.0→1.28.0 (minor).
- **Relevant to Phase 11?** **Directly and substantially.** Phase 11 will write new `bullmq`-adjacent admin code (dead-letter/retry/dismiss/trigger, Milestone 6), new `zod` schemas for every new admin route, `ioredis` underpins the queue and `businessRateLimit` infrastructure every admin route depends on, and `lucide-react` supplies icons for every new admin UI screen.
- **Merge before Phase 11?** **This needs a decision, not a default.** Two defensible paths:
  1. **Merge the whole group before Phase 11 starts**, so all 9 milestones are written against current dependency versions from day one — cleanest, but means absorbing three major-version bumps (`bullmq` 5→6, `ioredis` 5→6, `zod` 3→4) and fully regression-testing existing Phase 5/6/9 code against them *before* any new admin code exists to complicate the picture.
  2. **Defer the whole group until after Phase 11 Milestone 9**, writing all-new admin code against the currently-pinned versions, then absorb the three majors in one isolated pass afterward — avoids mixing "is this bug from my new code or from the dependency bump" during 9 milestones of active development, at the cost of building against soon-to-be-outdated majors.
  - **`zod` 3→4 specifically** is the most consequential for Phase 11: every new admin route's request validation would be written in whichever major is active at the time. A Zod major version bump has historically changed error-shape/parsing-API details — mixing v3-authored and v4-authored schemas mid-phase (if the bump landed between milestones) would be the worst outcome.
  - **Recommendation: resolve this dependency group *before* Milestone 1 begins**, as a deliberate, isolated, fully-regression-tested step — not silently deferred and not silently merged mid-phase. This is a recommendation for your decision, not a default I've applied.
- **Handle as part of a Phase 11 milestone?** No — should be its own isolated verification pass (full pipeline, full regression of Phase 5/6/9's existing code against the three majors) before any Phase 11 milestone starts, if you choose path 1 above.
- **Remain independent?** It's an independent PR either way; the *timing* relative to Phase 11 is the open question above.
- **Compatibility/security concerns:** The `@fastify/rate-limit` bump fixes a real, named advisory — worth prioritizing regardless of the broader group's timing (could in principle be cherry-picked/merged alone ahead of the majors, if you'd rather not block on the group's larger decision — flagged as an option, not a recommendation over the group approach).

### #30 — `chore(deps-dev): Bump the development-dependencies group with 14 updates`
- **What it changes:** Multiple majors — `eslint` 9→**10**, `@eslint/js` 9→**10**, `typescript` 5.9.3→**7.0.2** (two majors), `lint-staged` 15→**17**, `secretlint`/`@secretlint/secretlint-rule-preset-recommend` 9→**13**, `@types/node` 22→**26**, `tailwindcss` 3→**4** (affects `apps/web` build output, not dev-only in effect even though classified dev-dependency) — plus several minors/patches (`turbo`, `typescript-eslint`, `tsx`, `@types/react`, `@types/react-dom`, `postcss` 8.5.23→8.5.25).
- **Relevant to Phase 11?** Indirectly but significantly — `typescript` and `eslint` majors affect every file Phase 11 writes (lint rules, type-checking behavior can both change meaningfully across majors); `tailwindcss` 3→4 affects every new admin page's styling.
- **Merge before Phase 11?** **Recommend deferring until after Phase 11 Milestone 9**, for the same reason as the production group but stronger: a TypeScript major bump (5→7, skipping a whole major) and a Tailwind 3→4 bump both have well-known histories of requiring real code/config changes (Tailwind 4 in particular changed its config format substantially in the broader ecosystem), and absorbing that *simultaneously* with writing 9 new milestones of admin-panel code would make it very hard to attribute any resulting failure correctly.
- **Handle as part of a Phase 11 milestone?** No.
- **Remain independent?** Yes — its own isolated pass, after Phase 11 closes, recommended.
- **Concerns:** Two stacked TypeScript majors (6 and 7) in one bump is the single highest-risk item in this group — worth its own dedicated verification pass regardless of when it lands, not bundled even with #28's group.

---

## 5. Summary recommendation table

| PR | Merge before Phase 11? | Part of a Phase 11 milestone? | Remain independent? |
|---|---|---|---|
| #25 (node 22→25-alpine) | Not recommended before | No | Yes, own review (timing your call) |
| #26 (js-yaml patch) | Low-risk anytime | No | Yes |
| #27 (codeql-action/init patch) | Low-risk anytime | No | Yes |
| #28 (production group, 3 majors) | **Recommend yes, before Milestone 1** — needs your decision | No | Yes, but timed deliberately |
| #29 (codeql-action/analyze patch) | Low-risk anytime | No | Yes |
| #30 (dev-tooling group, 4+ majors) | **Recommend after Milestone 9** | No | Yes |

No PR is recommended for combination with any Phase 11 milestone. All six remain independent Dependabot-managed updates; only their *timing* relative to Phase 11 is flagged as a decision worth making deliberately rather than by default (Dependabot's own PR order).
