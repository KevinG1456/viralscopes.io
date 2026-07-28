# 05-performance-review.md
# Billing Architecture Review — Performance

---

## Expected Bottlenecks

| Area | Design | Assessment |
|---|---|---|
| Plan/quota lookup on the request hot path | Redis-only (`vs:plan:{orgId}`, `vs:quota:{orgId}:{eventType}:{periodKey}`), 5-min TTL cache with DB fallback on miss | **Sound** — matches the NFR target (< 5ms, no DB hit per request in the happy path) and mirrors the existing `business-rate-limit.ts` pattern, which already does exactly this kind of Redis-only check per request. |
| `UsageMiddleware` applied to "any authenticated API call" for `api_request` | `onRequest` (checkQuota) + `onSend` (emit) Fastify hooks, per `03-domain-model.md`'s event-type table | **Needs measurement before broad rollout.** If applied to *every* authenticated endpoint (as `03-domain-model.md`'s table implies for `api_request`), this adds a second Redis round-trip on top of whatever `business-rate-limit.ts` already does per request today — effectively doubling Redis calls per API request. The design correctly restricts quota *middleware* application to specific routes via explicit `preHandler` opt-in (`08-feature-gating.md`'s code sample), which is the right instinct, but `03-domain-model.md`'s table listing `api_request` as tracked on "any authenticated API call" contradicts that opt-in model and would apply it globally. **Recommendation:** pick one — either `api_request` quota tracking is opt-in per route (consistent with everything else) or it's global (in which case it needs an actual load test before shipping, since it changes the latency profile of every single API call in the product). |
| Webhook processing latency (NFR: < 5s p99) | Synchronous DB writes + Redis invalidation + email send, all within the webhook handler itself | **Risk of NFR violation.** The design explicitly states processing happens synchronously inside the webhook handler (`06-webhook-design.md`: "Processing happens synchronously but errors are caught and logged"), and includes an email send in that same synchronous path (`invoice.paid` → `billing-confirmation` email). If the email provider (once real) is slow or briefly degraded, this directly risks blowing the 5-second p99 target on every single successful payment webhook. **Recommendation:** enqueue the email send via the existing BullMQ infrastructure (already used for workflow dispatch) rather than sending inline during webhook processing — this decouples webhook latency from email-provider latency entirely and is a very small change from the current design. |
| `stripe_webhook_events.raw_payload JSONB` unbounded growth | "90 days (CRON purge job)" — mechanism never actually specified (see `01-architecture-review.md` re: `07-subscription-lifecycle.md`'s undefined CRON) | **Real risk if the purge job is never built.** Every webhook event's full JSON payload stored indefinitely (until a purge job that doesn't yet have a chosen implementation runs) means this table grows without bound in proportion to paying-customer webhook volume. Not urgent at MVP scale, but should be tracked as technical debt with an explicit owner rather than left as a parenthetical. |
| Annual-plan usage summary queries crossing partition boundaries | `usage_events` is monthly-partitioned (migration 0004, confirmed); `GET /usage`'s period bounds for an annual subscriber span up to 12 partitions | **Not addressed anywhere in the 14 documents.** The existing `sumUsageSince()` repository function (`apps/api/src/repositories/usage.repository.ts`) already does a `gte(createdAt, periodStart)` scan — correct and fine for a monthly subscriber (single partition), but an annual subscriber's `current_period_start` could be up to 11 months in the past, meaning the same query now has to scan up to 12 monthly partitions instead of 1. This is a real, previously-unconsidered cost difference between monthly and annual billing cycles that none of the 14 documents mention. **Recommendation:** either cap the `/usage` display window to the current calendar month regardless of billing cycle (simpler, still accurate for quota-enforcement purposes since Redis is the actual enforcement mechanism, not this DB query), or explicitly accept and test the wider partition scan for annual subscribers. |

---

## Database Indexes

| Table | New index proposed | Assessment |
|---|---|---|
| `subscriptions` | `uq_subscriptions_org_active` (partial unique on `org_id WHERE status NOT IN ('canceled')`), created `CONCURRENTLY` | **Correct and appropriately zero-downtime.** This is good practice and matches how a production Postgres schema change should be done. |
| `subscriptions.checkout_session_id` | UNIQUE constraint | **Correct**, small table, negligible cost. |
| `stripe_webhook_events` | Index on `stripe_event_id`, index on `processed_at DESC` | **Correct** — the `stripe_event_id` index is redundant with the UNIQUE constraint already implied on that column (Postgres automatically indexes UNIQUE columns), so the explicit separate index in the migration SQL shown is unnecessary duplication of the same index Postgres creates automatically. Minor, but worth removing to avoid two indexes doing the same job. |

No indexing gaps found beyond the two notes above — the existing `usage_events` partitioning and indexing from Phase 3/4 is untouched and adequate for what Phase 9 asks of it (aside from the annual-plan cross-partition query cost noted above).

---

## Caching Opportunities

- **Plan cache (`vs:plan:{orgId}`, 5-min TTL):** well-designed, appropriately short TTL for a value that changes rarely per org but must not be stale for too long after a plan change.
- **Missed opportunity:** the public `GET /billing/plans` endpoint is correctly designed to read from an in-memory constant (no DB, no Redis) — good, this is the cheapest possible design for a rarely-changing, publicly-cacheable resource. Could additionally set an HTTP `Cache-Control` header for CDN/browser caching, which none of the documents mention; low priority given the data changes only on deploy.

---

## Webhook Throughput

At MVP scale (per Monetization_Model.md's Year-1 customer projections — dozens to low hundreds of paying customers), webhook volume is trivially low (a handful of events per customer per billing cycle). The synchronous-processing design is not a throughput risk at this scale. It becomes a risk only at the latency-per-event level noted above (email-in-the-hot-path), not at a volume/concurrency level. No changes needed here beyond the email-decoupling recommendation.

---

## Concurrency

**Real risk, correctly identified by the architecture itself:** R1 in `01-overview.md`/`13-risk-register.md` — a webhook (`checkout.session.completed`) can arrive before the API's own `POST /billing/checkout` handler has finished writing `checkout_session_id` to the `subscriptions` row, especially if Stripe processes the checkout unusually fast. The proposed mitigation (retry with backoff in the webhook handler if the row isn't found yet) is a reasonable, standard pattern for this class of race condition and is the correct call — no changes recommended here, this is one of the better-reasoned parts of the whole spec.

---

## Scaling

At the customer volumes implied by Business_Model.md/Monetization_Model.md for Year 1–2 (see Financial Assumptions), none of the proposed designs (Redis quota counters, single-table webhook idempotency, synchronous-but-fast webhook processing once email is decoupled) present a scaling concern. The design would need revisiting only at a scale far beyond what's currently projected (e.g., thousands of webhook events per minute, which is not this product's trajectory in the timeframe these documents cover) — not worth over-engineering for now, and the documents correctly don't attempt to.

---

## Summary

The performance design is fundamentally sound (Redis-first, no-DB-hit-per-request quota checks; correct partitioning already in place from earlier phases). The two concrete, actionable findings are:

1. **Decouple the billing-confirmation email send from the synchronous webhook-processing path** (enqueue via BullMQ) to protect the stated < 5s p99 webhook NFR once a real email provider is wired in and could be slow or degraded.
2. **Resolve whether `api_request` quota tracking is global or opt-in** before implementation — the documents currently imply both, and the global interpretation would double Redis round-trips on every authenticated API call without any load test to support that it's safe.
