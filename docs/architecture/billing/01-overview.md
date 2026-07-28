# 01-overview.md
# Billing Architecture — Overview

> **Phase:** 9 — Subscription & Billing
> **Status:** Architecture / Pre-implementation
> **Created:** 2026-07-28
> **Based on:** ROADMAP.md §Phase 9, Pricing_Strategy.md, Database_Schema.md, URL_and_API_Structure.md, Security_Architecture.md, PROJECT_RULES.md

---

## Purpose

Phase 9 introduces Stripe-powered subscription billing to ViralScopes.io. It transforms the platform from a free MVP into a commercially operating SaaS product by:

- Collecting subscription payments for the five plan tiers (Free, Starter, Professional, Business, Enterprise)
- Tracking real-time usage against per-plan quotas
- Enforcing feature gates at the API and frontend layers
- Handling the complete subscription lifecycle (upgrade, downgrade, cancellation, payment failure, grace period, renewal)
- Sending transactional billing emails

All implementation reuses existing authentication (Phase 4), RBAC (Phase 4), rate-limiting (Phase 5), Redis (Phase 2), and the quota event system defined in Phase 5.

---

## Goals

| # | Goal | Success criterion |
|---|---|---|
| G1 | Accept payment for all five plan tiers | Starter, Professional, Business purchases complete in < 10 seconds |
| G2 | Enforce per-plan quotas reliably | Quota exceeded → 429 response within 1 API call of the limit |
| G3 | Handle the full subscription lifecycle | All Stripe webhook events processed idempotently within 5 seconds |
| G4 | Survive payment failure gracefully | 3-day grace period active; customer notified; access preserved |
| G5 | Provide billing transparency to customers | Usage dashboard accurate within 60 seconds of an event |
| G6 | Zero PCI scope exposure | No card data touches our servers at any point |

---

## Non-Goals

The following are explicitly out of scope for Phase 9:

| Non-goal | Deferred to |
|---|---|
| Paddle billing (global VAT merchant of record) | v1.5 |
| Crypto (USDC/USDT) invoicing | v2.0 |
| Usage overages (pay-per-unit above plan limit) | v1.5 |
| Affiliate / referral commission payouts | v2.0 |
| White-label billing | v3.0 |
| SaaS analytics / MRR dashboards (internal) | Post-launch tooling |
| Annual plan migration from monthly mid-cycle | v1.5 (currently: new annual subs only) |
| Multi-currency pricing | v1.5 (GBP + USD only, via Stripe FX) |

---

## Functional Requirements

### FR-01 — Plan Definitions

- Five tiers must be hard-coded as constants in `packages/shared/src/plans.ts`
- Each tier defines: `id`, `displayName`, `monthlyPricePence`, `annualPricePence`, `stripePriceIdMonthly`, `stripePriceIdAnnual`, and a `limits` map (see Feature Gating doc)
- Enterprise plan has `monthlyPricePence: null` (custom; not self-serve)
- The Free plan has no Stripe subscription; it is the default for all new organisations

### FR-02 — Checkout Flow

- Authenticated users may initiate checkout for any paid plan above their current plan
- Checkout creates a Stripe Checkout Session (hosted page) — no card fields on our domain (zero PCI scope)
- `client_reference_id` = `org_id` for post-checkout reconciliation
- On success, Stripe fires `customer.subscription.created` and `invoice.paid`; we never trust the return URL alone

### FR-03 — Customer Portal

- All post-purchase actions (upgrade, downgrade, cancel, payment method update) happen in Stripe's hosted Customer Portal
- We provide a portal session URL; the customer manages the rest
- We sync changes from webhooks, not from polling

### FR-04 — Webhook Processing

Must handle these Stripe events idempotently:

| Event | Action |
|---|---|
| `customer.created` | Store `provider_customer_id` on the subscription record |
| `checkout.session.completed` | Link Stripe customer to org; create/activate subscription |
| `invoice.paid` | Activate or renew subscription; send confirmation email |
| `invoice.payment_failed` | Set `grace_period_ends_at` = now + 3 days; send failure email |
| `customer.subscription.updated` | Sync plan, status, period dates, cancel_at_period_end |
| `customer.subscription.deleted` | Downgrade to free plan; nullify provider IDs |

### FR-05 — Grace Period

- On payment failure, access is preserved for exactly 3 days
- On day 4, if still unpaid: status → `past_due` → feature-gate enforcement treats it as Free
- If payment succeeds within grace period: grace period cancelled; subscription resumes as `active`

### FR-06 — Usage Tracking

- Emit a `usage_events` row for every billable action: `video_analyzed`, `api_request`, `export_created`, `alert_triggered`, `search_executed`
- Real-time quota check via Redis counter (`vs:quota:{orgId}:{event_type}:{period}`)
- Redis counters are written async; never block the API response path
- Postgres `usage_events` rows written via async BullMQ batch job every 5 minutes (durability)
- Quota resets at `current_period_start` of the active subscription

### FR-07 — Feature Gating

- Every quota-gated endpoint checks Redis before processing
- Plan limits are cached in Redis keyed `vs:plan:{orgId}` (TTL 5 minutes); loaded from `subscriptions` + `plans` constants
- Plan cache is invalidated on every webhook that changes plan or status
- Frontend renders upgrade prompts for features above the current plan

### FR-08 — Billing Emails

| Email | Trigger | Template |
|---|---|---|
| Billing confirmation | `invoice.paid` | `billing-confirmation` |
| Payment failed | `invoice.payment_failed` | `payment-failed` |
| Quota warning (80%) | Quota counter hits 80% | `quota-warning` |

### FR-09 — Admin Overrides

- Super Admin can set any org's plan directly via `PUT /api/v1/admin/organisations/:id/plan`
- Admin overrides bypass Stripe; they write directly to `subscriptions` with `billing_provider = 'manual'`
- All admin overrides are logged to `audit_logs`

### FR-10 — Settings / Billing UI

- `GET /api/v1/usage` returns current period usage per event type with `used` and `limit`
- Billing page embeds Stripe Customer Portal via redirect (no iframe)
- Upgrade CTA appears inline when a feature gate is hit

---

## Non-Functional Requirements

| NFR | Target |
|---|---|
| Webhook processing latency | < 5 seconds p99 |
| Quota check overhead | < 5ms (Redis only; no DB hit per request) |
| Plan cache TTL | 5 minutes |
| Idempotency on webhook replay | 100% — duplicate events must produce identical DB state |
| Availability dependency | Graceful degradation if Stripe is unreachable (webhooks retry for 72h) |
| PCI scope | Zero — no card data on our servers |
| Audit coverage | 100% of billing state changes logged to `audit_logs` |

---

## MVP Scope

Phase 9 MVP includes:

- [x] Stripe Checkout for Starter, Professional, Business plans (monthly and annual)
- [x] Stripe Customer Portal integration
- [x] Webhook handler for 6 event types
- [x] 3-day grace period on payment failure
- [x] Redis + PostgreSQL usage tracking
- [x] Per-plan quota enforcement on all gated endpoints
- [x] Feature gate middleware reusing Phase 5 rate-limiting infrastructure
- [x] 3 billing email templates
- [x] Admin plan override endpoint
- [x] `GET /api/v1/usage` endpoint
- [x] `GET /api/v1/billing/plans` public endpoint
- [x] Billing settings page (portal redirect)
- [x] Upgrade prompt components (frontend)

Phase 9 MVP excludes:

- [ ] Paddle / crypto providers
- [ ] Usage overage billing
- [ ] Affiliate commissions
- [ ] MRR dashboard

---

## Future Expansion

| Feature | Notes |
|---|---|
| Paddle (v1.5) | Merchant of record; handles EU/UK VAT automatically |
| Usage overages (v1.5) | £0.05/video above plan limit; added to next invoice |
| Crypto invoicing (v2.0) | USDC/USDT; 30-min FX lock |
| Affiliate commissions (v2.0) | 20% recurring; tracked via `affiliate_conversions` table |
| Enterprise invoicing (v1.5) | Manual invoice generation; `billing_provider = 'manual'` already in schema |

---

## Dependencies on Previous Phases

| Dependency | Phase | What we actually have | Status |
|---|---|---|---|
| Database schema | Phase 3 | `subscriptions`, `invoices`, `usage_events`, `api_keys`, `organizations` tables exist | **Reuse** |
| Authentication | Phase 4 | JWT with `orgId`, `orgRole`, `planTier` claims (`apps/api/src/lib/jwt.ts`); no `role` claim — super-admin status is a live DB read via `require-super-admin.ts`, deliberately not JWT-based | **Reuse** |
| RBAC middleware — role checks | Phase 4 | `requireRole()` (`apps/api/src/middleware/require-role.ts`), `requireOrgContext()`, `require-super-admin.ts` | **Reuse** |
| RBAC middleware — plan gating | — | `requirePlan()` does **not** exist anywhere in the codebase | **Build new in Phase 9** — see `05-api-design.md`/`08-feature-gating.md` |
| Redis | Phase 2 | Running; connected via `REDIS_URL`; used for rate limiting and caching | **Reuse** |
| Rate-limiting infrastructure | Phase 5 | Bespoke Redis `INCR`+`EXPIRE` sliding window (`business-rate-limit.ts`, `plan-limits.ts`'s `requestsPerMinuteFor()`) — not the generic `@fastify/rate-limit` plugin, which is registered separately for a different purpose | **Reuse and extend** (see `08-feature-gating.md`) |
| Plan-limit constants | Phase 5 | `apps/api/src/lib/plan-limits.ts` (`PlanTier`, `PlanLimits`, `PLAN_LIMITS`) — already live, already used by `watchlist.service.ts`/`alert.service.ts`/`api-key.service.ts`/`usage.service.ts`/`business-rate-limit.ts` | **Reuse — extend in place, then promote to `packages/shared/src/plans.ts`.** Decided: apps/web needs the same constants (pricing page, `PlanGate`), so the extended shape is promoted to `packages/shared` as the single source of truth; every existing `apps/api` call site is updated to import from there. Field names and the existing `number \| null` "no ceiling" sentinel are preserved, not renamed or replaced with `-1` — this is an extension, not a redesign. |
| Email service | Phase 4 | `apps/api/src/services/email.service.ts` exports only `createLoggingEmailService()` — throws if invoked in staging/production; no SendGrid/Resend integration exists (TD-010) | **Blocked — not Phase 9's to fix.** FR-08's three email templates can be written and exercised against the logging stub in development, but "billing email sent" cannot be claimed as done in any real environment until TD-010 is resolved. Track as an external dependency, not an assumption. |
| Audit logging | Phase 5 | No `auditLog()` helper exists anywhere in `apps/api/src` (confirmed by full-repo search) | **Build new in Phase 9** — first billing feature to actually write to `audit_logs`. |
| BullMQ queue | Phase 5/6 | `bullmq` is a real dependency; `apps/api/src/lib/queue.ts` runs workflow-dispatch queues today; no repeatable/delayed job is in use yet | **Reuse and extend** — Phase 9 is the first user of BullMQ's repeatable-job feature (grace-period expiry check) and delayed-job feature (admin override expiry). Decided over a new n8n scheduled workflow, since BullMQ is already a proven in-process dependency and doesn't require building new n8n infrastructure for an internal billing maintenance task. |

Six architecture decisions required by the architecture review (`docs/reviews/billing/`) have been resolved and are reflected throughout these documents:
1. Plan-limit constants live in `packages/shared/src/plans.ts` (table above).
2. Billing-mutation roles are **Owner-only** for upgrade/downgrade/cancel; **Owner + Admin** (+ Super Admin) for view — see `03-domain-model.md`, `05-api-design.md`, `09-security.md`, sourced directly from Security_Architecture.md's Role Permissions Matrix.
3. Webhook idempotency is a single durable table (`billing_events`) — see `04-database-design.md`, `06-webhook-design.md`.
4. `api_request` quota tracking is opt-in and scoped to API-key-authenticated traffic only, deferred until TD-025's API-key request-auth path exists — see `08-feature-gating.md`.
5. The grace-period expiry check runs as a BullMQ repeatable job — see `07-subscription-lifecycle.md`.
6. `teamSeats`/`workspaces`/`promptLibraryAccess` are defined as plan-limit fields now but enforcement is postponed until their underlying features (multi-seat invites, multi-workspace, org-facing prompt library) exist — see `03-domain-model.md`, `08-feature-gating.md`.

---

## Assumptions

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | Stripe Price IDs for all 8 prices (5 plans × monthly + annual, minus Free and Enterprise) are created in the Stripe dashboard before development begins | Stripe integration cannot be tested without real Price IDs |
| ~~A2~~ **Decision** | `organizations.plan` column is the fast-path for feature gating (not `subscriptions.plan` directly) — this is not an assumption, it's already how the code works today: `org-membership.repository.ts`'s `findActiveOrgContext()` reads `organizations.plan` directly for the JWT claim | N/A — confirmed current behavior |
| A3 | Phase 4 JWT includes `planTier` claim populated from `organizations.plan` | If not, JWT payload must be extended |
| A4 | The Free plan never has a Stripe subscription record | Free orgs have no row in `subscriptions` OR have a row with `billing_provider = 'manual'` and `status = 'active'` |
| A5 | `grace_period_ends_at` is the definitive field controlling grace period state; no separate status value needed | Plan enforcement must check this field alongside `status` |
| A6 | Stripe Customer Portal is configured to allow self-serve plan changes and cancellation | If not configured, customers cannot self-downgrade |

---

## Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Webhook received before DB row exists (race: checkout.session.completed arrives before our API inserts subscription) | Medium | High | Idempotency keys + retry with exponential backoff |
| R2 | Stripe downtime prevents new subscriptions | Low | High | Existing subscribers unaffected; retry queue for webhooks |
| R3 | Quota counter Redis key expires mid-period | Low | Medium | Set TTL to `current_period_end + 1 day`; fallback to DB count |
| R4 | Plan cache stale during rapid upgrade → immediate feature use | Low | Low | 5-minute TTL acceptable; customer can hard-refresh |
| R5 | PCI scope creep if card fields ever added to our frontend | Low | Critical | ESLint rule blocking Stripe Elements import outside billing module |
| R6 | Grace period not honoured if webhook processing fails | Medium | High | Dead-letter queue; admin notification; manual resolution |

