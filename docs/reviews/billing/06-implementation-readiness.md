# 06-implementation-readiness.md
# Billing Architecture Review — Implementation Readiness

Assessed milestone-by-milestone against `12-implementation-plan.md`'s M1–M10 breakdown, using the confirmed facts from `01-architecture-review.md` through `05-performance-review.md`.

---

## M1 — Plan Constants and Feature Limits

**Status: NEEDS DECISION**

Cannot start until the duplication between the proposed `packages/shared/src/plans.ts` and the existing, live `apps/api/src/lib/plan-limits.ts` is resolved (`02-consistency-review.md` §1). Starting M1 as currently written would create a second, incompatible source of truth for plan limits on day one of implementation. Decision needed: extend-in-place vs. promote-and-replace (recommendation given in the consistency review).

---

## M2 — Database Migrations

**Status: NEEDS DECISION**

Three small, non-blocking corrections needed before this is purely mechanical:
1. Migration numbers should be `0010`/`0011` (repo's actual latest is `0009_seed_prompt_library.sql`), not `0020`/`0021`.
2. `stripe_webhook_events` should get a provider-agnostic name (e.g. `billing_events`) consistent with `subscriptions.billing_provider`'s multi-provider design, and should cite migrations `0006`/`0007`'s established "identity looked up before tenant context exists" precedent rather than an unrelated one.
3. The RLS section proposing new SELECT-only policies for `subscriptions`/`invoices` should be **deleted** — both tables already have a correct `FOR ALL USING/WITH CHECK` policy from migration `0003`; no new RLS work is needed for them at all.

None of these require a stakeholder decision in the way M1 does — they're corrections an implementer can make directly — but they should be fixed in the document before someone starts writing the actual `.sql` files against numbers/names that don't match the repo.

---

## M3 — Billing Service (Checkout + Portal)

**Status: BLOCKED**

Blocked on:
- M1's resolution (plan constants location determines where `resolveStripePriceId` and plan-tier comparisons live).
- File-path convention fix (`apps/api/src/routes/v1/billing.routes.ts` → `apps/api/src/routes/billing.routes.ts`, no shared schemas package — see `02-consistency-review.md` §2).
- **External dependency, not a code blocker:** a real Stripe account with products/prices/Customer Portal configured. This cannot be verified or even manually tested end-to-end until that account exists — it's listed as a Prerequisite in `12-implementation-plan.md` itself, correctly, but is worth restating here since it means M3 cannot reach "done" (only "written") without it.

---

## M4 — Webhook Handler

**Status: NEEDS DECISION**

Blocked on:
- M2/M3 landing first (needs the DB migration and the `checkout_session_id` field M3 writes to).
- The idempotency-mechanism consolidation decision (`02-consistency-review.md` summary table — one durable table + one short-TTL Redis fast-path, not four separate mechanisms).
- RBAC role-set correction is not required for M4 itself (webhooks have no user-facing auth — they're verified by Stripe signature only), so this milestone is otherwise implementation-ready once the above are settled.

---

## M5 — Usage Service + Quota Middleware

**Status: BLOCKED**

Blocked on:
- `requirePlan()` middleware does not exist anywhere in the codebase (`03-roadmap-validation.md`) — this milestone silently includes building net-new RBAC middleware, not just a usage service. Should be explicitly budgeted as new middleware work, following the existing `require-role.ts`/`require-org-context.ts` pattern.
- The global-vs-opt-in decision for `api_request` quota tracking (`05-performance-review.md`) — this changes whether M5 touches every route in the API or only a handful of specific ones, a significant difference in blast radius and testing burden.
- M1's resolution (quota limits need to read from wherever the single, unified plan-limits source ends up living).

---

## M6 — Feature Gating Enforcement

**Status: BLOCKED**

Blocked on M5. Additionally, two of the planned enforcement rows depend on product features that don't exist yet in any phase:
- `teamSeats`/`workspaces` count-checks require a multi-seat-invite / multi-workspace flow that has never been built (`org-membership.repository.ts` currently only supports one membership per user, by its own explicit comment).
- `promptLibraryAccess` plan-gating conflicts with the prompt library's current design as a `super_admin`-only, platform-wide tool with no org-facing view at all.

**Recommendation:** descope these two rows from M6 (keep the plan-limit *fields* defined for forward compatibility, per `03-roadmap-validation.md`) so M6's actual scope matches features that exist today: video-analysis quota, export quota, watchlist/alert-rule counts, and API-key plan-gating.

---

## M7 — Billing UI

**Status: BLOCKED**

Blocked on M3/M5. Additionally, `12-implementation-plan.md` itself lists `PlanGate.tsx` as "verify — should exist from Phase 8." **It does not exist** — confirmed by a direct search of `apps/web/src` (no file matching `PlanGate`/`plan-gate` anywhere). It is documented as a design spec in `Component_Library.md` (with example usage) but was never built in Phase 8. M7 therefore includes building this component from scratch, not just wiring billing-specific children into it — this should be sized accordingly (it's a reusable component the whole app will lean on, not billing-specific, so consider building it as its own small PR ahead of M7 rather than bundling it in).

---

## M8 — Billing Emails

**Status: BLOCKED**

Hard-blocked on TD-010: no real transactional email provider (SendGrid/Resend) exists in this codebase at any phase — only a dev/test-only logging stub that explicitly throws in staging/production. The three email templates can be *written* against the existing stub for local development, but "billing confirmation email sent" cannot be claimed as done/verified in any real environment until TD-010 is resolved — and TD-010 predates and is independent of Phase 9; it shouldn't be Phase 9's job to fix, but Phase 9 cannot fully ship this milestone without it being fixed by someone. Also apply the performance-review recommendation here: enqueue email sends via BullMQ rather than inline in the webhook handler once a real provider exists.

---

## M9 — Admin Override Endpoint

**Status: NEEDS DECISION**

Blocked on M2/M4 landing, and on correcting the RBAC design: the endpoint must be gated via the existing `require-super-admin.ts` middleware (a live DB read of `users.role`), not a JWT `role` claim that doesn't exist (`04-security-review.md` finding #1). This is a one-line fix to the design, not a structural problem — once corrected, this milestone is otherwise well-scoped and small.

---

## M10 — Integration Tests

**Status: BLOCKED**

No test framework of any kind exists in this repository today — no Vitest/Jest/Playwright dependency anywhere, no existing `*.test.ts` file to pattern-match against, and the root `npm test` script is currently a no-op. This milestone as scoped ("~400 lines of tests") assumes a working test runner is just sitting there ready to receive new test files. It isn't. **This should be split into two milestones:** M10a — stand up a test runner for `apps/api` (Vitest is the natural choice given the rest of the stack; this is genuinely new infrastructure work, not billing-specific, and arguably shouldn't block Phase 9 specifically but blocks *any* meaningful "done" claim for billing) and M10b — the actual billing test suite once a runner exists.

---

## Readiness Summary Table

| Milestone | Status | Primary blocker |
|---|---|---|
| M1 | NEEDS DECISION | Plan-limits duplication vs. existing `plan-limits.ts` |
| M2 | NEEDS DECISION | Migration numbering, table naming, unnecessary RLS re-spec |
| M3 | BLOCKED | M1 + file-path conventions + real Stripe account |
| M4 | NEEDS DECISION | Idempotency-mechanism consolidation |
| M5 | BLOCKED | `requirePlan()` doesn't exist; global-vs-opt-in quota decision |
| M6 | BLOCKED | M5; two enforcement rows depend on unbuilt features |
| M7 | BLOCKED | M3/M5; `PlanGate.tsx` doesn't exist despite being marked "verify" |
| M8 | BLOCKED | TD-010 (no real email provider anywhere in this codebase) |
| M9 | NEEDS DECISION | RBAC must use `require-super-admin.ts`, not a nonexistent JWT claim |
| M10 | BLOCKED | No test framework exists anywhere in the repository |

**Zero of the ten milestones are unconditionally READY today.** This is not a statement that the architecture is bad — it correctly identified most of its own dependencies in `01-overview.md`'s Dependencies table — but several of those claimed dependencies turned out not to actually be there when checked. See `07-final-checklist.md` for the concrete, checkable list of what must be true before each milestone can flip to READY.
