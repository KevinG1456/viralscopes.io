# 13-risk-register.md
# Billing Architecture — Risk Register

---

| # | Risk | Category | Likelihood | Impact | Mitigation | Contingency |
|---|---|---|---|---|---|---|
| R1 | Stripe webhook arrives before checkout session ID is stored in our DB (race condition) | Architectural | Medium | High | Check `checkout_session_id` in webhook handler; if not found, retry with 5s delay × 3 | Manual admin reconciliation via `PUT /admin/organisations/:id/plan` |
| R2 | Redis quota key expires before period end (wrong TTL set) | Operational | Low | Medium | Set TTL = `(current_period_end - now) + 86400` seconds; add monitoring alert if key missing mid-period | Fall back to DB count for quota check on cache miss |
| R3 | Stripe downtime prevents new subscription creation | Operational | Low | High | Inform user; existing subscriptions unaffected (no outbound Stripe calls on data reads) | Customer can retry; Stripe SLA is 99.99% |
| R4 | Duplicate webhook event replayed by Stripe | Security | Low | Medium | `billing_events` DB table provides durable idempotency — this is now the *sole* mechanism (the earlier Redis TTL layer was removed as redundant, see `04-database-design.md`) | Duplicate processing produces same DB state (UPSERT semantics) — acceptable |
| R5 | PCI scope creep: developer accidentally adds card input field | Security | Low | Critical | ESLint rule blocking `@stripe/react-stripe-js` import outside billing module; PR review checklist | Immediately remove; rotate Stripe keys; notify security team |
| R6 | Plan cache stale during high-frequency plan changes (e.g. upgrade + immediate API call) | Architectural | Low | Low | 5-minute TTL is acceptable; customer rarely needs sub-minute plan enforcement | Customer refreshes page to force new JWT; plan correct within 5 min |
| R7 | Grace-period BullMQ repeatable job fails to run or errors; expired grace periods not enforced | Operational | Low | Medium | Decided mechanism is a BullMQ repeatable job (`07-subscription-lifecycle.md`), not an unspecified CRON — monitor via `job_logs`; Prometheus alert on job failure | Manual admin resolution; set org plan to free via admin API |
| R8 | BullMQ billing-persist worker crashes; usage events not written to DB | Operational | Medium | Low | Redis counters remain accurate (enforcement layer); DB is for reporting/retention only | Replay from Redis counters on worker restart; accept < 5 min gap in DB records |
| R9 | Stripe webhook secret leaked (env var exposure) | Security | Low | High | Rotate immediately via Stripe Dashboard; detect-secrets pre-commit hook; Coolify env var encryption | New secret takes effect within 60 seconds of update |
| R10 | Annual plan quota reset on wrong date (period start vs billing date mismatch) | Architectural | Low | Medium | Quota reset triggered by `invoice.paid` webhook (uses Stripe's authoritative period dates), not by our CRON | Manual quota reset via admin API |
| R11 | Free plan orgs with no subscription row cause null pointer in quota check | Architectural | Medium | Medium | `getPlanFromCache` must default to `free` limits when subscription row doesn't exist | Defensive null handling in usage service |
| R12 | Admin plan override expires but BullMQ job was lost on Redis restart | Operational | Low | Low | Log expiresAt to DB (subscription row); daily CRON also scans for expired manual overrides | Acceptable: org retains elevated plan until noticed; admin re-reverts |

---

## Top 3 Risks Requiring Pre-Implementation Decision

**R1 (Checkout race condition):** Must implement retry logic in webhook handler before production launch. Design approved in architecture phase; must be tested explicitly.

**R5 (PCI scope creep):** The ESLint rule must be added in M1 before any billing code is written. This is a preventive control, not a detective one.

**R11 (Free plan null handling):** The `getPlanFromCache` function must be the first implementation task in M5, with a test case for orgs with no subscription row.
