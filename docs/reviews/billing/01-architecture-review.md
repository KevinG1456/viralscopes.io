# 01-architecture-review.md
# Billing Architecture Review — Document-by-Document Assessment

> **Reviewed against:** the actual codebase (`apps/api/src`, `packages/db/src`, `apps/web/src`), ROADMAP.md, PROJECT_STATUS.md, PROJECT_RULES.md, Pricing_Strategy.md, Business_Model.md, REPOSITORY_STRUCTURE.md, CHANGELOG.md, README.md.
> **Method:** every factual claim in `docs/architecture/billing/*.md` that could be checked against a real file was checked. Claims are marked **Confirmed**, **Contradicted** (the codebase actively disagrees), or **Unverifiable** (no way to check without running infrastructure that doesn't exist, e.g. a live Stripe account).

---

## 01-overview.md

| Aspect | Verdict | Why |
|---|---|---|
| Goals / Non-goals / MVP scope | **Correct** | Matches ROADMAP.md Phase 9's 19-task checklist and Pricing_Strategy.md's version markers (Paddle/crypto/overages/affiliate correctly deferred to v1.5/v2.0/v3.0). |
| FR-01–FR-04, FR-06, FR-07, FR-10 | **Correct**, needs clarification on file location | Functionally sound, but FR-01 commits to `packages/shared/src/plans.ts` as the plan-constants location without reconciling that `apps/api/src/lib/plan-limits.ts` already holds this exact responsibility today (see `02-consistency-review.md` §1 — this is the single biggest structural issue in the whole spec). |
| FR-05 (Grace period) | **Needs clarification** | Conflates "our `grace_period_ends_at` overlay" with "Stripe's `status` field." Stripe sets `status = past_due` on the *first* failed charge, not "on day 4." Day 4 is when *our* grace period expires and *we* choose to start treating the org as free. The FR should say this explicitly — as written, an implementer will look for a Stripe status transition that doesn't happen the way described. |
| FR-08 (Billing emails) | **Contradicted** | Depends on `emailService.send()` as if a real provider is wired in. It isn't: `apps/api/src/services/email.service.ts` is `createLoggingEmailService()`, which **throws if invoked in staging or production** and only logs to console in dev/test (TD-010, already logged in PROJECT_STATUS.md). Billing confirmation / payment-failed / quota-warning emails cannot be sent anywhere but a developer's local machine today. This is not a Phase-9 problem to silently inherit — it must be named as a blocking dependency, not a `[x]` MVP checkbox. |
| FR-09 (Admin overrides) | **Needs clarification** | Correctly identifies bypassing Stripe via `billing_provider = 'manual'` (this is exactly what the column already supports). But see `04-security-review.md` — the *auth model* for who can call this endpoint is wrong. |
| Dependencies on Previous Phases table | **Contradicted** (2 of 8 rows) | "Email service — SendGrid/Resend configured" is false (see FR-08 above). "RBAC middleware — `requireRole()` and `requirePlan()` middleware in Fastify" — `requireRole()` exists (`apps/api/src/middleware/require-role.ts`); `requirePlan()` does **not** exist anywhere in the codebase. The document's own footnote under this table ("if this middleware does not yet exist, it must be created in Phase 9") is the right instinct but gets contradicted by every later document treating it as already-built (see `02-consistency-review.md`). |
| Assumptions A1–A6 | **Reasonable**, A3 is **Confirmed**, A2 needs a decision | A3 (JWT includes `planTier` populated from `organizations.plan`) is confirmed true (`apps/api/src/lib/jwt.ts` `AccessTokenPayload.planTier`, populated in `auth.service.ts` from `findActiveOrgContext`). A2 (`organizations.plan` is the fast-path, not `subscriptions.plan`) is a real and correct design decision — but it needs to be stated as a *decision*, not an assumption, because it's actually already how the existing code works (`org-membership.repository.ts` reads `organizations.plan` directly for the JWT claim). |
| Risks R1–R6 | **Correct**, well-calibrated | R5 (PCI scope creep via an ESLint rule) is a good, cheap preventive control. R1 (webhook race) is real and correctly flagged as the top risk — see `13-risk-register.md`'s own treatment, which is the strongest document in the set. |

**Overall:** the overview is the most reliable document in the set — its own hedges (the `[ASSUMPTION]` tags) correctly anticipate several of the problems found below, but subsequent documents don't carry those hedges forward consistently.

---

## 02-system-architecture.md

| Aspect | Verdict | Why |
|---|---|---|
| High-level Mermaid diagram | **Needs clarification** | Labels the database "PostgreSQL via Supabase." Nothing in this codebase uses Supabase — `packages/db/src/client.ts` explicitly documents a custom JWT/session auth system specifically *because* it is not Supabase Auth ("RLS policies therefore cannot use Supabase's `auth.uid()`"). This single mislabeled node is what seeds the RLS errors in `04-database-design.md` and `09-security.md` below. Should read "PostgreSQL (self-hosted, Drizzle ORM)." |
| Component responsibilities table (file paths) | **Contradicted** | Every file path uses a `routes/v1/` subdirectory (`apps/api/src/routes/v1/billing.routes.ts`, `.../v1/webhooks.routes.ts`). No such subdirectory exists or is used anywhere in the real codebase — all 13 existing route files live flat in `apps/api/src/routes/*.routes.ts` (`watchlist.routes.ts`, `alert.routes.ts`, `api-key.routes.ts`, etc.), with versioning expressed only in the *registered prefix* (`/api/v1/...`) inside `server.ts`, not in the directory layout. This is REPOSITORY_STRUCTURE.md's stale aspirational structure leaking in (see `02-consistency-review.md`). |
| Raw-body webhook parsing note | **Correct and important** | The `addContentTypeParser('application/json', { parseAs: 'buffer' }, ...)` requirement is accurate and is the single most implementation-critical detail in the whole spec — Fastify's default JSON body parser would break Stripe signature verification. Good catch, correctly repeated in `05`, `06`, `09`. |
| PlanGate middleware code sample | **Needs clarification** | Reasonable shape, but throws `AppError('PLAN_LIMIT_EXCEEDED', ..., 429)`. 429 is "Too Many Requests" — semantically wrong for "your plan doesn't include this," which the same author correctly assigns `402`/`422` codes elsewhere in `05-api-design.md`'s own error table. Pick one status per error code and keep it consistent (see `02-consistency-review.md` §4). |
| AuthContext plan sync / Option A vs B | **Correct instinct, needs decision** | Correctly identifies that a JWT's `planTier` claim will go stale between refreshes and correctly recommends "Redis/DB is authoritative, JWT is a hint" (Option A). This is the right call and is also `14-open-questions.md`'s Q1 — good that it's flagged, redundant that it's asked twice with slightly different framing in two documents. |
| n8n Interactions table | **Contradicted (partially)** | States WF-09 (Viral Score Engine) "calls `UsageService.emit('video_analyzed')` via internal API call" as an existing integration point to hook into. `infra/n8n-workflows/` contains exactly three workflow definitions: `foundation-demo.json`, `heartbeat.json`, `prompt-test.json`. WF-01/WF-09/WF-14 are documented on paper in `n8n_Workflow_Diagrams.md` but have no corresponding built workflow (this is PROJECT_STATUS.md's TD-020, "real business workflows deferred"). Phase 9 cannot wire usage emission into a pipeline that doesn't exist yet — this is a real cross-phase dependency gap, not a Phase-9-internal design flaw. |
| Redis key space table | **Correct** | Clean, non-colliding namespace (`vs:plan:`, `vs:quota:`, `vs:webhook:`), doesn't collide with the existing `ratelimit:{orgId}:{endpoint}:{windowKey}` pattern used by the real rate-limit middleware. |

---

## 03-domain-model.md

| Aspect | Verdict | Why |
|---|---|---|
| ER diagram / entity relationships | **Correct** | Matches the real Drizzle schema (`subscriptions.ts`, `invoices.ts`, `organizations.ts`) field-for-field. |
| Organization → Permissions | **Contradicted** | "Only `owner` and `admin` roles can initiate billing changes." Per Security_Architecture.md's own RBAC permission matrix, billing mutations (upgrade/downgrade/cancel) are **Owner-only**; Admin has view access only. This directly conflicts with the same claim repeated in `05-api-design.md` and `09-security.md` — a single wrong role gate copy-pasted three times. |
| Subscription lifecycle pointer | **Correct** | Appropriately deferred to `07-subscription-lifecycle.md`. |
| Plan (constant, not DB table) | **Needs clarification (duplication)** | This is FR-01's `packages/shared/src/plans.ts` proposal again — see `02-consistency-review.md` §1 for the full duplication analysis against `apps/api/src/lib/plan-limits.ts`. |
| Invoice / Usage Event / Checkout Session / Customer sections | **Correct** | Accurately describe existing schema and Stripe's real object model; the "we do not pre-create Stripe Customers at org creation" decision is sound and avoids orphaned Stripe objects for free orgs. |
| Feature Limits enforcement-points table | **Needs clarification** | Introduces `apiRequestsPerDay`, `teamSeats`, `workspaces`, `alertChannels` as if they're existing enforcement points. Real `apps/api/src/lib/plan-limits.ts` today only enforces `videosPerMonth`, `watchlists`, `alertRules`, `apiAccess`, `apiRateLimitPerMinute/Day` — team seats, workspaces, and per-channel alert gating do not exist as enforcement code yet. Not wrong to plan for them, but they should be listed as **new** enforcement points Phase 9 must build, not implied as already-partially-there. |
| Billing Events (audit log actions) table | **Correct**, contingent on a helper that doesn't exist yet | The `action` taxonomy is sensible and namespaced well (`billing.subscription.*`, `billing.invoice.*`). But no `auditLog()` helper function exists anywhere in `apps/api/src` today (confirmed via full-repo grep) — every one of these call sites is new code, not a call into existing infrastructure. |

---

## 04-database-design.md

| Aspect | Verdict | Why |
|---|---|---|
| "Phase 9 introduces no new tables" header claim | **Contradicted by the document's own next section** | The document immediately proposes a brand-new `stripe_webhook_events` table. The header claim should be corrected to "no new tables for subscription/invoice data — one new table for webhook idempotency." Minor, but it's an internal contradiction within the first page of the document. |
| `subscriptions` gap analysis (billing_cycle, checkout_session_id, partial unique index) | **Correct and well-justified** | All three additions are real gaps against the actual `packages/db/src/schema/subscriptions.ts`, and the reasoning for each is sound. |
| Migration 0020 "safe ADD COLUMN pattern" | **Correct, best practice in the set** | This is the only migration in all 14 documents that follows the zero-downtime, staged (nullable → backfill → NOT NULL → constraint) pattern the codebase's own migration style implies. Good model for the rest. |
| New table `stripe_webhook_events` | **Over-specific naming, otherwise sound** | The design (UNIQUE `stripe_event_id`, nullable `org_id`/`subscription_id`, `raw_payload JSONB`) is functionally identical to what a provider-agnostic `billing_events` table would look like — but naming it `stripe_webhook_events` hard-codes a provider the `subscriptions.billing_provider` column already treats as one of four (`stripe`, `paddle`, `crypto`, `manual`). If Paddle arrives in v1.5 as the doc's own Future Expansion table promises, this table needs a rename-and-migrate or a second parallel table. Prefer a provider-agnostic name with the existing `provider` column doing the differentiation, matching the pattern already used on `subscriptions`/`invoices`. |
| RLS policy claim ("no RLS — same pattern as `job_logs`") | **Unverifiable as stated, likely correct in spirit** | `job_logs`/`dead_letter_jobs` are not covered by any RLS-enabling statement in `packages/db/src/migrations/0003_rls_policies.sql` — so the *conclusion* (no RLS) is plausible, but the document doesn't cite the actual precedent it should: migrations `0006`/`0007` already establish and document the exact "identity-must-be-looked-up-before-tenant-context-exists" justification this table needs (used for `sessions`, `oauth_accounts`, `organization_members`). The new table should cite that precedent explicitly rather than an unrelated one, both for reviewer confidence and consistency of reasoning across the codebase. |
| ER diagram | **Correct** | Matches the proposed schema changes. |
| Row Level Security section | **Contradicted** | Uses `TO authenticated` / `auth.uid()` — Supabase Auth syntax. This project's actual RLS policies (`packages/db/src/migrations/0003_rls_policies.sql`) use `current_setting('app.current_org_id', true)::uuid` set via `withTenant()`. None of the SQL shown in this section would compile against this schema's actual role model (there is no `authenticated` role; the app connects as `app_user`, a role created by `packages/db/src/setup-roles.ts`). This must be rewritten against the real RLS convention before it's usable as an implementation reference. |

---

## 05-api-design.md

| Aspect | Verdict | Why |
|---|---|---|
| `GET /billing/plans` | **Correct** | Public, no-DB-read design is sound and matches the "Plan constants" approach (contingent on resolving where those constants live — see `02-consistency-review.md`). |
| `GET /usage` | **Correct**, response envelope needs alignment | Good "no DB read in the happy path" design. The JSON shape shown (`{ success: true, data: {...} }`) matches the real envelope convention in `apps/api/src/lib/response.ts`'s `ok()` helper — one of the few places this document accidentally gets the existing convention right without citing it. |
| `POST /billing/checkout` | **Needs clarification** | RBAC line says "owner or admin" — see the Owner-only conflict noted under `03-domain-model.md` above. |
| `POST /billing/portal` | **Correct** | Sound null-check on `provider_customer_id` before attempting a portal session. |
| **Admin Endpoints section — internal contradiction** | **Contradicted (self)** | Section header states "All require `super_admin` or `admin` role." The first endpoint immediately under it (`PUT /admin/organisations/:id/plan`) states "**Auth:** JWT (`super_admin` role)" — i.e., admin is excluded for that specific endpoint, contradicting the section header one line above it. This needs to be resolved one way and stated once, not implied two different ways in adjacent lines. |
| Webhook endpoint | **Correct**, matches `09-security.md` | Consistent raw-buffer handling and correctly notes "always return 200 to a verified event, never propagate our own processing failures as HTTP errors to Stripe." |
| Error Codes table | **Needs clarification** | `PLAN_LIMIT_EXCEEDED → 429` again — see the recurring status-code issue. `NO_BILLING_ACCOUNT → 402` and `PLAN_UPGRADE_REQUIRED → 402` reuse the same status for two different conditions; acceptable if the `code` field is what clients actually branch on (confirmed real convention: `AppError` carries a `code` string precisely so callers don't need to distinguish by HTTP status alone — see `apps/api/src/lib/errors.ts`), but worth stating explicitly that `code`, not `statusCode`, is the disambiguator. |

---

## 06-webhook-design.md

| Aspect | Verdict | Why |
|---|---|---|
| Overall design (never trust return URLs, webhooks are authoritative) | **Correct** | This is the right mental model for Stripe integrations and is applied consistently. |
| Per-event sequence diagrams | **Correct**, one is a real product-model mismatch | `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` handlers are each internally consistent and match Stripe's actual event semantics. |
| `customer.created` handling | **Needs clarification** | Introduces a *fourth* idempotency mechanism (`vs:pending_customer:{orgId}:{cusId}` Redis key) to handle out-of-order event arrival — on top of the Redis TTL key, the `stripe_webhook_events` table, and per-entity UNIQUE constraints already described elsewhere. Four distinct idempotency/ordering mechanisms across one webhook flow is more machinery than the problem needs — see `01-architecture-review` over-engineering note and `02-consistency-review.md` §3. |
| Retry Strategy table | **Correct** | Matches Stripe's documented Smart Retries schedule. |
| Failure Handling table | **Correct** | "Always 200 to Stripe, log internally" is the right pattern and is applied consistently everywhere in this document. |
| Trailing `MDEOF` text at end of file | **Defect** | Literal heredoc delimiter leaked into the committed file content (line 217). Present in 6 of the 14 documents (`06`, `07`, `08`, `09`, `10`, `11`). Cosmetic, but indicates these files were generated via a shell heredoc without verifying the closing delimiter was stripped — should be cleaned up before these documents are treated as final. |

---

## 07-subscription-lifecycle.md

| Aspect | Verdict | Why |
|---|---|---|
| State diagram | **Correct**, one status-semantics issue | Structurally sound, but see the `past_due` timing conflation noted under `01-overview.md` FR-05 above — repeated here in the state table ("`past_due` — Grace period has expired; treated as Free"), which is our own application-level interpretation, not Stripe's actual status-transition timing. |
| Signup / Upgrade / Downgrade / Cancellation flows | **Correct** | All five flows correctly route irreversible business decisions (proration, cancellation timing) to Stripe's own hosted Customer Portal rather than reimplementing them — this is the right call and avoids a large class of billing bugs. |
| Payment Failure Flow — CRON job | **Needs clarification** | Introduces a "CRON job (daily at 06:00 UTC)" with no chosen implementation mechanism. The codebase has exactly two precedents for recurring/scheduled execution: BullMQ (already used for the workflow-dispatch queues in `apps/api/src/lib/queue.ts`, though no repeatable/delayed job is used there yet) or an n8n workflow with a CRON trigger (WF-01 is documented as "CRON + manual" in `n8n_Workflow_Diagrams.md`). The document never picks one, and the two are architecturally very different (in-process worker vs. external workflow engine call-back). This should be a named decision, not an implicit "a CRON job exists somewhere." |
| Refund Flow | **Correct, appropriately deferred** | Manual-admin-only refund handling for MVP is a reasonable scope cut; the open question about `charge.refunded` is correctly deferred to `14-open-questions.md`. |
| Admin Plan Override Flow | **Needs clarification** | Uses a "BullMQ delayed job" for scheduled plan reversion — this is a legitimate use of existing infrastructure (BullMQ is already a real dependency, `bullmq: ^5.81.2` in `apps/api/package.json`), more concrete than the unspecified CRON job above. Should be the template for how the payment-failure CRON should also be described. |

---

## 08-feature-gating.md

| Aspect | Verdict | Why |
|---|---|---|
| Three-layer enforcement principle | **Correct** | Good architecture — plan minimum, quota, and count-check are genuinely different concerns and the doc is right not to collapse them into one mechanism. |
| `FeatureLimits` interface / `PLAN_LIMITS` constant | **Duplication (see `02-consistency-review.md` §1)** | This is the fullest expression of the plan-limits duplication problem — a completely independent reimplementation of `apps/api/src/lib/plan-limits.ts`'s responsibility, with a different shape, different field names, and a different "unlimited" sentinel (`-1` here vs. `null` in the real code). |
| Backend Enforcement tables | **Needs clarification** | `POST /videos/analyze` is used as the canonical quota-gated endpoint example, but no such user-facing endpoint exists — video analysis is n8n-pipeline-driven, not a synchronous API call a user makes (see `02-system-architecture.md` review above re: WF-09). The quota-check example needs a real endpoint or an explicit design decision for how a background-pipeline-triggered action reports usage back to the API (the doc gestures at this in `02-system-architecture.md`'s n8n section but doesn't reconcile it here). |
| Count-gated endpoints table | **Correct** | `watchlists`/`alertRules`/`workspaces` count-check pattern matches how `watchlist.service.ts`/`alert.service.ts` already do exactly this today (confirmed: both already call `PLAN_LIMITS[...].watchlists` / `.alertRules` before insert) — this table describes *extending* an existing, working pattern, which is exactly the right instinct, even though the constant it points at (`packages/shared/src/plans.ts`) is the wrong location per the duplication issue above. |
| Grace Period Gating section | **Correct** | Consistent with `07-subscription-lifecycle.md`. |
| Existing Phase 5 Quota System Reuse table | **Correct, good instinct, wrong location** | Correctly identifies the existing Redis rate-limit key pattern and confirms no collision with the new quota namespace — exactly the kind of reuse-not-duplicate analysis the user's Phase 9 brief asked for. Undermined only by the plan-limits duplication elsewhere in the same document. |

---

## 09-security.md

| Aspect | Verdict | Why |
|---|---|---|
| Trust boundary diagram | **Correct** | Clean and accurate framing. |
| Webhook signature verification code | **Correct** | Matches Stripe SDK usage correctly (`request.body as Buffer`, `constructEvent`). |
| Replay protection (two-layer) | **Correct** | Sound design. |
| CSRF section | **Needs clarification (overstated)** | States "the CSRF header requirement must be bypassed for `/api/v1/webhooks/*` routes." In the real codebase, `validateCsrf` (`apps/api/src/middleware/csrf.ts`) is an **opt-in `preHandler`**, not a global hook — a route simply doesn't include it. There is nothing to "bypass"; the webhook route just never adds `validateCsrf` to its `preHandler` array, same as every other unauthenticated route today. The document implies a global CSRF enforcement mechanism that doesn't exist. |
| JWT Interaction — Super Admin claim | **Contradicted (high severity)** | States "Super Admin JWT includes `role = 'super_admin'`." The real `AccessTokenPayload` type (`apps/api/src/lib/jwt.ts`) has exactly five fields — `sub, userId, orgId, orgRole, planTier` — **no `role` field at all**. The actual super-admin check (`apps/api/src/middleware/require-super-admin.ts`) does a **live database read** of `users.role`, with an explicit code comment stating this is deliberate: "Deliberately NOT based on the JWT." This is a direct, confirmed contradiction of an existing, intentional security design decision — see `04-security-review.md` for full treatment. |
| RBAC for Billing Operations table | **Contradicted** | Same owner/admin conflict as `03-domain-model.md` — repeated a third time. |
| Row Level Security table | **Contradicted** | Same Supabase `auth.uid()` issue as `04-database-design.md`. |
| Secrets Management — rotation table | **Correct in substance** | Reasonable secret list and rotation triggers. |
| Stripe Restricted Key scope | **Correct, good practice** | Minimum-permission API key design is exactly right and not commonly done by default. |
| PCI Considerations | **Correct** | Zero-PCI-scope design (Checkout + Portal only, no Stripe Elements) is sound and the ESLint-rule mitigation is a good concrete control. |
| Secret-scanning tool name | **Contradicted (minor)** | References "the `detect-secrets` pre-commit hook" twice. The actual tool wired into this repo is **secretlint** (`.secretlintrc.json`, `.secretlintignore`, invoked from `.github/workflows/ci.yml` and the root `secretlint` npm script). `detect-secrets` is not present anywhere in this repository. |
| Rate Limiting / Abuse Prevention | **Correct** | Sensible limits on checkout/portal session creation; correct call that Stripe's own IPs should be exempted from plan-tier limiting via infrastructure (WAF), not application code. |

---

## 10-environment.md

| Aspect | Verdict | Why |
|---|---|---|
| Env var table + `.env.example` additions | **Correct, well-scoped** | Clean naming (`STRIPE_*` prefix), correctly excludes real secret values from the document itself, matches the existing `.env.example` convention of placeholder values. |
| "Existing Variables Used by Billing" table | **Contradicted (one row)** | Lists `SENDGRID_API_KEY` / `RESEND_API_KEY` as "already defined in Phase 4." Neither variable exists in `.env.example`, `apps/api/.env`, or `apps/api/src/config.ts`'s Zod env schema — because no real email provider was ever wired in (see FR-08 above). This table should list these as **new, Phase-9-blocking** variables if billing emails are to work at all, not as pre-existing Phase 4 infrastructure. |
| Local dev / Stripe CLI instructions | **Correct** | Standard, accurate Stripe CLI workflow. |
| Staging environment / two webhook endpoints | **Correct** | Sound separation of test-mode and live-mode credentials and endpoints. |
| Production deployment checklist | **Correct**, contingent on migrations existing | References migrations `0020`/`0021`; consistent with `04-database-design.md`'s numbering, assuming no other migrations land first (the repo is currently at `0009`, so renumbering to `0010`/`0011` would be needed at actual implementation time — noted as a sequencing detail, not a design flaw). |
| Secret Security Notes | **Contradicted (minor)** | Repeats the `detect-secrets` claim from `09-security.md`. |

---

## 11-testing-strategy.md

| Aspect | Verdict | Why |
|---|---|---|
| Overall framing (4 layers: unit/integration/webhook/e2e) | **Correct in principle, missing prerequisite** | Sound test pyramid for a billing system. But **no test framework of any kind exists anywhere in this repository today** — no `vitest`, `jest`, or `playwright` dependency in any `package.json` (root, `apps/api`, `apps/web`, or any `packages/*`), no `*.test.ts`/`*.spec.ts` file anywhere, no `e2e/` directory. The root `npm test` script (`turbo run test`) is a no-op today because no workspace defines a `test` script for Turbo to run. This document is written as if Vitest+MSW+Playwright are already configured and working; they are not, in any phase completed so far. This is the single largest "Missing" finding in the entire architecture set. |
| Unit test examples (plan hierarchy, grace period gating, price ID resolution) | **Correct as design, but sample code, not real** | Good test *design* — but every code sample imports from files that don't exist yet (`packages/shared/src/plans.ts`, `getPlanForGating`), so these are illustrations of intent, not verifiable specs. |
| Integration tests (`app.inject`, MSW) | **Correct pattern, unproven stack** | `app.inject()` is genuinely how Fastify apps are conventionally tested and would work once a test runner exists; MSW for mocking the Stripe API is a reasonable and common choice. Neither is installed. |
| Webhook tests | **Correct design** | The idempotent-replay test is exactly the right test to have for this system. |
| E2E test (Playwright, real Stripe test-mode checkout UI) | **Unverifiable / high maintenance cost** | Automating Stripe's own hosted Checkout page's DOM (card number/expiry/CVC field selectors) is fragile — Stripe controls that page's markup, not this project, and it can change without notice. A more resilient E2E strategy would stop at "redirected to `checkout.stripe.com`" and use Stripe's API/CLI to simulate completion (`stripe trigger`) rather than driving the real hosted form via Playwright. |
| Failure injection tests (Stripe timeout, Redis unavailable) | **Correct, and surfaces a real open question** | The Redis-unavailable test asserts "fail open" (202, allow the request) — correctly flagged in the same document as `[ASSUMPTION — requires approval]`. Good that it's flagged; this is the single clearest example in the whole set of a document correctly marking its own uncertainty. |
| Rollback Testing section | **Correct** | Migrate → test → rollback → re-apply is exactly the right discipline, and matches Database_Schema.md's own reversibility requirement (every migration in this codebase already ships an "-- Up"/"-- Down" pair per `packages/db/src/migrate.ts`'s custom runner). |

---

## 12-implementation-plan.md

| Aspect | Verdict | Why |
|---|---|---|
| Milestone breakdown (M1–M10) | **Correct shape, some path/package errors** | Sensible dependency ordering (plans → migrations → services → webhooks → gating → UI → emails → admin → tests). PR sizes are realistic and mostly within the 500–700 line guideline. |
| M1 file paths | **Needs correction** | `packages/shared/src/plans.ts` — see duplication issue; should instead be an extension of `apps/api/src/lib/plan-limits.ts` (and only promoted to `packages/shared` if `apps/web` genuinely needs it at build time, which it does for a pricing page — see `02-consistency-review.md` §1 for the recommended resolution). |
| M2 migration numbers (`0020`, `0021`) | **Needs correction (sequencing)** | The repository's actual latest migration is `0009_seed_prompt_library.sql`. Phase 9's migrations should be `0010`/`0011` unless ten more migrations land between now and Phase 9 implementation. Cosmetic but will cause an immediate file-naming mismatch on day one of implementation. |
| M3 file paths (`routes/v1/billing.routes.ts`, `lib/stripe.ts`, `packages/shared/src/schemas/billing.schemas.ts`) | **Contradicted** | Same `routes/v1/` issue as `02-system-architecture.md`. A dedicated shared Zod-schemas package is also inconsistent with the existing convention of inline schemas per route file (confirmed in every existing `*.routes.ts`). `apps/api/src/lib/stripe.ts` as a client singleton is a good and consistent idea, matching how `apps/api/src/plugins/redis.plugin.ts`/`db.plugin.ts` already centralize external clients. |
| M4–M9 | **Correct shape** | Reasonable task breakdown; M6's file list (`videos.routes.ts`, `exports.routes.ts`, `watchlists.routes.ts`, etc.) uses plural file names that don't match the real singular convention (`video.routes.ts`, `watchlist.routes.ts`, `alert.routes.ts`) — minor but will cause confusion when an implementer goes looking for these files. |
| M10 test directory | **Contingent on the missing test framework** | Cannot be executed until a test runner is actually installed and configured for `apps/api` — this should be its own milestone (or folded into M1) rather than assumed as ambient capability. |
| Implementation Order diagram | **Correct** | The dependency graph itself is sound once the above path corrections are made. |

---

## 13-risk-register.md

**Correct — the strongest document in the set.** All 12 risks are concrete, plausible, and each has a genuine mitigation and contingency rather than a restated goal. R1 (checkout race condition), R11 (free-plan null handling), and R5 (PCI scope creep) are correctly prioritized as the three requiring a pre-implementation decision. No contradictions found against the codebase — this document reasons about *failure modes of the proposed design* rather than making claims about *existing infrastructure*, which is exactly why it holds up better than the others under verification.

---

## 14-open-questions.md

**Mostly correct, with one question that isn't actually open.** Q1–Q14 are well-formed decision points with sensible defaults. Two notes:

- **Q2** ("Free plan subscription row: should Free orgs have a manual row, or no row?") is framed as an open question, but the codebase already has a definitive answer today: `organizations.plan` defaults to `'free'` independent of any `subscriptions` row (`packages/db/src/schema/organizations.ts`: `plan: text('plan').notNull().default('free')`). The "default if not answered" (no row = free) *is* the current, working behavior — this should be documented as a confirmed existing decision, not an open question requiring Engineering Lead sign-off.
- **The CRON mechanism** (used in Q-adjacent risk R7 and in `07-subscription-lifecycle.md`'s payment-failure flow) is never actually posed as one of the 14 questions, despite being genuinely undecided (BullMQ repeatable job vs. n8n scheduled workflow vs. something else). It should be added as a 15th question — see `14-open-questions.md`'s gap noted throughout this review.

---

*Continued in `02-consistency-review.md` for the cross-cutting duplication/inconsistency analysis referenced repeatedly above.*
