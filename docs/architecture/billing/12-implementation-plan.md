# 12-implementation-plan.md
# Billing Architecture — Implementation Plan

---

## Prerequisites (Before Writing Any Code)

- [ ] All 14 architecture documents reviewed and approved
- [ ] Stripe account configured: 3 products, 6 prices, Customer Portal settings
- [ ] 9 environment variables added to Coolify (staging + production)
- [ ] Stripe Test Mode webhook endpoint registered
- [ ] Stripe CLI installed locally
- [ ] Open questions from `14-open-questions.md` resolved

---

## Milestone Overview

| # | Name | Approx. lines | Depends on |
|---|---|---|---|
| M0 | Test runner setup for `apps/api` (Vitest) | ~50 | Nothing — genuinely new infrastructure, not billing-specific, but nothing below can be verified without it |
| M1 | Plan constants + feature limits (promotes `apps/api/src/lib/plan-limits.ts`) | ~150 | Nothing |
| M2 | Database migrations | ~100 | M1 |
| M3 | Billing service (checkout + portal) | ~200 | M2 |
| M4 | Webhook handler | ~300 | M2 |
| M5 | Usage service + quota middleware (incl. new `requirePlan()` middleware) | ~300 | M2, M3 |
| M6 | Feature gating enforcement | ~150 (reduced — `teamSeats`/`workspaces`/`promptLibraryAccess` postponed) | M5 |
| M7 | Billing UI (settings page, incl. new `PlanGate.tsx`) | ~250 (increased — `PlanGate.tsx` doesn't exist yet) | M3, M5 |
| M8 | Billing emails | ~150 (blocked on TD-010 for anything beyond local dev) | M4 |
| M9 | Admin override endpoint | ~100 | M4 |
| M10 | Billing test suite | ~400 | M0, M1–M9 |

---

## M0 — Test Runner Setup

**Objective:** Install and configure a test runner for `apps/api` — this does not exist anywhere in the repository today (no Vitest/Jest/Playwright dependency in any `package.json`, no existing `*.test.ts` file, root `npm test` is a no-op). Not billing-specific, but nothing in M1–M10 can be verified without it.

**Files affected:**
- `apps/api/package.json` (add `vitest` devDependency + `test` script)
- `apps/api/vitest.config.ts` (new)
- `turbo.json` (confirm `test` task is wired to depend on `build`/`type-check` as appropriate)

**Verification:** a trivial smoke test (`expect(1 + 1).toBe(2)`) passes via `npm run test --workspace=apps/api`.

**Rollback:** revert the two new files and the `package.json` change — no other code depends on this yet.

**PR size:** ~50 lines

---

## M1 — Plan Constants and Feature Limits

**Objective:** Promote the already-live `apps/api/src/lib/plan-limits.ts` (`PlanTier`, `PlanLimits`, `PLAN_LIMITS`) to `packages/shared/src/plans.ts`, extending it with the fields Phase 9 needs — not a new, parallel definition. This is a **decided** resolution (see `03-domain-model.md`/`08-feature-gating.md`), not an open design question.

**Files affected:**
- `packages/shared/src/plans.ts` (new — receives the promoted, extended content of `apps/api/src/lib/plan-limits.ts`)
- `packages/shared/src/index.ts` (add exports)
- `packages/shared/src/plans.test.ts` (new)
- `apps/api/src/lib/plan-limits.ts` (deleted, or reduced to a re-export from `@viralscopes/shared` for minimal churn — team's choice)
- `apps/api/src/services/watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, `apps/api/src/middleware/business-rate-limit.ts` (update imports to `@viralscopes/shared`)

**Tasks:**
- [ ] Define `PlanTier` type (unchanged from existing)
- [ ] Extend `PlanLimits`/`FeatureLimits` interface, keeping existing field names (`apiRateLimitPerMinute`/`apiRateLimitPerDay`, not `apiRequestsPerDay`) and the existing `number | null` sentinel (not `-1`)
- [ ] Define `PLAN_HIERARCHY` constant (new)
- [ ] Populate `PLAN_LIMITS` for all 5 tiers (from `08-feature-gating.md`'s corrected table)
- [ ] Add `PLANS` metadata (price, display name, stripe price ID env var names)
- [ ] Update the 5 existing `apps/api` call sites to import from `packages/shared` instead
- [ ] Write unit tests for plan hierarchy and limit values

**Verification:**
```bash
npm run test packages/shared
```

**Rollback:** Delete `plans.ts` — no DB changes.

**PR size:** ~150 lines

---

## M2 — Database Migrations

**Objective:** Apply schema changes required for billing.

**Files affected** (numbering corrected — repo's actual latest migration is `0009`, not `0019`):
- `packages/db/src/migrations/0010_add_billing_cycle_to_subscriptions.sql`
- `packages/db/src/migrations/0011_billing_events.sql`
- `packages/db/src/schema/subscriptions.ts` (Drizzle schema update)
- `packages/db/src/schema/billing-events.ts` (new — provider-agnostic name, not `stripe-webhook-events.ts`)

**Tasks:**
- [ ] Write migration 0010 (billing_cycle column + checkout_session_id + partial unique index)
- [ ] Write migration 0011 (`billing_events` table — no separate index needed on `provider_event_id`, the UNIQUE constraint already indexes it; RLS justification cites migrations `0006`/`0007`'s precedent, not `job_logs`)
- [ ] Update Drizzle schema files to match
- [ ] Apply to development DB and verify
- [ ] Write migration down scripts

**Verification:**
```bash
npm run db:migrate
npm run db:migrate:status  # Should show 0010, 0011 as applied
psql $DATABASE_URL -c "\d subscriptions"  # Verify billing_cycle column
psql $DATABASE_URL -c "\d billing_events"  # Verify new table
```

**Rollback:**
```bash
npm run db:migrate:rollback  # Rolls back 0011
npm run db:migrate:rollback  # Rolls back 0010
```

**PR size:** ~100 lines

---

## M3 — Billing Service (Checkout + Portal)

**Objective:** Implement the Stripe Checkout and Customer Portal session creation.

**Files affected** (flat paths corrected — no `routes/v1/` subdirectory exists anywhere in the real codebase; Zod schemas kept inline in the route file, matching every existing route module, not a shared schemas package):
- `apps/api/src/services/billing.service.ts` (new)
- `apps/api/src/repositories/billing.repository.ts` (new)
- `apps/api/src/routes/billing.routes.ts` (new, registered with prefix `/api/v1/billing` in `server.ts`)
- `apps/api/src/lib/stripe.ts` (new — Stripe client singleton, matching how `redis.plugin.ts`/`db.plugin.ts` already centralize external clients)

**Tasks:**
- [ ] Create `apps/api/src/lib/stripe.ts` — initialise Stripe client from `STRIPE_SECRET_KEY`
- [ ] Implement `BillingService.createCheckoutSession()`:
  - Resolve Price ID from env var
  - Validate plan is an upgrade
  - Call `stripe.checkout.sessions.create()`
  - Store `checkout_session_id` in subscriptions table
- [ ] Implement `BillingService.createPortalSession()`:
  - Load `provider_customer_id` from active subscription
  - Call `stripe.billingPortal.sessions.create()`
- [ ] Add routes `POST /billing/checkout` and `POST /billing/portal`, `preHandler: [authenticate, requireOrgContext, requireRole('owner')]` (Owner-only — see `09-security.md`)
- [ ] Add `GET /billing/plans` route returning PLANS constant (public, no auth)

**Verification:**
```bash
# Start Stripe CLI
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe

# Create a checkout session
curl -X POST http://localhost:3001/api/v1/billing/checkout \
  -H "Authorization: Bearer $TEST_JWT" \
  -H "Content-Type: application/json" \
  -d '{"plan":"starter","billingCycle":"monthly","successUrl":"http://localhost:3000/billing?success=true","cancelUrl":"http://localhost:3000/billing"}'
# Expected: 200 with checkoutUrl

# Visit the URL in browser, complete with test card 4242...
# Expected: stripe CLI shows checkout.session.completed event
```

**Rollback:** Delete new service file; remove routes from billing.routes.ts.

**PR size:** ~200 lines

---

## M4 — Webhook Handler

**Objective:** Implement all 6 Stripe webhook event handlers.

**Files affected** (flat path corrected):
- `apps/api/src/services/webhook.service.ts` (new)
- `apps/api/src/routes/webhook.routes.ts` (new, registered with prefix `/api/v1/webhooks`)

**Critical note:** The raw body parser must be configured BEFORE this route is registered.

**Tasks:**
- [ ] Configure `addContentTypeParser` with `parseAs: 'buffer'` for webhook route
- [ ] Implement signature verification
- [ ] Implement the single consolidated idempotency check via `billing_events` table (not the four-mechanism design from the earlier draft — see `06-webhook-design.md`)
- [ ] Write the new `auditLog()` helper (doesn't exist yet — see `09-security.md`)
- [ ] Implement `handleCheckoutCompleted()`
- [ ] Implement `handleCustomerCreated()` — including the DB-lookup-with-retry pattern for out-of-order arrival (no bespoke Redis key)
- [ ] Implement `handleInvoicePaid()` — including quota reset
- [ ] Implement `handlePaymentFailed()` — including grace period
- [ ] Implement `handleSubscriptionUpdated()`
- [ ] Implement `handleSubscriptionDeleted()`
- [ ] All handlers write to `audit_logs` via the new `auditLog()` helper
- [ ] Failed handlers write to `dead_letter_jobs`

**Verification:**
```bash
# Test each event type
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Verify in DB
psql $DATABASE_URL -c "SELECT plan, status FROM subscriptions ORDER BY updated_at DESC LIMIT 1;"
psql $DATABASE_URL -c "SELECT * FROM billing_events ORDER BY processed_at DESC LIMIT 5;"
```

**Rollback:** Remove webhook route; no DB changes needed (`billing_events` rows can remain).

**PR size:** ~300 lines

---

## M5 — Usage Service + Quota Middleware

**Objective:** Implement real-time quota tracking and enforcement.

**Files affected:**
- `apps/api/src/services/usage.service.ts` (new)
- `apps/api/src/middleware/plan-gate.middleware.ts` (new, extends existing rate-limit pattern)
- `apps/api/src/middleware/quota.middleware.ts` (new)
- `apps/api/src/workers/billing-persist.worker.ts` (new BullMQ worker)

**Tasks:**
- [ ] Implement `UsageService.checkQuota(orgId, eventType)`:
  - Derive `periodKey` from `subscriptions.current_period_start`
  - GET Redis counter `vs:quota:{orgId}:{eventType}:{periodKey}`
  - Compare to limit from plan constants
  - If limit is `null`: skip check (unlimited — corrected sentinel, not `-1`)
- [ ] Implement `UsageService.emit(orgId, eventType, quantity, metadata)`:
  - INCR Redis counter
  - Enqueue BullMQ job for DB persistence
- [ ] Implement `UsageService.getUsageSummary(orgId)` for `/usage` endpoint
- [ ] Implement `UsageService.resetCounters(orgId)` — called by invoice.paid handler
- [ ] Implement `billing-persist` BullMQ worker (batch INSERT to usage_events)
- [ ] Implement `checkQuota` Fastify middleware factory — apply to `export_created` (real endpoint) and `api_request` (opt-in, API-key traffic only, deferred until TD-025's API-key auth path exists — see `08-feature-gating.md`); `video_analyzed` is blocked on TD-020 (WF-09 doesn't exist yet)
- [ ] Implement `requirePlan` Fastify middleware factory **from scratch** — this does not exist anywhere in the codebase today, despite earlier drafts describing it as reused Phase 4/5 infrastructure; follow the existing `require-role.ts` pattern
- [ ] Implement `getPlanFromCache(orgId)` — Redis cache with DB fallback, explicit tested null-handling for orgs with no `subscriptions` row (defaults to `free`, matching `organizations.plan`'s existing default)
- [ ] Add `GET /usage` route (any authenticated org member)

**Verification:**
```bash
# Set a low limit in test env, trigger an export, verify quota count
curl -X POST http://localhost:3001/api/v1/exports -H "Authorization: Bearer $TEST_JWT" \
  -d '{"watchlistId":"...", "format":"csv"}'

# Check Redis counter
redis-cli GET "vs:quota:${TEST_ORG_ID}:export_created:2026-07"

# Check usage endpoint
curl http://localhost:3001/api/v1/usage -H "Authorization: Bearer $TEST_JWT"
```

**Rollback:** Delete new service/middleware/worker files; remove `/usage` route.

**PR size:** ~250 lines

---

## M6 — Feature Gating Enforcement

**Objective:** Apply quota and plan gate middleware to all gated endpoints.

**Files affected** (singular file names corrected to match the real convention — `video.routes.ts` not `videos.routes.ts`, etc.; `teamSeats`/`workspaces`/`promptLibraryAccess` enforcement postponed — no `workspaces.routes.ts`/invite-flow changes in this milestone):
- `apps/api/src/routes/export.routes.ts` (add preHandler; video-analysis quota deferred to when WF-09/TD-020 exists)
- `apps/api/src/services/watchlist.service.ts` (extend existing count check)
- `apps/api/src/services/alert.service.ts` (extend existing count check + channel validation)
- `apps/api/src/routes/api-key.routes.ts` (add `requirePlan('professional')`)

**Tasks:**
- [ ] Add `requirePlan('starter')` + `checkQuota('export_created')` to `POST /exports`
- [ ] Extend the existing count check in `watchlist.service.createWatchlist()` (already checks `PLAN_LIMITS[...].watchlists` today — this is genuinely extending live code, not adding it from scratch)
- [ ] Extend the existing count check in `alert.service.createAlertRule()` (same — already live)
- [ ] Add channel allowlist validation in alert rule creation
- [ ] Add `requirePlan('professional')` to all api-key routes
- [ ] **Deferred, not in this milestone:** video-analysis quota gating (blocked on TD-020/WF-09), team-seat/workspace count checks and prompt-library plan-gating (postponed per decision 6 — see `03-domain-model.md`/`08-feature-gating.md`)

**Verification:**
```bash
# Test with free plan
# Create 2 watchlists (at limit) → 3rd should return 403 PLAN_LIMIT_EXCEEDED (corrected from 429)
# Attempt to access API keys → should return 402 PLAN_UPGRADE_REQUIRED
```

**Rollback:** Remove `preHandler` additions; revert service-layer count checks.

**PR size:** ~200 lines

---

## M7 — Billing UI

**Objective:** Build the billing settings page and upgrade prompts.

**Files affected:**
- `apps/web/app/(dashboard)/settings/billing/page.tsx` (new)
- `apps/web/components/billing/UsageBar.tsx` (new)
- `apps/web/components/billing/PlanBadge.tsx` (new)
- `apps/web/components/billing/UpgradePrompt.tsx` (new)
- `apps/web/components/common/PlanGate.tsx` (**build new — confirmed not to exist**, despite being documented as a spec in `Component_Library.md`; no file matching `PlanGate` exists anywhere in `apps/web/src`. Consider as its own small PR ahead of the rest of M7, since it's a reusable component the whole app will lean on, not billing-specific)
- `apps/web/hooks/use-billing.ts` (new)
- `apps/web/lib/api/billing.ts` (new)

**Tasks:**
- [ ] `GET /billing/plans` API hook
- [ ] `POST /billing/checkout` API call with redirect
- [ ] `POST /billing/portal` API call with redirect
- [ ] `GET /usage` API hook
- [ ] Billing settings page layout with plan badge + usage bars + billing action buttons
- [ ] `UpgradePrompt` component for paywall gates
- [ ] Grace period warning banner (shown when `gracePeriodEndsAt` is set)
- [ ] Plan change success toast (reads `?checkout=success` query param on return)

**Verification:**
- [ ] Complete checkout flow in browser (test mode)
- [ ] Verify usage bars update after analysis
- [ ] Verify upgrade prompt appears on Free plan attempting to create 6th watchlist

**PR size:** ~200 lines

---

## M8 — Billing Emails

**Objective:** Implement 3 billing email templates and their send triggers. **Blocked on TD-010** — no real transactional email provider (SendGrid/Resend) exists anywhere in this codebase; `email.service.ts` is a dev-only logging stub that throws in staging/production. Templates can be written and exercised locally against the stub, but "billing email sent" cannot be claimed as done in any real environment until TD-010 is resolved independently of Phase 9. Email sends should be enqueued via the existing BullMQ infrastructure rather than sent inline during webhook processing, to avoid coupling webhook latency (NFR target: <5s p99) to email-provider latency.

**Files affected:**
- `apps/api/src/emails/templates/billing-confirmation.tsx` (new)
- `apps/api/src/emails/templates/payment-failed.tsx` (new)
- `apps/api/src/emails/templates/quota-warning.tsx` (new)
- `apps/api/src/services/webhook.service.ts` (add email calls)
- `apps/api/src/services/usage.service.ts` (add 80% warning trigger)

**Tasks:**
- [ ] Design `billing-confirmation` template: plan name, amount, period, receipt link
- [ ] Design `payment-failed` template: amount due, grace period end date, Customer Portal link
- [ ] Design `quota-warning` template: current usage, limit, plan upgrade CTA
- [ ] Integrate email sends into `handleInvoicePaid()` and `handlePaymentFailed()`
- [ ] Implement 80% quota threshold check in `UsageService.emit()` — send warning email once per period

**Verification:**
```bash
stripe trigger invoice.paid
# Check email received at test inbox

stripe trigger invoice.payment_failed
# Check payment-failed email received
```

**PR size:** ~150 lines

---

## M9 — Admin Override Endpoint

**Objective:** Allow Super Admin to manually set any org's plan.

**Files affected** (flat path corrected):
- `apps/api/src/routes/admin.routes.ts` (extend)
- `apps/api/src/services/billing.service.ts` (add `adminPlanOverride()`)
- `apps/web/app/admin/organisations/[id]/page.tsx` (add plan override UI)

**Tasks:**
- [ ] Implement `PUT /admin/organisations/:id/plan`, gated by `require-super-admin.ts` (live DB read of `users.role`) — **not** a JWT `role` claim, which doesn't exist (see `09-security.md`)
- [ ] UPSERT subscription with `billing_provider = 'manual'`
- [ ] UPDATE organizations.plan
- [ ] Invalidate Redis plan cache
- [ ] Log to audit_logs
- [ ] Enqueue BullMQ delayed job for `expiresAt` revert (optional)
- [ ] Add plan override form to admin org detail page

**Verification:**
- [ ] Override org to Professional via admin API
- [ ] Verify `GET /usage` reflects Professional limits
- [ ] Verify audit log entry created

**PR size:** ~100 lines

---

## M10 — Billing Test Suite

**Objective:** Full test coverage of all billing paths, depending on M0's test runner actually existing.

**Files affected:**
- `apps/api/src/tests/billing/` (new directory)
- `apps/api/src/tests/billing/checkout.test.ts`
- `apps/api/src/tests/billing/webhooks.test.ts`
- `apps/api/src/tests/billing/usage.test.ts`
- `apps/api/src/tests/billing/feature-gating.test.ts`
- `e2e/billing.spec.ts` (new, if E2E is kept in scope — see `11-testing-strategy.md`'s decided approach: stop at the `checkout.stripe.com` redirect + `stripe trigger`, don't drive Stripe's hosted DOM directly)

**PR size:** ~400 lines of tests

---

## Implementation Order

```
M0 (test runner) — prerequisite for verifying everything below
M1 (plans) → M2 (migrations) → M3 (checkout/portal) → M4 (webhooks)
                                                    ↓
                                            M5 (usage/quota, incl. new requirePlan())
                                                    ↓
                                            M6 (feature gates — reduced scope) → M7 (UI, incl. new PlanGate.tsx)
                                            M8 (emails) ← depends on M4; blocked on TD-010 beyond local dev
                                            M9 (admin) ← depends on M4, M5
                                            M10 (tests) ← depends on M0 + all of the above
```
