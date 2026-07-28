# 00-executive-summary.md
# Billing Architecture Review — Executive Summary

> Reviews `docs/architecture/billing/01`–`14` against the real codebase, ROADMAP.md, PROJECT_STATUS.md, PROJECT_RULES.md, Pricing_Strategy.md, Business_Model.md, REPOSITORY_STRUCTURE.md, CHANGELOG.md, and README.md. Full detail in `01-architecture-review.md` through `07-final-checklist.md`.

---

## Scores

| Dimension | Score | Basis |
|---|---|---|
| **Architecture score** | **62 / 100** | The conceptual design (Stripe Checkout + Portal, webhook-driven state sync, Redis-first quota checks, three-layer feature gating, zero-PCI-scope) is sound and appropriately scoped to Phase 9. The score is held down by one significant reuse violation (a duplicate plan-limits source of truth) and a pattern of writing against an aspirational/stale project layout (`routes/v1/`, Supabase-style RLS, a nonexistent JWT `role` claim) instead of the real codebase, which was directly available to check against. |
| **Maintainability score** | **58 / 100** | Documents are individually well-organized and mostly internally consistent, but four separate idempotency mechanisms for one webhook flow, a `-1`-vs-`null` sentinel inconsistency, and a second parallel plan-limits implementation would all leave the codebase harder to reason about than necessary if implemented as written. Fixing all of it before coding is cheap (it's a documentation pass); fixing it after coding would not be. |
| **Security readiness** | **55 / 100** | PCI, secrets management, webhook signature verification, and replay protection are all genuinely well-designed — above the bar typically seen in a first-pass spec. The score is pulled down by one **confirmed, high-severity** error: the admin-override design assumes a JWT `role` claim that does not exist and would bypass nothing if implemented as written, plus a three-way inconsistent (and in one place self-contradictory) statement of which roles can perform billing actions. Neither is hard to fix — both are traceable to not checking the real JWT/RBAC code before writing the spec. |
| **Production readiness** | **35 / 100** | Zero of the ten planned milestones are unconditionally implementable today (`06-implementation-readiness.md`). This isn't primarily the architecture's fault — it's because several things the documents list as "existing, reusable Phase 4/5 infrastructure" (a `requirePlan()` middleware, a real transactional email provider, an `auditLog()` helper, a working test runner, the real n8n business workflows) don't actually exist in this repository yet. Phase 9 as scoped quietly includes building a meaningful amount of that missing infrastructure, which changes its actual size and risk profile. |
| **Overall recommendation** | **Ready with minor revisions** | Nothing found requires a redesign — the fundamental shape of the system (Stripe as a payment-processing-only provider, subscription state and enforcement owned by the backend, feature gating layered three ways) is correct and matches the user's own architecture constraint. What's needed is a documentation-correction pass (grounded in the real codebase, not the aspirational one) plus honest re-scoping of the milestones that turned out to depend on infrastructure that isn't there yet. |

---

## Remaining Architectural Risks

1. **Plan-limits duplication** (`02-consistency-review.md` §1) — must be resolved before M1, or the codebase ends up with two different definitions of what a "Professional" plan includes.
2. **Webhook race condition** (R1, correctly identified by the architecture itself) — retry logic is designed but untested against a real Stripe account; this is the one risk in the entire set that genuinely needs production-like verification, not just a documentation fix.
3. **Four overlapping idempotency mechanisms** — a correctness risk in a domain (billing) where a duplicate-processing bug means a real customer gets double-charged or a real payment gets silently dropped.
4. **Missing infrastructure quietly folded into Phase 9's scope** — `requirePlan()` middleware, `auditLog()` helper, `PlanGate.tsx` component, and a test runner for `apps/api` all need to be built from scratch; none is "reuse," despite being described that way in places.
5. **Cross-phase dependency on TD-010 (email) and TD-020 (n8n business workflows)** — billing emails and the `video_analyzed` usage-tracking hook cannot be fully verified until those pre-existing, already-logged gaps are closed by someone, independent of Phase 9's own work.

---

## Required Decisions Before Coding

(Full list with context in `07-final-checklist.md`'s "Decisions to close first" section — repeated here as the minimum needed to unblock M1–M2.)

1. Where do plan-limit constants live: extend `apps/api/src/lib/plan-limits.ts` in place, or promote a single unified version to `packages/shared`?
2. Which roles can perform billing mutations — resolved against Security_Architecture.md's actual permission matrix, not restated from memory?
3. One idempotency mechanism, or the four currently described?
4. Is `api_request` quota tracking global (every authenticated call) or opt-in (specific routes only)?
5. What actually runs the grace-period-expiry check — BullMQ repeatable job or an n8n scheduled workflow?
6. Are `teamSeats`/`workspaces`/`promptLibraryAccess` enforcement rows in scope for Phase 9, or postponed until their underlying product features exist?

---

## What Was Checked and Confirmed Wrong (highest-confidence findings)

These aren't matters of opinion — each was checked directly against a real file and found to contradict it:

- Billing emails assumed a working SendGrid/Resend integration; the real `email.service.ts` is a dev-only logging stub that throws in staging/production (TD-010).
- The admin-override security design assumed a JWT `role` claim; the real `AccessTokenPayload` has no such field, and the real super-admin check is a deliberate live database read (`require-super-admin.ts`, whose own comment says "Deliberately NOT based on the JWT").
- RLS policies were written in Supabase's `auth.uid()`/`TO authenticated` syntax; this project doesn't use Supabase Auth and has none of those objects — the real convention (`current_setting('app.current_org_id', true)`) is different and already correctly applied to `subscriptions`/`invoices` today, meaning no new RLS work is even needed there.
- `requirePlan()` middleware, an `auditLog()` helper, and a `PlanGate.tsx` component were each referenced as existing, reusable infrastructure; none exists anywhere in the repository.
- No test framework (Vitest, Jest, or Playwright) exists anywhere in this monorepo, despite an 11-document-long testing strategy assuming one is already configured.
- The secret-scanning tool was misnamed (`detect-secrets` vs. the real `secretlint`).
- n8n's real business-pipeline workflows (WF-01/WF-09/WF-14) don't exist yet (`infra/n8n-workflows/` has only three unrelated demo workflows) — they're documented on paper (TD-020) but not built, which matters because Phase 9's video-analysis usage tracking assumes a hook into WF-09 specifically.

---

## Recommendation

**Ready with minor revisions.** No architectural rework is needed. Before implementation begins:
1. Correct the codebase-vs-documentation mismatches listed above (a documentation-only pass, cited file-by-file in `01-architecture-review.md` and `02-consistency-review.md`).
2. Close the six decisions listed above.
3. Explicitly re-scope M6's two features-that-don't-exist-yet rows and M10's hidden "stand up a test runner for the first time" task, so the milestone plan reflects what Phase 9 actually has to build.

Waiting for review and approval before any application code, migrations, or API endpoints are written, per instruction.
