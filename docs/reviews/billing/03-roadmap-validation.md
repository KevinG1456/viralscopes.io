# 03-roadmap-validation.md
# Billing Architecture Review — Roadmap Scope Validation

Checked against ROADMAP.md's Phase 9 section (19 tasks across Plan Definition / Stripe Integration / Usage Tracking), Pricing_Strategy.md's version markers (MVP / v1.5 / v2.0 / v3.0), and Monetization_Model.md's feature-availability tables.

---

## Belongs in Phase 9 — confirmed

| Feature | ROADMAP.md task | Verdict |
|---|---|---|
| 5 plan tiers defined with limits | Plan Definition group | **In scope** |
| Feature flags cached in Redis, no DB hit per request | Plan Definition group | **In scope** |
| Stripe Checkout for new subscriptions | Stripe Integration group | **In scope** |
| Stripe Customer Portal (changes/cancellation) | Stripe Integration group | **In scope** |
| Monthly + annual billing with annual discount | Stripe Integration group | **In scope** |
| Webhook handler, signature verification, 4 named events | Stripe Integration group | **In scope** (architecture adds `checkout.session.completed` and `customer.created` beyond ROADMAP's 4 named events — reasonable addition, both are needed to actually activate a new subscription, not scope creep) |
| 3-day grace period on payment failure | Stripe Integration group | **In scope** |
| Billing confirmation email | Stripe Integration group | **In scope in design; blocked in practice** — see `02-consistency-review.md` §10 (no real email provider exists yet) |
| Usage event emission for billable actions | Usage Tracking group | **In scope** |
| Real-time Redis increment + async batch persist every 5 min | Usage Tracking group | **In scope**, matches ROADMAP's exact cadence |
| Usage reset at billing period start | Usage Tracking group | **In scope** |
| Quota warning email at 80% | Usage Tracking group | **In scope in design; blocked in practice** — same email-provider gap |
| Billing UI embedded in Settings | Usage Tracking group | **In scope** |

**All 19 of ROADMAP.md's Phase 9 tasks are addressed somewhere in the 14 documents.** No task is missing.

---

## Does NOT belong in Phase 9 (correctly deferred)

`01-overview.md`'s Non-Goals table correctly excludes:
- Paddle billing → v1.5
- Usage overages → v1.5
- Crypto invoicing → v2.0
- Affiliate commissions → v2.0
- White-label billing → v3.0
- Multi-currency pricing → v1.5

All six match Monetization_Model.md's own version markers exactly. **No premature scope found here.**

---

## Scope creep found (features pulled in from later phases without being named as such)

| Feature | Where it appears | Actual phase per source docs | Issue |
|---|---|---|---|
| `scheduledReports` feature flag | `08-feature-gating.md` `FeatureLimits` | Monetization_Model.md §2.12: "Scheduled Reports (**v1.5**)" | Wiring the *flag* into Phase 9's schema now is harmless (forward-compatible), but the document presents it as an active Phase 9 gate (`GET /admin/prompts` example row references a `business`-tier minimum) without noting the feature it gates doesn't exist until v1.5. Should be explicitly marked "flag defined now, enforcement is a no-op until v1.5 ships the feature." |
| `promptLibraryAccess` feature flag gating `GET /admin/prompts` by plan tier | `08-feature-gating.md` | N/A — prompt library is currently **`super_admin`-only**, platform-wide, with no org-plan dimension at all (`server.ts`: `adminRoutes`/`promptLibraryRoutes` both registered under `/api/v1/admin/...`, explicitly commented "Platform-wide, super_admin-gated (no RLS, no org scoping)") | This is a real scope conflict, not just an ordering issue: Phase 7 built the prompt library as an internal admin tool with no concept of org-level visibility. Phase 9 proposing to also gate it by customer plan tier means either (a) the prompt library needs an org-facing view that doesn't exist yet, or (b) this row is aspirational and should be removed from Phase 9's actual enforcement table. Recommend **postponing** this specific row — it depends on work no phase has scoped yet. |
| Team seats / workspaces count-limits (`teamSeats`, `workspaces` in `FeatureLimits`) | `08-feature-gating.md`, `03-domain-model.md` | Organisation & Workspace Management is referenced in `apps/api/src/repositories/org-membership.repository.ts`'s own comment as "a later phase, out of Phase 4's ... scope" — multi-workspace-per-org and seat invitations are not yet built features at all (only a single active org-membership lookup exists today: `findActiveOrgContext` picks the *first* membership found, by its own comment, "correct for a user with exactly one org ... true of every account this phase can create") | Gating a count-limit on `workspaces`/`teamSeats` presumes an invite/multi-workspace flow that doesn't exist in the product yet. This is the same class of issue as the prompt-library row above — **postpone these two enforcement rows** until the underlying feature (multi-seat invites, multi-workspace) actually ships; keep the *plan field* defined (harmless), but don't claim Phase 9 will enforce a count-check against a `POST /organisations/invite` or `POST /workspaces` endpoint that doesn't exist. |
| Alert-channel restriction UI validation (Discord/Slack/Telegram/webhook gating by plan) | `08-feature-gating.md` | Pricing_Strategy.md §2.7 marks this as a Starter+ feature — legitimately Phase 9 scope (Free = email-only) | Not scope creep — flagged here only to note it's **correctly in scope**, included for contrast with the two genuine creep items above. |

---

## Depends on previous completed phases — verified

| Dependency claimed | Verified against | Status |
|---|---|---|
| `subscriptions`, `invoices`, `usage_events`, `organizations` schema (Phase 3) | `packages/db/src/schema/*.ts` | **Confirmed present**, correct shape |
| JWT with `orgId`/`orgRole`/`planTier` (Phase 4) | `apps/api/src/lib/jwt.ts` | **Confirmed present** |
| `requireRole()` middleware (Phase 4) | `apps/api/src/middleware/require-role.ts` | **Confirmed present** |
| `requirePlan()` middleware (claimed Phase 4/5) | Full middleware directory listing | **Does not exist** — must be built fresh in Phase 9, not "reused" |
| Redis running (Phase 2) | `apps/api/src/plugins/redis.plugin.ts` | **Confirmed present** |
| Rate-limiting infra (Phase 5) | `business-rate-limit.ts` | **Confirmed present**, bespoke not `fastify-rate-limit`-based |
| Email service configured (Phase 4) | `email.service.ts` | **Not confirmed — contradicted.** Logging stub only (TD-010) |
| Audit logging helper (Phase 5) | Full-repo grep for `auditLog` | **Does not exist** — must be built fresh in Phase 9 |
| BullMQ queues running (Phase 5/6) | `apps/api/src/lib/queue.ts`, `bullmq` dependency | **Confirmed present** for workflow-dispatch queues; no repeatable/delayed job usage exists yet, so the "delayed job" and "CRON job" patterns Phase 9 wants are a new *usage* of existing infrastructure, not something already proven in this codebase |
| n8n workflows for usage-emission hooks (WF-01, WF-09) | `infra/n8n-workflows/` | **Not confirmed — contradicted.** Only 3 unrelated demo/utility workflows exist; the real business pipeline is still TD-020 |
| Test framework for the testing strategy (implicit) | Full-repo search | **Does not exist** — no Vitest/Jest/Playwright anywhere |

**Net effect:** 4 of the 10 claimed prerequisite building blocks (`requirePlan()`, email provider, audit-log helper, n8n business workflows) do not actually exist yet, and a 5th (test framework) is assumed without ever being named as a dependency at all. Phase 9 as scoped is not purely "wire billing into existing infrastructure" — it also silently includes building several pieces of infrastructure that earlier phases were supposed to have delivered.

---

## Recommendation

- Keep all 19 ROADMAP Phase 9 tasks — none should be dropped.
- Explicitly re-scope out (postpone) the `promptLibraryAccess` and `teamSeats`/`workspaces` *enforcement* rows in `08-feature-gating.md` until their underlying features exist; keep the plan-limit *fields* defined now for forward compatibility.
- Add "build `requirePlan()` middleware," "build an `auditLog()` helper," and "stand up a test runner for `apps/api`" as **named Phase 9 milestones**, not implicit assumptions — this reframing doesn't change what needs to be built, but it changes the risk picture: these are now correctly visible as new work with their own review/test burden, not free reuse.
- Flag the video-analysis usage-emission dependency on TD-020's still-unbuilt n8n workflows as a cross-phase blocker that is outside Phase 9's own ability to resolve.
