# 07-final-checklist.md
# Billing Architecture Review — Implementation Checklist

Every item is individually checkable. Grouped by the milestone it belongs to (`12-implementation-plan.md` M1–M10). Decisions must be resolved (checked off) before their dependent code items can start.

---

## Decisions to close first (blocks multiple milestones)

- [ ] **Plan-limits location decided**: extend `apps/api/src/lib/plan-limits.ts` in place, or promote a single unified version to `packages/shared/src/plans.ts` and update all existing call sites (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, `business-rate-limit.ts`)
- [ ] **"Unlimited" sentinel decided**: keep the existing `null` convention (recommended) rather than introducing `-1`
- [ ] **Billing-mutation role set decided**: owner-only vs. owner-and-admin, sourced from Security_Architecture.md's actual permission matrix, applied consistently everywhere
- [ ] **Idempotency mechanism consolidated**: one durable table (provider-agnostic name) + one short-TTL Redis fast-path, replacing the four separate mechanisms currently described
- [ ] **`api_request` quota tracking scope decided**: opt-in per route (consistent with the rest of the design) vs. global on every authenticated request (requires a load test first)
- [ ] **Grace-period CRON mechanism decided**: BullMQ repeatable job vs. n8n scheduled workflow — pick one, not "a CRON job" left unspecified
- [ ] **`stripe_webhook_events` naming decided**: rename to a provider-agnostic name (e.g. `billing_events`) before or during M2
- [ ] **`teamSeats`/`workspaces`/`promptLibraryAccess` enforcement rows**: explicitly descoped from Phase 9 (fields defined, enforcement postponed) or the underlying features are pulled into scope — pick one and state it

---

## Prerequisites (external / cross-cutting, not specific to one milestone)

- [ ] Stripe account created; 3 products + 6 prices (Starter/Professional/Business × monthly/annual) configured
- [ ] Stripe Customer Portal configured to allow self-serve plan changes + cancellation
- [ ] Stripe webhook endpoint registered (staging and production, separate signing secrets)
- [ ] Stripe CLI installed for local development
- [ ] All environment variables added to `.env.example` and to real deployment config (Coolify) — see `10-environment.md`'s 9-variable list
- [ ] TD-010 (real transactional email provider) resolved, or explicitly accepted that billing emails remain unverifiable beyond local dev until it is
- [ ] TD-020 (real n8n business workflows, specifically WF-09) resolved for `video_analyzed` usage-emission specifically to be wired end-to-end — not required for `export_created`/`api_request`, which have real existing trigger points
- [ ] A test runner (Vitest recommended) is configured for `apps/api` and, if E2E is kept in scope, Playwright for `apps/web`/`e2e`

---

## M1 — Plan Constants and Feature Limits

- [ ] Plan-limits location decision (above) resolved
- [ ] `PlanTier` type defined (single location)
- [ ] `PlanLimits`/`FeatureLimits` interface extended with Phase-9-needed fields, using existing `null`-for-unlimited convention
- [ ] `PLAN_LIMITS` populated for all 5 tiers, reconciled against Pricing_Strategy.md §2.6
- [ ] Stripe Price ID env-var names defined (not hard-coded values)
- [ ] Existing call sites (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, `business-rate-limit.ts`) updated if the location changed
- [ ] ESLint rule added blocking `@stripe/react-stripe-js` / `@stripe/stripe-js` imports outside the billing module (PCI scope-creep prevention — currently prose only, not implemented)

## M2 — Database Migrations

- [ ] Migration files numbered correctly against the repo's actual latest (`0009` → next is `0010`)
- [ ] `subscriptions.billing_cycle` column added via the staged (nullable → backfill → NOT NULL → constraint) pattern already shown correctly in `04-database-design.md`
- [ ] `subscriptions.checkout_session_id` column + UNIQUE constraint added
- [ ] Partial unique index `uq_subscriptions_org_active` added `CONCURRENTLY`
- [ ] New webhook-idempotency table created under its corrected, provider-agnostic name, with its "no RLS" justification citing migrations `0006`/`0007`'s established precedent
- [ ] Redundant explicit index on the new table's UNIQUE `event_id`-equivalent column removed (Postgres auto-indexes UNIQUE columns)
- [ ] Incorrect Supabase-style RLS section removed from the architecture doc; explicit confirmation added that `subscriptions`/`invoices` already have a correct policy from migration `0003` and need no change
- [ ] Drizzle schema files updated to match
- [ ] Migration applied to a real development DB and verified with `\d subscriptions` / `\d <new_table>`
- [ ] Down-migration tested (apply → rollback → re-apply)

## M3 — Billing Service (Checkout + Portal)

- [ ] File paths corrected to the real flat convention (`apps/api/src/routes/billing.routes.ts`, no `v1/` subdirectory, no shared schemas package)
- [ ] `apps/api/src/lib/stripe.ts` Stripe client singleton created, initialized from `STRIPE_SECRET_KEY`
- [ ] `BillingService.createCheckoutSession()` implemented (Price ID resolution, upgrade-only validation, `client_reference_id`/`metadata.org_id`)
- [ ] `BillingService.createPortalSession()` implemented (null-check on `provider_customer_id`, correct `402` on no billing account)
- [ ] `requireOrgContext` added to the billing routes' `preHandler` chain, matching every other org-scoped route
- [ ] Checkout endpoint tested against a real Stripe test-mode account end-to-end

## M4 — Webhook Handler

- [ ] `addContentTypeParser` with `parseAs: 'buffer'` configured before the webhook route is registered
- [ ] Signature verification implemented and tested against an invalid signature (expect 400)
- [ ] Single consolidated idempotency check implemented (per the decision above)
- [ ] All 6 event handlers implemented (`checkout.session.completed`, `customer.created`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- [ ] `organizations.plan` kept in sync with `subscriptions.plan` on every handler that changes plan
- [ ] Redis plan cache invalidated on every handler that changes plan or status
- [ ] Every handler writes an `audit_logs` entry (new `auditLog()` helper written first, since none exists)
- [ ] Failed handlers write to `dead_letter_jobs` and never return non-200 to Stripe
- [ ] Webhook race condition (R1: event arrives before `checkout_session_id` is stored) retry logic implemented and tested

## M5 — Usage Service + Quota Middleware

- [ ] `requirePlan()` middleware built fresh (does not exist today), following the existing `require-role.ts` pattern
- [ ] `getPlanFromCache(orgId)` implemented with explicit, tested null-handling for orgs with no `subscriptions` row (defaults to free — matches `organizations.plan`'s existing default)
- [ ] `UsageService.checkQuota()` / `.emit()` / `.getUsageSummary()` / `.resetCounters()` implemented
- [ ] `api_request` tracking scope decision (above) implemented as decided, not left ambiguous
- [ ] BullMQ worker for batched `usage_events` persistence implemented (5-minute cadence)
- [ ] `GET /usage` route added, verified to make no DB call in the happy path

## M6 — Feature Gating Enforcement

- [ ] `teamSeats`/`workspaces`/`promptLibraryAccess` rows explicitly descoped (per the decision above) or their underlying features pulled into scope
- [ ] `requirePlan()` + `checkQuota()` wired onto real, existing endpoints only (not the nonexistent `POST /videos/analyze` — resolve what the real quota-triggering endpoint/event is first)
- [ ] Count-check added in `watchlist.service.ts`/`alert.service.ts` (extends their existing `PLAN_LIMITS` usage, doesn't replace it)
- [ ] `requirePlan('professional')` added to API-key routes
- [ ] Free-plan limits manually tested at the boundary (at-limit request succeeds, over-limit request correctly rejected with the right error code)

## M7 — Billing UI

- [ ] `PlanGate.tsx` built (does not exist despite being marked "verify" — build it as a standalone, reusable component first)
- [ ] `UpgradePrompt.tsx` built
- [ ] Billing settings page built: current plan, usage bars, checkout/portal action buttons
- [ ] Grace-period warning banner implemented
- [ ] Post-checkout success state tested (`?checkout=success` query param handling)

## M8 — Billing Emails

- [ ] TD-010 status confirmed/resolved, or explicitly accepted as a known limitation for this milestone
- [ ] Three templates written (billing-confirmation, payment-failed, quota-warning)
- [ ] Email sends enqueued via BullMQ rather than inline in the webhook handler (performance-review recommendation)
- [ ] 80%-quota-warning trigger implemented with a "send once per period" guard

## M9 — Admin Override Endpoint

- [ ] Endpoint gated via `require-super-admin.ts` (live DB check), not a JWT `role` claim
- [ ] `PUT /admin/organisations/:id/plan` implemented (UPSERT subscription with `billing_provider = 'manual'`, update `organizations.plan`, invalidate cache, audit log)
- [ ] Optional `expiresAt` BullMQ delayed-job reversion implemented and tested against a Redis restart (R12: job lost on restart — daily reconciliation scan as contingency)

## M10 — Integration Tests

- [ ] Test runner (Vitest) installed and configured for `apps/api` — genuinely new to this repository, size and schedule accordingly
- [ ] Unit tests: plan hierarchy, grace-period gating logic, Price ID resolution
- [ ] Integration tests: checkout creation, RBAC rejection, usage tracking
- [ ] Webhook tests: signature rejection, idempotent replay, full lifecycle (checkout → paid → failed → grace → expired)
- [ ] E2E strategy decided: full Playwright drive of Stripe's hosted Checkout DOM (fragile, not recommended) vs. stop at "redirected to checkout.stripe.com" + `stripe trigger` for the rest (recommended)
- [ ] Rollback tested on staging: migrate → verify → rollback → confirm columns/tables removed → re-apply

## Cross-cutting

- [ ] `README.md` updated with the 9 new environment variables and local Stripe CLI workflow
- [ ] `PROJECT_STATUS.md` updated: new DEC/TD/RISK entries for every decision closed above, plus explicit tracking of TD-010/TD-020 as Phase-9-relevant blockers
- [ ] `CHANGELOG.md` updated following the existing per-phase entry format
- [ ] Rollback plan documented per milestone (already present in `12-implementation-plan.md` for each M1–M9; confirm M10's test-only nature means no production rollback is needed for it)
