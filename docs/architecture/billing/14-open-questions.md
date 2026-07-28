# 14-open-questions.md
# Billing Architecture — Open Questions

These questions must be resolved before implementation begins. Each is assigned a priority and a decision owner.

---

## Resolved (architecture-review decisions — see `docs/reviews/billing/`)

These six were surfaced by the architecture review as required decisions and are now closed. Reflected throughout `01`–`13`.

| # | Decision | Resolution |
|---|---|---|
| RD1 | Where do plan-limit constants live? | `packages/shared/src/plans.ts` — a **promotion** of the already-live `apps/api/src/lib/plan-limits.ts`, not a new parallel definition. Existing field names and the `number \| null` sentinel are preserved. See `03-domain-model.md`. |
| RD2 | Which roles can perform billing mutations? | **Owner-only** for upgrade/downgrade/cancel; Owner + Admin (+ Super Admin) for view-only — sourced directly from Security_Architecture.md's Role Permissions Matrix, "Billing" row. See `09-security.md`. |
| RD3 | One idempotency mechanism, or four? | One: the `billing_events` table, UNIQUE `(provider, provider_event_id)`. The Redis TTL key and the ad-hoc `vs:pending_customer:*` key are removed. See `04-database-design.md`, `06-webhook-design.md`. |
| RD4 | Is `api_request` quota tracking global or opt-in? | Opt-in, and scoped specifically to API-key-authenticated traffic — deferred until TD-025's API-key request-auth path exists. See `08-feature-gating.md`. |
| RD5 | What runs the grace-period expiry check? | A BullMQ repeatable job (`0 6 * * *`), not an n8n scheduled workflow — reuses proven in-process infrastructure rather than requiring a new n8n workflow. See `07-subscription-lifecycle.md`. This closes the CRON-mechanism gap that was previously missing from this document entirely (should have been its own question — added here as RD5 rather than a renumbered Q). |
| RD6 | Are `teamSeats`/`workspaces`/`promptLibraryAccess` in scope for Phase 9? | No — postponed. Fields removed from `FeatureLimits` until multi-seat invites, multi-workspace, and an org-facing prompt library actually exist. See `03-domain-model.md`, `08-feature-gating.md`. |

---

| # | Question | Priority | Owner | Default if not answered |
|---|---|---|---|---|
| Q1 | **JWT planTier claim strategy:** Should the JWT `planTier` claim be authoritative for plan enforcement, or should the API always verify against Redis/DB? | Critical | Engineering Lead | Default: Redis/DB is authoritative; JWT is display-only (Option A from `02-system-architecture.md`) |
| ~~Q2~~ **Resolved, not actually open** | **Free plan subscription row:** already answered by existing code — `organizations.plan` defaults to `'free'` independent of any `subscriptions` row (`packages/db/src/schema/organizations.ts`: `plan: text('plan').notNull().default('free')`). No `subscriptions` row is required for a Free org today, and this is the current, working behavior, not a decision Engineering Lead needs to make. | N/A | N/A | Confirmed: no row = free (already true) |
| Q3 | **Redis quota check fail-open vs fail-closed:** If Redis is unavailable during a quota check, do we allow the request (fail open) or block it (fail closed)? | High | Engineering Lead | Default: Fail open; log error; alert on Redis unavailability |
| Q4 | **Downgrade proration:** When a customer downgrades via Customer Portal, does Stripe credit the unused days? Should we display this credit in our UI? | Medium | Founder | Default: Use Stripe's default proration (credit applied). No UI change for MVP. |
| Q5 | **`charge.refunded` webhook:** Should we listen to this event and automatically downgrade the org, or handle refunds manually via admin override? | Medium | Founder | Default: Manual via admin override in MVP |
| Q6 | **Enterprise checkout:** Should Enterprise have any self-serve path (e.g. "Contact us" form), or purely outbound sales? | Medium | Founder | Default: "Contact us" link pointing to `mailto:enterprise@viralscopes.io` |
| Q7 | **Stripe Customer Portal scope:** Should customers be able to downgrade to a lower *paid* plan via the portal, or only cancel? | High | Founder | Default: Allow plan changes to any paid plan (including downgrade). Stripe handles proration. |
| Q8 | **80% quota warning: per event type or total?** Should the warning email trigger when any single event type hits 80%, or when total usage hits 80%? | Low | Product | Default: Per event type (e.g. 80% of videos/month triggers the email) |
| Q9 | **Annual plan: when does quota reset?** At the subscription anniversary date, or on the 1st of each month? | High | Engineering Lead | Default: At subscription anniversary (Stripe period start date). This means quota periods may not align with calendar months for annual subscribers. |
| Q10 | **Stripe Restricted Key scope:** Which exact permissions does the Stripe Restricted Key need? (See `09-security.md` for recommendation) | High | Engineering Lead | Default: As specified in `09-security.md` — customers, subscriptions, checkout.sessions, billing_portal.sessions, invoices (read) |
| Q11 | **Grace period duration:** Is 3 days correct, or should it match Stripe's retry schedule (~7 days)? | Medium | Founder | Default: 3 days as specified in ROADMAP.md Phase 9 |
| Q12 | **Annual discount billing:** 20% discount applied at checkout (Stripe coupon) or a separate annual price with the discount baked in? | High | Engineering Lead | Default: Separate annual Price IDs with the discounted amount (simpler; avoids coupon complexity) |
| Q13 | **Upgrade during trial (future):** When v1.5 introduces trials, what happens to the quota used during the trial period when the customer converts? | Low | Engineering Lead | N/A for MVP — no trials in MVP |
| Q14 | **Metrics/MRR visibility:** Should the Grafana billing dashboard show MRR, subscriber counts, and churn in Phase 9, or post-launch? | Low | Founder | Default: Post-launch — add Stripe-specific Grafana dashboard after Phase 9 is stable |

---

## Resolution Process

1. Engineering Lead and Founder review this list before Sprint 1 of Phase 9
2. Each question gets a written decision (update this document)
3. Decisions that change the architecture documents must update those documents before implementation
4. This document is closed when all Critical and High priority questions are resolved

---

## Questions That Cannot Default — Must Be Answered Before M1

- **Q1** (JWT plan enforcement strategy) — affects architecture of PlanGate middleware
- ~~Q2~~ — resolved, see above, not actually open
- **Q9** (Annual quota reset timing) — affects `periodKey` calculation in usage service
- **Q12** (Annual discount mechanism) — affects Stripe Price ID structure

All six of RD1–RD6 above were also closed before M1 begins.
