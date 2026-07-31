# CHANGELOG.md
# ViralScopes.io — Changelog

> All notable changes to ViralScopes.io are documented in this file.
>
> This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
> and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Changelog Format Guide

Each version entry uses the following change categories:

| Category | Description |
|---|---|
| `Added` | New features, endpoints, pages, or capabilities |
| `Changed` | Changes to existing functionality (non-breaking) |
| `Deprecated` | Features that will be removed in a future version |
| `Removed` | Features removed in this version |
| `Fixed` | Bug fixes |
| `Security` | Security patches, vulnerability fixes, compliance updates |
| `Performance` | Performance improvements |
| `Infrastructure` | Infrastructure, DevOps, CI/CD, deployment changes |
| `Documentation` | Documentation additions or corrections |

---

## Versioning Policy

| Version type | When used | Example |
|---|---|---|
| **Major** (`X.0.0`) | Breaking API changes, major product pivots | `2.0.0` |
| **Minor** (`x.Y.0`) | New features, non-breaking additions | `1.3.0` |
| **Patch** (`x.y.Z`) | Bug fixes, security patches, minor updates | `1.2.4` |

**Pre-release identifiers:**
- `alpha` — Internal only, unstable (`1.0.0-alpha.1`)
- `beta` — External beta testing (`1.0.0-beta.3`)
- `rc` — Release candidate, feature-complete (`1.0.0-rc.1`)

---

## [Unreleased]

> Changes merged to `develop` but not yet released to production.
> This section is moved to a versioned entry on each production release.

### Security

- Fixed an authentication oracle in `POST /api/v1/auth/login`: a correct password against an unverified account previously returned a distinct `403 EMAIL_NOT_VERIFIED` (and skipped the lockout counter), letting an attacker confirm a guessed/stuffed password was correct without completing login. Now returns the identical `401 INVALID_CREDENTIALS` as a wrong password or nonexistent account, and counts toward account lockout the same way. See DEC-015 in `PROJECT_STATUS.md`.
- Fixed silent OAuth account-linking: a Google/GitHub sign-in matching an existing, unverified local account (e.g. one an attacker pre-registered with a different email owner's address) previously linked automatically and issued a session with no verification check. OAuth linking now requires the existing account to already be verified; otherwise the attempt is refused (`OAUTH_ACCOUNT_REQUIRES_VERIFICATION`) and the real owner reclaims the account via the existing password-reset flow. See DEC-016 in `PROJECT_STATUS.md` and `Security_Architecture.md` §5.

### Added (Phase 5 — Core Backend API)

- `GET /api/v1/videos`, `/videos/:id`, `/channels`, `/channels/:id`, `/trends`, `/trends/opportunities` — paginated reads over global content
- `GET /api/v1/recommendations`, `/recommendations/:videoId` — org-scoped reads
- Watchlists (`/api/v1/watchlists`) and Alert Rules (`/api/v1/alerts/rules`) full CRUD, both plan-tier quota-enforced per `Pricing_Strategy.md`, with creator-or-org-owner/admin write authorisation; `GET /api/v1/alerts/events` read-only dispatch history
- API Keys (`/api/v1/api-keys`) CRUD — sha256-hashed storage, plaintext key returned once on creation, gated to plans with API access
- `GET /api/v1/usage` — current-period usage vs plan quota; `GET /api/v1/analytics/overview` — org KPIs
- `/api/v1/admin/*` — users, organizations, jobs, dead-letter queue (+ retry), platform metrics, gated by a new super-admin middleware
- Plan-tier-aware Redis rate limiting on all Phase 5 endpoints (`Pricing_Strategy.md` §2.6/§3 ceilings)
- `withTenant()` (built in Phase 3) is now actually used — every org-scoped query in this release runs inside it

### Fixed (Phase 5)

- Fixed a query-parameter bug affecting the dead-letter (`?resolved=`) and trends (`?latestSnapshotOnly=`) filters: `z.coerce.boolean()` coerced the literal string `"false"` to `true` (any non-empty string is JS-truthy), silently inverting the filter. Replaced with an explicit `"true"`/`"false"` enum-and-transform.
- Fixed plan-tier rate-limit resolution: Free/Starter tiers (which have no documented API rate limit because they have no API access at all) were falling through to the same generous fallback intended for Enterprise's "Custom" limit, instead of the conservative placeholder ceiling intended for tiers with no API access.
- Fixed `apps/api`'s production Docker image crashing on boot (`ERR_MODULE_NOT_FOUND` on `@viralscopes/db`) on any database-touching request — pre-existing since Phase 4 first added that runtime dependency, only caught now via an actual container boot test (BLK-004 in `PROJECT_STATUS.md`). `packages/db` gained a real build step (previously TS-source-only, tsx-consumption-only) and `Dockerfile.api`'s runner stage now includes its compiled output.
- Fixed a fresh-checkout CI failure caused by the above: `turbo.json`'s `type-check` task didn't depend on upstream `build` tasks, so `apps/api`'s type-check ran before `packages/db`'s newly-required `dist/` existed. Added `dependsOn: ["^build"]` to `type-check`, matching `build`/`test`.

### Added (Phase 6 — n8n Workflow Engine, partial)

- Real BullMQ producer/worker (`apps/api/src/lib/queue.ts`): jobs are enqueued with custom backoff (0s/30s/5min, 4 attempts), dispatched to an n8n webhook over HTTP, and n8n's `{success, message}` response drives retry/completion/dead-letter — n8n never touches the queue directly, so all persistence and retry logic stays in the backend. See DEC-018 in `PROJECT_STATUS.md`.
- `job_logs` and `dead_letter_jobs` are now written from real job lifecycle events (started/retrying/completed/failed), not left empty
- `requireServiceToken` middleware (timing-safe comparison) and `POST /api/v1/internal/heartbeat`, called by n8n's new Schedule Trigger workflow every 5 minutes
- `POST /api/v1/admin/jobs/:workflow/trigger` — manually enqueue a registered workflow; `POST /api/v1/admin/dead-letter/:id/retry` now genuinely re-enqueues the job instead of a stub response
- `GET /health`'s queue check now reports real `getJobCounts()` per registered queue instead of a static `not_implemented`
- Two n8n workflows added under `infra/n8n-workflows/`: `foundation-demo.json` (webhook trigger, service-token validation, simulated success/failure — the template every future real workflow follows) and `heartbeat.json` (scheduled liveness check)
- `npm run workflows:import` / `workflows:export` — sync workflow JSON between this repo and the running n8n container
- n8n added to both Docker Compose files with a healthcheck, Redis dependency, and service-to-service auth via `N8N_SERVICE_TOKEN`

### Fixed (Phase 6)

- Fixed n8n's `EXECUTIONS_MODE=queue` hanging every workflow execution forever: it requires a separate `n8n worker` process to consume n8n's own internal execution queue, which wasn't configured. Reverted both compose files to n8n's default regular execution mode. See DEC-019 and TD-021 in `PROJECT_STATUS.md`.
- Fixed n8n blocking `$env` access inside node expressions by default, which silently evaluated the service-token check and the heartbeat's auth header to `undefined`. Added `N8N_BLOCK_ENV_ACCESS_IN_NODE: 'false'` (safe for this single-tenant self-hosted instance).
- Fixed `BullMQ`'s queue-naming rejecting colons: `INFRASTRUCTURE_GROWTH_PLAN.md` documents a `viralscopes:<priority>:<workflow>` naming convention that BullMQ itself rejects at runtime; switched to dashes.

### Added (Phase 7 — AI Prompt Library & Versioning)

- Admin-only CRUD over `prompt_library` (`GET/POST /api/v1/admin/prompts/...`): list prompts, list/get a version, create a new version, activate a version (one active version per name, enforced transactionally), and a field-by-field diff between two versions
- Seeded the 6 real AI prompts (`video_analysis`, `thumbnail_analysis`, `title_formula_detection`, `hook_classification`, `trend_clustering`, `ethical_recommendation`), transcribed from `AI_Strategy.md`/`n8n_Workflow_Diagrams.md` — corrects an earlier 8-item list that included two pipelines with no actual AI call. See DEC-020 in `PROJECT_STATUS.md`.
- Redis AI-response cache (`vs:ai:{promptName}:{promptVersion}:{sha256(input)}`, 24h TTL) with real hit/miss counters now in `GET /api/v1/admin/metrics`'s new `aiCache` field; `POST /api/v1/internal/ai-cache/lookup` and `/store` let n8n workflows use it without a native Redis credential
- Prompt test harness (`POST /api/v1/admin/prompts/:name/test`, `GET .../test/:jobId`) against 10 committed fixture videos (`apps/api/test-fixtures/videos/`), dispatched through the same queue→n8n pattern as every Phase 6 workflow (`infra/n8n-workflows/prompt-test.json`) rather than a synchronous in-request AI call
- Regression runner (`npm run ai:regression`): every video-scoped active prompt against all 10 fixtures, reporting schema-validation results — deliberately not wired into CI as a merge-blocking gate (see TD-023)

### Fixed (Phase 7)

- None — no bugs found in previously-shipped code this phase; three genuine limitations were found and logged as TD-023 instead (no AI provider credentials anywhere in this environment, blocking the test harness's/regression runner's actual AI-call leg and any real cost estimate)

### Added (Phase 8 — Frontend Dashboard, partial)

- `@fastify/cors` on `apps/api` (`Security_Architecture.md`'s already-specified CORS policy, never implemented before now) — required infrastructure for the browser to call the API cross-origin at all
- `apps/web` frontend foundation: a typed API client (access token held in memory only, session persistence via the httpOnly refresh cookie, single 401-retry-with-refresh), design-system primitives hand-built on Radix UI + `cva` + `tailwind-merge` (shadcn's own copy-source model), TanStack Query with a query-key factory and per-resource cache-strategy tiers, and typed route constants
- Auth pages: login, register, verify-email, reset-password (request + confirm), logout — email/password only; a client-side auth gate (the real boundary) plus a `proxy.ts` route guard (Next.js 16's renamed `middleware.ts`)
- Responsive app shell (collapsible sidebar + mobile drawer + topbar) and a Home dashboard wired to analytics overview, watchlists, recommendations, and alert events, with an honest empty state when the signed-in user has no organisation
- Full CRUD UI: Watchlists (optimistic delete), Alert Rules + read-only event history, API Keys (one-time plaintext reveal with copy), Profile (account info + session list/revoke), and a read-only Organisation page
- AI Prompt Library admin UI (Phase 7 integration): version history + activate, version diff, and a test harness against the 10 fixture videos with live job-status polling

### Fixed (Phase 8)

- Fixed the password-reset page being at the wrong URL: `auth.service.ts` hardcodes the reset email's link as `/reset-password/confirm`, not the flat `/reset-password` first built — restructured to a request page (`/reset-password`) + confirm page (`/reset-password/confirm`)
- Fixed `analytics/overview`'s `alertEvents.last30Days` being rendered as if it were a number — it's actually a per-status breakdown object (`{sent, failed, ...}`)
- Fixed relative imports using a trailing `.js` extension, which `tsc`'s Bundler module resolution tolerates but Turbopack does not — a real build failure, not a type-check-only issue

### Added (Phase 9 — Subscription & Billing, Milestone 1 of 6: Billing Foundation)

- `packages/shared/src/plans.ts` — `PlanTier`/`PlanLimits`/`PLAN_LIMITS`/`PLAN_HIERARCHY`/`PLANS`, promoted from `apps/api/src/lib/plan-limits.ts` (extended, not duplicated) so `apps/web` can share the same constants; `packages/shared` given a real build path (mirrors BLK-004's fix for `packages/db`)
- Two new migrations: `subscriptions.billing_cycle`/`checkout_session_id` + a partial unique index enforcing one non-canceled subscription per org, and a new `billing_events` table (webhook idempotency ledger, no RLS by design — same identity-lookup-before-tenant-context justification as `sessions`/`oauth_accounts`)
- `billing.repository.ts`, `billing.service.ts` (current-plan summary implemented; checkout/portal session creation defined but intentionally not implemented — Milestone 2 scope), and a `BillingProvider` interface + `StripeBillingProvider` implementation so business logic never imports the `stripe` SDK directly
- `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/6 Stripe Price ID environment variables (all optional — billing returns `503` rather than crashing at boot when unset, same as unconfigured OAuth)
- No billing routes, no HTTP surface, no live Stripe account exercised yet — by design; see `PROJECT_STATUS.md`'s Phase 9 section

### Fixed (Phase 9 Milestone 1)

- Caught before it could reach a real migration run: the draft design used `CREATE UNIQUE INDEX CONCURRENTLY`, which Postgres refuses inside a transaction block — and this project's migration runner (`packages/db/src/migrate.ts`) wraps every migration in one. Switched to a plain `CREATE UNIQUE INDEX` (negligible lock cost at this table's current size).

### Documentation (Phase 9)

- 14 architecture documents (`docs/architecture/billing/`) and 8 independent review documents (`docs/reviews/billing/`) — the review cross-checked every architectural claim against the real codebase and found (then corrected) several mismatches: RLS written against Supabase's `auth.uid()` instead of this project's actual `current_setting()` pattern, a JWT `role` claim assumed for admin checks that doesn't exist, a proposed plan-limits file that duplicated rather than reused existing code, and a testing strategy assuming a test runner this repository has never had. Six architecture decisions were resolved and reflected across all 14 documents before implementation began. See `PROJECT_STATUS.md` DEC-026/DEC-027, TD-025.

### Added (Phase 9 Milestone 2 of 6: Checkout & Subscription APIs)

- `POST /api/v1/billing/checkout` (Owner only) — creates a Stripe Checkout Session for a self-serve plan upgrade; validates the organisation, the requested plan, and that it's an upgrade from any existing real paid subscription before ever calling the provider
- `POST /api/v1/billing/portal` (Owner only) — creates a Stripe Customer Portal session; `402 NO_BILLING_ACCOUNT` if the org has never subscribed
- `GET /api/v1/billing/subscription` (Owner + Admin) — full subscription details (status, billing cycle, periods, grace period)
- `GET /api/v1/billing/plan` (any authenticated org member) — current plan tier + feature limits, derived from the JWT with no database call
- `billing.routes.ts` is the first route in this codebase to actually call `requireRole()` — built in Phase 4, never wired to a real route until now (see TD-012 in `PROJECT_STATUS.md`, now resolved)

### Security (Phase 9 Milestone 2)

- Verified RBAC end-to-end against all three organisation roles (owner/admin/member): owner has full checkout/portal/subscription access; admin can view the subscription but is correctly blocked (403) from checkout/portal; member is blocked from all three
- Re-confirmed RLS directly against Postgres for `subscriptions` (unauthorized insert fails, authorized insert with correct tenant context succeeds) and `billing_events` (no RLS, by design)
- No provider secrets or provider IDs (`provider_customer_id`, `provider_subscription_id`, `checkout_session_id`) are ever included in an API response

### Added (Phase 9 Milestone 3 of 6: Webhooks)

- `POST /api/v1/webhooks/stripe` — unauthenticated by design (verified by the `Stripe-Signature` HMAC, not a JWT/CSRF token), with a scoped raw-`Buffer` content-type parser so Stripe's signature can be verified against the exact bytes received, isolated to this one route via Fastify plugin encapsulation
- `WebhookService` (`webhook.service.ts`) processes exactly the 6 Stripe events the approved architecture defines: `checkout.session.completed`, `customer.created`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Idempotency via the Milestone-1 `billing_events` table: every event's provider event ID is checked before dispatch; duplicate deliveries are detected and skipped without reprocessing
- 3-day grace period on `invoice.payment_failed`, only set on the first failure per invoice (Stripe's Smart Retries can re-fire the event for the same invoice)
- `lib/audit-log.ts` — a new `auditLog()` helper writing to the existing `audit_logs` table, invoked from every billing-state-changing webhook handler
- Processing failures are recorded to `billing_events` (`status='failed'`) and pushed to the existing (Phase 6) `dead_letter_jobs` table; unknown/unhandled event types are recorded as `status='skipped'` — both cases still answer Stripe `200`, since retrying a signature-valid delivery whose failure won't self-resolve serves no purpose

### Fixed (Phase 9 Milestone 3)

- `subscriptions.canceled_at` existed in the schema since Milestone 1 but no code path ever set it — added `canceledAt` to `UpsertSubscriptionInput` and threaded it through all 5 call sites in `webhook.service.ts`

### Security (Phase 9 Milestone 3)

- Invalid and missing `Stripe-Signature` headers both verified to return `400 INVALID_WEBHOOK_SIGNATURE` without touching `billing_events` or any billing table
- Idempotency live-verified: replaying the same event ID produces exactly one `billing_events` row and no duplicate side effects
- Database writes never trust client-supplied billing state — plan/status/period/cancellation are always resolved from the Stripe event's own payload (`metadata.org_id` per DEC-027), never from a request body
- Audit log metadata carries the Stripe event ID and plan/status fields only — no card or payment-method data is ever logged
- A deliberate scope decision, not an oversight: Stripe's auto-created Customer object during Checkout carries no metadata, so `customer.created` cannot resolve `org_id` without a database lookup-before-tenant-context that would break the RLS approach DEC-027 established for `subscriptions`/`invoices` — handled as an audit-only no-op (`billing_events` row, `orgId=null`, `status='skipped'`) instead

### Added

- `PROJECT_RULES.md` — Engineering standards, coding conventions, git workflow, RBAC, Definition of Done, and AI assistant contribution rules
- `PRD.md` — Complete Product Requirements Document: product vision, 4 user personas, 43 user stories across 8 categories, 49 functional requirements, non-functional requirements, success metrics and KPIs, risk register, assumptions and constraints, and future roadmap
- `ROADMAP.md` — Detailed development roadmap: 14 MVP phases with full task checklists, dependency graph, parallel development opportunities, v1–v4 feature progression, priority matrix, risk register, and 16-milestone calendar
- `REPOSITORY_STRUCTURE.md` — Complete annotated monorepo hierarchy (every directory and file), layer responsibilities, dependency boundaries, naming conventions, testing structure, and environment variable reference
- `INFRASTRUCTURE_GROWTH_PLAN.md` — 4-stage infrastructure evolution plan: Stage 1 MVP through Stage 4 Enterprise, covering database growth, caching, CDN, queues, storage, search, monitoring, logging, CI/CD, security, disaster recovery, cost optimisation, and multi-region strategy
- `README.md` — Project overview, full feature list, complete tech stack, architecture diagram, installation guide, local development guide, environment variable reference, testing guide, deployment pipeline, folder structure, contributing guide, and 14-question FAQ
- `PROJECT_STATUS.md` — Single source of truth for project progress: at-a-glance dashboard, per-phase completion tracking, task summary (444 total MVP tasks), active risks (RISK-01 YouTube quota, RISK-02 AI cost model), 6 architecture decisions (DEC-001 through DEC-006), technical debt log (4 intentionally accepted debts), and prioritised next actions
- `CHANGELOG.md` — This file, initialised in Keep a Changelog format

### Infrastructure

- Defined complete monorepo structure: `apps/web`, `apps/api`, `packages/shared`, `packages/db`, `infra/`, `docs/`
- Defined Docker Compose architecture for development and production environments
- Defined CI/CD pipeline: GitHub Actions lint → test → build → staging deploy → production deploy (with manual approval)
- Defined 4-stage infrastructure evolution plan with measurable upgrade triggers per stage

### Documentation

- All 8 core project documents authored and cross-referenced
- Architecture Decision Records (ADRs) defined for: monorepo structure, Fastify over Express, n8n for workflows, Drizzle ORM, dual AI providers, Cloudflare R2

### Added (Phase 1 — Foundation & Project Setup)

- Turborepo monorepo scaffold: `apps/web` (Next.js 16, App Router), `apps/api` (bare Fastify skeleton), `packages/shared` and `packages/db` (stub packages, populated from Phase 3 onward)
- TypeScript strict mode, ESLint (flat config, shared base + no-`any`/no-`console`/import-order rules), Prettier, and Husky pre-commit hooks configured across all packages
- `secretlint` pre-commit secret scanning — verified to actually block a commit containing a fake secret
- Full design token system implemented as CSS custom properties (colour, typography, spacing, layout, motion) with dark/light theme support, wired into `tailwind.config.ts`
- Placeholder brand assets: logo, favicon (`icon.svg`), loading screen, and dashboard icon set (home, trends, videos, watchlists, settings)
- `.env.example` populated with the full environment variable reference
- `LICENSE` (MIT) added

### Infrastructure (Phase 1)

- Turborepo build pipeline (`build`, `dev`, `lint`, `type-check`, `test` tasks)
- GitHub repository ruleset configuration created for `main` and `develop` per `PROJECT_RULES.md` §5.2; enforcement became active once the repository was made public in Phase 2 (see DEC-008 in `PROJECT_STATUS.md` — originally limited by GitHub's private-repo plan requirements, BLK-001)

### Documentation (Phase 1)

- `README.md` setup instructions corrected to match the actual repository layout (docs at root, not under `docs/`) and the real GitHub remote
- `PROJECT_RULES.md` §4.3 updated to name `secretlint` explicitly (was generic "git-secrets or detect-secrets")
- `REPOSITORY_STRUCTURE.md` §9 annotated to note its `docs/` folder tree is a target convention, not the current layout

### Added (Phase 2 — Infrastructure & DevOps, Milestones 1-3)

- Multi-stage Dockerfiles for `apps/api` (using `turbo prune` to avoid bundling unrelated workspace dependencies) and `apps/web` (Next.js `standalone` output)
- `docker-compose.dev.yml` — Redis, n8n, MinIO, Prometheus, Grafana, Loki for local development (PostgreSQL intentionally excluded; that's Phase 3's Supabase CLI setup)
- `docker-compose.prod.yml` and Traefik configuration — written and validated, not yet deployed (no server/domain provisioned)
- `GET /health` (liveness) and `GET /ready` (readiness) on both `apps/api` and `apps/web`; `/ready` honestly reports unimplemented dependencies (database, Redis, queue) rather than faking success
- `.github/workflows/ci.yml` — lint, type-check, build, format check, secret scan on every push/PR to `main`/`develop`
- `.github/workflows/security.yml` — production-aware dependency audit (`.github/scripts/check-audit.mjs` + `.github/security/audit-allowlist.json`), CodeQL, and Dependency Review

### Security (Phase 2 Milestone 3)

- Production-aware `npm audit` policy: production dependencies only gate the build; any high/critical finding must be fixed or explicitly allowlisted with a reason and a review-by date (currently 4 findings, all traced to Next.js's bundled `sharp`/`postcss`, reviewBy 2026-10-26)
- Dependabot vulnerability alerts and Dependabot security updates enabled
- CodeQL and Dependency Review evaluated: both require GitHub Advanced Security, unavailable on this repo while private; both verified working after the repository was made public

### Infrastructure (Phase 2 Milestones 1-3)

- Repository switched from private to public (repo owner's decision) to unblock GitHub Advanced Security features
- Branch protection rulesets on `main`/`develop` now actively enforced (1 required approving review, required status checks, no force-push/deletion), with a repository-admin bypass so the solo maintainer isn't blocked by the self-approval restriction GitHub enforces

### Added (Phase 2 Milestone 4 — Environment & Secrets)

- Zod-based startup validation for `apps/api`'s environment variables (`apps/api/src/config.ts`) — invalid `PORT` or `APP_ENV` values fail immediately with a specific error instead of booting on a silently-wrong config; verified locally
- `.env.example` reorganised into four explicit categories (required now / optional now / required starting Phase N / development-only) instead of an undifferentiated list

### Security (Phase 2 Milestone 4)

- `.env.example` removed from `.secretlintignore` — it's now actually scanned by secretlint like every other file, rather than exempted
- `.gitignore`'s environment-file exclusion replaced with a catch-all (`.env.*`, with `.env.example` as the one explicit exception) so a new variant (`.env.test`, `.env.staging.local`, ...) can't slip through by omission — verified against 4 real cases

### Fixed (Phase 2 Milestone 4)

- README.md no longer claims `DATABASE_URL`, `JWT_SECRET`, and similar Phase 3/4 variables are required to run the application shell locally — nothing reads them yet, and the app boots fine with an empty `.env.local`
- A second stale reference to a PostgreSQL container in `docker-compose.dev.yml` (which doesn't include one) — missed in the Milestone 1 README fix — corrected in README.md §8
- Restored `S3_FORCE_PATH_STYLE` to `.env.example` (present in the pre-reset implementation, dropped during the Phase 1 rewrite; genuinely required for MinIO's path-style addressing)

### Added (Phase 2 Milestone 5 — Monitoring & Health Checks)

- Structured Pino logging for `apps/api` (`apps/api/src/plugins/logger.plugin.ts`): JSON output with `service`/`version`/`environment` base fields and ISO timestamps
- Redaction of `password`, `password_hash`, `token`, `apiKey`/`api_key`, `secret`, `authorization` (incl. the `Authorization`/`Cookie` headers), `email`, `name`, and `ip_address` from all log output
- A deliberate one-time `warn`-level log at boot listing unimplemented dependencies (database, Redis, queue), alongside `info` for normal request/lifecycle events and `error` for unexpected failures
- `LOG_LEVEL` added to the `apps/api` Zod config schema — invalid values fail fast like every other validated variable

### Security (Phase 2 Milestone 5)

- Log redaction verified directly against real output (not assumed): a test log call with `password`/`email`/`name`/`ip_address` fields produces `[REDACTED]`; confirmed this doesn't affect Pino's own error serialization (`err.type`, not `err.name`)

### Fixed (Phase 2 Milestone 6 — Deployment & Release Readiness)

- Added `.gitattributes` (`* text=auto eol=lf`) — fixes a real, recurring issue where a fresh checkout on Windows with `core.autocrlf=true` converted every text file to CRLF, causing `npm run format:check` to report ~47 files as having formatting issues that didn't actually exist in the committed content. Verified via two fresh clones: before the fix, `apps/api/src/config.ts` checked out as CRLF; after, it checks out as clean LF and `format:check` passes with zero warnings.
- Confirmed (not assumed) that an `apps/web` build failure encountered while testing from a deeply-nested scratch directory was a Windows `MAX_PATH` limitation specific to that test location, not a code defect — the same clean checkout builds successfully from a short path.

### Documentation (Phase 2 Milestone 6)

- Audited all core docs for broken internal links. Found 6 references (in `README.md` and `PROJECT_STATUS.md` DEC-001 through DEC-005) to `docs/decisions/ADR-*.md` and a GDPR guide that were never written — pre-existing from Pre-Development, not introduced by Phase 2. Logged as TD-007 rather than fixed silently or fabricated under time pressure.
- **Phase 2 — Infrastructure & DevOps is complete** (6/6 milestones). TD-006 logged for infrastructure explicitly deferred at the Phase 2 approval gate (live Traefik/SSL, Coolify staging/production deploy, Alertmanager/PagerDuty, Grafana dashboards against real metrics) — tracked forward to Phase 14 and ongoing work, not silently dropped.

### Added (Phase 3 — Database & Core Schema)

- `packages/db/src/schema/*.ts` — all 26 tables from `Database_Schema.md` as Drizzle ORM schema (users/orgs, billing/usage, content, AI analysis, watchlists/alerts, operations), recovered and re-verified against the pre-reset implementation (commit `b747f97` and two follow-up fix commits)
- `packages/db/src/migrations/0001_initial_schema.sql` through `0004_partitioning.sql` — hand-written, reversible SQL migrations (tables/indexes/constraints, `updated_at` triggers, RLS policies, `usage_events`/`job_logs` partitioning), applied by a custom runner (`packages/db/src/migrate.ts`) supporting `up`, `down [n]`, and `status`
- `packages/db/src/client.ts` — `createDbClient()` and `withTenant()`, which sets `app.current_org_id`/`app.current_user_id` as transaction-local settings for RLS to read
- `packages/db/src/setup-roles.ts` — creates/updates a dedicated, unprivileged `app_user` Postgres role that RLS-protected application queries will run as, since the migration/owner role bypasses RLS unconditionally
- `packages/db/src/seeds/` — deterministic, idempotent dev seed data (2 users, 1 org, 2 memberships, 1 default workspace); insert-if-missing pattern (not upsert) so re-running never mutates existing rows
- `packages/db/src/reset.ts` — drops and recreates the `public` schema for local dev; refuses to run against a non-localhost `DATABASE_URL`
- Root-level `db:migrate` / `db:migrate:down` / `db:migrate:status` / `db:setup-roles` / `db:seed` / `db:reset` / `db:studio` npm scripts (pass through to `packages/db`)
- `postgres` service in `docker-compose.dev.yml` (`postgres:17-alpine`) — supersedes the Milestone-1 comment that assumed the Supabase CLI, since the app doesn't use Supabase Auth (see Fixed, below)
- `docs/database-erd.mmd` — Mermaid ER diagram source covering all 26 tables and their relationships

### Fixed (Phase 3)

- `Database_Schema.md` §12 (Row Level Security) documented Supabase Auth's `auth.uid()` pattern, which cannot work in this project — it defines its own `users`/`sessions` tables with bcrypt password hashes (Security_Architecture.md §5, PRD.md FR-43), not Supabase Auth. Corrected to the `current_setting('app.current_org_id'/'app.current_user_id')` session-variable pattern actually implemented in `0003_rls_policies.sql`.
- `Database_Schema.md` §14 (Migration Strategy) claimed Drizzle ORM manages migrations directly; corrected to describe the actual hand-written-SQL-plus-custom-runner approach (see DEC-013 in PROJECT_STATUS.md for why).

### Security (Phase 3)

- Verified RLS functionally, not just as "enabled" flags: an initial tenant-isolation test returned every organisation's rows, because Postgres superusers/table owners bypass RLS unconditionally regardless of policy — and the role used to run migrations necessarily owns every table. Fixed by adding the dedicated `app_user` role (`setup-roles.ts`); re-verified with real per-tenant isolation (each org sees only its own rows) and fail-closed behaviour (zero rows visible with no tenant context set, whether reading or writing).
- `packages/db/src/setup-roles.ts` validates `APP_DB_USER` against a strict identifier allowlist and escapes the role password via standard-conforming SQL string escaping before use in `CREATE ROLE`/`ALTER ROLE` DDL, since Postgres does not accept bind parameters in that position.

### Known Limitations (Phase 3)

- Retention purge jobs and monthly partition-rotation automation are not implemented — business logic/scheduled automation, explicitly out of this phase's schema-and-data-layer-only scope. Logged as TD-008.
- The dead-letter queue admin endpoint and its Grafana panel are not implemented — API surface and a dashboard for that API, both explicitly out of scope. Logged as TD-009.
- ERD PNG export via `@mermaid-js/mermaid-cli` failed on a broken local `puppeteer-core`/`ws` module resolution (an environment issue). The Mermaid source (`docs/database-erd.mmd`) is complete and renders correctly in GitHub and other Mermaid-aware viewers.

---

## [1.0.0-alpha.1] — Planned

> **Target:** Week 6 from project initiation
> **Scope:** Foundation, infrastructure, database schema, and authentication complete.
> **Internal only — not publicly accessible.**

### Added

- Monorepo initialised with Turborepo (`apps/web`, `apps/api`, `packages/shared`, `packages/db`)
- TypeScript strict mode configured across all packages
- ESLint, Prettier, and Husky pre-commit hooks configured
- GitHub repository with branch protection rules on `main` and `develop`
- Design system: colour palette, typography scale, Tailwind design tokens, dark/light mode
- Logo placeholder, favicon, and loading screen
- Docker Compose development environment (`docker-compose.dev.yml`)
- Docker Compose production environment (`docker-compose.prod.yml`)
- Dockerfiles for all services: Next.js, Fastify API, n8n, Redis, MinIO
- Traefik reverse proxy with automatic SSL via Let's Encrypt
- GitHub Actions CI pipeline: lint, type-check, unit tests, integration tests, security scan
- GitHub Actions CD pipeline: staging auto-deploy, production manual-approval deploy
- Prometheus metrics collection with scrape targets for all services
- Grafana dashboards: API performance, queue health, database metrics, YouTube quota, business metrics
- Loki log aggregation from all services and n8n workflows
- Health check endpoints: `GET /health` and `GET /ready` on all services
- Cloudflare R2 object storage (production) and MinIO (development) configured
- Complete PostgreSQL schema via Drizzle ORM migrations (31 tables):
  - User and organisation tables: `users`, `organizations`, `organization_members`, `workspaces`, `projects`, `sessions`, `audit_logs`
  - Billing tables: `subscriptions`, `usage_events`, `api_keys`, `invoices`
  - Content tables: `videos`, `channels`, `transcripts`, `thumbnail_analyses`, `title_analyses`, `video_analyses`, `recommendations`, `trends`, `watchlists`, `alert_rules`, `alert_events`
  - Operational tables: `job_logs`, `dead_letter_jobs`, `prompt_library`
- Row Level Security (RLS) policies on all tables
- Table partitioning for `usage_events` and `job_logs` by month
- Data retention automated purge jobs (nightly)
- Dead-letter queue schema and admin retry endpoints
- Development seed data
- Full JWT authentication: access tokens (15-min), refresh token rotation (HTTP-only cookies)
- Google OAuth and GitHub OAuth integration
- Email verification required before dashboard access
- Password reset flow (1-hour email link)
- Account lockout after 5 consecutive failed login attempts
- Transactional email service (SendGrid/Resend) with 7 templates: welcome, verify, reset, invite, alert digest, billing confirmation, quota warning
- RBAC: 5 roles (Super Admin, Admin, Owner, Team Member, Viewer) enforced at route and service layers
- Organisation and workspace management: CRUD, member invitations, role management, ownership transfer
- Session management: active session listing, remote revocation, full audit logging

### Infrastructure

- One-command local development startup: `docker compose up`
- CI/CD pipeline deployed to staging environment
- Monitoring stack live with all service metrics flowing

---

## [1.0.0-alpha.2] — Planned

> **Target:** Week 13 from project initiation
> **Scope:** Core backend API, n8n workflows, AI prompt library, and frontend dashboard complete.
> **Internal only — not publicly accessible.**

### Added

- Fastify REST API v1 (`/api/v1/`) with full OpenAPI documentation at `/api/v1/docs`
- Zod input validation on all 40+ API endpoints
- Standardised error responses: `{ success, data, error: { code, message, details }, meta }`
- Redis-backed rate limiting per API key and authenticated user (per-plan limits)
- YouTube API Quota Manager: daily unit tracking, cache-first strategy, RapidAPI/Apify fallback
- API key management: create (plaintext shown once), list (hashed), revoke
- Stripe webhook handler with signature verification for all subscription events
- Outgoing webhook dispatch for user-configured alert channels
- Usage tracking: real-time Redis counters, async PostgreSQL persistence
- `GET /api/v1/usage` — current period usage and quota remaining
- Full admin API: users, organisations, jobs, dead-letter queue, metrics, quota override
- All 14 n8n workflows running and monitored:
  - Video Discovery (CRON every 6h + manual trigger)
  - Metadata Pipeline
  - Transcript Pipeline
  - Thumbnail Analysis (Claude/OpenAI Vision, CTR prediction)
  - AI Analysis Pipeline (schema-validated, cached)
  - Title Formula Detection
  - Hook Classification
  - Engagement Analytics
  - Viral Score Engine (proprietary 0–100 score + confidence)
  - Trend Detection (daily topic clustering)
  - Opportunity Engine (demand × growth ÷ competition ranking)
  - Ethical Recommendation Engine (original output only)
  - Channel Intelligence
  - Alert Dispatch (email, Discord, Slack, Telegram, webhook; throttled 1/hour/rule)
- Dead-letter queue: all workflow failures captured, admin notification sent, retry available
- All workflow JSON files committed to `/infra/n8n-workflows/`
- All workflow diagrams published to `/docs/workflows/`
- AI Prompt Library: 8 versioned prompts stored in database, test harness, diff view, regression runner
- AI response caching: Redis key = `(prompt_version, sha256(input))`, 24h TTL
- Next.js 14 App Router frontend with Tailwind CSS, shadcn/ui, TanStack Query
- `next-intl` i18n architecture (English at launch; framework ready for additional languages)
- Typed API client layer (`apps/web/lib/api/`)
- Route path constants (`apps/web/lib/routes.ts`)
- Authentication pages: login, register, password reset, email verification, OAuth callback
- 3-step onboarding flow: create org → choose plan → set first watchlist → product tour
- Dashboard pages: Home, Trending, Videos, Video Detail, Channels, Trends, Opportunities, Recommendations, Watchlists, Alerts, Search, Export, Settings, Admin
- API Key Management UI: list (hashed), create (one-time plaintext + copy), revoke
- Changelog page with sidebar badge
- Charts: growth line, viral score histogram, trend velocity area, upload frequency heatmap, engagement bar
- Responsive design: desktop and tablet

### Performance

- AI response cache achieving estimated 40–60% hit rate after first week of operation
- All API endpoints meeting p95 < 500ms target in staging load tests

---

## [1.0.0-beta.1] — Planned

> **Target:** Week 16 from project initiation
> **Scope:** Billing, security hardening, GDPR compliance, and full test suite complete.
> **External beta — invited testers only.**

### Added

- Stripe subscription billing: 5 plan tiers (Free, Starter, Professional, Business, Enterprise)
- Plan-based feature flags cached in Redis (no DB hit per request)
- Stripe Checkout for new subscriptions
- Stripe Customer Portal for plan changes, payment method updates, and cancellation
- Monthly and annual billing with annual discount
- Webhook handlers with signature verification: `invoice.paid`, `invoice.payment_failed`, `subscription.updated`, `subscription.deleted`
- 3-day grace period on payment failure before access restriction
- Billing confirmation email on successful payment
- Usage quota warning email at 80% of monthly limit
- Billing UI embedded in Settings (Stripe Customer Portal)
- GDPR compliance:
  - `DELETE /api/v1/account` — right to deletion (hard delete, 30-day purge)
  - `GET /api/v1/account/export` — personal data export (JSON ZIP)
  - Cookie consent banner
  - Privacy Policy page
  - Terms of Service page
- Full unit test suite (≥80% coverage)
- Full integration test suite (≥70% endpoint coverage)
- AI prompt regression tests: all 8 active prompts against 10 fixed test fixture videos
- E2E tests (Playwright): all critical user journeys
- Load tests (k6): 100 concurrent baseline, 500 concurrent stress, 1,000 queued job test

### Security

- HTTPS enforced everywhere; HTTP → HTTPS redirect at Traefik
- Helmet.js security headers: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy
- CORS locked to allowed origins; no wildcard in production
- CSRF protection on all browser-session state-changing endpoints
- XSS sanitisation on all user-generated content
- SQL injection prevention via Drizzle ORM parameterised queries
- API key storage as `sha256(key)` only — plaintext never stored or logged
- `npm audit` in CI: high/critical CVEs block the build
- Dependabot configured for weekly dependency update PRs
- Docker base image versions pinned

### Fixed

- Beta bug fixes to be documented here as they are discovered and resolved during the beta period

---

## [1.0.0-rc.1] — Planned

> **Target:** Week 18–19 from project initiation
> **Scope:** All bugs from beta resolved. Docs complete. Production-ready.
> **Release candidate — limited external access.**

### Added

- Super Admin Panel: organisation management, user management, billing override, quota override, job log viewer, dead-letter queue management, prompt library editor, system health dashboard
- All technical documentation published: Installation Guide, Deployment Guide, API Reference, Database Schema + ERD, n8n Workflow Diagrams, Configuration Reference, Scaling Guide, Troubleshooting Guide, Security Guide, Prompt Library Reference, Data Retention Reference, GDPR Request Handling Guide

### Fixed

- All bugs identified during beta testing resolved
- All failing CI checks resolved
- All performance regressions from beta load tests addressed

### Infrastructure

- Production deployment on Coolify fully configured
- Production Supabase instance with PgBouncer
- Production Redis with persistence
- Production Cloudflare R2
- Production Prometheus + Grafana + Loki stack
- Production alerting (PagerDuty or email)
- Automated daily database backups with 30-day retention; test restore verified
- Deployment runbook written
- Rollback procedure tested
- Cloudflare CDN, DDoS protection, and WAF rules active

---

## [1.0.0] — Planned

> **Target:** Week 19–20 from project initiation
> **Scope:** Public launch. Production live. All services healthy.

### Added

- **ViralScopes.io is live.** 🚀
- Video discovery, analysis, and viral scoring operational
- Full dashboard available to paying customers
- Stripe billing live (Free, Starter, Professional, Business, Enterprise tiers)
- All alert channels operational: Email, Discord, Slack, Telegram, custom webhook
- Export system live: CSV, Excel, JSON, PDF
- API key authentication available to Professional tier and above
- GDPR compliance active
- Monitoring and alerting live in production

### Infrastructure

- Production deployment live on Coolify
- All 14 n8n workflows running on production schedule
- Production monitoring: all Grafana dashboards receiving live data
- Production alerting: Prometheus alerts configured, PagerDuty/email on-call active

---

## [1.1.0] — Planned (v1.5)

> **Target:** Week 36 from project initiation (approximately Month 8)
> **Scope:** AI Chat Interface, Scheduled Reports, Chrome Extension, Paddle billing, database read replica.

### Added

- **AI Chat Interface** — Floating chat widget on all dashboard pages. Ask natural language questions about your niche: "Why did this video perform well?", "Find fast-growing documentary channels", "Suggest 5 original content ideas". Responses streamed via SSE. Contextual answers include links to video/channel/trend detail pages.
- **Scheduled PDF Reports** — Weekly PDF briefings auto-emailed to configured recipients. Configurable: which metrics, which watchlists, delivery day and time.
- **Chrome Extension** — Analyse any YouTube video from the browser with one click. Shows viral score, hook type, title formula, and key recommendations in a browser panel.
- **Trend Prediction Engine** — Predicts which topics are about to go viral before they peak. Computes momentum score and growth probability for each tracked topic.
- **Paddle Billing** — Paddle as merchant of record for global VAT and tax compliance. Enables sales in EU, UK, Australia, and other VAT-applicable regions without manual tax handling. Multi-currency pricing tables.
- **Paddle webhook handler** with signature verification

### Infrastructure

- PostgreSQL read replica provisioned; analytics queries routed to replica
- ClickHouse deployed for high-cardinality analytics queries

### Performance

- Analytics query p95 reduced by targeting replica instead of primary

---

## [2.0.0] — Planned (v2.0)

> **Target:** Week 72 from project initiation (approximately Month 18)
> **Scope:** Multi-platform expansion, mobile app, public API, team collaboration, affiliate system.

### Added

- **TikTok Analytics Connector** — Discover, analyse, and score TikTok videos. Platform-agnostic architecture extended to support TikTok's content patterns.
- **Instagram Analytics Connector** — Discover and analyse Instagram Reels. Viral scoring adapted for short-form vertical content.
- **Mobile Application** — React Native app for iOS and Android. Receive alerts, view trending content, check viral scores, and review recommendations on mobile.
- **Public REST API** — ViralScopes data accessible via authenticated REST API with API key. Full OpenAPI documentation. Rate limits per subscription plan.
- **JavaScript SDK** — Official JavaScript/TypeScript client SDK for the ViralScopes Public API.
- **Python SDK** — Official Python client SDK for the ViralScopes Public API.
- **Team Collaboration** — Comment threads on video analyses, task assignments, @mentions, shared annotations. Collaboration features visible across workspace members.
- **Crypto Billing** — Invoice-based billing in USDC and USDT. FX rate locked at invoice creation (30-minute window). Blockchain confirmation via webhook.
- **Affiliate & Referral System** — Referral link generation and tracking, click and conversion attribution, percentage-based commission engine (recurring), affiliate dashboard (earnings, clicks, conversions), payout management (bank transfer and PayPal), coupon and promo code system, basic fraud detection (velocity checks).
- **White-Label Deployment** — Agencies can deploy a branded version of ViralScopes (custom domain, logo, colour scheme) for their clients.
- **Multi-Language Content Support** — Platform can discover, analyse, and surface Spanish, Portuguese, German, French, and Hindi content in addition to English.

### Changed

- Platform architecture updated to support multiple content platforms with a shared analysis pipeline
- Viral Score algorithm updated to handle short-form content (TikTok Reels, Instagram Reels)

### Infrastructure

- Typesense deployed as dedicated search engine; PostgreSQL full-text search retired
- Kubernetes cluster provisioned for all services (horizontal auto-scaling)
- Redis Cluster (3 nodes) replacing single Redis instance
- n8n worker pool scaled to 5–20 instances

---

## [3.0.0] — Planned (v3.0)

> **Target:** Month 24–30 from project initiation
> **Scope:** Enterprise features, plugin marketplace, additional platform connectors.

### Added

- **Plugin Marketplace** — Third-party developers can build and publish integrations for ViralScopes. Revenue sharing model for paid plugins.
- **Custom AI Models** — Per-niche fine-tuned viral scoring models. Customers in specific verticals (fitness, finance, tech) get models trained on niche-specific data.
- **Facebook Analytics Connector** — Facebook Page video analysis and performance scoring.
- **X (Twitter) Analytics Connector** — X video and thread performance analysis.
- **LinkedIn Analytics Connector** — LinkedIn video content analysis.
- **Podcast Analytics Connector** — Podcast episode performance analysis via RSS feed data.
- **Enterprise SSO** — SAML 2.0 and OIDC integration for Enterprise customers. Supports Okta, Azure AD, Google Workspace, and custom identity providers.
- **Advanced Fraud Detection** — ML-based fraud detection for affiliate payouts and billing: velocity analysis, device fingerprinting, network graph analysis.
- **Dynamic Pricing Intelligence (Rule-Based)** — Configure pricing rules based on geo, usage pattern, and customer cohort. Foundation for ML-based pricing in v4.
- **Full Multi-Tier Affiliate System** — Multi-level commission tiers, regional commission rules, AI-generated optimisation suggestions, crypto payout support.

### Security

- SOC 2 Type II audit completed
- ISO 27001 certification achieved
- Customer-managed encryption keys (CMEK) for Enterprise tier

### Infrastructure

- Apache Kafka replacing BullMQ for event streaming at scale
- OpenTelemetry distributed tracing deployed (Jaeger or Grafana Tempo)
- Elasticsearch or Typesense Cluster for real-time search at scale
- SOC 2 compliance infrastructure fully operational

---

## [4.0.0] — Planned (v4.0+)

> **Target:** Post Month 30 — requires 2+ years of real transaction and behavioural data
> **Scope:** Advanced AI financial systems. These must not be built before the data exists.

> ⚠️ **Data prerequisite:** These systems require a minimum of 2 years of real payment, churn, and behavioural data to produce useful decisions. Building them without that data results in systems that make uninformed choices. This section is documented for planning purposes only.

### Added

- **Autonomous Financial AI** — AI-powered pricing and payment routing autopilot. Analyses transaction history, churn patterns, and market signals to recommend and execute pricing changes within defined guardrails.
- **Self-Evolving Monetisation OS** — Continuously proposes, simulates, and (with human approval) executes business model changes. A/B tests pricing tiers, discount structures, and upsell flows.
- **Global Payment Routing AI** — ML-powered payment provider selection per transaction. Routes to the provider with the highest predicted success rate based on card type, geography, and transaction history.
- **Multi-Touch Attribution Engine** — Full affiliate and referral attribution across complex customer journeys. Distributes commission credit across multiple touchpoints.
- **Reinforcement Learning Pricing** — Adaptive pricing models that improve continuously based on conversion and retention outcomes.

### Infrastructure

- Multi-region deployment: EU (Frankfurt) + US-East (N. Virginia) + APAC (Singapore)
- Global load balancing with automatic region failover
- Active-active database replication across regions
- Data residency controls enforced per organisation

---

## Version History Summary

| Version | Status | Target / Released | Key deliverable |
|---|---|---|---|
| Pre-development | ✅ Complete | 2026-07-20 | All 8 core project documents |
| `1.0.0-alpha.1` | ⏳ Planned | Week 6 | Foundation, infra, DB, auth |
| `1.0.0-alpha.2` | ⏳ Planned | Week 13 | API, n8n workflows, prompts, dashboard |
| `1.0.0-beta.1` | ⏳ Planned | Week 16 | Billing, security, GDPR, full test suite |
| `1.0.0-rc.1` | ⏳ Planned | Week 18–19 | Bug fixes, admin panel, all docs |
| `1.0.0` | ⏳ Planned | Week 19–20 | Public launch 🚀 |
| `1.1.0` | ⏳ Planned | Week 36 (Month 8) | AI Chat, Reports, Chrome Extension, Paddle |
| `2.0.0` | ⏳ Planned | Week 72 (Month 18) | TikTok, Instagram, Mobile App, Public API |
| `3.0.0` | ⏳ Planned | Month 24–30 | Plugin marketplace, Enterprise SSO, SOC 2 |
| `4.0.0` | ⏳ Planned | Month 30+ | Autonomous Financial AI (data-gated) |

---

## How to Update This File

This changelog is updated by the engineer who merges a pull request to `main`. The update is part of the **Definition of Done** for any user-facing change.

### Update Rules

1. **Every PR merged to `main` that changes user-facing behaviour must update this file.**
2. Changes go into the `[Unreleased]` section under the appropriate category.
3. On each production release, the `[Unreleased]` section is moved to a new versioned entry with the release date.
4. The version number follows Semantic Versioning — see the [Versioning Policy](#versioning-policy) above.
5. Never edit a past release entry except to correct a factual error.
6. Entries should be written for the user, not the developer: "Added viral score breakdown on Video Detail page" not "Added `GET /api/v1/videos/:id/viral-score` endpoint".

### Release Process

```bash
# 1. Rename [Unreleased] to the new version with today's date
## [Unreleased]  →  ## [1.2.0] — 2026-09-15

# 2. Add a new empty [Unreleased] section at the top
## [Unreleased]
(empty — ready for next cycle)

# 3. Update version in package.json files
npm version minor  # or patch / major

# 4. Commit
git commit -m "chore(release): v1.2.0"

# 5. Tag
git tag v1.2.0
git push origin main --tags
```

---

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html

---

**Related Documents:**
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current progress and next priorities
- [ROADMAP.md](./ROADMAP.md) — Development phases and milestone calendar
- [PRD.md](./PRD.md) — Product requirements and success metrics
- [README.md](./README.md) — Project overview and quick start
