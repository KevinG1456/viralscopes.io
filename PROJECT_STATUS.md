# PROJECT_STATUS.md
# ViralScopes.io — Project Status

> **Version:** 1.0
> **Last Updated:** 2026-08-04 (Phase 10 Security & Compliance — Milestone 5 of 6 complete: Compliance & Privacy — GDPR account export/deletion endpoints, a 30-day account purge job, a cookie consent banner, and draft Privacy Policy/Terms of Service pages, all live-verified; found and honestly disclosed a real gap — no "right to rectification" endpoint exists despite the security docs previously claiming it did — see §2)
> **Status:** Phase 9 — Subscription & Billing, complete. Phase 10 — Security & Compliance, Milestone 5/6 (Compliance & Privacy) complete; see §2
> **Maintained by:** Engineering Lead
> **Update cadence:** Weekly (every Monday) + on every phase completion
> **Cross-references:** [ROADMAP.md](./ROADMAP.md) · [PRD.md](./PRD.md) · [CHANGELOG.md](./CHANGELOG.md)

---

> ⚠️ **This document is the single source of truth for project progress.**
> It must be updated every Monday and after every phase completion, decision, or blocker change.
> Stale status information is worse than no status information.

---

## Table of Contents

1. [At a Glance](#1-at-a-glance)
2. [Current Phase](#2-current-phase)
3. [Overall Completion](#3-overall-completion)
4. [Phase Progress](#4-phase-progress)
5. [Completed Tasks](#5-completed-tasks)
6. [In-Progress Tasks](#6-in-progress-tasks)
7. [Pending Tasks](#7-pending-tasks)
8. [Blockers](#8-blockers)
9. [Risks — Active](#9-risks--active)
10. [Upcoming Milestones](#10-upcoming-milestones)
11. [Decisions Made](#11-decisions-made)
12. [Technical Debt Log](#12-technical-debt-log)
13. [Known Issues](#13-known-issues)
14. [Next Priorities](#14-next-priorities)

---

## 1. At a Glance

| Property | Value |
|---|---|
| **Current phase** | Phase 9 (Subscription & Billing) complete. Phase 10 — Security & Compliance (Milestone 5/6 "Compliance & Privacy" complete: GDPR export/deletion, 30-day purge job, cookie consent, draft Privacy Policy/ToS — see §2) |
| **Overall MVP completion** | ~40% |
| **Infrastructure stage** | Stage 0 (not yet provisioned) |
| **Active engineers** | TBD |
| **Target MVP launch** | Week 19–20 from project initiation |
| **Critical path item** | RISK-01 and RISK-02 (YouTube quota strategy, AI cost model) both remain unresolved past their targets, and no AI provider credentials exist anywhere in this environment (TD-023) — blocks TD-020 (14 real Phase 6 workflows), full AI-call verification of Phase 7's test harness, and TD-011 (org management) blocks Phase 8's onboarding flow |
| **Active blockers** | None |
| **Open risks** | 2 (YouTube API quota strategy — unresolved past its Week 6 target; AI cost model — unresolved past its Week 9 target) |
| **Last status update** | 2026-08-04 |
| **Next milestone** | Phase 9 (Billing) is complete (6/6 milestones). Phase 10 (Security & Compliance) and Phase 11 (Super Admin Panel) are next — see §2 |

---

## 2. Current Phase

### Complete: Pre-Development — Documentation Complete

All 8 core project documents have been authored and are ready for engineering handoff:

| Document | Status | Notes |
|---|---|---|
| `PROJECT_RULES.md` | ✅ Complete | Engineering standards, git workflow, Definition of Done |
| `PRD.md` | ✅ Complete | User personas, stories, functional and non-functional requirements |
| `ROADMAP.md` | ✅ Complete | 14 MVP phases with task checklists, dependency graph, milestone calendar |
| `REPOSITORY_STRUCTURE.md` | ✅ Complete | Full annotated monorepo hierarchy |
| `INFRASTRUCTURE_GROWTH_PLAN.md` | ✅ Complete | 4-stage infrastructure evolution plan |
| `README.md` | ✅ Complete | Installation, development, deployment, FAQ |
| `PROJECT_STATUS.md` | ✅ Complete | This document |
| `CHANGELOG.md` | ✅ Complete | Initialised in Keep a Changelog format |

### Complete: Phase 1 — Foundation & Project Setup (14/14 tasks)

**Key deliverables:**
- ✅ Monorepo initialised with all packages (`apps/web`, `apps/api`, `packages/shared`, `packages/db`)
- ✅ TypeScript, ESLint, Prettier, Husky configured across all packages
- ✅ Design system: colour palette, typography, dark/light mode tokens
- ✅ `.env.example` populated with all required variables
- ✅ Git repository with branch protection rules configured — ruleset config in place; enforcement is a GitHub Pro plan limitation on this private repo, accepted per BLK-001

### Complete: Phase 2 — Infrastructure & DevOps (6/6 milestones)

**Key deliverables:**
- ✅ Milestone 1 — Docker: multi-stage Dockerfiles, `docker-compose.dev.yml`/`.prod.yml`, `/health`+`/ready` on both apps, Prometheus/Grafana/Loki (dev, optional)
- ✅ Milestone 2 — GitHub Actions CI: lint/type-check/build/format/secretlint, verified on real push/PR/branch runs
- ✅ Milestone 3 — Security: production-aware `npm audit` policy, CodeQL, Dependency Review (both required the repo to go public — GitHub Advanced Security isn't available for private repos on this plan)
- ✅ Milestone 4 — Environment & Secrets: Zod-validated startup config, reorganised `.env.example`, `.env.example` now actually scanned by secretlint
- ✅ Milestone 5 — Monitoring & Health Checks: structured Pino logging with verified PII/secret redaction, full re-verification of Docker/Compose health
- ✅ Milestone 6 — Deployment & Release Readiness: verified a genuinely fresh clone builds cleanly end-to-end; `.gitattributes` added to fix a recurring Windows line-ending false-positive; broken-reference audit; TD-006/TD-007 logged for intentionally deferred work

**Deferred (not silently dropped — see TD-006, TD-007):** live Traefik/SSL, Coolify staging/production deploy, Alertmanager/PagerDuty, Grafana dashboards against real metrics, 5 missing ADR documents.

### Phase 2 Retrospective

**What was accomplished:** A working, verified local development environment (Docker Compose infra + native app dev), a CI/CD foundation that actually enforces quality (not just documents it), a security posture built from real, tested constraints rather than the literally-documented-but-untested naive policy, and an environment/logging strategy that's honest about what the API does and doesn't do yet.

**Lessons learned:**
- Documented specs (`Deployment_Guide.md`, `Security_Architecture.md`, `Monitoring_and_Operations.md`) were written aspirationally and drifted from reality in several concrete, verifiable ways — a stale Loki config schema (Milestone 1), a naive `npm audit` gate that fails on unactionable findings (Milestone 3), and branch-protection assumptions that turned out to be plan-gated (Phase 1, then again in Milestone 3 as the repo went public). Every one of these was only caught by actually running the thing, not by reading the docs and trusting them.
- GitHub Advanced Security (secret scanning, CodeQL, Dependency Review, enforced rulesets) is unavailable for private repos on this account's plan — confirmed repeatedly, not assumed once and generalised. The repo going public was a real, consequential decision made explicitly by the repo owner, not a side effect.
- A solo maintainer conflicts with `required_approving_review_count: 1` in a way GitHub doesn't warn about upfront (self-approval is silently rejected) — resolved via a repo-admin bypass that, in retrospect, was already configured and just needed the REST merge endpoint instead of `gh pr merge --admin`'s GraphQL path.
- Windows `core.autocrlf` silently corrupts local Prettier verification on every fresh checkout until `.gitattributes` forces LF — a low-severity but recurring source of false-positive noise across three milestones before being fixed at the root cause in Milestone 6.

**Architecture decisions made this phase:** DEC-007 (secretlint), DEC-008 (repo made public), DEC-009 (custom production-aware audit script over a third-party tool), DEC-010 (Zod env validation), DEC-011 (structured Pino logging with redaction) — see §11 for full detail on each.

**What Phase 3 builds on:** `packages/db` is still an empty stub — Phase 3 initialises the actual Supabase project, Drizzle schema, migrations, and RLS policies. The `apps/api` config schema (DEC-010) and `/ready` endpoint are already structured to accept a real database check the moment a client exists — no rework needed, just an addition to `envSchema` and `checkDatabase()`. Docker Compose deliberately has no Postgres service (Phase 3 owns that via the Supabase CLI, not `docker-compose.dev.yml`).

### Complete: Phase 3 — Database & Core Schema (schema/migrations/seeds layer)

**Scope note:** per explicit direction, this phase covered schema and data layer only — no business logic, API endpoints, or authentication. Operational automation that ROADMAP.md's Phase 3 checklist also lists (nightly retention purge jobs, monthly partition rotation, a dead-letter admin endpoint, a Grafana dead-letter panel) is business logic / API surface by nature and is deferred — logged as TD-008 and TD-009, not silently dropped.

**Key deliverables:**
- ✅ All 26 tables from `Database_Schema.md` implemented as Drizzle schema (`packages/db/src/schema/`), recovered and verified against the pre-reset implementation (commit `b747f97` and its two fix-up commits) plus a fresh diff against the current doc
- ✅ 4 hand-written, reversible SQL migrations (`0001_initial_schema`, `0002_updated_at_triggers`, `0003_rls_policies`, `0004_partitioning`), applied by a custom runner (`packages/db/src/migrate.ts`) — drizzle-kit's own migration journal has no `down` command, which doesn't meet the "every migration must be reversible" rule in `Database_Schema.md` §14
- ✅ RLS active on all 14 tenant/user-scoped tables, verified functionally (not just "enabled") — see DEC-014
- ✅ `usage_events` and `job_logs` partitioned by month from creation, with initial `2026_07`/`2026_08` partitions
- ✅ Deterministic, idempotent dev seed data (2 users, 1 org, 2 memberships, 1 workspace) — verified via two consecutive `db:seed` runs producing identical row counts
- ✅ Local Postgres via a plain `postgres:17-alpine` container in `docker-compose.dev.yml` (see DEC-012), superseding the Milestone-1 comment that assumed the Supabase CLI
- ✅ Corrected `Database_Schema.md` §12 (RLS pattern) and §14 (migration tooling), which had drifted from what the rest of the document (and Security_Architecture.md, PRD.md FR-43) actually specifies
- ✅ Full clean-slate verification cycle: `db:reset` → `db:migrate up` → `db:setup-roles` → `db:seed` → re-seed (idempotency) → `db:migrate down 4` (clean teardown, verified via `\dt`) → `db:migrate up` again (reproducibility)

**What was found, not assumed:** `Database_Schema.md`'s RLS section documented Supabase Auth's `auth.uid()` pattern, which cannot work in this project — it defines its own `users`/`sessions` tables with bcrypt password hashes (Security_Architecture.md §5, PRD.md FR-43), not Supabase Auth. Separately, an initial RLS functional test returned all tenants' rows instead of isolating them — root-caused to Postgres superusers/table owners unconditionally bypassing RLS, which is how migrations necessarily run. Fixed by adding a dedicated, unprivileged `app_user` role (DEC-014) that the application will actually query with from Phase 5 onward.

### In Progress: Phase 4 — Authentication & Authorisation (9/31 ROADMAP tasks)

**Scope note:** `ROADMAP.md`'s Phase 4 checklist spans five task groups: Authentication, Transactional Email Service, RBAC, Organisation & Workspace Management, and Session Management (31 checkbox items total — corrects this document's earlier placeholder count of 26, logged before the phase started). PR #16 (merged 2026-07-27) completed the **Authentication** group in full and the **Session Management** group's listing/revocation items — 9 tasks — plus found and fixed two pre-merge security issues during review (DEC-015, DEC-016). The remaining three groups (Transactional Email Service, RBAC route/service-layer enforcement, Organisation & Workspace Management) are not started; see TD-010 through TD-013.

**Key deliverables (merged):**
- ✅ JWT access tokens (15-min expiry, HS256, algorithm-pinned on verify) + opaque refresh tokens (HMAC-hashed, rotated on every use, replay/reuse detection kills all sessions for the user)
- ✅ Email + password registration and login (bcrypt cost 12, common-password blocklist, 10–128 char length)
- ✅ Google OAuth and GitHub OAuth (code-complete against `@fastify/oauth2`; not yet exercised against real provider credentials — no OAuth app has been provisioned, same category as TD-006)
- ✅ Password reset (1-hour opaque token) and email verification (24-hour opaque token) flows
- ✅ Progressive account lockout (5/10/15 failed attempts → 15min/1hr/24hr, Redis-backed)
- ✅ Active session listing and remote revocation (single session + "sign out all other devices")
- ✅ Two security issues found and fixed during pre-merge review (see DEC-015, DEC-016, `Security_Architecture.md` §2/§5) and one CodeQL-flagged gap (missing rate limiting on `/logout` and both OAuth callbacks) closed before merge

**Not done — deferred, see TD-010 through TD-013:**
- [ ] Transactional email service (SendGrid/Resend integration, all 7 templates, SPF/DKIM/DMARC, audit logging) — only a dev/test-only logging stub exists, which refuses to run in staging/production
- [ ] RBAC role-based middleware wired onto real routes (`requireRole()` exists but nothing to protect yet — no business routes exist before Phase 5) and service-layer permission checks
- [ ] Organisation & Workspace Management (org CRUD, member invitation, member removal/role change, multi-workspace support, project management, ownership transfer) — JWT org context is currently read-only against Phase 3 seed data
- [ ] Audit log writes for auth events (login/logout/password-reset/etc.) — `audit_logs` table has existed since Phase 3 but nothing writes to it yet

### In Progress: Phase 5 — Core Backend API (36/57 ROADMAP tasks)

**Scope note:** `ROADMAP.md`'s Phase 5 checklist spans API Foundation, Rate Limiting & Quota, YouTube API Quota Manager, and 13 endpoint groups (57 checkbox items total — corrects this document's earlier placeholder count of 58). This pass implemented every endpoint group that does **not** depend on the still-unresolved RISK-01 (YouTube quota strategy), a real job runner (n8n, Phase 6), or unbuilt Phase 9 billing infrastructure (Stripe) — 36 tasks. The remainder is logged as TD-014 through TD-019, not silently dropped.

**Key deliverables (merged):**
- ✅ Standard response envelope extended with pagination `meta`; every list endpoint paginated (page/limit, capped at 100)
- ✅ `withTenant()` (built in Phase 3, unused until now) wired into every org-scoped repository query — RLS is no longer just "enabled," it's actually the enforcement path live traffic goes through
- ✅ Plan-tier-aware business rate limiting (Redis-backed, per-authenticated-user, ceilings from `Pricing_Strategy.md` §2.6/§3: Professional 50/min, Business 200/min, Free/Starter a conservative fallback since neither has documented API access)
- ✅ Plan-tier quota enforcement on watchlists, alert rules, and API-key creation (`PLAN_LIMITS`, sourced from the same pricing doc — FR-37)
- ✅ Read endpoints for Videos, Channels, Trends/Opportunities (global content, no RLS) and Recommendations (org-scoped)
- ✅ Full CRUD for Watchlists and Alert Rules, with creator-or-org-manager (`owner`/`admin`) write authorisation — the "application-layer business logic" migration 0003_rls_policies.sql explicitly deferred to this phase
- ✅ API Keys CRUD (sha256-hashed, plaintext shown once, plan-gated) and Usage (current-period quota vs plan limit)
- ✅ Analytics overview (org KPIs from unambiguously org-scoped data — see TD-019 for what's excluded and why)
- ✅ Admin endpoints (users/organizations/jobs/dead-letter/metrics), gated by a new `requireSuperAdmin` middleware that reads `users.role` live from the DB rather than trusting a JWT claim — this is what actually puts Phase 4's `requireRole()`/RBAC pattern into use for the first time (see TD-012, now resolved for every route this phase built)
- ✅ Two real bugs found and fixed during live verification (not just type-checked): a `z.coerce.boolean()` query-param footgun that silently coerced `?resolved=false` to `true`, and a plan-tier rate-limit fallback bug that gave Free/Starter tiers the generous Enterprise ceiling instead of the conservative one — both confirmed via before/after live requests, not just code review

**Not done — deferred, see TD-014 through TD-019:**
- [ ] YouTube API Quota Manager, `POST /videos/analyze`, `POST /videos/refresh`, `POST /admin/quota/reset` — blocked on RISK-01 (YouTube quota strategy), which was never resolved and remains open past its Week 6 target
- [ ] Unified `GET /search` — cross-entity search with cursor pagination
- [ ] Export endpoints (`POST /exports`, status, signed download) — needs Cloudflare R2/S3 wiring, not yet configured
- [ ] Webhooks — Stripe signature verification (Phase 9 billing doesn't exist yet) and outgoing alert-channel dispatch (needs Phase 6's dispatcher)
- [ ] OpenAPI/Swagger auto-generated spec at `/api/v1/docs` — endpoints documented in README.md §4 instead for now
- [ ] `GET /analytics/viral-scores` and `/analytics/engagement` — would require a defined join between org-scoped data and global video/channel content that isn't specified anywhere in `Database_Schema.md`
- [ ] Per-day API rate limit and 80%-quota warning email (needs TD-010's real email service); Redis-cached feature flags

### In Progress: Phase 6 — n8n Workflow Engine (9/28 ROADMAP tasks)

**Scope note:** `ROADMAP.md`'s Phase 6 checklist spans Setup (6 items), 14 real business Workflows, Scheduler (5 items), and Version Control (3 items) — 28 checkbox items total (corrects this document's earlier placeholder count of 52). This pass built the infrastructure and orchestration foundation — queue plumbing, a base workflow template, one scheduled job, one manually-triggered job, retry/dead-letter handling, and version-controlled workflow export/import — while deferring every one of the 14 real content-pipeline workflows, which need external AI/YouTube API access this environment doesn't have and depend on RISK-01/RISK-02, neither of which was resolved by their "before Phase 6 begins" target despite this document flagging both.

**Key deliverables (merged):**
- ✅ n8n deployed via Docker with persistent storage (`docker-compose.dev.yml`, already existed from Phase 2) — added a real healthcheck, confirmed HTTP Basic Auth genuinely gates n8n's data API (`/rest/*` correctly 401s unauthenticated; the login-page shell itself is reachable by design)
- ✅ `apps/api`'s own BullMQ producer + in-process worker + event-driven bookkeeping (`lib/queue.ts`) satisfies ROADMAP's "Configure Redis queue (BullMQ) integration" — genuinely independent of n8n's own `EXECUTIONS_MODE` setting (see DEC-019)
- ✅ Base workflow template (`infra/n8n-workflows/foundation-demo.json`): webhook-triggered, validates a shared service token, branches on success/simulated-failure, always responds with an explicit `{success, message}` body — the shape every future real workflow should copy
- ✅ Retry strategy implemented exactly per `INFRASTRUCTURE_GROWTH_PLAN.md` §10.5 (immediate / 30s / 5min, then dead-letter) via a custom BullMQ backoff strategy — live-verified end to end, including the full ~5.5-minute real-time cycle to a `dead_letter_jobs` row
- ✅ `requireServiceToken` middleware (timing-safe comparison) authenticates n8n <-> backend calls in both directions; `POST /api/v1/internal/heartbeat` (n8n calling in, confirmed firing autonomously every 5 minutes) and the queue worker's webhook dispatch (backend calling out) both live-verified
- ✅ `POST /api/v1/admin/jobs/:workflow/trigger` (ROADMAP's manual-trigger endpoint, nested under `/admin`) and a genuinely-re-enqueuing `POST /api/v1/admin/dead-letter/:id/retry` (previously bookkeeping-only in Phase 5, now a real replay when the workflow has a registered queue)
- ✅ Workflows exported to `infra/n8n-workflows/` with an embedded `meta.description` field each, diagrams published to `docs/workflows/`, and genuinely-working `npm run workflows:import`/`workflows:export` scripts (previously aspirational placeholders in this README)
- ✅ Three real bugs found and fixed during live verification: `EXECUTIONS_MODE=queue` without a separate `n8n worker` process hangs every execution forever (reverted, DEC-019); n8n blocks `$env` access in node expressions by default (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` needed); BullMQ rejects colons in queue names, breaking `INFRASTRUCTURE_GROWTH_PLAN.md`'s literal `viralscopes:<priority>:<workflow>` convention (adapted to dashes)

**Not done — deferred, see TD-020 through TD-022:**
- [ ] All 14 real business workflows (Video Discovery, Metadata/Transcript/Thumbnail pipelines, AI Analysis, Title Formula Detection, Hook Classification, Engagement Analytics, Viral Score Engine, Trend Detection, Opportunity Engine, Ethical Recommendation Engine, Channel Intelligence, Alert Dispatch) — TD-020, blocked on RISK-01/RISK-02
- [ ] Scheduled jobs for the real pipeline (6h/daily/weekly/monthly cadences) — same blocker; only the foundation demo's manual trigger and the heartbeat's 5-minute cron are real
- [ ] Credentials store populated for external services — nothing to store yet (no YouTube/Anthropic/OpenAI keys provisioned)
- [ ] n8n's own `EXECUTIONS_MODE=queue` + a dedicated `n8n worker` process + Postgres-backed n8n storage — TD-021 (confirmed live: queue mode without a worker hangs forever; n8n itself warns queue mode isn't officially supported against its default SQLite backing)

### Complete: Phase 7 — AI Prompt Library & Versioning (7/7 ROADMAP tasks)

**Scope note:** `ROADMAP.md`'s Phase 7 checklist has 7 items (corrected from an earlier placeholder count of 12 — see DEC-020). Every one is built and live-verified as completely as this environment allows; the sole residual gap is that the actual content of a real AI-provider response cannot be observed anywhere in this environment (TD-023, no `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`) — that is a credentials gap, not an unbuilt task.

**Key deliverables:**
- ✅ Admin-only CRUD over `prompt_library` (built in Phase 3, unused until now): list prompts, list/get a version, create a new version, activate a version (transactionally enforcing one active version per name), diff two versions field-by-field
- ✅ Seeded the 6 prompts that correspond to an actual AI model call (`video_analysis`, `thumbnail_analysis`, `title_formula_detection`, `hook_classification`, `trend_clustering`, `ethical_recommendation`), transcribed from `AI_Strategy.md`/`n8n_Workflow_Diagrams.md` — not the 8 `ROADMAP.md` originally named, two of which turned out not to be AI prompts at all (DEC-020)
- ✅ Redis AI-response cache (`vs:ai:{promptName}:{promptVersion}:{sha256(normalizedInput)}`, 24h TTL, per `PROJECT_RULES.md` §3.5) with real hit/miss counters surfaced in `GET /api/v1/admin/metrics`'s new `aiCache` field — n8n has no native Redis credential in this stack, so two new `requireServiceToken`-gated endpoints (`/api/v1/internal/ai-cache/lookup`, `/store`) stand in for the in-workflow Redis step `n8n_Workflow_Diagrams.md` shows
- ✅ Prompt test harness (`POST /admin/prompts/:name/test`) against 10 committed synthetic fixture videos (`apps/api/test-fixtures/videos/`), dispatched through the same queue→n8n pattern as every Phase 6 workflow (`infra/n8n-workflows/prompt-test.json`) — per `PROJECT_RULES.md` §3.5 ("never call AI APIs synchronously in request handlers"), not a direct HTTP call from Fastify
- ✅ Regression runner (`npm run ai:regression`) against all 5 video-scoped active prompts × the 10 fixtures = 50 combinations, deliberately **not** wired into CI as a merge-blocking gate (TD-023) — `trend_clustering`'s batch-topic input correctly excluded rather than forced through a single-video harness it doesn't fit
- ✅ Live-verified the entire pipeline up to the AI-provider call boundary by running it for real: service-token auth, fixture-driven template rendering, cache-key computation, provider routing by model string, `continueOnFail` error capture, response normalisation, and the retry→dead-letter path all confirmed working — the call itself fails predictably (`n8n webhook responded 502`, then a genuine `dead_letter_jobs` row after the standard retry cycle), which is exactly the expected outcome without credentials, not a bug. Separately verified the cache-hit path returns a pre-stored result immediately with zero jobs enqueued.
- ✅ Corrected `ROADMAP.md`'s Phase 7 task wording from 8 prompts to 6 (DEC-020)

**Not fully verifiable — see TD-023:**
- [ ] The actual content of a real AI-provider response (Anthropic/OpenAI) — no API keys exist anywhere in this environment
- [ ] The regression suite as a CI-blocking gate (`PROJECT_RULES.md` §9.5's letter) — would either fail every PR or spend real, unapproved money once keys exist; built as a standalone script instead
- [ ] A real AI cost estimate (`ai_cost_estimate_gbp_today`) in admin metrics — needs actual call volume/token counts this environment has none of
- [ ] "Cache hit rate displayed in admin dashboard" — Phase 8's AI Prompt Library admin UI (built) does not surface `aiCache` from `/admin/metrics` anywhere; the repo owner's Phase 8 requirements didn't list it explicitly, so it wasn't added without confirming — the backend data itself is live, this is purely a missing display, tracked under TD-024

### Complete: Phase 8 — Frontend Dashboard (repo owner's explicit requirements; 17/45 ROADMAP tasks)

**Scope note:** The repo owner gave a reduced, explicit Phase 8 requirement set (Application Shell, Authentication, Dashboard, CRUD for Watchlists/Alerts/API Keys/Profile/Organisation, Phase 7 AI integration, state management) rather than `ROADMAP.md`'s full 45-task aspirational list. All of the explicit requirements are built and live-verified; 17/45 ROADMAP tasks are checked as a byproduct, with the rest deferred for documented reasons — see TD-024.

**Key deliverables:**
- ✅ Backend CORS (`@fastify/cors`, Security_Architecture.md's already-specified policy, never implemented before Phase 8 needed it) — necessary infrastructure, not new business logic
- ✅ Typed API client with in-memory access token + httpOnly-refresh-cookie session persistence, hand-built design-system primitives on Radix + `cva` (shadcn's own actual model), TanStack Query with a proper query-key factory and cache-strategy tiers, route constants, a client-side auth gate (the real security boundary is still the API — Frontend_Architecture.md section 8) plus a `proxy.ts` UX heuristic (Next.js 16's renamed `middleware.ts`)
- ✅ Login, register, verify-email, reset-password (request + confirm), logout — email/password only (see DEC-024 for why OAuth buttons/callback are deferred)
- ✅ Responsive app shell (Sidebar + mobile drawer + Topbar) and a Home dashboard wired to analytics overview, watchlists, recommendations, and alert events, with an explicit honest empty state for the no-organisation case (TD-011)
- ✅ Full CRUD: Watchlists (optimistic delete), Alert Rules (+ read-only event history), API Keys (one-time plaintext reveal), Profile (session list/revoke), and a deliberately read-only Organisation page (TD-011)
- ✅ AI Prompt Library admin UI (Phase 7 integration): version history/activate, version diff, and a test harness that runs against Phase 7's 10 fixtures and polls job status honestly through TD-023's expected failure path
- ✅ Three real bugs/mismatches found and fixed via live testing, not assumed: Turbopack doesn't resolve `.js`-extension relative imports the way `tsc`'s Bundler mode tolerates; the password-reset email hardcodes `/reset-password/confirm`, not the flat path first built; `analytics/overview`'s `alertEvents.last30Days` is a per-status breakdown object, not a flat number

**Not built — deferred, see TD-024:**
- [ ] Onboarding flow — no self-service org-creation endpoint exists (TD-011); every one of its 4 steps depends on step 1
- [ ] Trending/Videos/Video Detail/Channels/Trends/Opportunities pages, Search, Export, charts — backing tables are empty (TD-020) or the endpoint doesn't exist (TD-015/016)
- [ ] Billing/Team/Notifications settings — need Phase 9 (Stripe) and TD-011
- [ ] Full Admin panel (job logs, dead-letter queue, quota, system health) — only the explicitly-requested Prompt Library page was built
- [ ] OAuth login buttons/callback handler, `next-intl` i18n, Changelog page — not requested; OAuth additionally can't be live-verified (no provider credentials, same gap as Phase 4)

### Complete: Phase 9 — Subscription & Billing (6/6 milestones; 11/19 ROADMAP tasks)

**Scope note:** implemented as 6 milestones per the repo owner's explicit instruction, each stopped for review before continuing. A full architecture pass (`docs/architecture/billing/`, 14 documents) and an independent review pass (`docs/reviews/billing/`, 8 documents) preceded any code — the review cross-checked every architectural claim against the real codebase and found several that didn't hold (RLS written against Supabase's `auth.uid()` instead of this project's `current_setting()` pattern, a JWT `role` claim that doesn't exist, a proposed `packages/shared/plans.ts` that duplicated rather than reused `apps/api/src/lib/plan-limits.ts`, four overlapping webhook idempotency mechanisms). Six required decisions were resolved before implementation began (see DEC-026/027 below); all fourteen architecture documents were corrected to match.

**Milestone 1 — Billing Foundation (complete, live-verified):**
- ✅ `apps/api/src/lib/plan-limits.ts` promoted to `packages/shared/src/plans.ts` (extended, not duplicated — same field names, same `number | null` sentinel); all 5 existing call sites (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`, `usage.service.ts`, `business-rate-limit.ts`) updated to import from `@viralscopes/shared`
- ✅ `packages/shared` given a real build path (`tsconfig.build.json`, `dist/` output) — the same fix BLK-004 gave `packages/db`, needed because `apps/api`'s production image now depends on it too (DEC-026)
- ✅ Two new migrations: `0010_billing_cycle_and_checkout_session` (adds `subscriptions.billing_cycle`/`checkout_session_id` + a partial unique index enforcing one non-canceled subscription per org) and `0011_billing_events` (new webhook-idempotency table, no RLS — same "identity looked up before tenant context exists" justification as migrations 0006/0007, not compared to an unrelated table)
- ✅ `billing.repository.ts` (subscriptions/invoices/billing_events queries) and `billing.service.ts` (plan summary + provider-agnostic checkout/portal method signatures, real logic deferred to Milestone 2 per the "no payment processing yet" scope boundary)
- ✅ Provider abstraction (`billing-provider.ts`): a `BillingProvider` interface plus a `StripeBillingProvider` implementation — business logic never imports the `stripe` SDK directly (PROJECT_RULES.md P10)
- ✅ `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/6 Price ID env vars added to `config.ts` (all optional, same pattern as unset OAuth credentials — billing routes will return `503`, not crash at boot), `.env.example`, and `README.md`
- ✅ Found and fixed a real bug before it could reach a real migration run: the original design called for `CREATE UNIQUE INDEX CONCURRENTLY`, which Postgres refuses inside a transaction block — and this project's migration runner (`packages/db/src/migrate.ts`) wraps every migration in one. Switched to a plain `CREATE UNIQUE INDEX` (a non-issue at this table's current size — zero production traffic exists yet, per TD-008)
- ✅ Full verification: migrations applied, rolled back 2, and re-applied cleanly against the real dev Postgres; `type-check`/`lint`/`build` green across all 4 packages; the `apps/api` production Docker image was rebuilt (now including `packages/shared/dist`, mirroring BLK-004's fix for `packages/db`) and booted against the real dev Postgres/Redis containers — `/health` and `/ready` both returned healthy from inside the container, not just a successful `docker build`

**Milestone 2 — Checkout & Subscription APIs (complete, live-verified):**
- ✅ `POST /api/v1/billing/checkout`, `POST /api/v1/billing/portal` (Owner only), `GET /api/v1/billing/subscription` (Owner+Admin view), `GET /api/v1/billing/plan` (any authenticated org member) — registered in `server.ts` under `/api/v1/billing`
- ✅ `createCheckoutSession()`/`createPortalSession()` implemented in `billing.service.ts`: validates the requested plan is a real self-serve tier, re-validates the organisation against the database (not just the JWT), rejects checkout into a plan that isn't an upgrade from an existing real paid subscription, resolves the Stripe Price ID from configuration, and reuses an existing Stripe Customer ID when one exists rather than creating a duplicate
- ✅ `findOrgWithOwnerEmail()` added to `billing.repository.ts` — organisations/users have no RLS (root tables), so this is a plain filtered query, not `withTenant()`
- ✅ First route in this codebase to actually call `requireRole()` (`billing.routes.ts`'s `/subscription`, `/checkout`, `/portal`) — built in Phase 4, exercised in isolation, never wired to a real route until now; this is exactly the "pure org-role allowlist with no ownership component" case TD-012 describes
- ✅ Reused, not duplicated: `GET /api/v1/usage` (Phase 5) continues to serve the usage-summary need as-is; no second usage endpoint was built
- ✅ Full live verification against the real seeded dev org (`admin@viralscopes.dev` = owner, `member@viralscopes.dev` = member, temporarily promoted to `admin` org-role and reverted for the third RBAC case) via the running dev server: `GET /plan` (any role, 200), `GET /subscription` (owner/admin 200, member 403), `POST /checkout`/`POST /portal` (owner reaches full business-logic validation, member/admin correctly blocked at 403 before it), invalid-plan and missing-field requests correctly rejected (422) before touching the database, checkout correctly proceeds through every validation layer up to `502 STRIPE_ERROR` (no Price IDs configured) — confirming the entire pipeline executes in the right order with no live Stripe account required to verify it
- ✅ RLS re-confirmed directly against Postgres: an unauthorized `subscriptions` insert (no tenant context) fails; an authorized one (correct `set_config` context) succeeds; `billing_events` correctly has no RLS (insert succeeds with zero tenant context, by design)
- ✅ Docker: image rebuilt with the new route and booted against real dev Postgres/Redis; `/health`, `/ready`, a real login, and `GET /billing/subscription`/`GET /billing/plan` all verified working from inside the running container
- ✅ Found, understood, and correctly left alone (not a bug): the seeded dev org has `organizations.plan = 'professional'` but no real `subscriptions` row — confirms `createCheckoutSession`'s duplicate-prevention check is correctly keyed off the `subscriptions` table (the actual billing source of truth), not `organizations.plan` (a fast-path cache that can be set independent of a real subscription, e.g. by seed data or a future admin override)

**Milestone 3 — Webhooks (complete, live-verified):**
- ✅ `POST /api/v1/webhooks/stripe` (`webhook.routes.ts`) — unauthenticated by design (verified by Stripe-Signature HMAC, not a JWT/CSRF token), scoped raw-`Buffer` content-type parser (Fastify plugin encapsulation, so every other route keeps normal JSON parsing), no business rate limit (Stripe is the only expected caller; rate-limiting a webhook risks dropping a legitimate delivery)
- ✅ `WebhookService` (`webhook.service.ts`) handles exactly the 6 Stripe events the approved architecture defines: `checkout.session.completed`, `customer.created`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`. Trial lifecycle events (started/ending/ended) were **not** implemented — `Pricing_Strategy.md` §5.3 and `07-subscription-lifecycle.md` both state there is no trial in MVP, and "only implement events that exist in the approved architecture" governs here same as everywhere else
- ✅ Idempotency via the Milestone-1 `billing_events` table: every event's `provider_event_id` is checked before dispatch; a duplicate delivery (same event ID resent) is detected and skipped before any handler runs — live-verified (second delivery produced zero new rows anywhere, first delivery's effects unchanged)
- ✅ Database synchronization never trusts client-side state: `checkout.session.completed` creates the `subscriptions` row and syncs `organizations.plan`; `invoice.paid` renews the current period and clears any active grace period; `invoice.payment_failed` starts a 3-day grace period (only on the *first* failure — Stripe's own Smart Retries can re-fire the event, live-verified this doesn't reset the grace period a second time); `customer.subscription.updated` syncs plan/status/period/cancel-flag; `customer.subscription.deleted` cancels the subscription, resets the org to `free`, and now also stamps `canceled_at` (a real gap found during live verification — the column existed in the schema but no code path ever set it; fixed by adding `canceledAt` to `UpsertSubscriptionInput` and threading it through all 5 call sites)
- ✅ `auditLog()` (`lib/audit-log.ts`) is genuinely new — the first thing to write to `audit_logs` in this codebase — invoked from every handler that changes billing state (`billing.subscription.created`, `billing.invoice.paid`, `billing.subscription.grace_period_started`, `billing.subscription.updated`/`.downgraded`, `billing.subscription.canceled`); metadata carries the Stripe event ID and plan/status fields only, never card or payment-method data
- ✅ Failure handling: signature-invalid or missing-signature requests get `400 INVALID_WEBHOOK_SIGNATURE` (the only case the route itself throws for); every other failure is caught inside `WebhookService`, recorded to `billing_events` with `status='failed'`, pushed to the existing (Phase 6) `dead_letter_jobs` table via `createDeadLetterJob()`, and still answered `200` — Stripe must always receive 200 for a signature-valid event or it retries unnecessarily for up to 72h; unknown/unhandled event types are recorded as `status='skipped'` and also answered 200, never a crash
- ✅ A genuine architecture gap found while implementing, not assumed upfront: Stripe's auto-created Customer object during a subscription-mode Checkout Session carries no metadata (only the Subscription object does, via `subscription_data.metadata`), so `customer.created` cannot resolve `org_id` without a database lookup-before-tenant-context — which would break the RLS approach DEC-027 established for this exact table. Resolved by making `handleCustomerCreated` a deliberate audit-only no-op (`billing_events` row, `orgId=null`, `status='skipped'`), not a silently-dropped case
- ✅ Full live verification using Stripe's own `webhooks.generateTestHeaderString()` (no live Stripe account, no network call) to sign synthetic events against a real running dev server: the full happy-path chain (checkout → customer.created no-op → invoice.paid → plan upgrade via subscription.updated) produced correct `subscriptions`/`invoices`/`organizations.plan`/`audit_logs` state at every step (each independently re-checked against Postgres, including under RLS with tenant context explicitly set — three earlier "missing" rows during verification turned out to be RLS correctly hiding data from an unscoped `psql` session, not application bugs); duplicate delivery of the same event ID confirmed idempotent (1 row, not 2, no reprocessing); invalid signature and missing-signature requests both correctly rejected with 400 and never reached `billing_events`; unknown event type (`charge.refunded`) recorded as skipped, 200 returned; out-of-order delivery (`invoice.paid` arriving before any subscription exists) handled gracefully — org resolved via the invoice's own subscription metadata, invoice row created with `subscription_id=null`, no crash; Docker-verified — image rebuilt, booted against real dev Postgres/Redis on the compose network, webhook endpoint reachable and functional from inside the container
- ✅ Reused, not duplicated: `dead_letter_jobs`/`createDeadLetterJob()` (Phase 6) for processing failures; `billing_events` (Milestone 1) for idempotency; `subscriptions`/`invoices`/`organizations` repositories (Milestone 1/2) for all writes

**Milestone 4 — Frontend Billing (complete, live-verified):**
- ✅ `/settings/billing` (`apps/web/src/app/(dashboard)/settings/billing/page.tsx`), added as a fourth tab in the existing Settings layout — current-subscription summary, usage & limits, plan comparison, and a billing-history placeholder (no invoice-list endpoint exists yet, so this is an honest "not available" state, not a fabricated one)
- ✅ `packages/shared` promoted from an `apps/api`-only dependency to a real shared package: `apps/web` now imports `PLANS`/`PLAN_LIMITS`/`PLAN_HIERARCHY`/`SELF_SERVE_CHECKOUT_PLANS` directly for the plan comparison table's pricing/features, rather than re-typing `Pricing_Strategy.md`'s numbers a second time in the frontend — the promotion Milestone 1 set up specifically for this. `Dockerfile.web`'s build step switched from a plain `npm run build --workspace=apps/web` to `npx turbo run build --filter=@viralscopes/web` so turbo's dependency graph builds `packages/shared/dist` first, mirroring BLK-004's fix for `Dockerfile.api`
- ✅ Checkout/portal are redirect-only, exactly per "no payment logic in the frontend": both call the existing Milestone 2 endpoints, then hand the tab to the returned Stripe-hosted URL. No Stripe.js/Elements, no card fields, no `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` usage anywhere in `apps/web` (documented as not-yet-consumed in README.md rather than silently unused)
- ✅ RBAC mirrors the backend exactly, gating the query itself rather than just the UI: `GET /billing/subscription` is only requested if `orgRole` is owner/admin (member sees an explicit "you don't have access" state instead of a request the backend would 403 anyway); checkout/downgrade actions are owner-only, matching `billing.routes.ts`
- ✅ Usage & Limits reuses Phase 5's existing `GET /usage` endpoint as-is (a new `lib/api/usage.ts` client, no new backend route) alongside `GET /billing/plan`'s limits — distinct from `GET /analytics/overview`'s smaller usage subset already used on `/home`, not a duplicate of it
- ✅ Downgrade correctly routes to the Billing Portal, not a second checkout call: `billing.service.ts`'s `createCheckoutSession` only ever accepts upgrades (confirmed in Milestone 2), so the plan comparison table's downgrade CTA opens the same portal session as "Manage subscription" rather than attempting a checkout the backend would reject
- ✅ Stripe's checkout return flow (`successUrl`/`cancelUrl`, both pointing back at `/settings/billing?checkout=...`) shows a toast and refetches the subscription query — never optimistically assumes the plan changed, since the webhook (Milestone 3) remains the only real source of truth
- ✅ Full live verification against the real running backend (not mocked): `GET /billing/plan`, `GET /billing/subscription`, and `GET /usage` response shapes confirmed to match the frontend's TypeScript types exactly; `POST /billing/checkout` and `POST /billing/portal` confirmed to surface their real error codes (`502 STRIPE_ERROR` — no Price IDs configured; `402 NO_BILLING_ACCOUNT` — no existing subscription) through to the error-toast path; member role confirmed to get `403 INSUFFICIENT_PERMISSIONS` on `/subscription` while still getting `200` on `/plan`, matching the frontend's per-query RBAC gate exactly. `type-check`/`lint`/`build` green across all 4 packages; the `apps/web` Docker image rebuilt (first time it's depended on `packages/shared`) and booted against the real dev Postgres/Redis/`apps/api` compose network — `/`, `/api/health`, and the `proxy.ts` middleware's `/settings/*` redirect-to-`/login` all confirmed working from inside the container
- ✅ Found and fixed a real, unrelated frontend bug during this milestone's own verification pass (not billing-specific): `apps/web/src/app/page.tsx` was still the unmodified Phase 1 scaffold splash screen, never wired to redirect anywhere once real pages existed from Phase 4 onward — visiting `/` showed a static splash instead of routing to `/home`/`/login`. Fixed with an instant client-side redirect mirroring `(dashboard)/layout.tsx`'s own auth-gate pattern, confirmed against both branches via the real `/auth/refresh` endpoint (`401` with no session, `200` with one)

**Milestone 4 — complete manual verification pass (2026-07-31, before Milestone 5 approval):**
- ✅ **Billing page loads:** `proxy.ts` middleware correctly returns `307` to `/login` with no session cookie and `200` for a valid one — confirmed for owner, admin, and member sessions via real cookie jars from real `/auth/login` calls (not assumed)
- ✅ **Current subscription / current plan display:** `GET /billing/subscription` and `GET /billing/plan` response shapes re-confirmed byte-for-byte against the frontend's TypeScript types with a fresh login; the "no real subscription row" synthesized case (`billingProvider: 'manual'`) re-confirmed to map to `SubscriptionSummaryCard`'s "No billing account on file yet" branch, not a crash or blank state
- ✅ **Usage meter reflects backend data / feature limits display correctly:** seeded real `usage_events` rows (850/1000 videos, 20/20 exports, 100/2500 alerts — 3-day-scoped, cleaned up after) and confirmed via the real `GET /usage` + `GET /billing/plan` responses that `UsageMeter`'s 80%/100% thresholds land exactly where expected (warning at 85%, error/"limit reached" at 100%, default at 4%)
- ✅ **Plan comparison renders correctly:** traced `PlanComparisonTable`'s current/upgrade/downgrade/enterprise branches against `PLAN_HIERARCHY` for `currentPlan='professional'` — free/starter correctly resolve to Downgrade, business to Upgrade, enterprise to "Contact sales" regardless of current plan (never self-serve)
- 🟡 **Upgrade button creates a checkout session / Billing portal opens successfully — partially verified:** the full request pipeline was traced to the deepest point this environment allows (no live Stripe account exists, consistent with every prior milestone's disclosed limitation). Checkout confirmed to reach `502 STRIPE_ERROR` (no Price IDs configured) with the exact request body the UI sends. Portal was pushed one level deeper than its default `402` by temporarily inserting a real `provider_customer_id` (reverted after) — confirmed it then reaches `503 STRIPE_ERROR` ("Stripe not configured"), the actual final boundary; a genuinely successful session (a real `checkoutUrl`/`portalUrl` back from Stripe) cannot be produced without live Stripe test credentials, which don't exist in this environment
- ✅ **Loading states:** code-level confirmation that every query branch (`isLoading`/`isError`/success) is intact post-formatting, plus a real-world exercise of the error branch (see below) that would have surfaced any related regression
- ✅ **Error states:** stopped the real `apps/api` dev server mid-session (genuine `ECONNREFUSED`, not simulated) and confirmed by code trace that both failure paths handle it correctly without crashing — the query-level `EmptyState` fallback branches never reference `error.message` (safe for a raw network `TypeError`, not just an `ApiClientError`), and `use-billing-actions.ts`'s mutation catch blocks fall back to a generic message when `err instanceof ApiClientError` is false. API restarted and confirmed healthy afterward
- 🟡 **Responsive layout — partially verified:** confirmed via code review that `PlanComparisonTable` uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` and the page stacks via `flex flex-col`, consistent with every other page's existing responsive pattern; not visually confirmed at real mobile/desktop viewports (no browser tool connected this session)
- ⚪ **Organisation switching — unable to verify, feature does not exist:** grepped the entire frontend for any org-switcher/multi-org UI — none exists, and the JWT itself carries a single `orgId` resolved once at login (no mechanism to hold or switch between multiple memberships; this is TD-011, Organisation & Workspace Management, still unbuilt). The closest real analog — that billing data is correctly scoped to the JWT's `orgId` and isolated by RLS — is solid and covered by the RBAC verification below
- ✅ **RBAC prevents unauthorized access:** re-verified the full 3-role matrix fresh (not reused from Milestone 4's report) by temporarily promoting the seeded member to `admin` (reverted after): owner gets `200`+full UI on everything; admin gets `200` on `/subscription` and `/plan` but `403` on `/checkout` and `/portal` (view-only, no manage UI); member gets `403` on `/subscription`/`/checkout`/`/portal` and `200` on `/plan` only; a request with no token at all gets `401 UNAUTHENTICATED`
- ✅ **Refresh preserves state correctly:** confirmed both branches of the exact mechanism this depends on against the real backend — `POST /auth/refresh` returns `401` with no session cookie and `200` with a fresh access token given one from a real login; this is the identical, already-proven pattern `(dashboard)/layout.tsx` and every other page in this app already rely on (`apiRequest`'s built-in retry-after-refresh-on-401 covers the race where a billing query fires before `AuthProvider`'s refresh resolves), not a new mechanism built for billing
- ✅ `lint`/`type-check`/`build` re-run clean across all 4 packages
- ⚪ **Docker — not re-run, not affected:** no code changed during this verification pass (only runtime API calls and temporary, reverted database rows); Milestone 4's own report already covers a full `apps/web` Docker rebuild+boot against the real compose network
- All temporary test data (usage events, a temporary Stripe-backed subscription row, the admin role promotion) confirmed reverted; the seeded dev org is back to its exact original state (`plan='professional'`, zero `subscriptions`/`billing_events`/`usage_events` rows)

**Milestone 5 — Feature Enforcement (complete, live-verified):**
- ✅ `lib/plan-enforcement.ts`'s `getEnforcedPlanTier()` replaces the JWT `planTier` claim as the source of truth for the three existing Phase 5 plan-limit checks — `watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts` all now resolve the org's enforceable plan with a live database read (per `docs/architecture/billing/02-system-architecture.md`'s "Option A": JWT is a hint, DB/Redis is authoritative) rather than trusting a token that can be up to 15 minutes stale. No new plan logic — same `PLAN_LIMITS` lookups, same error codes, same thresholds; only the *source* of the plan value changed
- ✅ Deliberately a plain DB read, not a Redis-cached lookup (the sketch in `07-subscription-lifecycle.md`): the three real call sites this feeds are low-frequency mutations (creating a watchlist/alert rule/API key), not a hot path, so a cache would trade a negligible performance gain for real invalidation-bug risk. Documented as a deliberate simplification, revisited if/when a real high-frequency quota check (`video_analyzed`, `api_request` — both still blocked on TD-020/TD-025) is ever built
- ✅ Grace-period enforcement is live and independent of the daily job: `getEnforcedPlanTier()` checks `subscriptions.grace_period_ends_at` against `now()` on every call, so an expired grace period is enforced immediately — not only after the daily maintenance job has run
- ✅ `jobs/grace-period-expiry.job.ts` + `lib/billing-maintenance-queue.ts`: a daily (06:00 UTC) BullMQ repeatable job — an in-process task, not an n8n workflow, per the architecture's explicit rejection of an n8n scheduled workflow for this — that downgrades any subscription whose grace period has expired (`status → past_due`, `organizations.plan → free`, audit-logged) and purges `billing_events` rows older than 90 days, exactly matching `07-subscription-lifecycle.md`'s resolved decision (exact SQL/cron pattern/retention window). This job keeps the *persisted* `status`/`plan` columns eventually-consistent for display and billing-history accuracy — it is not the enforcement boundary itself, which `getEnforcedPlanTier()` already covers live
- ✅ Cross-org RLS constraint discovered and resolved while implementing: `subscriptions` has RLS (`org_id = current_setting(...)`), so a single query cannot scan every organization's grace periods at once under the `app_user` role (DEC-014) — resolved by looping per-organization (`organizations` has no RLS) and calling the existing `withTenant()` for each org's own `subscriptions` read, exactly the same tenant-scoped access pattern every authenticated request already uses, not a new RLS-bypass precedent
- ✅ Found and fixed a real bug during direct testing of the new job (not caught by type-check): `purgeOldBillingEvents` used a raw `sql\`...\`` template comparing a timestamp column against a JS `Date`, which the postgres.js driver can't serialize outside of drizzle's own operators — every other timestamp comparison in this codebase uses `lt()`/`gte()`, and this one now does too
- ✅ Frontend: `/settings/api-keys` now reads the real `apiAccess` flag from `GET /billing/plan` (never hard-coded) to hide the "New API key" action for Free/Starter orgs — existing keys stay visible/revocable either way, since the backend only gates creation, not listing. A new `UpgradeRequiredNotice` component (proactive gating, for binary flags the frontend already has) and `PlanLimitErrorMessage` component (reactive, for count-based `403 PLAN_LIMIT_EXCEEDED` responses on watchlist/alert-rule/API-key creation) both link to `/settings/billing` — the distinction is deliberate: a binary flag like `apiAccess` is safe to gate proactively (no duplicated calculation, just reading a boolean the backend already returns), while a *count* limit is handled reactively (attempt the action, let the backend's already-authoritative count decide) specifically to avoid the frontend re-implementing "how many watchlists does this org have" itself
- ✅ Found and correctly did NOT implement (matching this engagement's established practice of not building ahead of real dependencies): `docs/architecture/billing/08-feature-gating.md`'s "Alert channel restriction (Starter+)" — the alert-rule `deliveryChannels` field is `unknown[]`, has no defined shape anywhere in the codebase (not even a Zod enum for the channel type), and the frontend's alert-creation form has no UI to set it at all (confirmed by search — it's always sent as the schema's default `[]`). Building a validation for a data shape that doesn't exist yet would be inventing new plan logic, not reusing it; same reasoning as the deferred `/exports` (TD-016) and `checkQuota`/quota-emission infrastructure (blocked on TD-020/TD-025), neither of which this milestone builds either, since neither has a real endpoint to attach to yet
- ✅ Full live verification against the real running backend, not mocked: created a watchlist at the Free-tier limit (1), confirmed the 2nd was rejected (`403`), then — using the *same, still-Free-JWT* session, no re-login — upgraded the org to Professional directly in the database (simulating a webhook) and confirmed the 2nd watchlist immediately succeeded; then downgraded back to Free and confirmed a 3rd watchlist immediately failed again with the same stale JWT throughout. Repeated the identical immediate-upgrade/downgrade proof for API-key creation (`apiAccess`). Separately verified the live grace-period check overrides an unexpired-looking `subscriptions.status='active'`/`organizations.plan='professional'` row the instant `grace_period_ends_at` is in the past. Verified Enterprise (unlimited watchlists/alert rules, `apiAccess=true`). Directly executed the new daily job against the real database and confirmed it correctly persisted `status='past_due'`/`plan='free'`, wrote the audit log entry, and purged old `billing_events` (after the bug fix above). Re-confirmed RLS in both directions on `subscriptions` unaffected by this milestone's changes. `type-check`/`lint`/`build` green across all 4 packages; both `apps/api`'s Docker image (booted, live-tested the full plan-check pipeline from inside the container, confirmed the maintenance queue starts without error) and no `apps/web` rebuild was needed (only existing pages/components changed, no new dependency). All temporary test data (subscriptions, watchlists, API keys, audit logs) confirmed reverted; the seeded org is back to its exact original state
- No ROADMAP.md checkbox changes this milestone — the work connects *existing* Phase 5 checks to real subscription state rather than completing a distinct, separately-tracked checklist item; task count remains 11/19

**Not done yet — by design, not oversight (see Milestone 6's technical-debt review below for the complete list):** no billing emails, no invoice UI (no backing endpoint), no new quota-tracking infrastructure for `video_analyzed`/`api_request`/`export_created` (still blocked on TD-020/TD-025/TD-016 — none of their endpoints exist yet), no alert-channel restriction (no defined data shape or UI to enforce against yet).

**Milestone 6 — Hardening & Testing (complete, live-verified) — Phase 9 is now complete:**
- 🔴 **Found and fixed a real, exploitable quota-bypass vulnerability** during the security review, not a theoretical one: `handleSubscriptionUpdated` (`webhook.service.ts`) only called `updateOrganizationPlan()` when the *plan text* itself changed (`if (existing && existing.plan !== plan)`). Stripe's `customer.subscription.updated` event can carry a terminal `status` (`canceled`, `unpaid`, `incomplete_expired`, `paused`) without the plan metadata changing — e.g. a subscription canceled via this event rather than `customer.subscription.deleted` would leave `organizations.plan` (and therefore `getEnforcedPlanTier()`'s fallback path, since `findActiveSubscriptionForOrg` excludes non-active statuses entirely) stuck at the old paid tier **indefinitely**, granting continued paid-tier feature access to a canceled account. Fixed by always syncing `organizations.plan` to the subscription's effective state (forcing `'free'` for any terminal status, `past_due` deliberately excluded to preserve the grace-period's "retain current plan features" behavior). Live-verified end to end: reproduced the exact bypass before the fix, then confirmed the fix closes it — through the real webhook, the database, `getEnforcedPlanTier()`, and a real `POST /api-keys` call, including inside the rebuilt Docker image
- 🟠 **Found and fixed a real webhook idempotency/retry-safety bug:** the idempotency check treated ANY existing `billing_events` row (including `status='failed'`) as "already handled," and `recordBillingEvent` was a plain insert. Since the webhook route always answers Stripe `200` regardless of internal outcome (by design, to avoid needless retries), a processing failure recorded as `'failed'` could **never be reprocessed again** — not by Stripe (it got a 200), not by a manual dead-letter replay (the idempotency check would just skip it), not by any future automated retry. Fixed: the idempotency check now only short-circuits on `'processed'`/`'skipped'`, and `recordBillingEvent` is now a real upsert (`onConflictDoUpdate` on `(provider, provider_event_id)`) so a reprocessed event correctly updates its own row instead of crashing on the unique constraint. Live-verified: forced a real mid-handler failure (an invalid `plan` value violating `subscriptions`' own CHECK constraint), confirmed it was correctly recorded as `'failed'` and dead-lettered, then replayed the identical event ID with valid data and confirmed it was correctly reprocessed (not silently skipped) end to end
- ✅ Hardened the Stripe provider client: an explicit 15s timeout (was the SDK's 80s default — far too long to block a synchronous checkout/portal request), and `billing.service.ts`'s `createCheckoutSession`/`createPortalSession` now translate any provider-layer failure into the existing `502 STRIPE_ERROR` shape instead of leaking through as an unlabelled generic `500`
- ✅ Found and fixed a real, codebase-wide (not billing-specific) logging-hygiene gap: `errorHandlerPlugin`'s `setErrorHandler` never logged `AppError` instances, even at 5xx severity — a genuine Stripe outage (or the pre-existing OAuth-profile-fetch failure, `lib/oauth-profile.ts`) would previously have been completely invisible in server logs, visible only in the client's own error response. Now any `AppError` with `statusCode >= 500` is logged server-side, matching the existing unhandled-error branch's behavior
- ✅ Reviewed and consciously accepted (not silently ignored) a narrower race-condition window in `upsertSubscriptionForOrg`'s non-locking SELECT-then-branch pattern: empirically fired two genuinely concurrent webhook deliveries for the same org and observed them serialize safely at the database layer in this test (no corruption, exactly one subscription row, both processed) — but this is a timing-dependent result, not proof the window can never trigger. Assessed the worst case instead of relying on luck: even if both requests raced to INSERT, `uq_subscriptions_org_active` guarantees only one succeeds, and the loser now fails safely into the dead-letter path and — thanks to the idempotency fix above — is genuinely retryable, rather than permanently stuck. Logged as TD-026 rather than either ignored or over-engineered with new locking infrastructure for an unreproduced failure mode
- ✅ Comprehensive re-verification across the full authorization matrix (Free/Professional/Enterprise/expired-via-grace-period/cancelled/grace-period/owner/admin/member), the complete webhook lifecycle (checkout, upgrade, downgrade, cancellation, renewal, failed payment, grace period, duplicate delivery, invalid signature, replay-attempt timestamp rejection, out-of-order delivery, unknown events), and every existing feature gate (watchlists, alert rules, API keys) — see the Milestone 6 verification matrix in the deliverables report for the full Verified/Partially Verified/Unable to Verify breakdown
- ✅ Confirmed via code review, not assumed: `requireRole()` (billing RBAC) checks only `request.user.orgRole`, never any platform-level `super_admin` flag — no privilege-escalation path exists between platform admin status and org-level billing authority (matching DEC-017's established separation)
- ✅ Confirmed no privilege-escalation surface exists at all for org roles: no route or service anywhere touches `organization_members.role` (TD-011, Organisation & Workspace Management, is still entirely unbuilt) — there is no code path that could let a member escalate their own or another user's org role
- ✅ Confirmed production configuration is sound: `docker-compose.prod.yml` sources all Stripe credentials via `env_file: .env.production` (never hardcoded in the compose file, consistent with every other secret), and `.env.example` documents every `STRIPE_*` variable Milestone 1 introduced
- ✅ `type-check`/`lint`/`build` green across all 4 packages; `apps/api`'s Docker image rebuilt and booted against the real compose network, with the full webhook pipeline (including both fixes above) re-verified working from inside the container
- All temporary test data confirmed reverted; the seeded org is back to its exact original state

---

### Phase 9 Completion Summary

**Merged:** PR #21, squash commit `6832590` on `main`, 2026-08-01. `develop` fast-forwarded to match; `feat/VS-phase9-billing` deleted (remote + local); zero open PRs.

**Milestones completed (6/6):**
1. Billing Foundation — domain models, schema/migrations, repositories, provider abstraction, config
2. Checkout & Subscription APIs — `POST /billing/checkout`/`portal`, `GET /billing/subscription`/`plan`
3. Webhooks — `POST /webhooks/stripe`, signature-verified, idempotent, 6 handled events
4. Frontend Billing — `/settings/billing` dashboard, redirect-only checkout/portal
5. Feature Enforcement — live (not JWT-cached) plan resolution wired into existing watchlist/alert-rule/API-key limits, daily grace-period-expiry job
6. Hardening & Testing — full security/reliability review; found and fixed a real quota-bypass vulnerability and a webhook retry-safety bug

**Major deliverables:** `subscriptions`/`invoices`/`billing_events` schema; `BillingProvider`/`StripeBillingProvider` abstraction; 4 checkout/portal/subscription/plan endpoints; the Stripe webhook endpoint; `packages/shared/src/plans.ts` (promoted, shared by both apps); the `/settings/billing` dashboard (plan comparison, usage & limits, subscription summary); `lib/plan-enforcement.ts`'s live plan resolution; the daily billing-maintenance BullMQ job.

**Security improvements:** signature verification + replay protection (Stripe's own tolerance window, independently confirmed) + durable idempotency (survives days-later retries, now correctly retryable after a failure, not just after success); RLS preserved on `subscriptions`/`invoices` throughout (DEC-027 — org_id always resolved from the event payload, never a pre-tenant-context lookup); RBAC on every billing mutation (owner-only) and view (owner+admin); **the quota-bypass fix** (a canceled-via-`.updated` subscription could otherwise retain paid access indefinitely); **the retry-safety fix** (a failed webhook could otherwise never be reprocessed); provider-failure error handling that no longer leaks internals; a codebase-wide logging-hygiene fix (5xx `AppError`s are now actually logged); confirmed no privilege-escalation surface exists for org roles or platform-admin status.

**Technical debt carried forward:** TD-010 (no transactional email — billing confirmation/grace-period/quota-warning emails all unsent), TD-016/TD-020/TD-025 (export/analysis/API-key-auth quota infrastructure has no real endpoint to attach to yet), TD-008 (partially resolved — `billing_events` retention done, other tables' retention/rotation still open), TD-026 (new — a reviewed-and-accepted, non-atomic multi-step webhook write pattern; safe today via idempotency + DB constraints, revisit only if a real production failure mode surfaces).

**Blockers:** None currently active. TD-011 (Organisation & Workspace Management) is not a blocker for anything Phase 9 shipped, but remains the shared prerequisite for team billing/seats, full Organisation settings, and Phase 8's onboarding flow, should any of those be prioritised next.

**Production-readiness assessment:** The billing system is functionally complete and defensively sound against every scenario reproducible in this environment — signature verification, replay protection, idempotency, RBAC, RLS, plan enforcement, and both vulnerabilities found in Milestone 6 were closed and re-verified, including inside a rebuilt Docker image. The one structural gap, disclosed consistently since Milestone 1, is that **no live Stripe account has ever processed a real transaction against this codebase** — every verification used synthetic, locally-signed events. Recommend a staging run with real Stripe test-mode credentials (checkout, a real webhook delivery, a real Customer Portal session) before this is exposed to production traffic.

---

### In Progress: Phase 10 — Security & Compliance (Milestone 5/6)

**Milestone 1 — Security Architecture Review (complete):**
- ✅ A comprehensive review of all 22 requested subsystems (authentication, session management, JWT lifecycle, refresh tokens, RBAC, multi-tenant RLS, billing, subscription enforcement, API keys, n8n workflows, AI Prompt Library, admin APIs, frontend authentication, Redis, queue workers, Docker, secrets, environment variables, logging, audit logs, rate limiting, CSP/CORS/CSRF, OAuth, third-party integrations), each documented against the real, current implementation — not the aspirational spec — with attack surface, trust boundaries, privileged operations, auth/authz model, tenant isolation, sensitive data, existing protections, risks, and recommendations. Full detail in `docs/reviews/security/00-executive-summary.md` through `06-remediation-plan.md`
- ✅ **0 Critical, 0 High, 5 Medium, 2 Low, 3 Informational findings.** No exploitable cross-tenant data access, authentication bypass, or privilege escalation path found anywhere. Every Medium finding is real and narrow (a single RBAC route not matching its documented permission matrix, a missing defense-in-depth header, an availability-not-confidentiality rate-limit gap, no column-level OAuth-token encryption, and a latent RLS gap that would block Milestone 2's own planned work if not fixed first) — already scoped into the approved Milestone 2–4 plan, not requiring a plan change
- ✅ Confirmed (not re-litigated) that Phase 9's own Milestone 6 hardening pass already closed the billing/subscription-enforcement subsystem's real vulnerabilities; this review re-verified rather than duplicated that work
- ✅ Highest-confidence positive findings, each independently re-verified: platform-admin status is never a JWT claim (always a live DB read, DEC-017); `apps/api` holds no database owner/migration-role credential at all; the frontend access token is memory-only with zero `dangerouslySetInnerHTML` usage anywhere; n8n's webhook calls are authenticated in both directions (confirmed by direct inspection of the workflow JSON, not assumed); Pino's log-redaction list is wider than the spec requires
- No code, migrations, or configuration changed during this milestone — review only, per instruction. `Security_Architecture.md`'s three documentation-vs-reality corrections (an unimplemented `viewer` role, an OAuth-token-encryption claim, a password-blocklist claim) are deferred to Milestone 2, landing alongside their corresponding code fixes rather than drifting apart again

**Milestone 2 — Application Security Hardening (complete):** all 5 confirmed Medium findings fixed, each independently verified with real tests (not assumed) — see the 2026-08-01 Status Update History entry below for full detail. F-01 (password blocklist) and F-02 (RBAC doc mismatch) were deliberately **not** in this milestone's approved scope and remain open for a later milestone.

**Milestone 3 — API Security & Abuse Protection (complete):** the one finding originally scoped here (F-10, global pre-auth rate limiting) was moved up into Milestone 2 at the repo owner's request, so this milestone's own work was three fresh audits against the running application rather than closing an already-known list: (1) cross-checked `Security_Architecture.md`'s auth-route rate-limit table against the real routes and corrected three drifted values (F-12, informational); (2) an open-redirect audit that **found and fixed a real Medium-severity vulnerability** — the login page's `from` query parameter was passed unvalidated into `router.push()`, and Next.js's own router source confirms an external URL there triggers a genuine full-page browser redirect, not a safely-ignored internal route miss (F-11); (3) an SSRF audit across every outbound server-side HTTP call in the codebase, concluding — after tracing each one, not assuming — that no SSRF vector exists anywhere today. See the 2026-08-01 Status Update History entry below for full detail.

**Milestone 4 — Infrastructure Security (complete):** F-09 (Docker digest pinning) resolved, plus a broader infrastructure review the repo owner explicitly requested (Dockerfiles, Compose configuration, GitHub Actions, secrets handling, container hardening, production configuration). Found and fixed a real, previously-undetected gap: Traefik's `web` (port 80) entrypoint had no redirect or router attached to it at all — `redirect-to-https`, a middleware written in Phase 2, was never referenced by any router (already flagged as dead code in Milestone 1's review), meaning a plain `http://` request would have hit Traefik's default 404 instead of the documented "all HTTP redirects to HTTPS" behavior. Fixed with an entrypoint-level redirect (covers every current and future service automatically, rather than requiring each router to remember to attach a middleware) and verified live against a real Traefik v3 container. Also added `.github/dependabot.yml` (npm/github-actions/docker ecosystems), SHA-pinned every third-party GitHub Action referenced in both workflows (verified each digest against the real upstream repos via the GitHub API, not guessed), added explicit least-privilege `permissions: contents: read` to both workflows, and added `no-new-privileges` to every service plus `read_only` root filesystems to the two images this project builds itself (`api`/`web`) — both rebuilt and confirmed still booting correctly under the hardened flags against the real dev network. Reviewed the npm audit allowlist and confirmed it's current (not stale) via `check-audit.mjs`, cross-checked against GitHub's live Dependabot Alerts API. See the 2026-08-01 Status Update History entry below for full detail.

**Milestone 5 — Compliance & Privacy (complete):** GDPR "right to access"/"right to deletion" (Security_Architecture.md §19) implemented and live-verified for the first time — `GET /api/v1/account/export` and `DELETE /api/v1/account`, a daily 30-day account-purge job, a cookie consent banner, and draft (visibly not-legally-reviewed) Privacy Policy/Terms of Service pages linked from every auth page. While correcting §19's compliance table to match reality, found and honestly disclosed a real, pre-existing documentation/reality mismatch: the table claimed "right to rectification" was already an "MVP" (built) feature via Settings, but no profile-update endpoint exists anywhere in `apps/api` — corrected the doc rather than silently building the feature (out of this milestone's approved scope) or leaving the false claim in place. See the 2026-08-04 Status Update History entry below for full detail.

**Start condition (for context):** Phase 10 depends on Phase 5 (built). Phase 11 (Super Admin Panel) depends on Phases 5, 6, and 9 — Phase 9 is now complete, so that dependency is satisfied whenever Phase 11 is picked up. Neither is blocked by TD-020/TD-023/TD-011, though TD-011 (Organisation & Workspace Management) remains worth prioritising soon.

---

## 3. Overall Completion

### MVP Progress (Phases 1–14)

```
Pre-Development  ████████████████████  100%  ✅ Complete
Phase 1          ████████████████████  100%  ✅ Complete
Phase 2          ████████████████████  100%  ✅ Complete (see TD-006 for deferred infra items)
Phase 3          ███████████████░░░░░   76%  ✅ Schema/migrations/seeds complete (see TD-008/TD-009 for deferred automation)
Phase 4          █████░░░░░░░░░░░░░░░   29%  🚧 Authentication + Session Management complete (see TD-010–013 for deferred remainder)
Phase 5          █████████████░░░░░░░   63%  🚧 Read/CRUD business endpoints + RBAC live (see TD-014–019 for deferred remainder)
Phase 6          ██████░░░░░░░░░░░░░░   32%  🚧 Queue infra, base template, retry/dead-letter live (see TD-020–022 for deferred remainder)
Phase 7          ████████████████████  100%  ✅ Complete per its own checklist (built as far as possible without AI credentials — TD-023)
Phase 8          ███████░░░░░░░░░░░░░   38%  🚧 Repo owner's explicit requirements complete; ROADMAP's fuller aspirational list deferred (see TD-024)
Phase 9          ████████████████████  100%  ✅ Complete (6/6 milestones; 11/19 ROADMAP tasks — see TD-010/014/016/020/025/026 for deferred remainder)
Phase 10         ████████████████░░░░   83%  🚧 Milestone 5/6 (Compliance & Privacy) complete
Phase 11         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 12         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 13         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 14         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
─────────────────────────────────────────────────────────
Overall MVP      ████████░░░░░░░░░░░░   40%  🚧 In progress
```

### Task Completion Summary

| Category | Total tasks | Complete | In progress | Pending |
|---|---|---|---|---|
| Pre-Development (docs) | 8 | 8 | 0 | 0 |
| Phase 1 — Foundation | 14 | 14 | 0 | 0 |
| Phase 2 — Infrastructure | 28 | 23 | 0 | 5 |
| Phase 3 — Database | 42 | 32 | 0 | 10 |
| Phase 4 — Auth | 31 | 9 | 0 | 22 |
| Phase 5 — Backend API | 57 | 36 | 0 | 21 |
| Phase 6 — n8n Workflows | 28 | 9 | 0 | 19 |
| Phase 7 — Prompt Library | 7 | 7 | 0 | 0 |
| Phase 8 — Frontend | 45 | 17 | 0 | 28 |
| Phase 9 — Billing | 19 | 11 | 0 | 8 |
| Phase 10 — Security | 18 | 9 | 0 | 9 |
| Phase 11 — Admin Panel | 16 | 0 | 0 | 16 |
| Phase 12 — Testing | 24 | 0 | 0 | 24 |
| Phase 13 — Documentation | 12 | 0 | 0 | 12 |
| Phase 14 — Deployment | 14 | 0 | 0 | 14 |
| **Total** | **413** | **175** | **0** | **238** |

---

## 4. Phase Progress

| Phase | Name | Status | Completion | Target week | Notes |
|---|---|---|---|---|---|
| Pre-Dev | Documentation | ✅ Complete | 100% | Week 0 | All 8 documents authored |
| Phase 1 | Foundation & Project Setup | ✅ Complete | 100% | Week 1 | BLK-001/BLK-002 resolved 2026-07-26 |
| Phase 2 | Infrastructure & DevOps | ✅ Complete | 23/28 tasks | Week 1–3 | All 6 milestones done; 5 tasks deferred to Phase 14/ongoing (TD-006), not silently dropped |
| Phase 3 | Database & Core Schema | ✅ Complete (schema layer) | 32/42 tasks | Week 3–4 | Retention/partition automation + dead-letter admin endpoint deferred (TD-008, TD-009) — business logic/API, out of this phase's scope |
| Phase 4 | Authentication & Authorisation | 🚧 In progress | 9/31 tasks (29%) | Week 4–6 | Authentication + Session Management merged (PR #16); Email Service, RBAC route-enforcement, Org/Workspace Management remain (TD-010–013) — does not block Phase 5 |
| Phase 5 | Core Backend API | 🚧 In progress | 36/57 tasks (63%) | Week 6–9 | Read/CRUD business endpoints, RBAC, plan-tier rate limiting live; YouTube Quota Manager/Search/Export/Webhooks/OpenAPI deferred (TD-014–019) |
| Phase 6 | n8n Workflow Engine | 🚧 In progress | 9/28 tasks (32%) | Week 9–12 | Queue infra, base workflow template, retry/dead-letter live; all 14 real workflows deferred (TD-020, blocked on RISK-01/02) |
| Phase 7 | AI Prompt Library | ✅ Complete (own checklist) | 7/7 tasks (100%) | Week 10–12 | Prompt storage/versioning/caching/test-harness/regression-runner all live; only the actual AI-provider response is unverified (TD-023, no credentials in this environment) |
| Phase 8 | Frontend Dashboard | ✅ Complete (repo owner's requirements) | 17/45 ROADMAP tasks (38%) | Week 6–13 | Shell, auth, dashboard, Watchlists/Alerts/API Keys/Profile/Organisation CRUD, Phase 7 AI integration all live and live-verified; onboarding/i18n/Changelog/full page coverage/charts deferred (TD-024) |
| Phase 9 | Subscription & Billing | ✅ Complete | 11/19 tasks (58%), 6/6 milestones | Week 13–15 | Billing Foundation, Checkout & Subscription APIs, Stripe webhook processing, the frontend billing dashboard, live feature enforcement, and a hardening pass (found + fixed a real quota-bypass vulnerability) all live-verified; no billing emails (TD-010) |
| Phase 10 | Security & Compliance | 🚧 In progress | 9/18 tasks, Milestone 5/6 | Week 15–16 | Milestone 1: 22-subsystem architecture review, 0 Critical/High findings. Milestone 2: all 5 confirmed Medium findings fixed and live-verified — audit_logs RLS gap closed, API keys restricted to owner/admin, CSP + full Helmet header set on both apps, global pre-auth rate limit, OAuth token encryption at rest. Milestone 3: found and fixed a real open-redirect vulnerability on the login page (traced through Next.js's own router source, not assumed), corrected a drifted auth rate-limit table, confirmed no SSRF vector exists anywhere in the codebase. Milestone 4: Docker base images pinned to a digest, found and fixed a real gap where HTTP never actually redirected to HTTPS (dead Traefik config since Phase 2), Dependabot enabled, GitHub Actions SHA-pinned, container hardening flags added and live-verified. Milestone 5: GDPR account export/deletion live-verified end-to-end (ownership guard, PII scrub, audit trail, 30-day purge job), cookie consent banner, draft Privacy Policy/Terms of Service — and found/disclosed a real gap: no "right to rectification" endpoint exists despite the docs previously claiming it did |
| Phase 11 | Super Admin Panel | ⏳ Not started | 0% | Week 20–22 | 30 days post-launch |
| Phase 12 | Testing | ⏳ Not started | 0% | Week 3–18 (ongoing) | Runs incrementally |
| Phase 13 | Documentation | ⏳ Not started | 0% | Week 5–18 (ongoing) | Runs incrementally |
| Phase 14 | Production Deployment | ⏳ Not started | 0% | Week 19–20 | Depends on all phases |

---

## 5. Completed Tasks

### Pre-Development ✅

- [x] Author `PROJECT_RULES.md` — Engineering standards, coding conventions, git workflow, AI assistant rules, Definition of Done
- [x] Author `PRD.md` — Product vision, problem statement, 4 user personas, 43 user stories, functional requirements, non-functional requirements, success metrics, risks
- [x] Author `ROADMAP.md` — 14 MVP phases with full task checklists, dependency graph, parallel development map, v1–v4 feature roadmap, milestone calendar
- [x] Author `REPOSITORY_STRUCTURE.md` — Complete annotated monorepo hierarchy, layer responsibilities, dependency boundaries, naming conventions, testing structure
- [x] Author `INFRASTRUCTURE_GROWTH_PLAN.md` — 4-stage infrastructure evolution, database growth strategy, caching, CDN, queue, storage, search, monitoring, logging, CI/CD, security, DR/HA, cost optimisation, multi-region
- [x] Author `README.md` — Project overview, features, full tech stack, architecture diagram, installation guide, dev commands, environment variables, testing guide, deployment pipeline, FAQ
- [x] Author `PROJECT_STATUS.md` — This document
- [x] Author `CHANGELOG.md` — Initialised in Keep a Changelog format

### Phase 1 — Foundation & Project Setup (13/14) ✅

- [x] Initialise monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/db`
- [x] Configure TypeScript strict mode across all packages
- [x] Set up ESLint with import ordering, no-any, no-unused-vars rules
- [x] Configure Prettier with project settings
- [x] Set up Husky pre-commit hooks (lint-staged + secretlint) — verified the hook actually blocks a commit containing a fake secret
- [x] Configure Git repository with branch protection rules for `main` and `develop` — ruleset config created; enforcement pending GitHub Pro (BLK-001, accepted limitation)
- [x] Establish Turborepo build pipeline configuration
- [x] Finalise colour palette (dark mode + light mode tokens)
- [x] Define typography scale
- [x] Build Tailwind CSS design tokens
- [x] Create logo placeholder (SVG), favicon (`icon.svg`), and loading screen
- [x] Design dashboard icon set (home, trends, videos, watchlists, settings)
- [x] Document all environment variables in `.env.example`
- [x] Write initial README.md with setup instructions

### Phase 3 — Database & Core Schema (32/42) ✅

- [x] Set up Drizzle ORM with migration tooling (custom SQL-file runner, not `drizzle-kit generate` — see DEC-013)
- [x] Add migration dry-run check equivalent: `db:migrate:status` lists applied vs pending
- [x] Enable RLS on all tenant/user-scoped tables from creation, verified functionally with a dedicated app role (DEC-014)
- [x] `users`, `oauth_accounts`, `sessions`, `organizations`, `organization_members`, `workspaces`, `projects`, `audit_logs`
- [x] `subscriptions`, `invoices`, `usage_events`, `api_keys`
- [x] `channels`, `videos`, `transcripts`, `thumbnail_analyses`, `title_analyses`, `video_analyses`, `recommendations`, `trends`, `prompt_library`
- [x] `watchlists`, `alert_rules`, `alert_events`
- [x] `job_logs`, `dead_letter_jobs`
- [x] Define indexes on all foreign keys and frequently queried columns
- [x] Implement table partitioning for `usage_events` and `job_logs` (structural `PARTITION BY RANGE` + initial monthly partitions)
- [x] Write seed data scripts for development (idempotent, insert-if-missing)
- [x] Local Postgres via Docker (plain container, not Supabase CLI — DEC-012)

**Not done — deferred, see TD-008/TD-009 (explicitly out of this phase's schema-and-data-layer-only scope):**
- [ ] Initialise hosted Supabase project (no server/account provisioned yet, same category as TD-006)
- [ ] Configure PgBouncer connection pooling (no hosted DB to pool against yet)
- [ ] Automated nightly data-retention purge jobs
- [ ] Automated monthly partition creation/rotation job
- [ ] Dead-letter admin endpoint (API surface — Phase 5)
- [ ] Grafana dead-letter queue depth panel
- [ ] ERD PNG render (`docs/database-erd.mmd` written and verified as valid Mermaid; PNG export via `@mermaid-js/mermaid-cli` failed on a broken local `puppeteer-core`/`ws` module resolution — environment issue, not a content issue)

### Phase 4 — Authentication & Authorisation (9/31) 🚧

- [x] JWT access tokens (15-min expiry, HS256 pinned on both sign and verify) + opaque refresh token rotation in HTTP-only, Secure, SameSite=Strict cookies
- [x] Email + password registration and login (bcrypt cost 12, ~300-entry common-password blocklist, 10–128 char length)
- [x] Google OAuth integration (code-complete; not yet exercised against a real provisioned OAuth app)
- [x] GitHub OAuth integration (code-complete; not yet exercised against a real provisioned OAuth app)
- [x] Password reset flow (opaque token, sha256-hashed, 1-hour expiry)
- [x] Email verification required before login (opaque token, sha256-hashed, 24-hour expiry)
- [x] Account lockout after 5 consecutive failed login attempts (progressive: 15min/1hr/24hr at 5/10/15 failures, Redis-backed)
- [x] Active session listing per user (`GET /api/v1/auth/sessions`)
- [x] Remote session revocation — individual (`DELETE /sessions/:id`) and "sign out all other devices" (`DELETE /sessions`)
- [x] Two pre-merge security fixes found and closed during review: login information oracle (DEC-015) and silent OAuth account-linking to unverified accounts (DEC-016)
- [x] CodeQL-flagged missing rate limiting on `/logout` and both OAuth callback routes, fixed before merge

**Not done — deferred, see TD-010 through TD-013:**
- [ ] Transactional email service (SendGrid/Resend, all 7 templates, SPF/DKIM/DMARC, unsubscribe/preference management, audit logging of sent emails) — TD-010
- [ ] RBAC role-based middleware wired onto real routes and service-layer permission checks (`requireRole()` exists but nothing to protect yet) — TD-012
- [ ] Organisation & Workspace Management: org CRUD, member invitation/removal/role-change, multi-workspace support, project management, ownership transfer — TD-011
- [ ] Audit log writes for auth events (`audit_logs` table has existed since Phase 3, nothing writes to it yet) — TD-013

### Phase 5 — Core Backend API (36/57) 🚧

- [x] Standard response envelope extended with pagination `meta` (page/limit/total/totalPages); shared `paginationQuerySchema`/`paginationMeta()` helpers used by every list endpoint
- [x] `withTenant()` (built in Phase 3, never called until now) wired into every org-scoped repository — RLS is now actually exercised by live traffic, not just policy definitions
- [x] `GET /videos`, `GET /videos/:id` (joined analysis/thumbnail/title/transcript), `GET /channels`, `GET /channels/:id`, `GET /trends`, `GET /trends/opportunities` — global content, no org required
- [x] `GET /recommendations`, `GET /recommendations/:videoId` — org-scoped
- [x] Watchlists full CRUD — plan-tier quota enforced (Free 1 / Starter 5 / Professional 20 / Business+ unlimited, `Pricing_Strategy.md` §2.6), creator-or-org-owner/admin write authorisation
- [x] Alert Rules full CRUD (same plan-tier quota pattern) + `GET /alerts/events` (read-only dispatch history)
- [x] API Keys CRUD — sha256-hashed storage, plaintext key shown once, gated to plans with documented API access (Professional+)
- [x] `GET /usage` — current-period `usage_events` aggregation vs plan's monthly video-analysis quota
- [x] `GET /analytics/overview` — org KPIs built only from unambiguously org-scoped data (watchlists/alerts/api-keys/usage)
- [x] Admin endpoints (`/admin/users`, `/organizations`, `/jobs`, `/dead-letter`, `/dead-letter/:id/retry`, `/metrics`) gated by a new `requireSuperAdmin` middleware — live DB read of `users.role`, not a JWT claim, so a demoted admin loses access immediately rather than at token expiry
- [x] Plan-tier-aware business rate limiting (Redis INCR/EXPIRE per authenticated user per minute; ceilings from `Pricing_Strategy.md` — Professional 50/min, Business 200/min)
- [x] Two real bugs found and fixed during live verification: a `z.coerce.boolean()` query-param bug (`?resolved=false` silently coerced to `true`) affecting the dead-letter and trends filters, and a rate-limit plan-tier fallback bug that gave Free/Starter the Enterprise-tier ceiling instead of the intended conservative one — both confirmed via before/after live HTTP requests

**Not done — deferred, see TD-014 through TD-019:**
- [ ] YouTube API Quota Manager, `POST /videos/analyze`, `POST /videos/refresh`, `POST /admin/quota/reset` — TD-014 (blocked on RISK-01, unresolved)
- [ ] Unified `GET /search` — TD-015
- [ ] Export endpoints (`POST /exports`, status, signed download) — TD-016 (needs R2/S3 wiring)
- [ ] Stripe webhook handler + outgoing alert-channel webhook dispatch — TD-017
- [ ] OpenAPI/Swagger spec at `/api/v1/docs` — TD-018 (endpoints documented in README.md §4 instead)
- [ ] `GET /analytics/viral-scores`, `GET /analytics/engagement` — TD-019 (undefined org↔global-content join)
- [ ] Per-day API rate limit, 80%-quota warning email, Redis-cached feature flags

### Phase 6 — n8n Workflow Engine (9/28) 🚧

- [x] n8n deployed via Docker with persistent named volume (existed since Phase 2; added a real healthcheck this phase)
- [x] Redis queue integration — `apps/api`'s own BullMQ producer + in-process worker (`lib/queue.ts`), independent of n8n's internal `EXECUTIONS_MODE` (DEC-019)
- [x] Base workflow template (`infra/n8n-workflows/foundation-demo.json`): token validation, error capture, explicit success/failure response — the shape every future real workflow copies
- [x] Retry strategy: immediate / 30s / 5min per `INFRASTRUCTURE_GROWTH_PLAN.md` §10.5, via a custom BullMQ backoff strategy — live-verified through a full real-time cycle
- [x] Dead-letter handling: on exhausted retries, writes to `dead_letter_jobs` + a structured admin-notification log line (real notification channel needs TD-010's email service)
- [x] `requireServiceToken` middleware (timing-safe) authenticating n8n <-> backend calls both directions
- [x] `POST /api/v1/internal/heartbeat` — n8n's Heartbeat workflow calls this every 5 minutes (Schedule Trigger, no queue involved); confirmed firing autonomously, not just manually
- [x] `POST /api/v1/admin/jobs/:workflow/trigger` — ROADMAP's manual-trigger endpoint; `POST /api/v1/admin/dead-letter/:id/retry` upgraded from Phase 5's bookkeeping-only stub to a genuine re-enqueue when the workflow has a registered queue
- [x] Workflows version-controlled in `infra/n8n-workflows/` with an embedded `meta.description` field each; diagrams in `docs/workflows/`; genuinely-working `npm run workflows:import`/`workflows:export` (previously aspirational README placeholders)
- [x] Three real bugs found and fixed during live verification: `EXECUTIONS_MODE=queue` without a worker process hangs every execution forever (reverted); n8n blocks `$env` access in expressions by default (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` needed); BullMQ rejects colons in queue names (adapted `INFRASTRUCTURE_GROWTH_PLAN.md`'s naming convention to dashes)

**Not done — deferred, see TD-020 through TD-022:**
- [ ] All 14 real business workflows (Video Discovery, Metadata/Transcript/Thumbnail pipelines, AI Analysis, Title Formula Detection, Hook Classification, Engagement Analytics, Viral Score Engine, Trend Detection, Opportunity Engine, Ethical Recommendation Engine, Channel Intelligence, Alert Dispatch) — TD-020, blocked on RISK-01/RISK-02
- [ ] Real scheduled cadences (every 6h/daily/weekly/monthly) for the above — same blocker
- [ ] Credentials store populated for external services — TD-022, nothing to store yet (no YouTube/Anthropic/OpenAI keys)
- [ ] n8n's own `EXECUTIONS_MODE=queue` + dedicated `n8n worker` + Postgres-backed n8n storage — TD-021

---

### Phase 7 — AI Prompt Library & Versioning (7/7) ✅

- [x] `prompt_library` CRUD (list prompts, list/get a version, create a version, activate a version, diff two versions), admin-only via `requireSuperAdmin`
- [x] Seeded the 6 real prompts (`video_analysis`, `thumbnail_analysis`, `title_formula_detection`, `hook_classification`, `trend_clustering`, `ethical_recommendation`) — corrected from `ROADMAP.md`'s original 8-item list (DEC-020)
- [x] Redis AI-response cache (`vs:ai:{promptName}:{promptVersion}:{sha256(input)}`, 24h TTL) with real hit/miss counters in `GET /admin/metrics`'s `aiCache` field; two `requireServiceToken`-gated endpoints (`/internal/ai-cache/lookup`, `/store`) since n8n has no native Redis credential in this stack
- [x] Prompt test harness (`POST /admin/prompts/:name/test`) against 10 committed fixture videos, dispatched via the queue→n8n pattern (`infra/n8n-workflows/prompt-test.json`) rather than a direct synchronous AI call (`PROJECT_RULES.md` §3.5)
- [x] Diff view (`GET /admin/prompts/:name/diff`) and regression runner (`npm run ai:regression`, not CI-gated — TD-023)
- [x] Live-verified the full pipeline up to the AI-provider call boundary: auth, template rendering, cache check, provider routing, error handling, retry→dead-letter all confirmed working by observing the (expected, credential-less) failure and a real cache-hit round trip

**Not fully verifiable — see TD-023:** the actual AI-provider response content (no `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` in this environment), the regression suite as a CI-blocking gate, a real AI cost estimate, and the admin-dashboard UI for cache hit-rate (Phase 8 scope; still not built, see TD-024).

---

### Phase 8 — Frontend Dashboard (17/45 ROADMAP tasks, 100% of repo owner's explicit requirements) ✅

- [x] Backend `@fastify/cors` (`Security_Architecture.md`'s already-specified policy) — necessary infrastructure so the browser can call the API at all
- [x] Typed API client: in-memory access token, httpOnly-refresh-cookie session persistence (DEC-023), single 401-retry; hand-built design-system primitives on Radix + `cva` (shadcn's actual copy-source model); TanStack Query with a query-key factory and per-resource cache-strategy tiers; route constants
- [x] Client-side auth gate in the `(dashboard)` layout (the real boundary) plus `proxy.ts`'s `csrf_token`-presence UX heuristic (DEC-024) — Next.js 16's renamed `middleware.ts`
- [x] Login, register, verify-email, reset-password (request + confirm), logout — email/password only (OAuth deferred, DEC-025)
- [x] Responsive app shell (Sidebar + mobile drawer + Topbar) and Home dashboard (analytics overview, watchlists, recommendations, alert events), with an honest empty state for the no-organisation case (TD-011)
- [x] Full CRUD: Watchlists (optimistic delete), Alert Rules + read-only event history, API Keys (one-time plaintext reveal), Profile (session list/revoke), Organisation (deliberately read-only, TD-011)
- [x] AI Prompt Library admin UI (Phase 7 integration): version history/activate, version diff, test harness with honest job-status polling through TD-023's expected failure path
- [x] Three real bugs/mismatches found and fixed via live testing: Turbopack rejects `.js`-extension relative imports (`tsc`'s Bundler mode tolerates them, the actual bundler doesn't); the password-reset email hardcodes `/reset-password/confirm`, not the flat path first built; `analytics/overview`'s `alertEvents.last30Days` is a per-status breakdown object, not a flat number

**Not built — deferred, see TD-024:** Onboarding flow (TD-011), Trending/Videos/Video Detail/Channels/Trends/Opportunities/Search/Export/charts (TD-020/TD-015/TD-016), Billing/Team/Notifications settings (Phase 9/TD-011), the rest of the Admin panel beyond Prompt Library, OAuth UI (DEC-025), i18n, Changelog page, and a cache-hit-rate display anywhere in the UI.

---

## 6. In-Progress Tasks

*No tasks are actively in progress right now. Phase 6's queue infrastructure, base workflow template, and retry/dead-letter pipeline are merged; its remaining task groups (the 14 real business workflows — TD-020, n8n's own queue-mode scaling — TD-021, external credentials store — TD-022) are blocked or not started and not currently assigned. Phase 7 is complete per its own checklist (TD-023 covers what AI credentials would additionally unblock). Phase 8 is complete per the repo owner's explicit requirements (TD-024 covers ROADMAP.md's fuller aspirational list). Phase 5's remainder (TD-014 through TD-019) and Phase 4's remainder (TD-010, TD-011, TD-013) are also still outstanding — TD-011 (Organisation & Workspace Management) is now the shared blocker for Phase 8's onboarding flow, Phase 9's billing-per-organisation model, and full Organisation settings. Phase 9 (Billing), Phase 10 (Security), and Phase 11 (Admin Panel) are ready to begin — see §2 and §14.*

---

## 7. Pending Tasks

### Following — Phase 2: Infrastructure & DevOps (Parallel with Phase 1)

- [ ] Write Dockerfiles for all services
- [ ] Write `docker-compose.dev.yml` and `docker-compose.prod.yml`
- [ ] Configure Traefik reverse proxy and SSL
- [ ] Set up GitHub Actions CI/CD pipeline (all 5 workflows)
- [ ] Add `npm audit` to CI
- [ ] Configure Dependabot or Renovate
- [ ] Deploy Prometheus + Grafana + Loki stack
- [ ] Wire all service and n8n logs into Loki
- [ ] Implement `/health` and `/ready` endpoints on all services
- [ ] Register health endpoints with Coolify and Traefik
- [ ] Configure MinIO (dev) and Cloudflare R2 (production)
- [ ] Test one-command startup: `docker compose up`

*All remaining pending tasks are listed in full in [ROADMAP.md](./ROADMAP.md).*

---

## 8. Blockers

### Active Blockers

*No active blockers at this time.*

---

### BLK-004 — Production Docker image for `apps/api` crashed on boot (`@viralscopes/db` unresolved)
- **Raised:** 2026-07-27
- **Raised by:** Engineering (AI-assisted), discovered while Docker-verifying Phase 5
- **Severity:** High
- **Phases affected:** Phase 2 (Dockerfile authored), Phase 4 (first runtime dependency on `@viralscopes/db`), Phase 5
- **Description:** `infra/docker/Dockerfile.api`'s runner stage (final production image) copied `/app/node_modules`, `/app/apps/api/dist`, and `/app/apps/api/package.json` — but never `/app/packages/db`. `node_modules/@viralscopes/db` is an npm-workspaces symlink into `packages/db`; with that directory absent from the image, the symlink target doesn't exist and the container crashed immediately with `ERR_MODULE_NOT_FOUND` on the first import of `@viralscopes/db` (`db.plugin.ts`, required at server boot, not lazily). A second, related gap: `packages/db` had no build step at all (`tsconfig.json` sets `noEmit: true`, and `package.json`'s `main`/`types` pointed straight at `src/index.ts`) — it was designed purely for tsx/Node-with-a-TS-loader consumption, which plain `node` (the runner stage's `CMD`) cannot execute regardless of whether the directory was present.
- **Impact:** The built production image could not run at all — a boot-time crash — for any code path touching the database, true since Phase 4 added `db.plugin.ts`. Phase 2's Docker verification milestone predated that dependency and only confirmed the (then dependency-free) image booted; nobody re-verified a real container boot since. Local development (`tsx` directly against source, no container) was unaffected, which is exactly why this went uncaught through Phase 4 and most of Phase 5.
- **Owner:** Engineering (AI-assisted)
- **Status:** Resolved
- **Resolution:** Gave `packages/db` a real build path without touching its zero-build dev workflow: added `tsconfig.build.json` (extends the existing config, overrides `noEmit`/`declaration`/`outDir`/`rootDir` — the default `tsconfig.json` stays `noEmit: true` for `type-check` and tsx dev) and a `"build": "tsc -p tsconfig.build.json"` script. Changed `package.json`'s `main`/`types` from `src/index.ts` to `dist/index.js`/`dist/index.d.ts` — this is a real (disclosed) workflow change: `packages/db` must now be built (`npm run build --workspace=packages/db`, or via `turbo`) before its compiled output reflects source edits, in dev or Docker. Updated `Dockerfile.api`'s builder stage to run `turbo run build --filter=@viralscopes/api`, which turbo's dependency graph (`turbo.json`'s `build` task has `dependsOn: ["^build"]`) automatically expands to build `@viralscopes/db` first; added two `COPY` lines so the runner stage includes `packages/db/dist` and `packages/db/package.json`, giving the workspace symlink a real target. Live-verified end-to-end: rebuilt the image, booted it against the real dev Postgres/Redis containers, and successfully ran a login + a Phase 5 business endpoint + an admin endpoint entirely through the container (not just `/ready`). Also re-verified no regression to local dev: `tsc --noEmit`, `eslint`, and a full `tsx`-mode boot + login + endpoint call all still pass after the `package.json` change. **Follow-up caught by CI on PR #17:** `turbo.json`'s `type-check` task had no `dependsOn: ["^build"]` (unlike `build`/`test`, which already had it), so a genuinely fresh checkout ran `apps/api`'s type-check before `packages/db`'s new `dist/` existed, failing with `Cannot find module '@viralscopes/db'`. Added the missing `dependsOn`, verified against a real fresh-checkout simulation (deleted all `dist/`/`.next`/`.turbo` output and reran `npm run type-check` from clean), and confirmed green on CI.
- **Resolved:** 2026-07-27

---

### Blocker Log (Historical)

### BLK-001 — GitHub branch protection unenforceable on private repo (Free plan)
- **Raised:** 2026-07-26
- **Raised by:** Engineering (AI-assisted)
- **Severity:** Medium
- **Phases affected:** Phase 1
- **Description:** Phase 1 requires configuring branch protection on `main`/`develop` (`PROJECT_RULES.md` §5.2). Initially blocked on `gh auth login`; once authenticated, both the classic branch-protection API and the newer repository-rulesets API returned `403 Upgrade to GitHub Pro or make this repository public to enable this feature` — a plan limitation on private repos under a personal (non-Pro) GitHub account, not an auth or config issue.
- **Impact:** Branch protection rules cannot be actively enforced by GitHub right now. All other Phase 1 deliverables are complete.
- **Resolution options:**
  1. Upgrade to GitHub Pro (~$4/mo) — unblocks both classic protection and rulesets immediately.
  2. Make the repository public — free, but exposes private strategy docs (`Business_Model.md`, `Pricing_Strategy.md`, `Commercial_Strategy.md`, `Competitive_Analysis.md`, etc.) alongside the code. Not recommended.
  3. Document as an accepted limitation for now; revisit when upgrading to Pro or adding a second engineer becomes a real need.
- **Owner:** Repo owner (Kevin Gates)
- **Status:** Resolved — accepted as documented limitation
- **Resolution:** Repository ruleset configuration for `main` and `develop` was created and is ready to enforce; it will activate automatically if/when the account upgrades to GitHub Pro (or the repo goes public). No plan change made. `PROJECT_RULES.md` §5.2's branch-protection rules remain the documented team convention, enforced by process/discipline rather than GitHub tooling until the plan limitation is lifted.
- **Resolved:** 2026-07-26

---

### BLK-002 — `main` branch deleted from GitHub, default branch switched to stale `develop`
- **Raised:** 2026-07-26
- **Raised by:** Engineering (AI-assisted), discovered while verifying BLK-001
- **Severity:** High
- **Phases affected:** Phase 1
- **Description:** While setting up `develop` and branch protection outside this session, `origin/main` was deleted from GitHub and the repository's default branch was switched to `develop`, which was anchored at an early commit (`0cb7a44`, "scaffold Turborepo monorepo for Phase 1 foundation") — 9 commits behind where `main` actually was. Local `main` retained the full, current history throughout, so nothing was permanently lost.
- **Impact:** The repo's primary branch was missing from the remote and the default branch pointed at stale history, which would have broken the `PROJECT_RULES.md` §5.1 git workflow (all branches assume `main` is current and canonical) had it gone unnoticed into Phase 2.
- **Resolution options:**
  1. Push local `main` back to `origin/main` and reset the GitHub default branch to `main`; fast-forward `develop` to match.
  2. Investigate further before making any remote changes.
- **Owner:** Repo owner (Kevin Gates) — confirmed option 1
- **Status:** Resolved
- **Resolution:** `git push origin main` restored `origin/main` at the current tip (`b747f97`); GitHub default branch reset to `main` via `gh api`; `origin/develop` fast-forwarded to match `main`'s tip (`0cb7a44` confirmed as an ancestor, so no unique work was on the old `develop`). Both branches now point to the same, current commit on the remote.
- **Resolved:** 2026-07-26

---

### BLK-003 — Branch protection enforced, but solo maintainer can't approve own PRs
- **Raised:** 2026-07-26
- **Raised by:** Engineering (AI-assisted), discovered during Phase 2 Milestone 3
- **Severity:** Medium
- **Phases affected:** Phase 2
- **Description:** The repository was made public (owner's decision, to unblock GitHub Advanced Security features — see DEC-008). This lifted BLK-001's plan limitation: the rulesets configured in Phase 1 became actively enforced, including `required_approving_review_count: 1` on both `main` and `develop`. The first PR opened afterward (#10) could not be merged: GitHub rejects self-approval outright ("Can not approve your own pull request"), and no bypass actor was configured, so even a repo-admin merge attempt (`gh pr merge --admin`) was rejected.
- **Impact:** No PR could be merged to `main` or `develop` without a second human reviewer, who doesn't exist on this solo project.
- **Resolution options:**
  1. Add the repository-admin role to each ruleset's bypass list — protection still applies to any future non-admin collaborator.
  2. Set `required_approving_review_count` to 0, removing the human-review requirement entirely.
  3. Merge manually via the GitHub UI through some other means.
- **Owner:** Repo owner (Kevin Gates) — confirmed option 1
- **Status:** Resolved
- **Resolution:** Confirmed all three active rulesets ("Protected Branches", "Protected Branches main", "Protected Branches develop") already had `bypass_actors: [{actor_id: 5, actor_type: RepositoryRole, bypass_mode: always}]` (Admin role) configured with `current_user_can_bypass: always`. The blocker was specifically `gh pr merge --admin`'s GraphQL path not invoking the bypass correctly — merging via the REST API directly (`PUT /repos/.../pulls/10/merge`) respected it and succeeded. Direct `git push` to a bypass-covered branch also correctly bypasses (used to sync `develop`).
- **Resolved:** 2026-07-26

---

### Blocker Template

When a blocker is identified, log it in this format:

```
### BLK-NNN — [Short title]
- **Raised:** YYYY-MM-DD
- **Raised by:** [Name]
- **Severity:** Critical / High / Medium
- **Phases affected:** Phase N, Phase M
- **Description:** [Clear description of what is blocked and why]
- **Impact:** [What cannot proceed until this is resolved]
- **Resolution options:**
  1. [Option A]
  2. [Option B]
- **Owner:** [Name responsible for resolution]
- **Target resolution:** YYYY-MM-DD
- **Status:** Open / In Progress / Resolved
- **Resolution:** [How it was resolved — fill in when closed]
- **Resolved:** YYYY-MM-DD
```

---

## 9. Risks — Active

### RISK-01 — YouTube API Quota Strategy

| Property | Value |
|---|---|
| **ID** | RISK-01 |
| **Raised** | 2026-07-20 |
| **Severity** | Critical |
| **Probability** | High |
| **Phases affected** | Phase 5, Phase 6 |
| **Status** | Open — overdue. Target was "before Phase 5 begins" (Week 6); still unresolved as of Phase 6's start. Phase 5 and Phase 6 both proceeded by scoping out everything that depends on it (TD-014, TD-020) rather than guessing |

**Description:**

The YouTube Data API v3 free tier provides 10,000 quota units per day. A search request costs 100 units; a video detail request costs 1–3 units. At the scale of the discovery workflow (scanning hundreds of videos per run, every 6 hours), the free tier will be exhausted very quickly.

**Required decision before Phase 5:**

- [ ] Evaluate YouTube Data API paid quota tiers (cost vs volume)
- [ ] Evaluate RapidAPI YouTube API as supplemental source (cost per request, rate limits, data quality)
- [ ] Evaluate Apify YouTube scraper as fallback (cost per run, reliability, ToS compliance)
- [ ] Define per-plan daily quota allocation (Free gets fewer discovery cycles than Enterprise)
- [ ] Define the cache-first threshold (how many hours before a video is re-eligible for refresh)
- [ ] Document the chosen strategy in a new ADR: `ADR-006-youtube-quota-strategy.md`

**Owner:** To be assigned
**Target resolution:** Before Phase 5 starts (Week 6)

---

### RISK-02 — AI Cost Model Validation

| Property | Value |
|---|---|
| **ID** | RISK-02 |
| **Raised** | 2026-07-20 |
| **Severity** | High |
| **Probability** | High |
| **Phases affected** | Phase 6, Phase 7 |
| **Status** | Open — overdue. Target was "before Phase 6 begins" (Week 9); still unresolved as Phase 6's foundation work landed. Scoped out (TD-020) rather than guessing a cost model |

**Description:**

Full AI analysis of one video (transcript analysis + thumbnail vision + full content analysis + recommendations) costs approximately $0.05–$0.15 at current OpenAI/Anthropic pricing. Without caching and tiered analysis, analysing 10,000 videos per day would cost $500–$1,500 per day — unsustainable at MVP revenue levels.

**Required decisions before Phase 6:**

- [ ] Define the tiered analysis thresholds:
  - Basic metadata scoring only: videos under [X] views (majority)
  - Full AI analysis: videos over [X] views with engagement ratio above [Y]
- [ ] Prototype the prompt chain and measure actual cost per video on a sample of 100 videos
- [ ] Validate the expected cache hit rate (estimate: 40–70% after the first week of operation)
- [ ] Confirm which tasks use Claude vs GPT-4o vs lighter models (Claude Haiku, GPT-4o mini)
- [ ] Set daily AI spend alert threshold in Grafana
- [ ] Document cost model and decisions in `ADR-007-ai-cost-model.md`

**Owner:** To be assigned
**Target resolution:** Before Phase 6 starts (Week 9)

---

### Resolved Risks

*No risks have been resolved yet.*

---

## 10. Upcoming Milestones

| ID | Milestone | Target | Phase | Status | Deliverable |
|---|---|---|---|---|---|
| M1 | Project Ready | Week 1 | Phase 1 | ✅ Done | Repo initialised, tooling configured, design system done |
| M2 | Infrastructure Live | Week 3 | Phase 2 | ✅ Done | Docker running, CI/CD live (not yet deployed to a real staging host — TD-006) |
| M3 | Schema Complete | Week 4 | Phase 3 | ✅ Done | All migrations applied, RLS active (ERD in Mermaid, not yet exported to PNG) |
| M4 | Auth Complete | Week 6 | Phase 4 | 🚧 Partial | Auth system live (not yet in a real staging deploy); email templates are a dev-only logging stub (TD-010) |
| M5 | API v1 Complete | Week 9 | Phase 5 | 🚧 Partial | 36/57 endpoints live (TD-014–019); OpenAPI spec not generated (TD-018) |
| M6 | Workflows Live | Week 12 | Phase 6 | 🚧 Partial | Queue/orchestration foundation live; the 14 real content workflows deferred (TD-020) |
| M7 | Prompts Live | Week 12 | Phase 7 | ✅ Done | All 6 real prompts (DEC-020) versioned, cached, test harness and regression runner working as far as possible without AI credentials (TD-023) |
| M8 | Dashboard Complete | Week 13 | Phase 8 | 🚧 Partial | Repo owner's explicit Phase 8 requirements live and responsive (not a staging deploy); onboarding untested -- no self-service org creation exists (TD-011) |
| M9 | Billing Live | Week 15 | Phase 9 | 🚧 Partial | Full billing system built, hardened, and live-verified end-to-end against synthetic signed Stripe events (no live Stripe account exists in this environment, so "in staging" with real Stripe traffic is unverified); usage tracking active for the count/flag-based limits that exist (TD-025/TD-016/TD-020 block the rest) |
| M10 | Security Complete | Week 16 | Phase 10 | ⏳ Pending | Security checklist done, GDPR endpoints live |
| M11 | Tests Green | Week 18 | Phase 12 | ⏳ Pending | All test suites passing, coverage targets met |
| M12 | Docs Complete | Week 18 | Phase 13 | ⏳ Pending | All technical docs published and reviewed |
| M13 | Production Launch 🚀 | Week 19–20 | Phase 14 | ⏳ Pending | All services live in production |
| M14 | Admin Panel Live | Week 22 | Phase 11 | ⏳ Pending | Super Admin Panel live (within 30 days of launch) |
| M15 | v1.5 Launch | Week 36 | Post-MVP | ⏳ Pending | AI Chat, Scheduled Reports, Chrome Extension, Paddle |
| M16 | v2.0 Launch | Week 72 | v2.0 | ⏳ Pending | TikTok, Instagram, Mobile App, Public API |

---

## 11. Decisions Made

Significant decisions are logged here with context, options considered, and rationale. For full technical decisions, see the Architecture Decision Records (ADRs) in `docs/decisions/`.

---

### DEC-001 — Monorepo Architecture

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use a Turborepo monorepo with `apps/` and `packages/` |
| **Decided by** | Engineering Lead |
| **ADR** | [ADR-001-monorepo.md](./docs/decisions/ADR-001-monorepo.md) |

**Context:** The project has two applications (Next.js frontend, Fastify API) that share TypeScript types, Zod schemas, and constants. A monorepo prevents type drift and enables atomic cross-package refactoring.

**Options considered:**
1. Separate repositories per service — simple to start, but type sharing requires publishing packages or copy-pasting
2. Turborepo monorepo — single repository, shared packages, consistent tooling, built-in build caching
3. Nx monorepo — more powerful but significantly more complex configuration

**Decision:** Turborepo monorepo. Best balance of simplicity and capability for a small team.

---

### DEC-002 — Fastify over Express

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use Fastify 4.x for the backend API |
| **Decided by** | Engineering Lead |
| **ADR** | [ADR-002-fastify-over-express.md](./docs/decisions/ADR-002-fastify-over-express.md) |

**Context:** The API needs to handle high-frequency requests from the dashboard and the n8n workflow engine simultaneously. Performance, TypeScript support, and validation ergonomics are key selection criteria.

**Options considered:**
1. Express — familiar, large ecosystem, but slow and lacks native TypeScript support
2. Fastify — 2–3× faster than Express, first-class TypeScript, built-in JSON schema validation, plugin architecture
3. Hono — newer, very fast, but smaller ecosystem and less mature for production SaaS

**Decision:** Fastify. The performance advantage and TypeScript-first design align with project requirements.

---

### DEC-003 — n8n for Workflow Orchestration

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use self-hosted n8n for all background workflow orchestration |
| **Decided by** | Engineering Lead |
| **ADR** | [ADR-003-n8n-for-workflows.md](./docs/decisions/ADR-003-n8n-for-workflows.md) |

**Context:** The AI analysis pipeline has 14 distinct workflow stages, each calling different external services. A visual workflow engine reduces boilerplate and makes the pipeline observable and debuggable without writing custom worker code.

**Options considered:**
1. Custom BullMQ workers — maximum control, but significant boilerplate for 14 workflows
2. n8n (self-hosted) — visual editor, built-in retry logic, credential management, large integration library
3. Temporal — powerful, but complex to operate; overkill for current scale
4. AWS Step Functions — managed, but vendor lock-in and per-execution cost at scale

**Decision:** n8n. Best fit for the workflow complexity and team size. Self-hosted keeps costs low and data on our infrastructure.

---

### DEC-004 — Drizzle ORM over Prisma

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use Drizzle ORM for database access and migrations |
| **Decided by** | Engineering Lead |
| **ADR** | [ADR-004-drizzle-orm.md](./docs/decisions/ADR-004-drizzle-orm.md) |

**Context:** The data layer needs to support complex analytics queries, partitioned tables, and explicit control over generated SQL. The ORM must not become a performance bottleneck at scale.

**Options considered:**
1. Prisma — popular, excellent DX for CRUD, but generates suboptimal SQL for complex queries; migration system less transparent
2. Drizzle ORM — generates clean, predictable SQL; lightweight; excellent TypeScript inference; full migration control
3. Raw SQL with pg — maximum control but no type safety; too much boilerplate for a small team

**Decision:** Drizzle ORM. Clean SQL generation, TypeScript-first, and the migration system gives full visibility into every schema change.

---

### DEC-005 — Dual AI Providers (Claude + OpenAI)

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use Claude (Anthropic) for reasoning tasks and GPT-4o for structured extraction; each serves as fallback for the other |
| **Decided by** | Engineering Lead |
| **ADR** | [ADR-005-dual-ai-providers.md](./docs/decisions/ADR-005-dual-ai-providers.md) |

**Context:** Different AI tasks have different requirements. Content analysis and recommendation generation benefit from Claude's nuanced reasoning. Structured JSON extraction and vision tasks benefit from GPT-4o's speed and reliability.

**Options considered:**
1. Single provider (Claude only) — simpler, but no fallback if Anthropic has downtime
2. Single provider (OpenAI only) — simpler, but Claude outperforms GPT-4o on strategic reasoning
3. Dual providers with task-specific routing — more complex, but optimises cost and quality per task type; adds resilience

**Decision:** Dual providers. Task routing documented per workflow. AI provider accessed through an abstraction layer — can add or swap providers without touching workflow logic.

---

### DEC-006 — Cloudflare R2 for Object Storage

| Property | Value |
|---|---|
| **Date** | 2026-07-20 |
| **Decision** | Use Cloudflare R2 as the primary object storage provider for production |
| **Decided by** | Engineering Lead |

**Context:** The platform stores thumbnails, exports, and cached AI outputs. Egress costs on AWS S3 are significant at scale.

**Options considered:**
1. AWS S3 — industry standard, excellent reliability, but egress costs at $0.09/GB
2. Cloudflare R2 — S3-compatible, zero egress fees, integrated with Cloudflare CDN
3. Backblaze B2 — low cost, but less CDN integration

**Decision:** Cloudflare R2. Zero egress fees provide material cost savings; S3-compatible API means migration to AWS S3 is straightforward if needed. MinIO used for local development (S3-compatible, zero cost).

---

### DEC-007 — secretlint for Pre-Commit Secret Scanning

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Use `secretlint` (`@secretlint/secretlint-rule-preset-recommend`) as the pre-commit secret scanner |
| **Decided by** | Engineering Lead (approved) |

**Context:** `PROJECT_RULES.md` §4.3 originally named "git-secrets or detect-secrets" generically without picking one.

**Options considered:**
1. `git-secrets` — mature, but a Python/shell tool, adds a non-Node dependency to an otherwise pure TypeScript/Node toolchain
2. `detect-secrets` — similar tradeoff, Python-based
3. `secretlint` — npm-native, fits the existing ESLint/Prettier/Husky toolchain, plugin-based rule presets

**Decision:** `secretlint`. `PROJECT_RULES.md` §4.3 updated to name it explicitly.

---

### DEC-008 — Repository made public

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Switch the GitHub repository from private to public |
| **Decided by** | Repo owner (Kevin Gates) |

**Context:** GitHub Advanced Security features (secret scanning, CodeQL/code scanning, Dependency Review, enforced branch protection rulesets) are unavailable for private repositories on this account's plan — confirmed repeatedly via real API calls and workflow runs (BLK-001; Phase 2 Milestone 3). Advanced Security is free on public repositories.

**Options considered:**
1. Upgrade to GitHub Pro — unblocks these features while staying private.
2. Make the repository public — free, but exposes every file, including strategy docs (`Business_Model.md`, `Pricing_Strategy.md`, `Commercial_Strategy.md`, `Competitive_Analysis.md`, etc.).
3. Leave private, accept the feature gap indefinitely.

**Decision:** Public. The owner made this call directly (flagged as a significant, hard-to-reverse decision before proceeding — see chat log 2026-07-26). Confirmed working immediately after: CodeQL and Dependency Review both passed on the next real workflow run, and branch-protection rulesets became actively enforced (see BLK-003 for the solo-maintainer follow-on issue that surfaced and was resolved).

---

### DEC-009 — Production-aware npm audit policy (custom script, not a third-party tool)

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Replace the naive `npm audit --audit-level=high` CI gate with a custom policy: production dependencies only, plus a reviewed, dated allowlist for advisories with no available fix |
| **Decided by** | Engineering Lead (approved) |

**Context:** The literal gate documented in `Security_Architecture.md` §20 and `Deployment_Guide.md` §9 fails on devDependency-only advisories (no runtime risk) and on advisories with no non-breaking fix (Next.js's bundled `sharp`/`postcss`) — exactly the failure that blocked the old CI before the Phase 1 reset.

**Options considered:**
1. `audit-ci` (npm package) — battle-tested, but still needed custom logic for the allowlist-with-review-dates requirement, so it wouldn't actually remove much custom code.
2. Custom script (`.github/scripts/check-audit.mjs`) — full control, no new dependency, matches the small scale of the check.

**Decision:** Custom script. Verified against all three logic paths (clean pass, unaddressed vulnerability, expired review date) before shipping. See `.github/security/audit-allowlist.json` for the current accepted exceptions (all four current findings trace to the same root cause: Next.js's bundled `sharp`/`postcss`, reviewBy `2026-10-26`).

---

### DEC-010 — Zod schema for environment variable validation (apps/api)

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Validate every environment variable `apps/api` reads through a single Zod schema (`apps/api/src/config.ts`), failing fast with a specific error rather than booting on an invalid or silently-defaulted value |
| **Decided by** | Engineering Lead (approved) |

**Context:** Phase 2 Milestone 4 requires startup validation for required configuration without inventing placeholder requirements for variables nothing reads yet. Only `APP_ENV`, `PORT`, and `APP_VERSION` are consumed by any code today.

**Decision:** `zod` (already the project's documented validation standard — `PROJECT_RULES.md`, `Security_Architecture.md`) added as a real dependency of `apps/api`, not a devDependency-only or aspirational one. Verified locally: invalid `PORT` and `APP_ENV` values both fail immediately with a field-specific error message; valid values (including a custom `APP_VERSION`) flow through correctly to `GET /health`. Each future phase that wires in a new dependency (database, Redis, JWT, ...) extends this same schema rather than reading `process.env` ad hoc elsewhere in the codebase.

---

### DEC-011 — Structured Pino logging with redaction (apps/api)

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Add `pino` as an explicit direct dependency of `apps/api` and configure Fastify's logger via `apps/api/src/plugins/logger.plugin.ts` (base fields, redaction, ISO timestamps), rather than the bare `logger: true` default |
| **Decided by** | Engineering Lead (approved) |

**Context:** `pino` was only present as an undeclared transitive dependency of `fastify`. Phase 2 Milestone 5 requires a real logging strategy (structured output, level differentiation, no secrets in logs) — relying on an undeclared transitive dependency for that would be fragile, and the bare `logger: true` default has no redaction and no base fields.

**Decision:** `pino` added directly. `buildLoggerOptions()` implements the exact redact path list from `Security_Architecture.md` §9 / `Monitoring_and_Operations.md` §3 (`password`, `token`, `apiKey`, `email`, `name`, `ip_address`, auth headers, etc.) plus `service`/`version`/`environment` base fields and `pino.stdTimeFunctions.isoTime`. `LOG_LEVEL` added to the Zod schema (DEC-010) so an invalid value fails fast like every other env var. Verified directly (not assumed): a log call with `password`/`email`/`name`/`ip_address` fields produces `[REDACTED]` in the actual output; `LOG_LEVEL=error` correctly suppresses `warn`/`info` logs; Pino's own error serializer (`err.type`, not `err.name`) is unaffected by the `*.name` redaction path, so error diagnostics aren't lost.

---

### DEC-012 — Plain `postgres:17-alpine` container for local dev, not the Supabase CLI

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | `docker-compose.dev.yml` runs a plain Postgres container; the Supabase CLI (which would additionally start GoTrue/Storage/Realtime/Studio) is not used |
| **Decided by** | Repo owner (approved via explicit question during Phase 3 planning) |

**Context:** Milestone 1 (Phase 2) had left a comment assuming local Postgres would come from the Supabase CLI, per `ROADMAP.md`'s literal Phase 3 task wording ("Initialise Supabase project (local dev + hosted)"). While investigating Phase 3, recovering the pre-reset implementation (commit `b747f97`) showed the app was already built around its own JWT/OAuth auth (own `users`/`sessions` tables, bcrypt hashes), not Supabase Auth — confirmed against `Security_Architecture.md` §5 and `PRD.md` FR-43.

**Decision:** Since the app never calls Supabase's GoTrue/Storage/Realtime services — only Postgres itself, which production (Supabase-hosted Postgres) is too — a plain `postgres:17-alpine` container is simpler, lighter, and equally correct. Supersedes the Milestone-1 comment.

---

### DEC-013 — Custom SQL-file migration runner instead of `drizzle-kit generate`/`migrate`

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | Migrations are hand-written SQL files (`packages/db/src/migrations/*.sql`) with `-- Up`/`-- Down` sections, applied by a small custom runner (`packages/db/src/migrate.ts`) that tracks state in a `_migrations` table |
| **Decided by** | Engineering Lead (approved) |

**Context:** `Database_Schema.md` §14 requires every migration to be reversible (up + down). `drizzle-kit`'s own migration journal is forward-only — there is no `down`/rollback command — which doesn't meet that requirement. Several of Phase 3's migrations (the `updated_at` trigger function, RLS policies using `current_setting()`, `PARTITION BY RANGE`) also aren't expressible through drizzle-kit's schema-diffing DSL at the installed version (`drizzle-kit@0.31.10`).

**Decision:** Drizzle ORM remains the query builder and the source of column/type definitions (`packages/db/src/schema/*.ts`); the SQL migration files are hand-written to match those definitions exactly, and applied/reverted by the custom runner. Verified: a full `up` → `down 4` → `up` cycle against a live Postgres instance produces the same 26 tables + 4 partitions both times, and rollback leaves only the `_migrations` bookkeeping table.

---

### DEC-014 — Dedicated unprivileged `app_user` Postgres role for RLS-protected queries

| Property | Value |
|---|---|
| **Date** | 2026-07-26 |
| **Decision** | The application will query via a separate, non-superuser, non-owning Postgres role (`app_user`, created by `packages/db/src/setup-roles.ts`) — never the role migrations run as |
| **Decided by** | Engineering Lead (found and fixed during verification, not assumed to be needed upfront) |

**Context:** While functionally verifying RLS (not just checking that policies exist), a tenant-isolation test returned every organisation's rows instead of isolating them. Root cause: Postgres superusers and table owners bypass Row Level Security unconditionally, regardless of policies — and the connection used for migrations (which owns every table) is exactly that.

**Decision:** `setup-roles.ts` creates `app_user` with `NOSUPERUSER NOBYPASSRLS` and grants it `SELECT`/`INSERT`/`UPDATE`/`DELETE` (not ownership) on all tables. `DATABASE_APP_URL` (`.env.example`) is what the application will connect with from Phase 5 onward; `DATABASE_URL` (the owner connection) is reserved for migrations/seeds/admin scripts only. Re-verified the same isolation test as `app_user`: each organisation saw only its own row, and a connection with no tenant context set saw zero rows (fail-closed).

---

### DEC-015 — Generic response for every login failure, including "email not verified"

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | `POST /api/v1/auth/login` returns the identical `401 INVALID_CREDENTIALS` response for a wrong password, a nonexistent account, and a *correct* password on an unverified account — the three are indistinguishable to the caller |
| **Decided by** | Engineering Lead (found and fixed during a Phase 4 pre-merge security review, not assumed to be needed upfront) |

**Context:** The initial implementation checked password validity, then separately checked `emailVerified`, returning a distinct `403 EMAIL_NOT_VERIFIED` only when the password was correct. This let an attacker running a credential-stuffing list confirm a guessed password was genuinely correct for any email/password registrant still in the unverified window — without ever completing login, and without tripping account lockout (`recordFailedLogin` only ran on the wrong-password branch, so this specific probe was free beyond the route's IP rate limit).

**Decision:** `login()` now treats "wrong password" and "correct password but unverified" as a single outcome: both throw `INVALID_CREDENTIALS` (401) and both call `recordFailedLogin`. The real reason is still fully visible server-side via a structured `logger.info` line (`"Login rejected: password correct but email not verified."`, keyed by `userId`) for legitimate diagnostics — only the client-visible response was collapsed, not the operational signal.

**Consequence:** A legitimate user who forgets to verify their email before attempting to log in no longer gets a specific "please verify your email" message from `/login` itself — they still received it once at registration time (`"Verification email sent. Please check your inbox."`). Building a self-service "resend verification email" endpoint (which would need to preserve the same anti-oracle property `forgotPassword()` already has) is noted as a follow-up UX improvement, not a Phase 4 blocker.

---

### DEC-016 — OAuth account-linking requires the existing account to already be verified

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | An OAuth callback (`google`/`github`) only auto-links to an existing local account found by email match when that account's `emailVerified` is already `true`. If the existing account is unverified, the OAuth attempt is refused (`OAUTH_ACCOUNT_REQUIRES_VERIFICATION`, 409) instead of silently linking |
| **Decided by** | Engineering Lead (found and fixed during a Phase 4 pre-merge security review, not assumed to be needed upfront) |

**Context:** `register()` lets anyone create a `users` row for any email with an attacker-chosen password (`emailVerified: false` until the link is clicked). The original `findOrCreateUserFromOAuth` linked any OAuth login to an existing local account purely on email match, with no check of that account's verification state, then issued a session directly (bypassing `login()`'s checks entirely). This is the "Classic-Federated Merge" pre-hijack pattern: an attacker pre-registers `victim@example.com`, the real victim later signs in with "Sign in with Google" on that same address, and the two identities merge onto one row — with an attacker-known password sitting on what is now the victim's account — with no re-authentication challenge and no notification to either party.

**Decision:** Account-linking policy is now: an OAuth identity may only be silently linked to an existing local account whose email ownership has *already* been independently established (`emailVerified === true` — e.g. via the password + email-verification flow, or a prior OAuth link). Both proofs anchor to the same mailbox, so the same person almost certainly controls it, and no extra friction is warranted. An **unverified** existing account means nobody has ever proven they control that row; linking is refused, and the real owner reclaims the account through the existing, already-anti-enumeration-safe password-reset flow (`forgotPassword`/`resetPassword`) — an explicit, intentional action rather than an implicit merge. See `Security_Architecture.md` §5, "Account Linking Policy".

**Consequence:** No new account/duplicate identity is ever created in this scenario (the pre-registered row is preserved, untouched, until its real owner resets its password). The OAuth callback redirects to `${APP_URL}/login?error=account_requires_verification` instead of completing the merge, so the frontend can render an explanatory message; implementing that frontend message is tracked as Phase 4 frontend follow-up work, not a backend blocker.

---

### DEC-017 — Platform-admin authorisation reads `users.role` live from the DB, not the JWT

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | `requireSuperAdmin` (Phase 5's `/api/v1/admin/*` gate) queries the `users` table on every request instead of adding a platform-role claim to the access token |
| **Decided by** | Engineering Lead (found while building Phase 5's Admin endpoints, not assumed to be needed upfront) |

**Context:** The JWT payload (Phase 4, `buildAccessTokenPayload`) carries `orgRole` (org-level: owner/admin/member/viewer) but not `users.role` (platform-level: `super_admin`/`user`) — the two are different concepts serving different endpoints (`requireRole()` for org-scoped resources vs. platform-wide admin access). Adding `role` to the JWT would have been a one-line change, but would mean a super_admin who gets demoted keeps admin API access for up to the access token's 15-minute lifetime.

**Decision:** `requireSuperAdmin` (`apps/api/src/middleware/require-super-admin.ts`) does a live `findUserById` lookup and checks `role === 'super_admin'` on every admin request, rather than trusting a token claim. The cost is one extra indexed query per admin request — admin traffic volume doesn't make this meaningful, and it closes the revocation-lag gap immediately rather than accepting up to 15 minutes of stale access.

**Consequence:** Deliberately did not modify `apps/api/src/lib/jwt.ts` or `auth.service.ts`'s `buildAccessTokenPayload` — Phase 5 needed a way to gate admin routes, not a reason to touch Phase 4's token-signing code, so no JWT payload shape changed.

---

### DEC-018 — n8n calls out to `apps/api`'s BullMQ worker, not the other way around

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | `apps/api` runs a real BullMQ producer + in-process `Worker`; the worker's processor function calls n8n's webhook synchronously and treats n8n's response as the job outcome. n8n never polls or pulls from the queue itself |
| **Decided by** | Engineering Lead (found while implementing Phase 6's "Configure Redis queue (BullMQ) integration", not assumed to be needed upfront) |

**Context:** `INFRASTRUCTURE_GROWTH_PLAN.md` §10.1 describes "API enqueues jobs; n8n polls and executes them." n8n has no first-party BullMQ consumer node — building genuine n8n-side polling would mean either a custom n8n node or an HTTP dequeue/complete/fail bridge that's arguably a *larger* custom protocol surface than the alternative, for no functional benefit at this scale.

**Decision:** `apps/api`'s own `Worker` (standard BullMQ usage: an in-process consumer with a processor callback) picks up each job and makes ONE synchronous HTTP call to n8n's webhook for that workflow, attaching the shared service token. n8n's `{success, message}` response is the job's pass/fail signal — a thrown error inside the processor triggers BullMQ's normal retry/backoff. All persistence (job_logs, dead_letter_jobs), retry counting, and backoff scheduling stay in `apps/api`; n8n only ever receives a webhook call and returns a response — the architecture constraint requiring business rules/persistence to live in the backend, not n8n, is satisfied by construction, not by convention.

**Consequence:** This differs from `INFRASTRUCTURE_GROWTH_PLAN.md`'s literal "n8n polls" phrasing — noted here rather than silently deviating from documented architecture. Functionally equivalent (queue-mediated handoff between API and n8n) with a much smaller integration surface; live-verified end to end including the full retry-to-dead-letter cycle.

---

### DEC-019 — n8n's own `EXECUTIONS_MODE=queue` reverted to default "regular" mode

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | n8n runs in its default single-instance "regular" execution mode. `EXECUTIONS_MODE=queue` (BullMQ-backed, n8n's own internal scaling feature) was tried, found broken, and reverted |
| **Decided by** | Engineering Lead (found live while verifying Phase 6's Docker Compose changes) |

**Context:** `EXECUTIONS_MODE=queue` makes n8n's main process only *enqueue* executions onto its own internal queue — a separate `n8n worker` process (a distinct container/command) is required to actually consume and run them. Configured queue mode without also adding a worker service; confirmed live that every execution (a webhook call, a scheduled trigger) enqueued and then hung forever, since nothing existed to dequeue it. n8n also logs "Scaling mode is not officially supported with sqlite" on every boot in this mode — a genuine second problem, since a shared-storage worker setup would need n8n's own execution database moved to Postgres too.

**Decision:** Reverted to n8n's default regular mode, which executes in-process and needs no separate worker — confirmed live this is what n8n itself treats as fully supported against the default SQLite backing. `apps/api`'s own BullMQ queue (DEC-018) is entirely unaffected either way — it's a separate set of BullMQ Queue/Worker instances that happen to share the same Redis server, not connected to n8n's internal execution mode at all.

**Consequence:** A dedicated `n8n worker` service + Postgres-backed n8n storage is real, legitimate scaling work for when it's actually needed (matches `INFRASTRUCTURE_GROWTH_PLAN.md`'s own "Stage 2 — Multiple n8n Workers" framing) — deferred as TD-021, not configured now.

---

### DEC-020 — Phase 7 seeds 6 prompts, not the 8 named in `ROADMAP.md`'s checklist

| Property | Value |
|---|---|
| **Date** | 2026-07-27 |
| **Decision** | `prompt_library` is seeded with exactly the 6 prompts that correspond to a real AI model call: `video_analysis`, `thumbnail_analysis`, `title_formula_detection`, `hook_classification`, `trend_clustering`, `ethical_recommendation` |
| **Decided by** | Engineering Lead (found while implementing Phase 7's "store all prompts in DB" task) |

**Context:** `ROADMAP.md`'s Phase 7 checklist names 8 items, including "transcript analysis" and "opportunity detection." Cross-checking against `n8n_Workflow_Diagrams.md` (the more detailed, authoritative workflow design) shows neither is an AI prompt: WF-03 Transcript Pipeline only fetches YouTube captions via the Data API — transcript *summarisation* is produced as part of the `video_analysis` prompt's output, not a separate call — and WF-11 Opportunity Engine is explicitly documented as "No AI calls — purely computational ranking" (`opportunity_score = velocity×0.40 + viral_score×0.30 + (100-competition)×0.20 + growth×0.10`). `AI_Strategy.md` §5.1's own "Active prompts (MVP)" table independently lists exactly these same 6 — the two documents agree with each other and disagree with `ROADMAP.md`'s checklist wording.

**Decision:** Seed the 6 prompts that correspond to a real model call (migration `0009_seed_prompt_library.sql`), each transcribed from `AI_Strategy.md` §2 / `n8n_Workflow_Diagrams.md`'s per-workflow specs (system prompt, user template, and a JSON-Schema `output_schema` matching each analysis table's actual columns/enums — `hook_type`'s 9 values and `title_analyses.formula_type`'s 15 values, including `'other'`, both transcribed verbatim from `n8n_Workflow_Diagrams.md` WF-07/WF-06 rather than invented). Do not seed placeholder prompts for `transcript_analysis` or `opportunity_detection`, since no such AI call exists to version.

**Consequence:** `ROADMAP.md`'s Phase 7 task wording is corrected to name the 6 real prompts instead of 8, cross-referencing this decision, so the checklist matches what was actually (and correctly) built rather than silently underreporting 6/8 forever.

---

### DEC-023 — Access token held in memory only; session persistence via the httpOnly refresh cookie, not a client-side-readable cookie

| Property | Value |
|---|---|
| **Date** | 2026-07-28 |
| **Decision** | `apps/web` never stores the JWT access token in a cookie, localStorage, or sessionStorage. It lives in a module-level variable, re-hydrated by calling `POST /auth/refresh` (the httpOnly, `SameSite=Strict` refresh-token cookie) on every app mount and silently on any `401` |
| **Decided by** | Engineering Lead (Phase 8 M1, following `Frontend_Architecture.md` section 8 / `Security_Architecture.md` section 4's own documented guidance) |

**Context:** `Frontend_Architecture.md`'s own documented `middleware.ts` example assumes the access token is readable from an `access_token` cookie at the edge — but the backend (Phase 4) only ever returns it in the login/refresh response body, never as a cookie, specifically so it's never exposed to a mechanism an XSS payload could read as easily as JS-visible cookies. Storing it in localStorage would have been the easy path but reintroduces exactly that XSS-exfiltration risk the backend's design already avoids.

**Decision:** Keep the access token in memory only (lost on a full page reload, as designed); rely on the refresh-token cookie (httpOnly, so JS -- and XSS -- cannot read it at all) to silently obtain a new one on mount. The `user` object returned alongside login/register (name/email/verification status only, no token) is cached in `localStorage` purely for instant display, and is never treated as an authorisation source.

**Consequence:** `Frontend_Architecture.md`'s documented middleware example doesn't apply as written -- corrected by DEC-024 below, which explains the actual working route-guard mechanism.

---

### DEC-024 — Route guard checks for `csrf_token`'s presence, not `refresh_token`'s

| Property | Value |
|---|---|
| **Date** | 2026-07-28 |
| **Decision** | `apps/web/src/proxy.ts` (Next.js 16's renamed `middleware.ts`) redirects to `/login` when the `csrf_token` cookie is absent, not `refresh_token` |
| **Decided by** | Engineering Lead (found live while testing Phase 8 M1's route guard against real login cookies) |

**Context:** The backend scopes `refresh_token` to `path=/api/v1/auth` (`cookies.ts`) -- deliberately narrow, so the credential is never sent to paths that don't need it. That means the browser never attaches it to a request for e.g. `/home` in the first place; a middleware check for its presence would always see it absent regardless of login state, unconditionally redirecting every authenticated user to `/login`. Confirmed live: inspecting real `Set-Cookie` headers from an actual login call showed `refresh_token`'s `Path=/api/v1/auth` and `csrf_token`'s `Path=/` side by side.

**Decision:** `csrf_token` is set and cleared in the exact same `setAuthCookies()`/`clearAuthCookies()` calls as `refresh_token`, but scoped `path=/` -- it doubles as a working "has an active session" presence check without weakening anything, since it was already a non-httpOnly, JS-readable value by design (the CSRF double-submit pattern requires that). This is a UX heuristic only, avoiding a flash of the dashboard shell for a browser with no session at all; `Frontend_Architecture.md` section 8's principle that client-side authorisation is UX, not security, still applies -- the real gate is the `(dashboard)` layout's client-side check against `AuthProvider`'s actual refresh result, and the API enforces authorisation regardless of either.

**Consequence:** None -- this is strictly an internal implementation correction to make the documented "route guard" deliverable actually work against this project's real cookie scoping, not a security-relevant tradeoff.

---

### DEC-025 — OAuth login buttons and callback handler deferred, matching Phase 4's own unverified status

| Property | Value |
|---|---|
| **Date** | 2026-07-28 |
| **Decision** | Phase 8's Login page implements email/password only; Google/GitHub OAuth buttons and the OAuth callback handler are not built |
| **Decided by** | Engineering Lead (Phase 8, following the repo owner's explicit requirement list, which named Login/Registration/Password reset/Email verification/Session persistence/Logout but not OAuth) |

**Context:** Phase 4's own status has always noted its OAuth routes are "code-complete against `@fastify/oauth2`; not yet exercised against real provider credentials -- no OAuth app has been provisioned." That remains true. Building OAuth UI now would add code that can't be live-verified against a real Google/GitHub app, the same category of gap as RISK-01/RISK-02/TD-023 elsewhere in this document, and the repo owner's Phase 8 requirement list didn't ask for it.

**Decision:** Defer OAuth buttons and the callback handler until real OAuth app credentials are provisioned (same blocker as Phase 4's), rather than shipping unverifiable UI.

**Consequence:** `ROADMAP.md`'s Phase 8 "Login: email/password + Google + GitHub OAuth buttons" and "OAuth callback handler" tasks are marked not done rather than silently checked off — see TD-024.

---

### DEC-026 — Plan-limit constants promoted from `apps/api/src/lib/plan-limits.ts` to `packages/shared/src/plans.ts`, given a real build path

| Property | Value |
|---|---|
| **Date** | 2026-07-29 |
| **Decision** | `PlanTier`/`PlanLimits`/`PLAN_LIMITS` moved to `packages/shared/src/plans.ts` (extended, not duplicated) so `apps/web` can consume the same constants at build time (pricing page, Milestone 4's `PlanGate` component); `packages/shared` given the same `tsconfig.build.json`/`dist/`-output treatment BLK-004 gave `packages/db` |
| **Decided by** | Engineering Lead (Phase 9 architecture review, `docs/reviews/billing/02-consistency-review.md` §1) |

**Context:** an earlier architecture draft proposed a *second*, independent `PLAN_LIMITS` definition in `packages/shared` with different field names and a different "unlimited" sentinel (`-1` instead of the already-live `null`) — directly against the instruction to reuse Phase 5's plan-limit enforcement rather than duplicate it. Cross-checked against the real `apps/api/src/lib/plan-limits.ts` (already imported by 5 call sites) before writing any code.

**Decision:** move the existing file, don't duplicate it. Field names and the `null` sentinel are unchanged; all 5 call sites updated to import from `@viralscopes/shared`. Since `apps/api`'s production Docker image would otherwise dangle on the new workspace symlink exactly the way BLK-004 documented for `packages/db`, `packages/shared` got the identical fix pre-emptively (`tsconfig.build.json`, `package.json` `main`/`types` pointing at `dist/`, two new `COPY` lines in `Dockerfile.api`) rather than deferring it to when the bug would otherwise resurface. Verified: `apps/api`'s production image was rebuilt and booted against real dev Postgres/Redis; `/health` and `/ready` both returned healthy from inside the container.

---

### DEC-027 — Stripe objects are always stamped with `metadata.org_id`; webhook handlers never look up tenant context by provider ID before resolving it

| Property | Value |
|---|---|
| **Date** | 2026-07-29 |
| **Decision** | Every Stripe object `billing.service.ts`/`billing-provider.ts` creates (Checkout Sessions, and via `subscription_data.metadata`, the Subscriptions they produce) carries `metadata.org_id`; Checkout Sessions additionally carry `client_reference_id = org_id` |
| **Decided by** | Engineering Lead (found while designing `billing.repository.ts`, not assumed to be needed upfront) |

**Context:** `subscriptions`/`invoices` kept their existing RLS policy unchanged from migration 0003 (confirmed correct and sufficient by the architecture review). But a webhook handler resolving *which org* an event belongs to by looking up `provider_customer_id`/`provider_subscription_id` in the database first would hit exactly the chicken-and-egg RLS problem migrations 0006/0007 already solved for `sessions`/`oauth_accounts`/`organization_members` — a lookup-before-tenant-context query against an RLS-protected table returns zero rows under the restricted `app_user` role, not the row that exists.

**Decision:** avoid the problem entirely rather than extend the RLS-bypass precedent to a financial-data table. Every Stripe object created here is stamped with `org_id` at creation time, so every subsequent webhook event is self-describing — the handler reads `org_id` directly out of the event's own payload (`session.client_reference_id`, or `subscription.metadata.org_id`) and calls `withTenant()` immediately, exactly like an authenticated request would. No new RLS policy, no RLS bypass, and `docs/architecture/billing/04-database-design.md`'s claim that "no RLS change is needed for subscriptions/invoices" holds — provided this metadata-stamping discipline is followed by every future Stripe object creation (Milestone 2 onward).

---

## 12. Technical Debt Log

Technical debt is tracked here from the moment it is knowingly incurred. Each entry includes the reason it was accepted and a plan to resolve it.

---

### TD-001 — Single Server Deployment (Stage 1)

| Property | Value |
|---|---|
| **Logged** | 2026-07-20 |
| **Severity** | Medium |
| **Phases affected** | Phase 2, Phase 14 |
| **Status** | Accepted (intentional) |

**Description:** All services run on a single VPS at MVP launch. There is no horizontal scaling, no database read replica, and Redis is a single instance.

**Why accepted:** Stage 1 infrastructure is sufficient for 0–2,000 MAU and keeps costs under £900/month during the validation phase. Over-engineering infrastructure before product-market fit is a common and expensive mistake.

**Resolution plan:** Migrate to Stage 2 (separated services, managed Redis, read replica) when Stage 1 upgrade triggers are breached. Target: when MAU exceeds 2,000 or MRR exceeds £15k. See [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md).

---

### TD-002 — No Distributed Tracing at Launch

| Property | Value |
|---|---|
| **Logged** | 2026-07-20 |
| **Severity** | Low |
| **Phases affected** | Phase 2 |
| **Status** | Accepted (intentional) |

**Description:** The MVP monitoring stack (Prometheus + Grafana + Loki) does not include distributed tracing (OpenTelemetry). Diagnosing latency across the API → n8n → AI pipeline will require correlating logs by correlation ID rather than following a trace.

**Why accepted:** Distributed tracing adds operational complexity and cost that is not justified at MVP scale with a small team.

**Resolution plan:** Add OpenTelemetry instrumentation and Jaeger/Tempo at Stage 3. All services are built with `correlationId` on every log entry, making log-based correlation viable until then.

---

### TD-003 — PostgreSQL Full-Text Search (Not Typesense)

| Property | Value |
|---|---|
| **Logged** | 2026-07-20 |
| **Severity** | Low |
| **Phases affected** | Phase 5 |
| **Status** | Accepted (intentional) |

**Description:** The MVP uses PostgreSQL `tsvector` + GIN indexes for full-text search rather than a dedicated search engine (Typesense or Elasticsearch).

**Why accepted:** PostgreSQL full-text search is adequate for < 1 million video records and < 100 concurrent search requests. Adding Typesense at MVP would introduce operational complexity before it is needed.

**Resolution plan:** Migrate to Typesense when search query p95 exceeds 500ms or the video database exceeds 1 million records. See [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) Section 12.

---

### TD-004 — No Redis Persistence at Launch

| Property | Value |
|---|---|
| **Logged** | 2026-07-20 |
| **Severity** | Medium |
| **Phases affected** | Phase 2 |
| **Status** | Accepted (intentional) |

**Description:** The Stage 1 Redis instance runs in Docker without AOF (Append-Only File) or RDB persistence enabled. A Redis restart will lose all cached data, rate limit counters, and queue state.

**Why accepted:** Cache misses are acceptable — data will be re-fetched from PostgreSQL. Rate limit counters resetting is a minor issue at MVP scale. BullMQ jobs that are in-flight at restart will be re-queued by n8n.

**Resolution plan:** Migrate to managed Redis (Upstash or Redis Cloud) with AOF + RDB persistence at Stage 2. Queue data loss risk is eliminated with persisted Redis.

---

### TD-005 — Upstream High-Severity CVEs in Transitive Dependencies (Next.js bundled sharp/postcss, ESLint's minimatch chain)

| Property | Value |
|---|---|
| **Logged** | 2026-07-26 |
| **Severity** | Medium |
| **Phases affected** | Phase 1, Phase 2 |
| **Status** | Mitigated — production-aware CI gate live (Phase 2 Milestone 3) |

**Description:** `npm audit` reports high-severity CVEs: (1) `sharp`/`postcss` vulnerabilities bundled *inside* `next@16.2.12`'s own dependency tree (not something our `package.json` controls directly — no newer Next.js patch resolves it as of this writing), and (2) (originally) a `brace-expansion`/`minimatch` DoS reachable via `eslint@9.x`'s internals — fixed only in `eslint@10`, which `eslint-plugin-import` didn't support as a peer dependency at the time.

**Why accepted:** Both are dev-time-only or upstream-vendored issues with low practical exploitability in our context (ESLint runs locally over trusted source, not attacker input; the affected Next.js code paths are image-optimisation internals not currently exercised — no image processing exists yet). Forcing `npm audit fix --force` would downgrade to much older, more-vulnerable major versions (`next@9.3.3`, ancient `eslint`), which is a worse trade.

**Resolution:** `.github/workflows/security.yml`'s `dependency-audit` job now runs `npm audit --omit=dev`, which excludes the ESLint/devDependency chain from blocking entirely (it's dev-only). The 4 remaining production findings (all traced to Next.js's bundled `sharp`/`postcss`) are recorded in `.github/security/audit-allowlist.json` with a reason and a `reviewBy: 2026-10-26` date — the CI job fails if that date passes without re-evaluation, so this cannot silently persist forever. See DEC-009.

---

### TD-006 — Deferred Phase 2 infrastructure (needs real accounts/servers that don't exist yet)

| Property | Value |
|---|---|
| **Logged** | 2026-07-26 |
| **Severity** | Low |
| **Phases affected** | Phase 2, Phase 14 |
| **Status** | Accepted (intentional, deferred) |

**Description:** A handful of ROADMAP Phase 2 line items are written as config-as-code but never deployed or exercised live, because they depend on infrastructure that doesn't exist yet:
- Traefik + Let's Encrypt SSL (`infra/traefik/`) — untestable without a real public domain (ACME HTTP-01 challenge needs one)
- CI build-and-push to GHCR, deploy-to-Coolify-staging, deploy-to-Coolify-production — no Coolify server provisioned
- Alertmanager + PagerDuty routing — no PagerDuty account
- Prometheus scraping real service metrics / Grafana business dashboards — no service exposes `/metrics` yet (no routes/business logic exist before Phase 5)

**Why accepted:** This was scoped explicitly at the Phase 2 approval gate (before Milestone 1) rather than discovered late — see the chat log 2026-07-26. Building and testing any of these now would mean either faking the infrastructure they depend on or shipping unverifiable config.

**Resolution plan:** Traefik/SSL, GHCR push, and Coolify deploy activate naturally in Phase 14 (Production Deployment) once a server and domain are provisioned. Alertmanager/PagerDuty is a Stage 2 infrastructure trigger (`INFRASTRUCTURE_GROWTH_PLAN.md` §13.2), not an MVP blocker. Grafana dashboards get built incrementally as each phase's services actually expose `/metrics` (Phase 5 onward) — building them now against nonexistent metrics would just be broken panels.

---

### TD-007 — ADR files referenced but never created (pre-existing, not introduced by Phase 2)

| Property | Value |
|---|---|
| **Logged** | 2026-07-26 |
| **Severity** | Low |
| **Phases affected** | Pre-Development |
| **Status** | Accepted (deferred) |

**Description:** `README.md` and this document's DEC-001 through DEC-005 entries link to `docs/decisions/ADR-00N-*.md` files that were never written — these references predate Phase 1 (authored during Pre-Development) and Phase 2 didn't introduce or touch them. Found during Milestone 6's broken-reference audit.

**Why accepted:** Writing 5 substantive ADR documents (each requiring 2 approvals per `PROJECT_RULES.md`) is real, dedicated documentation work, not a quick fix — doing it as a side effect of Phase 2's deployment-readiness milestone would be scope creep.

**Resolution plan:** Author the missing ADRs as part of Phase 13 (Documentation), or opportunistically whenever a related architecture decision is revisited.

---

### TD-008 — No automated data-retention purge or partition-rotation jobs yet

| Property | Value |
|---|---|
| **Logged** | 2026-07-26 |
| **Severity** | Low |
| **Phases affected** | Phase 3, Phase 6, Phase 9 |
| **Status** | Partially resolved (Phase 9 Milestone 5) — `billing_events` retention done; everything else still accepted/deferred |

**Description:** `Database_Schema.md` §13/§18 and `ROADMAP.md`'s Phase 3 checklist call for automated nightly retention-purge jobs (transcripts, job_logs, usage_events, audit_logs, dead_letter_jobs) and a monthly partition creation/rotation job for `usage_events`/`job_logs`. Neither exists yet — only the structural pieces (partitioned tables, initial `2026_07`/`2026_08` partitions) were built.

**Partial resolution (Phase 9 Milestone 5, 2026-07-31):** `billing_events`' own 90-day retention purge is now live — `jobs/grace-period-expiry.job.ts`, run daily by a BullMQ repeatable job (`lib/billing-maintenance-queue.ts`), per `docs/architecture/billing/07-subscription-lifecycle.md`'s explicit decision to fold it into the same job as the grace-period sweep rather than invent a separate mechanism. This resolves exactly the `billing_events` slice of this TD's scope — `transcripts`, `job_logs`, `usage_events`, `audit_logs`, and `dead_letter_jobs` retention, and `usage_events`/`job_logs` partition rotation, are all still unbuilt and still blocked on the reasoning below.

**Why the rest is still accepted:** These are scheduled jobs — business logic/automation, not schema or data-layer structure — and were explicitly out of scope for Phase 3 per the approved scope ("schema and data layer only... no business logic"). n8n (the workflow engine most of these would naturally run on) exists as of Phase 6, but none of these specific jobs have been built on it yet.

**Resolution plan:** Implement the remaining tables' retention/rotation as n8n scheduled workflows (following `billing_events`' BullMQ-repeatable-job precedent if an in-process mechanism turns out to be preferred instead, per the reasoning `07-subscription-lifecycle.md` gives for billing specifically). Until then, `usage_events`/`job_logs` will need a manually-created partition past 2026-08, and no retention data is purged for those tables (acceptable at current data volumes — zero production traffic exists yet).

---

### TD-009 — Dead-letter admin endpoint and Grafana panel not built (API/monitoring surface, not schema)

| Property | Value |
|---|---|
| **Logged** | 2026-07-26 |
| **Severity** | Low |
| **Phases affected** | Phase 3, Phase 5 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 3 checklist also lists "Admin endpoint to inspect, retry, and dismiss dead-letter jobs" and "Grafana panel: dead-letter queue depth over time" under the same "Dead-Letter Queue" heading as the `dead_letter_jobs` table itself. The table (schema) was built; the endpoint (API) and panel (monitoring dashboard) were not.

**Why accepted:** An admin endpoint is API surface — explicitly excluded from Phase 3's approved scope. A Grafana panel needs a running API to query in the first place (same reasoning as TD-006's dashboard items).

**Resolution plan:** Admin endpoint lands with Phase 5 (Core Backend API) or Phase 11 (Super Admin Panel); Grafana panel follows once that endpoint exposes real data.

---

### TD-010 — Transactional email service not integrated (dev-only logging stub)

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Medium |
| **Phases affected** | Phase 4, Phase 9 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 4 checklist calls for a real transactional email provider (SendGrid or Resend) with 7 templates (welcome, email verification, password reset, member invitation, alert digest, billing confirmation, usage quota warning), SPF/DKIM/DMARC configuration, unsubscribe/preference management, and audit logging of every sent email. What actually exists is `createLoggingEmailService` (`apps/api/src/services/email.service.ts`): it logs the verification/reset URL (containing the plaintext single-use token) via `logger.warn` in development/test only, and throws at construction time if used in staging or production.

**Why accepted:** A real provider needs an account that doesn't exist yet — same category as TD-006's deferred infrastructure accounts. Building 7 branded templates and configuring sending-domain authentication is substantial, separable work from the auth logic itself, and the guard that refuses to run this stub outside dev/test prevents it from silently reaching a real user.

**Phase 9 note (confirmed through all 6 billing milestones, not just assumed):** this is the reason none of Phase 9's billing webhook handlers (checkout confirmation, payment-failed notice, grace-period-ended notice) send an email — every one of them was explicitly scoped as "email notifications: deferred" milestone over milestone, and this TD is the actual, single root cause. 2 of the 7 templates this TD already covers (`billing confirmation`, `usage quota warning`) are billing's own — no new template requirement was discovered, this TD's existing scope already accounts for billing.

**Resolution plan:** Provision a SendGrid or Resend account, implement the 7 templates, configure SPF/DKIM/DMARC on the sending domain, and wire sent-email audit logging — before any staging deployment that exercises real user signups.

---

### TD-011 — Organisation & Workspace Management not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Medium |
| **Phases affected** | Phase 4, Phase 9 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 4 checklist includes organisation CRUD, a member invitation flow (email invite → accept → join), member removal and role change with audit logging, multiple workspace support per organisation, project management within workspaces, and an ownership transfer flow. None of this exists. `findActiveOrgContext` (`apps/api/src/repositories/org-membership.repository.ts`) only reads the first `organization_members` row for a user — sufficient to embed `orgId`/`orgRole`/`planTier` in the JWT for Phase 3's seeded dev org, but there is no API path for a user to create an organisation, invite anyone, or manage membership.

**Why accepted:** This is a distinct, sizeable feature area from session/credential management (the rest of Phase 4), and every account this phase can create is a single-org user (via seed data) — org-switching/multi-membership logic was explicitly out of scope per `org-membership.repository.ts`'s own comment.

**Resolution plan:** Build before Phase 9 (Billing), which the dependency graph (`ROADMAP.md` §6) marks as depending on both Phase 4 and Phase 5. Not required to start Phase 5's video/channel/trend endpoints, which can operate against the existing seeded org.

---

### TD-012 — RBAC middleware built but not wired onto any route

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 4, Phase 5 |
| **Status** | Resolved (Phase 9 Milestone 2) |

**Description:** `requireRole()` (`apps/api/src/middleware/require-role.ts`) is implemented — it reads `request.user.orgRole` (set by `authenticate` from the verified JWT) and enforces a role allowlist — but no route in this PR uses it. Service-layer permission checks (Layer 2 of the three-layer defence described in `Security_Architecture.md` §3) are likewise not demonstrated.

**Why accepted:** There is nothing to protect yet — Phase 4 built identity/session endpoints, not the org-scoped business resources (watchlists, alert rules, API keys, billing) that Layer-1/Layer-2 RBAC is meant to gate. Wiring `requireRole()` onto routes that don't exist would be unverifiable scaffolding.

**Resolution (Phase 5, 2026-07-27):** Every business route Phase 5 built now enforces authorization, live-verified — but not via literally calling `requireRole()`. Two new, purpose-fitted mechanisms replaced it: (1) service-layer `assertCanManage()` checks in `watchlist.service.ts`/`alert.service.ts` comparing `request.user.orgRole` against an allowlist AND the resource's `createdBy`, which `requireRole()`'s pure allowlist check can't express; (2) a new `requireSuperAdmin` middleware for platform-admin routes that reads `users.role` live from the DB rather than the JWT, since platform role (`super_admin`/`user`) and org role (`owner`/`admin`/`member`/`viewer`) are different concepts — see DEC-017. `requireRole()` itself remained unused dead code at this point; it was kept rather than deleted because it might still fit a future route shape with no ownership component — hence "partially," not fully, resolved.

**Resolution (Phase 9 Milestone 2, 2026-07-31):** `billing.routes.ts` is exactly that future route shape — billing mutations have a pure org-role dimension (Owner-only) with no per-resource ownership component to check. `GET /billing/subscription`, `POST /billing/checkout`, and `POST /billing/portal` now call `requireRole('owner')`/`requireRole('owner', 'admin')` directly, live-verified against all three org roles (owner: full access; admin: view allowed, mutation correctly blocked with `403 INSUFFICIENT_PERMISSIONS`; member: blocked from all three). `requireRole()` is no longer dead code.

---

### TD-013 — No audit-log writes for authentication events

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 4 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 4 Session Management group calls for "audit log for all auth events." The `audit_logs` table has existed since Phase 3, but nothing in `auth.service.ts` or `oauth.service.ts` writes to it — login, logout, registration, password reset, and OAuth linking all currently leave no audit trail beyond the structured Pino application logs (which are operational logs, not the queryable, retained audit record `audit_logs` is designed for).

**Why accepted:** Wiring a new table write into every auth code path is separable, mechanical follow-up work once the auth flows themselves were verified correct and secure — sequencing security-correctness first was the higher priority for this PR.

**Resolution plan:** Add `audit_logs` writes to `register`, `login`, `logout`, `refresh` (on rotation and on reuse-detection), `verifyEmail`, `resetPassword`, and both OAuth callback paths before Phase 4 is considered fully complete.

---

### TD-014 — YouTube API Quota Manager and video-analysis-triggering endpoints not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | High |
| **Phases affected** | Phase 5, Phase 6 |
| **Status** | Accepted (blocked, not deferred by choice) |

**Description:** `ROADMAP.md`'s Phase 5 checklist calls for a YouTube API Quota Manager (daily unit tracking against the 10,000/day free-tier limit, per-org quota allocation, cache-first strategy, RapidAPI/Apify fallback, admin override endpoint), plus `POST /videos/analyze`, `POST /videos/refresh`, and `POST /admin/quota/reset`. None of this was built.

**Why accepted:** This is not a scoping choice the way TD-015/016/017 are — it's blocked on **RISK-01** (§9), which this same document has carried as "Open — decision required before Phase 5 begins" since 2026-07-20 and was never resolved (no owner assigned, no paid-tier/RapidAPI/Apify evaluation done, no per-plan daily allocation defined). Building a quota manager or an analyze-trigger endpoint without that decision would mean inventing the strategy mid-implementation rather than implementing a decision that was actually made. Per-org daily quota allocation specifically depends on Phase 9's subscription/plan enforcement being real, which it also isn't yet.

**Resolution plan:** Resolve RISK-01 first (owner assignment, tier/vendor evaluation, ADR-006). Only then can the quota manager, analyze/refresh endpoints, and admin quota-reset be built against an actual decision instead of a guess.

---

### TD-015 — Unified search endpoint not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 5 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 5 checklist calls for `GET /api/v1/search` — unified cross-entity search with cursor-based pagination and "all filter types." Not built.

**Why accepted:** A genuinely unified search (videos + channels + trends + recommendations in one ranked result set) is a distinct piece of design work — what's searched, how relevance is ranked across heterogeneous entity types, and cursor-pagination semantics across a UNION are all open product questions, not implementation details. The individual entities are already searchable via their own list endpoints' filters (e.g. `channels`' `search` param).

**Resolution plan:** Design the cross-entity ranking/pagination contract, then implement — likely alongside or after TD-003's Typesense/full-text-search decision, since a real "search" experience benefits from the same infrastructure.

---

### TD-016 — Export endpoints not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 5 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 5 checklist calls for `POST /exports` (async, CSV/Excel/JSON/PDF), `GET /exports/:id` (status), and `GET /exports/:id/download` (signed S3 URL). Not built.

**Why accepted:** Needs Cloudflare R2/S3 wiring (DEC-006 selected R2, but no client/bucket is configured in `apps/api` yet — same unprovisioned-account category as TD-006) and an async job mechanism to generate the file, which doesn't exist before Phase 6's job runner.

**Resolution plan:** Wire an S3-compatible client once R2 is provisioned; implement export generation as an n8n-triggered (or equivalent) background job once Phase 6 lands.

---

### TD-017 — Webhook endpoints not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 5, Phase 9 |
| **Status** | Partially resolved (Phase 9 Milestone 3) — Stripe webhook handler done; outgoing alert-channel dispatch still deferred |

**Description:** `ROADMAP.md`'s Phase 5 checklist calls for a Stripe webhook handler (signature verification) and outgoing webhook dispatch for user alert channels. Neither existed at the time this was logged.

**Resolved (Phase 9 Milestone 3, 2026-07-31):** `POST /api/v1/webhooks/stripe` is live — Stripe-Signature HMAC verification, idempotent on `billing_events`, handles the 6 events the approved architecture defines. This closes the Stripe-webhook half of this TD entirely; see `PROJECT_STATUS.md`'s Milestone 3 write-up in §2 and the Status Update History for the full verification record.

**Still open — outgoing alert-channel webhook dispatch:** `alert_events.delivery_channel = 'webhook'` is already a valid value in the schema, but the dispatcher that would actually populate it isn't built yet. This is Phase 6's Alert Dispatch workflow's job, unrelated to Stripe/billing, and out of Phase 9's scope.

**Resolution plan:** Outgoing webhook dispatch lands with Phase 6's Alert Dispatch workflow, whenever that's picked up.

---

### TD-018 — OpenAPI/Swagger spec not published

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 5 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 5 API Foundation checklist calls for an auto-generated OpenAPI/Swagger spec at `/api/v1/docs` via `fastify-swagger`, generated from the Zod request schemas. Not built — endpoints are documented as a plain markdown reference table in `README.md` §4 instead.

**Why accepted:** Wiring `fastify-swagger` plus a Zod-to-OpenAPI schema converter correctly (and verifying the generated spec is actually accurate, not just present) is a self-contained, moderate-effort piece of work independent of any single endpoint's business logic — better done as one deliberate pass over all endpoints at once than bolted on incrementally.

**Resolution plan:** Add `fastify-swagger` + `zod-to-openapi` (or equivalent) and generate the spec from the same Zod schemas already used for request validation, so the two can never drift.

---

### TD-019 — Analytics viral-scores/engagement breakdowns not built

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 5 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `ROADMAP.md`'s Phase 5 checklist calls for `GET /analytics/viral-scores` (score distribution over time) and `GET /analytics/engagement` (engagement trends) alongside `GET /analytics/overview` (built). Only `overview` was implemented.

**Why accepted:** `overview` was built from data unambiguously scoped to the caller's org (watchlists, alert rules, alert events, API keys, usage). Viral scores and engagement metrics live on `videos`/`video_analyses` — global, shared-across-tenants content (see `videos.ts`'s own "no RLS" comment) — so an org-level breakdown of them requires a defined join (most plausibly via an org's watchlisted channels/keywords) that isn't specified anywhere in `Database_Schema.md` or `PRD.md`. Building it now would mean guessing a product decision (which videos "belong" to an org's analytics) rather than implementing a specified one.

**Resolution plan:** Define the org↔content attribution model (likely: videos matching an org's active watchlists) as a product decision, then implement both endpoints against it.

---

### TD-020 — 14 real business workflows not built (Video Discovery, AI Analysis Pipeline, etc.)

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Medium |
| **Phases affected** | Phase 6 |
| **Status** | Accepted (blocked, not guessable) |

**Description:** `ROADMAP.md`'s Phase 6 checklist lists 14 real business workflows: Video Discovery, Metadata Pipeline, Transcript Pipeline, Thumbnail Analysis, AI Analysis Pipeline, Title Formula Detection, Hook Classification, Engagement Analytics, Viral Score Engine, Trend Detection, Opportunity Engine, Ethical Recommendation Engine, Channel Intelligence, and Alert Dispatch. None are built. Only the queue/orchestration foundation and two infrastructure-proving workflows (`foundation-demo`, `heartbeat`) were delivered — see `docs/workflows/README.md`.

**Why accepted:** Every one of these needs live YouTube Data API and/or Anthropic/OpenAI API access this environment doesn't have credentials for, and each depends on a quota or cost strategy that's still unresolved: RISK-01 (YouTube API quota strategy, overdue since "before Phase 5 begins") and RISK-02 (AI cost model, overdue since "before Phase 6 begins" — see updated Status fields on both). Building any of the 14 now would mean guessing quota/cost/retry parameters rather than implementing a decided strategy, which is exactly the guessing this document's process is meant to avoid (see TD-014's identical reasoning for the Phase 5 YouTube Quota Manager). `foundation-demo.json` establishes the exact webhook-in/respond-with-`{success,message}` shape every one of these 14 will follow once unblocked, so the foundation isn't wasted work.

**Resolution plan:** Resolve RISK-01 and RISK-02, provision the needed API keys, then implement each workflow against `foundation-demo.json`'s template — validate `X-Service-Token` first, do the real work, always end in an explicit `{success, message}` JSON response (the BullMQ Worker's retry logic in `apps/api/src/lib/queue.ts` depends on that response shape).

---

### TD-021 — n8n runs single-instance ("regular" mode); no dedicated worker or Postgres-backed n8n storage

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 6 |
| **Status** | Accepted (deferred scaling work) |

**Description:** n8n runs in its default regular execution mode against its bundled SQLite storage (see DEC-019). `EXECUTIONS_MODE=queue` plus a separate `n8n worker` process plus Postgres-backed n8n storage — the setup `INFRASTRUCTURE_GROWTH_PLAN.md` describes as n8n's own scaling path — is not configured.

**Why accepted:** Live-tested queue mode without a worker and confirmed every execution hangs forever with nothing to consume it; n8n itself logs scaling mode as unsupported against SQLite. At current load (two infrastructure-proving workflows, no real traffic) regular mode is what n8n treats as fully supported, and standing up a second n8n process plus a storage migration is real infrastructure work with no current driver.

**Resolution plan:** When workflow volume or concurrency actually requires it (per `INFRASTRUCTURE_GROWTH_PLAN.md`'s own stage triggers), add a dedicated `n8n worker` service to both compose files, move n8n's own storage to Postgres, and re-enable `EXECUTIONS_MODE=queue`.

---

### TD-022 — n8n credentials store not populated (no external service keys configured)

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Low |
| **Phases affected** | Phase 6 |
| **Status** | Accepted (blocked on same dependency as TD-020) |

**Description:** n8n's built-in credentials store (for YouTube, Anthropic, OpenAI, etc.) has nothing configured in it. The two delivered workflows don't need external credentials — `foundation-demo` only checks a shared service token, and `heartbeat` only calls back into `apps/api`.

**Why accepted:** There's nothing to configure yet without the API keys TD-020 is also blocked on; populating placeholder credentials now would be untested, dead configuration.

**Resolution plan:** Populate n8n's credentials store as part of implementing each of TD-020's 14 workflows, using whichever secret each one actually needs.

---

### TD-023 — No AI provider credentials anywhere; prompt test harness, regression suite, and cost visibility blocked

| Property | Value |
|---|---|
| **Logged** | 2026-07-27 |
| **Severity** | Medium |
| **Phases affected** | Phase 7 |
| **Status** | Accepted (blocked, more fundamental than RISK-02) |

**Description:** Neither `ANTHROPIC_API_KEY` nor `OPENAI_API_KEY` is set anywhere in this environment (`.env.example` has both blank; the local `.env` has neither). This blocks three Phase 7 deliverables: the prompt test harness's actual AI-provider call ("select prompt + version → run against test video → view formatted output"), the 10-fixture regression suite `PROJECT_RULES.md` section 9.5 requires to run and block merge on every PR touching the AI pipeline, and any real AI cost estimate (`ai_cost_estimate_gbp_today` per `AI_Strategy.md` section 5.2) — cost can only be estimated from actual call volume and token counts, neither of which exist without live traffic.

**Why accepted:** This is a harder blocker than RISK-02 (AI cost model undecided) — even a decided cost model can't be exercised without credentials to call. Wiring the regression suite into CI now, per `PROJECT_RULES.md` section 9.5's letter, would either fail every PR (no keys) or, once keys exist as GitHub Secrets, spend real, uncontrolled money on every single push with no budget approval gate — directly contradicting `AI_Strategy.md`'s own "AI cost is a first-class constraint" principle. Cache hit-rate visibility (a real, measurable Redis-backed metric, live regardless of whether any AI call has ever happened) is delivered now; cost visibility is not fabricated as a placeholder number.

**Resolution plan:** Once API keys are provisioned and a budget/spend-alert threshold is approved (`AI_Strategy.md` section 3.3 Strategy 5's £30/day alert is the documented target), wire the regression runner into CI per `PROJECT_RULES.md` section 9.5, enable the prompt test harness's live AI-call leg, and add a real cost-estimate field to `GET /api/v1/admin/metrics`.

---

### TD-024 — Phase 8's ROADMAP.md coverage is 17/45; the rest is deferred for documented reasons

| Property | Value |
|---|---|
| **Logged** | 2026-07-28 |
| **Severity** | Low |
| **Phases affected** | Phase 8 |
| **Status** | Accepted (scoped explicitly by the repo owner, not silently dropped) |

**Description:** `ROADMAP.md`'s Phase 8 checklist has 45 tasks across Foundation, Authentication Pages, Onboarding Flow, Dashboard Pages, API Key Management UI, Changelog Page, and Charts. 17 are checked as a byproduct of building the repo owner's explicit, reduced Phase 8 requirement set (Application Shell, Authentication, Dashboard, CRUD for Watchlists/Alerts/API Keys/Profile/Organisation, Phase 7 AI integration, state management). Not built: the Onboarding flow (all 4 steps depend on org creation, which doesn't exist — TD-011); Trending/Videos/Video Detail/Channels/Trends/Opportunities pages, Search, Export, and all 5 chart types (backing tables are empty — TD-020 — or the endpoint doesn't exist — TD-015/TD-016); Billing/Team/Notifications settings (need Phase 9 and TD-011); the full Admin panel beyond the requested Prompt Library page (job logs/dead-letter/quota/system-health have no frontend); OAuth login buttons/callback (DEC-025); `next-intl` i18n; the Changelog page; and a cache-hit-rate display in any admin UI (the backend data is live, nothing renders it).

**Why accepted:** Every deferred item traces to either an explicit repo-owner scoping decision, a genuine backend gap logged elsewhere (TD-011/TD-015/TD-016/TD-020), or a credentials gap that can't be live-verified (OAuth, matching Phase 4's own unverified status). None were silently dropped — each is named in `ROADMAP.md`'s Phase 8 section with the specific reason.

**Resolution plan:** Revisit once the specific blocker for each item clears: TD-011 unblocks Onboarding and full Organisation settings; TD-020/RISK-01/RISK-02 unblock the content-dependent pages and charts; Phase 9 unblocks Billing settings; real OAuth app credentials unblock the OAuth UI. i18n, the Changelog page, and the rest of the Admin panel are product-priority decisions, not technical blockers, and can be scheduled independently whenever they're actually wanted.

---

### TD-025 — No separate API-key vs JWT-session request-authentication path

| Property | Value |
|---|---|
| **Logged** | 2026-07-29 |
| **Severity** | Low |
| **Phases affected** | Phase 5, Phase 9 |
| **Status** | Still open — requires a future phase; deliberately not built in Phase 9 Milestone 5 (see below) |

**Description:** Every authenticated request goes through the same JWT-session `authenticate` middleware today, regardless of whether it should "count" as billable API usage (Pricing_Strategy.md's Professional+ `apiRequestsPerDay`/`apiRateLimitPerMinute` limits describe API-key traffic specifically, not browser-session traffic). There is no code path that distinguishes the two. Found while designing Phase 9's `api_request` quota tracking (`docs/architecture/billing/08-feature-gating.md`) — the original architecture draft mis-cited this gap as "TD-014," which is actually an unrelated, pre-existing entry (YouTube API Quota Manager); corrected during the Phase 9 architecture review.

**Why accepted:** `api-key.service.ts`'s CRUD (create/list/revoke a key) was built in Phase 5, but nothing yet authenticates an *incoming* request via an API key rather than a JWT — that's a distinct, not-yet-built request-authentication path. Building `api_request` quota enforcement without it would mean quota-gating ordinary browser sessions, which Pricing_Strategy.md never describes.

**Milestone 5 status (2026-07-31):** Explicitly re-confirmed still blocked, not silently dropped. Milestone 5 ("Feature Enforcement") connected the *existing* count/flag-based checks (watchlists, alert rules, API-key `apiAccess`) to live subscription state, but deliberately did not build `checkQuota`/API-key-authentication infrastructure — there is still no real endpoint that would consume `api_request` quota tracking (this TD), nor `export_created` (TD-016, `/exports` doesn't exist) or `video_analyzed` (TD-014/TD-020, no analysis pipeline). Building the Redis quota-counter machinery ahead of any of these three real dependencies would be inventing infrastructure with nothing to attach it to.

**Resolution plan:** Build an API-key request-authentication middleware (validate `sha256(key)` against `api_keys`, resolve org/plan context from it) before wiring `api_request` quota tracking — this is real, scoped future-phase work, not tied to a specific already-completed Phase 9 milestone. Until then, `api_request` quota enforcement is a documented no-op, not a silently-skipped requirement.

---

### TD-026 — Webhook handler writes are not wrapped in a single atomic database transaction

| Property | Value |
|---|---|
| **Logged** | 2026-08-01 |
| **Severity** | Low |
| **Phases affected** | Phase 9 |
| **Status** | Reviewed and accepted (Phase 9 Milestone 6 hardening review) |

**Description:** Every `WebhookService` handler (`webhook.service.ts`) makes several separate, sequentially-awaited database calls — e.g. `handleCheckoutCompleted` calls `upsertSubscriptionForOrg` (its own `withTenant()` transaction), then `updateOrganizationPlan` (a separate plain update), then `auditLog` (its own separate `withTenant()` transaction), then `recordBillingEvent` (a separate insert/upsert) — rather than all four running inside one shared database transaction. A process crash or dropped connection between any two of these steps could leave the database in a state where, e.g., the subscription row was updated but `organizations.plan` wasn't, or the state mutation succeeded but no `billing_events` row was ever written for it.

**Why accepted, not fixed:** Found and deliberately not refactored during Milestone 6's reliability review, for concrete reasons rather than by default: (1) every individual write is itself atomic and idempotent by construction (`upsertSubscriptionForOrg` is a real upsert; re-running any handler with the same input converges to the same end state), so a partial-failure retry self-corrects rather than compounds; (2) the actual worst discovered consequence — a crash after a real state mutation but before `recordBillingEvent` runs, which would previously have permanently blocked that event from ever being reprocessed — was found and fixed directly in this same milestone (see the Milestone 6 write-up in §2: the idempotency check no longer treats a `'failed'` `billing_events` row as terminal, and `recordBillingEvent` is now a real upsert, not a plain insert, specifically so a reprocessed event can update its own row); (3) wrapping every handler's full write sequence in one shared transaction would require every repository function involved (`upsertSubscriptionForOrg`, `updateOrganizationPlan`, `auditLog`, `recordBillingEvent`) to accept an optional pre-existing transaction handle rather than always opening its own via `withTenant()` — a real, broader architectural change across every consumer of these functions (including the non-webhook call sites in `billing.routes.ts`/`billing.service.ts`), not a small addition, and disproportionate to make in a hardening pass without a second, independently-reproduced failure mode beyond the one already fixed.

**Resolution plan:** Revisit if a concrete failure mode beyond the one already closed is ever found in production (e.g. via real webhook-processing error-rate monitoring, not built yet — see TD-002). If so, the fix is to thread an optional `tx` parameter through `billing.repository.ts`'s write functions and have each `WebhookService` handler open one transaction per event, passing it through every call.

---

## 13. Known Issues

*No known issues have been logged yet. Development has not started.*

### Known Issue Template

When a known issue is identified, log it in this format:

```
### KI-NNN — [Short title]
- **Logged:** YYYY-MM-DD
- **Severity:** Critical / High / Medium / Low
- **Type:** Bug / Performance / UX / Security
- **Affects:** [Component or feature]
- **Description:** [Clear description of the issue]
- **Reproduction steps:** [How to reproduce]
- **Workaround:** [Temporary workaround if any]
- **Fix planned:** [Yes / No / Investigation needed]
- **Target fix version:** [v1.x / v2.x / TBD]
- **Status:** Open / In Progress / Fixed
- **Fixed in:** [commit hash or version — fill in when resolved]
```

---

## 14. Next Priorities

### This Week (Week of 2026-07-26)

| Priority | Task | Owner | Notes |
|---|---|---|---|
| 🔴 P1 | Decide YouTube API quota strategy (RISK-01) | Engineering Lead | Overdue — target was "before Phase 5 begins" (Week 6); Phase 5/6/7 all proceeded without it by scoping out everything that depends on it (TD-014, TD-020) rather than guessing |
| 🔴 P1 | Run AI cost model prototype — sample 100 videos, measure actual cost (RISK-02) | Engineering Lead | Overdue — target was "before Phase 6 begins" (Week 9); blocks TD-020's 14 real workflows and TD-023's Phase 7 AI-call verification |
| 🔴 P1 | Provision `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` | Repo owner | TD-023 — neither exists anywhere in this environment; blocks the Phase 7 test harness/regression runner's AI-call leg regardless of RISK-02's outcome |

### Next Up — Phase 9/10/11 kickoff

| Priority | Task | Owner | Notes |
|---|---|---|---|
| 🔴 P1 | Organisation & Workspace Management: org CRUD, invite flow, member management | Engineer | TD-011 — now blocks Phase 8's onboarding flow, full Organisation settings, and Phase 9's billing-per-organisation model simultaneously; the highest-leverage single item outstanding |
| 🔴 P1 | Resolve RISK-01 (YouTube quota strategy), RISK-02 (AI cost model), and provision AI provider keys (TD-023) | Engineering Lead | Unblocks TD-020's 14 real workflows and Phase 7's remaining AI-call verification together |
| 🟠 P2 | Begin Phase 9 (Billing), Phase 10 (Security), and/or Phase 11 (Admin Panel) | Engineer | Phase 9/10 depend on Phase 5 only, independent of each other; Phase 11 depends on Phases 5/6/9, per `ROADMAP.md` §7 |
| 🟠 P2 | Transactional email service: provision SendGrid/Resend, build 7 templates, SPF/DKIM/DMARC | Engineer / Repo owner | TD-010 — needed before any staging deployment with real user signups |
| 🟡 P3 | OpenAPI/Swagger spec generation | Engineer | TD-018 |
| 🟡 P3 | Add `audit_logs` writes to all auth code paths | Engineer | TD-013 |
| 🟡 P3 | Provision a real Coolify server + domain, hosted Supabase project | Repo owner | Unblocks TD-006 and the hosted-Supabase item in TD-009's category |
| 🟡 P3 | Dedicated `n8n worker` + Postgres-backed n8n storage | Engineer | TD-021 — only needed once real workflow volume justifies it |
| 🟡 P3 | Provision a real Google/GitHub OAuth app | Repo owner | Unblocks DEC-025's deferred OAuth login UI, same gap Phase 4 has had since it was built |

### Backlog (Next 4 Weeks)

- Resolve TD-011 (Organisation & Workspace Management) — unblocks the most other outstanding work of any single item
- Resolve RISK-01/RISK-02/TD-023, then implement TD-020's 14 real business workflows against `foundation-demo.json`'s template and enable Phase 7's AI-call verification + CI regression gate
- Begin Phase 9 (Billing), Phase 10 (Security), and/or Phase 11 (Admin Panel) per `ROADMAP.md`'s parallel-development notes
- Phase 8 remainder once unblocked: Onboarding flow (TD-011), Trending/Videos/Channels/Trends/Opportunities/Search/Export/charts (TD-020/015/016), Billing/Team settings (Phase 9/TD-011), full Admin panel, OAuth UI
- Phase 5 remainder once unblocked: YouTube Quota Manager + analyze/refresh (needs RISK-01), Search, Export (needs R2 provisioning), Webhooks (needs Phase 9), OpenAPI spec, Analytics viral-scores/engagement
- Phase 4 remainder: Transactional Email Service, Organisation & Workspace Management, auth audit logging
- First stakeholder demo: staging environment with auth + a working dashboard (target: Week 6, now genuinely achievable for the seeded/admin org)

---

## Status Update History

| Date | Updated by | Summary |
|---|---|---|
| 2026-07-20 | Engineering Lead | Initial document created. Pre-development phase complete. All 8 project documents authored. Development not yet started. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 1 — Foundation & Project Setup: 14/14 tasks complete (monorepo scaffold, tooling, design tokens, brand assets, env vars, README, branch protection). BLK-001 (branch protection unenforceable without GitHub Pro) resolved as an accepted limitation. BLK-002 (`main` deleted from remote, default branch pointed at stale `develop`) discovered and resolved same day — `main` restored, `develop` fast-forwarded to match. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 2 — Infrastructure & DevOps: Milestones 1-3 of 6 complete. M1 Docker (Dockerfiles, docker-compose dev/prod, health checks, monitoring config — all verified running, not just written). M2 GitHub Actions CI (lint/type-check/build/format/secretlint, verified on real push, PR, and branch runs). M3 Security (production-aware npm audit policy with a reviewed allowlist; CodeQL and Dependency Review built, tested, found blocked by GitHub Advanced Security on the then-private repo, then re-verified working after the repo owner made the repo public — DEC-008). BLK-003 (branch protection enforcement conflicting with solo-maintainer self-approval) discovered and resolved via admin bypass, already present on the rulesets. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 2 Milestone 4 (Environment & Secrets) complete: `.env.example` reorganised into required-now/optional-now/required-starting-phase-N categories, restored `S3_FORCE_PATH_STYLE` and added `PORT`/`APP_VERSION` (both real, previously undocumented). Zod-based startup validation added to `apps/api/src/config.ts` — verified to fail fast with a specific error on invalid `PORT`/`APP_ENV`, and to pass a custom `APP_VERSION` through to `GET /health` (DEC-010). `.gitignore`'s env-file pattern replaced with a catch-all (`.env.*` + explicit `.env.example` exception), verified against 4 real cases. `.env.example` removed from `.secretlintignore` and confirmed it still passes secretlint — it's now actually scanned, not exempted. README §5/§7/§8 corrected: no environment variables are actually required to boot the app shell today (previously claimed `DATABASE_URL`/`JWT_SECRET`/etc. were required — they aren't, nothing reads them yet), and a second stale "PostgreSQL" reference in §8 (missed in Milestone 1) fixed. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 2 Milestone 5 (Monitoring & Health Checks) complete: added structured Pino logging (`apps/api/src/plugins/logger.plugin.ts`) with `service`/`version`/`environment` base fields, ISO timestamps, and PII/secret redaction — all verified directly against actual log output, not assumed (redaction confirmed on `password`/`email`/`name`/`ip_address`; `LOG_LEVEL=error` confirmed to suppress `warn`/`info`; Pino's error serializer confirmed unaffected). `LOG_LEVEL` added to the Zod config schema (DEC-011). Re-verified (not just trusted from Milestone 1) that both Docker images still build and report `healthy`, and that all 6 `docker-compose.dev.yml` services (Redis, n8n, MinIO, Prometheus, Grafana, Loki) start cleanly and respond correctly — the monitoring stack remains explicitly optional, not required for `npm run dev`. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 2 Milestone 6 (Deployment & Release Readiness) complete — **Phase 2 is now fully complete (6/6 milestones)**. Verified a genuinely fresh `git clone` builds cleanly end-to-end (lint/type-check/build/format all pass); found and fixed a real Windows `MAX_PATH` false-negative (test location artifact, not a code defect — confirmed by retrying in a short path) and a real, recurring `core.autocrlf` false-positive affecting `format:check` on every fresh Windows checkout, root-caused and fixed with a new `.gitattributes` file (verified via a second fresh clone: 47 previously-flagged files now check out clean). Audited all core docs for broken references — found 6 pre-existing (Pre-Development-era) links to ADR documents and a GDPR guide that were never written; not introduced by Phase 2, logged as TD-007 rather than silently ignored or hastily fabricated. TD-006 logged for the infrastructure explicitly deferred at the Phase 2 approval gate (live Traefik/SSL, Coolify deploy, PagerDuty, real Grafana dashboards) so it's tracked forward, not forgotten. |
| 2026-07-26 | Engineering (AI-assisted) | Phase 3 — Database & Core Schema (schema/migrations/seeds layer) complete, per approved scope of schema and data layer only. Recovered and verified the pre-reset Drizzle schema (26 tables, commit `b747f97` + 2 fix-up commits) against the current `Database_Schema.md`; implemented as 4 hand-written, reversible SQL migrations applied by a custom runner (`packages/db/src/migrate.ts` — DEC-013, since `drizzle-kit` has no rollback command). Found and fixed a real doc/reality mismatch: `Database_Schema.md` §12 documented Supabase Auth's `auth.uid()` RLS pattern, inconsistent with the project's own custom-JWT auth (confirmed against `Security_Architecture.md` §5, `PRD.md` FR-43) — corrected to the `current_setting()` session-variable pattern actually implemented. Functionally verified RLS (not just "enabled"): an initial test returned all tenants' rows because Postgres superusers/table owners bypass RLS unconditionally — fixed by adding a dedicated, unprivileged `app_user` role (DEC-014), re-verified with real per-tenant isolation and fail-closed behaviour with no tenant context set. Local Postgres via a plain container, not the Supabase CLI (DEC-012). Full clean-slate cycle verified against a live Postgres instance: `db:reset` → `db:migrate up` → `db:setup-roles` → `db:seed` (and re-seed, confirming idempotency) → `db:migrate down 4` (clean teardown) → `db:migrate up` again (reproducibility). Retention/partition-rotation automation and the dead-letter admin endpoint/Grafana panel are business logic/API surface, explicitly out of scope — logged as TD-008/TD-009, not silently dropped. ERD source written as Mermaid (`docs/database-erd.mmd`); PNG export failed on a broken local `mermaid-cli`/`puppeteer-core` dependency resolution — an environment issue, reported as such rather than claimed done. |
| 2026-07-27 | Engineering (AI-assisted) | Phase 4 — Authentication & Authorisation: Authentication and Session Management task groups merged to `main` (PR #16, squash commit `0bb43eb`) — JWT + refresh-token session management, email/password auth with bcrypt/lockout/common-password blocklist, Google/GitHub OAuth, email verification, password reset, CSRF double-submit, Redis-backed rate limiting, active-session listing and remote revocation. A pre-merge security review found and fixed two issues before merge: a login response that let an attacker confirm a guessed password was correct for an unverified account without completing login (DEC-015), and OAuth sign-in silently auto-linking to an existing but unverified local account, a pre-account-hijack pattern (DEC-016) — both live-verified against a real Postgres/Redis instance, not just type-checked. CodeQL's Advanced Security scan additionally flagged missing rate limiting on `/logout` and both OAuth callbacks as high severity; fixed before merge rather than bypassing the check. Merged via the REST API per BLK-003's documented resolution (`gh pr merge --admin` still doesn't invoke the configured bypass correctly). Corrected this document's Phase 4 task count from an unreconciled placeholder (26) to the actual `ROADMAP.md` checklist total (31); 9 of 31 are complete. Transactional Email Service, RBAC route/service-layer enforcement, and Organisation & Workspace Management remain and are logged as TD-010 through TD-013 — Phase 4 is **not** fully complete, but Phase 5 (Core Backend API) can begin per the dependency graph, since the specific auth primitives it needs (JWT verification, session management, RBAC middleware scaffolding) are in place. Deleted the merged feature branch; confirmed only `main`/`develop` remain and no open PRs reference it. |
| 2026-07-27 | Engineering (AI-assisted) | Phase 5 — Core Backend API: 36 of 57 `ROADMAP.md` tasks implemented and live-verified against real Postgres/Redis (corrects this document's earlier placeholder count of 58). Delivered: paginated Videos/Channels/Trends/Opportunities reads (global content), org-scoped Recommendations reads, full Watchlist and Alert Rule CRUD with plan-tier quota enforcement (`Pricing_Strategy.md` §2.6/§3) and creator-or-org-manager write authorisation, Alert Events reads, API Keys CRUD (sha256-hashed, plaintext shown once, plan-gated), Usage and Analytics-overview endpoints, and Admin endpoints (users/organizations/jobs/dead-letter/metrics) behind a new `requireSuperAdmin` middleware that reads `users.role` live from the DB rather than the JWT (DEC-017) — this is what actually puts Phase 4's RBAC pattern into practice for the first time (TD-012, now partially resolved). `withTenant()`, built in Phase 3 and never called until now, is wired into every org-scoped query. Added plan-tier-aware Redis rate limiting reusing the `planTier` JWT claim. Found and fixed two real bugs during live verification, not just type-checking: a `z.coerce.boolean()` query-param bug that silently coerced the literal string `"false"` to `true` (affecting the dead-letter and trends filters), and a rate-limit fallback bug that gave Free/Starter tiers the generous Enterprise ceiling instead of the intended conservative one — both confirmed via before/after live HTTP requests against dedicated test fixtures (cleaned up afterward). Deliberately did not build: the YouTube Quota Manager or `/videos/analyze`/`/refresh` (blocked on RISK-01, which this document flagged as "decision required before Phase 5 begins" on 2026-07-20 and which was never resolved — logged as TD-014 rather than guessing a quota strategy), unified Search (TD-015), Export (TD-016, needs R2 provisioning), Webhooks (TD-017, needs Phase 9), the OpenAPI/Swagger spec (TD-018, documented as a markdown table in README.md §4 instead), and Analytics viral-scores/engagement (TD-019, undefined org↔global-content join). README.md's API reference and stale Phase-4-era environment-variable descriptions (`DATABASE_APP_URL`/`REDIS_URL` were described as "not yet consumed" — inaccurate since Phase 4) were corrected. Docker-verified `apps/api`'s production image per Phase 5's verification requirements — found and logged BLK-004: the runner stage never copies `packages/db`, so the `@viralscopes/db` workspace symlink dangles and the container crashes on boot on the first database-touching request. Pre-existing since Phase 4 (the first phase to add a runtime dependency on `@viralscopes/db`), not introduced by Phase 5, and not fixed here — reported rather than silently expanding scope into deployment-infrastructure changes. Does not affect local/dev-mode operation, which is how Phase 4 and Phase 5 were both live-verified. |
| 2026-07-27 | Engineering (AI-assisted) | BLK-004 resolved: gave `packages/db` a real build path (`tsconfig.build.json`, `npm run build` emitting `dist/` with declarations) without disturbing its existing zero-build tsx dev workflow's underlying mechanism — only its package.json `main`/`types` now point at compiled output instead of source, which is a disclosed workflow change (packages/db must be rebuilt after source edits, in dev or Docker). `Dockerfile.api`'s builder stage now runs `turbo run build --filter=@viralscopes/api`, which turbo's own dependency graph expands to build `@viralscopes/db` first automatically; the runner stage now also copies `packages/db/dist` and its `package.json`, giving the workspace symlink a real target. Live-verified twice: rebuilt and booted the Docker image against real dev Postgres/Redis, ran a login + a Phase 5 endpoint + an admin endpoint entirely through the container (previously an instant `ERR_MODULE_NOT_FOUND` crash); separately re-ran `tsc --noEmit`/`eslint`/a full `tsx`-mode boot + login + endpoint call to confirm zero regression to local dev from the `package.json` change. |
| 2026-07-27 | Engineering (AI-assisted) | PR #17 (`feat/VS-phase5-core-backend-api`) opened for the Phase 5 feature commit (already-merged BLK-004 Docker fix stayed on `main` directly, per prior approval). CI's initial run failed: `turbo.json`'s `type-check` task lacked `dependsOn: ["^build"]`, so a fresh checkout ran `apps/api`'s type-check before `packages/db`'s new `dist/` existed (see BLK-004's resolution note in §8). Root-caused and fixed rather than bypassed — added the missing dependency, verified against a true fresh-build simulation, re-ran the full CI-equivalent sequence clean, pushed the fix as a second commit on the same PR. All required checks (CI, Dependency Audit, Dependency Review, both CodeQL runs) green; CodeQL explicitly reported no new alerts introduced by the PR's diff. |
| 2026-07-27 | Engineering (AI-assisted) | PR #17 squash-merged to `main` (commit `2341e50`) after confirming zero merge conflicts, no unresolved review comments, no new security findings, and that this document plus `CHANGELOG.md` accurately reflected the implementation. Verified `main` builds clean post-merge; `develop` fast-forwarded to match (`2341e50`, confirmed identical tip via `git ls-remote`); `feat/VS-phase5-core-backend-api` deleted from the remote, leaving only `main`/`develop`. Phase 5 retrospective: 36/57 tasks delivered and live-verified; the two real bugs found during Phase 5 verification (boolean query-param coercion, rate-limit tier fallback) and the CI build-order fix are the only defects the phase surfaced; TD-014 through TD-019 capture everything intentionally deferred, all blocked on RISK-01 or explicit product/infra decisions rather than left ambiguous. |
| 2026-07-27 | Engineering (AI-assisted) | Phase 6 — n8n Workflow Engine: 9 of 28 `ROADMAP.md` tasks implemented and live-verified against a real Docker Compose stack (Postgres, Redis, n8n, `apps/api`) — not merged yet, work is currently uncommitted directly on `main` pending a dedicated feature branch and PR, per the established Phase 5 workflow. Delivered: a real BullMQ producer/worker in `apps/api` (`lib/queue.ts`) that dispatches jobs to n8n webhooks and treats the HTTP response as the outcome, with custom retry backoff (0s/30s/5min, 4 attempts) and dead-letter transition on exhaustion — n8n never touches the queue directly, keeping all persistence/retry/business logic in the backend (DEC-018); `job_logs`/`dead_letter_jobs` writes wired to real job lifecycle events; a `requireServiceToken` middleware (timing-safe comparison) gating a new `/api/v1/internal/heartbeat` endpoint; an admin manual-trigger endpoint (`POST /api/v1/admin/jobs/:workflow/trigger`) and a genuinely-functional dead-letter retry (previously a stub); `/health`'s queue check now calls real `getJobCounts()` instead of returning a static placeholder; two n8n workflows (`foundation-demo.json` as the template every future workflow will follow, `heartbeat.json` as a scheduled liveness check) built, imported, and live-tested end to end including the full retry-to-dead-letter cycle. Found and fixed three real bugs during live verification: BullMQ rejects colon-delimited queue names despite `INFRASTRUCTURE_GROWTH_PLAN.md` documenting that convention literally; n8n's `EXECUTIONS_MODE=queue` hangs every execution forever without a separate `n8n worker` process, reverted to n8n's default regular mode (DEC-019, TD-021); n8n blocks `$env` access in node expressions by default, breaking both workflows' service-token checks, fixed via `N8N_BLOCK_ENV_ACCESS_IN_NODE`. Deliberately did not build the 14 real business workflows the roadmap lists (Video Discovery, AI Analysis Pipeline, etc.) — all blocked on RISK-01/RISK-02, neither of which has been resolved despite both being overdue — logged as TD-020 rather than guessed at; a dedicated `n8n worker`/Postgres-backed n8n storage (TD-021) and populating n8n's credentials store (TD-022) are deferred for the same reason or lack of current need. |
| 2026-07-27 | Engineering (AI-assisted) | PR #18 (`feat/VS-phase6-n8n-workflow-engine`) opened, all required checks (CI, Dependency Audit, Dependency Review, both CodeQL runs) green, squash-merged to `main` (commit `48b5247`). Verified `main` builds clean post-merge; `develop` fast-forwarded to match; the feature branch pruned from both remote and local, leaving only `main`/`develop`. |
| 2026-07-28 | Engineering (AI-assisted) | Phase 7 — AI Prompt Library & Versioning: all 7 of `ROADMAP.md`'s own checklist items complete (corrects an earlier placeholder count of 12) and live-verified as far as this environment allows. Delivered on `feat/VS-phase7-ai-prompt-library`, in three milestones (M1 prompt_library CRUD + seed, M2 Redis caching + admin metrics, M3 test harness + regression runner + docs), each type-checked/linted/built and live-verified against real Postgres/Redis/n8n before committing. Found and corrected a real doc inaccuracy before building anything: `ROADMAP.md`'s "8 prompts" included "transcript analysis" and "opportunity detection," neither of which is an AI prompt per `n8n_Workflow_Diagrams.md`'s own design (WF-03 is caption ingestion only; WF-11 is "no AI calls — purely computational ranking") — seeded the 6 real prompts instead, matching `AI_Strategy.md` §5.1 exactly (DEC-020). Built a prompt test harness and 10-fixture regression runner (`npm run ai:regression`) dispatched through the same queue→n8n pattern as Phase 6's workflows (`infra/n8n-workflows/prompt-test.json`) rather than a synchronous in-request AI call, per `PROJECT_RULES.md` §3.5. Found the same fundamental blocker Phase 6 hit for its 14 real workflows applies here too, more severely: no `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` exist anywhere in this environment (TD-023) — live-verified the entire pipeline up to that exact boundary by running a real test and watching it fail predictably (`n8n webhook responded 502`, then a genuine dead-letter row after the standard retry cycle) and, separately, verified the cache-hit path returns a pre-stored result immediately. Did not wire the regression suite into CI as `PROJECT_RULES.md` §9.5 literally specifies, since that would either fail every PR or spend real, unapproved money once keys exist — built as a standalone script instead, logged as part of TD-023 rather than silently deviating from the documented rule. |
| 2026-07-28 | Engineering (AI-assisted) | PR #19 (`feat/VS-phase7-ai-prompt-library`) opened, all required checks (CI, Dependency Audit, Dependency Review, both CodeQL runs) green with zero new alerts, squash-merged to `main` (commit `578d9f2`). Verified `main` builds clean post-merge; `develop` fast-forwarded to match; the feature branch pruned from both remote and local, leaving only `main`/`develop`. Phase 7 retrospective: 7/7 of its own `ROADMAP.md` checklist items delivered and live-verified as completely as this environment allows; the only genuine gap (TD-023, no AI provider credentials) is an external dependency, not an unbuilt task — every other phase's remaining debt (RISK-01/02, TD-010 through TD-022) is unaffected by this merge. |
| 2026-07-28 | Engineering (AI-assisted) | Phase 8 — Frontend Dashboard: delivered against the repo owner's explicit, reduced requirement set (Application Shell, Authentication, Dashboard, CRUD for Watchlists/Alerts/API Keys/Profile/Organisation, Phase 7 AI integration, state management) rather than `ROADMAP.md`'s full 45-task aspirational list — 17/45 checked as a byproduct (DEC-023–025, TD-024). Built in five milestones on `feat/VS-phase8-frontend`, each type-checked/linted/built and live-verified against the real running backend before committing. Delivered: backend CORS (`Security_Architecture.md`'s already-specified policy, never implemented before now); a typed API client with the access token held in memory only and session persistence via the httpOnly refresh cookie (DEC-023), never localStorage; hand-built design-system primitives on Radix + `cva` (shadcn's actual copy-source model, not a runtime dependency); login/register/verify-email/reset-password/logout (email/password only — OAuth deferred per DEC-025, matching Phase 4's own unverified-OAuth status); a responsive app shell and Home dashboard with an honest empty state for the no-organisation case (TD-011); full CRUD for Watchlists (optimistic delete), Alert Rules (+ read-only history), API Keys (one-time reveal), Profile (session management), and a deliberately read-only Organisation page; and an AI Prompt Library admin UI consuming every Phase 7 endpoint, including a test harness that honestly surfaces TD-023's expected queue→retry→dead-letter path rather than hiding it. Found and fixed three real bugs via live testing, not assumed: Turbopack rejects `.js`-extension relative imports that `tsc`'s Bundler mode tolerates; the backend hardcodes `/reset-password/confirm` for the password-reset link, not the flat path first built; `analytics/overview`'s `alertEvents.last30Days` is a per-status breakdown object, not a flat number. Test data (watchlists, alert rules, API keys, a second prompt version, ~30 accumulated sessions) cleaned up after each milestone's verification. |
| 2026-07-28 | Engineering (AI-assisted) | PR #20 (`feat/VS-phase8-frontend`) opened, all required checks (CI, Dependency Audit, Dependency Review, both CodeQL runs) green with zero new alerts. Before merging, investigated a separate report of 5 PostgreSQL errors (auth failure, `CREATE ROLE ... $1` syntax error, RLS violations on `sessions`/`watchlists`, a UUID empty-string error) — none reproduced against the current codebase; correlating the live Postgres container's own log timestamps against `git log` and `_migrations.applied_at` showed every entry was either already resolved by an existing, documented migration (`0006_identity_tables_no_rls.sql`/`0007_org_members_no_rls.sql`, both Phase 4, commit `0bb43eb`) or the setup-roles.ts literal-escaping approach (Phase 3, commit `8821aae`), or was self-inflicted by an earlier ad-hoc test command in this same session. Re-verified live in both directions: an unauthorized `watchlists` insert (no tenant context) correctly fails RLS; an authorized one (real `set_config` context) succeeds; two different real users each see only their own sessions via `GET /auth/sessions` despite `sessions` intentionally having RLS disabled (confirming the application-layer `user_id` filter, not the database, is the real boundary there, exactly as `0006` documents). No code changed as a result, since nothing reproduced. PR #20 then squash-merged to `main` (commit `e652bc8`). Verified `main` builds clean post-merge; `develop` fast-forwarded to match; the feature branch pruned from both remote and local, leaving only `main`/`develop`; zero open PRs; all checks (Lint/Type-check/Build/Format/Secrets, Dependency Audit, CodeQL) green on `main`'s latest commit, zero open CodeQL alerts. |
| 2026-07-29 | Engineering (AI-assisted) | Phase 9 (Billing) architecture phase: authored 14 documents (`docs/architecture/billing/`) covering system architecture, domain model, database design, API design, webhook design, subscription lifecycle, feature gating, security, environment, testing strategy, implementation plan, risk register, and open questions. Followed by an independent review pass (`docs/reviews/billing/`, 8 documents) cross-checking every claim against the real codebase rather than trusting the draft — found and corrected several real mismatches: RLS policies written against Supabase's `auth.uid()` (this project uses `current_setting()`); a JWT `role` claim assumed for Super Admin checks that doesn't exist (the real check, `require-super-admin.ts`, is a deliberate live DB read, DEC-017); a proposed `packages/shared/plans.ts` that duplicated rather than extended the already-live `apps/api/src/lib/plan-limits.ts`; four overlapping webhook idempotency mechanisms where one durable table suffices; a testing strategy assuming a Vitest/Playwright setup that doesn't exist anywhere in this repository; `stripe_webhook_events` named provider-specifically despite `subscriptions.billing_provider` already treating Stripe as one of four supported providers; and migration numbers/file paths drifted from the real repository state. Six required decisions were resolved (plan-limits location, billing-mutation RBAC sourced from Security_Architecture.md's actual permission matrix, single-table webhook idempotency, `api_request` quota scope, the grace-period expiry mechanism, and postponing `teamSeats`/`workspaces`/`promptLibraryAccess` enforcement) and all 14 architecture documents were corrected to match before any code was written. Committed directly to `main` (commit `04d2166`), matching the established pattern for documentation-only commits. |
| 2026-07-29 | Engineering (AI-assisted) | Phase 9 Milestone 1 (Billing Foundation) complete on `feat/VS-phase9-billing`: promoted `apps/api/src/lib/plan-limits.ts` to `packages/shared/src/plans.ts` (extended, not duplicated — DEC-026), gave `packages/shared` a real build path mirroring BLK-004's fix for `packages/db`, added migrations `0010`/`0011` (subscriptions' `billing_cycle`/`checkout_session_id` + partial unique index; the new `billing_events` webhook-idempotency table, no RLS per the migrations-0006/0007 precedent), `billing.repository.ts`, `billing.service.ts` (plan summary implemented; checkout/portal method signatures defined but not implemented — explicitly Milestone 2 scope), a `BillingProvider` interface + `StripeBillingProvider` implementation, and the `STRIPE_*` env vars (all optional). Found and fixed a real bug before it reached a live migration run: `CREATE UNIQUE INDEX CONCURRENTLY` cannot run inside a transaction block, and this project's migration runner wraps every migration in one — switched to a plain `CREATE UNIQUE INDEX`. Made an explicit design decision (DEC-027) to stamp every Stripe object with `metadata.org_id` at creation time specifically so webhook handlers never need to look up tenant context in the database before resolving it — avoiding an RLS-bypass precedent on a financial-data table. Live-verified, not assumed: migrations applied, rolled back, and re-applied cleanly against real dev Postgres; `type-check`/`lint`/`build` green across all 4 packages; the `apps/api` production Docker image rebuilt with the new `packages/shared` dependency and booted against real dev Postgres/Redis containers, with `/health` and `/ready` both returning healthy from inside the running container. No billing routes exist yet and no live Stripe account has been exercised — by design, Milestone 2's scope, not an oversight. |
| 2026-07-31 | Engineering (AI-assisted) | Phase 9 Milestone 2 (Checkout & Subscription APIs) complete on `feat/VS-phase9-billing`: `POST /api/v1/billing/checkout`, `POST /api/v1/billing/portal` (Owner only), `GET /api/v1/billing/subscription` (Owner+Admin), `GET /api/v1/billing/plan` (any org member) registered and implemented. `createCheckoutSession()` validates the plan is real and self-serve, re-checks the organisation against the database rather than trusting the JWT alone, blocks checkout into a non-upgrade when a real paid subscription already exists, resolves the Stripe Price ID from config, and reuses an existing Stripe Customer ID rather than creating a duplicate. `billing.routes.ts` is the first route in this codebase to actually call `requireRole()` — built in Phase 4, never wired to a route until now (TD-012, now resolved). Live-verified against the real seeded dev org and all three org roles (owner/admin/member, the last two via a temporary, reverted DB role promotion): every RBAC case, every validation-error case (invalid plan, missing fields), and the checkout pipeline's full validation path up through `502 STRIPE_ERROR` (no Price IDs configured, no live Stripe account exists) all behaved exactly as designed. RLS re-confirmed directly against Postgres in both directions on `subscriptions`, and confirmed absent (by design) on `billing_events`. `type-check`/`lint`/`build` green; the `apps/api` Docker image rebuilt and booted against real dev Postgres/Redis, with a real login and both GET billing endpoints verified working from inside the container. No webhooks, subscription-event processing, frontend UI, invoice sync, payment retries, cancellation automation, or emails — Milestone 3+ scope, not built here. |
| 2026-07-31 | Engineering (AI-assisted) | Phase 9 Milestone 3 (Webhooks) complete on `feat/VS-phase9-billing`: `POST /api/v1/webhooks/stripe` (unauthenticated, Stripe-Signature HMAC-verified, scoped raw-body content-type parser) and `WebhookService` handle exactly the 6 events the approved architecture defines (`checkout.session.completed`, `customer.created`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`) — trial-lifecycle events deliberately not implemented, since `Pricing_Strategy.md` states there is no trial in MVP and the instruction to implement only architecture-defined events governs. Idempotency via the Milestone-1 `billing_events` table (checked before dispatch); database writes never trust client-side state (plan/status/period/cancellation all resolved from the Stripe event payload, per DEC-027); failures recorded to `billing_events` and the existing (Phase 6) `dead_letter_jobs` table, always answering Stripe 200 to avoid needless retries; a new `auditLog()` helper (`lib/audit-log.ts`) writes the first real `audit_logs` rows this codebase has produced. Found and fixed two real issues during live verification, not just type-checking: `subscriptions.canceled_at` existed in the schema but no code path ever set it — added `canceledAt` to `UpsertSubscriptionInput` and threaded it through all 5 call sites; and confirmed (not a bug) that three initially "missing" rows during manual DB verification were RLS correctly hiding data from an unscoped `psql` session, not application defects. Live-verified using Stripe's own `webhooks.generateTestHeaderString()` (no live Stripe account, no network call) against a real running dev server: the full happy-path chain (checkout → invoice.paid → plan upgrade via subscription.updated → payment failure/grace period → cancellation) produced correct state in `subscriptions`/`invoices`/`organizations.plan`/`audit_logs`/`billing_events` at every step; duplicate delivery of the same event ID confirmed idempotent; invalid/missing signatures correctly rejected with 400 before touching `billing_events`; an unknown event type recorded as skipped; out-of-order delivery (`invoice.paid` before any subscription exists) handled gracefully with no crash. `type-check`/`lint`/`build` green across all 4 packages; the `apps/api` Docker image rebuilt and booted against the real dev Postgres/Redis compose network, with the webhook endpoint verified working end-to-end from inside the container. Corrected this document's Phase 9 task count from an unreconciled placeholder (22) to the actual `ROADMAP.md` checklist total (19); 10 of 19 now complete. A genuine, deliberate scope decision found while implementing (not assumed upfront): Stripe's auto-created Customer object during Checkout carries no metadata, so `customer.created` cannot resolve `org_id` without a database lookup-before-tenant-context that would break DEC-027's RLS approach — handled as an audit-only no-op instead. No frontend billing UI, invoice UI, billing analytics, or email notifications — Milestone 4+ scope, not built here. |
| 2026-07-31 | Engineering (AI-assisted) | Before starting Phase 9 Milestone 4, the repo owner reported the frontend was inaccessible: `http://localhost:3000/` showed only a static Phase 1 splash screen. Investigated and found `apps/web/src/app/page.tsx` was the unmodified Phase 1 scaffold (confirmed via `git log`, untouched since the initial monorepo-scaffolding commit), never wired to redirect to `/login`/`/home` once real pages existed from Phase 4 onward — not a Phase 9 regression, not a feature flag, not a middleware bug (`proxy.ts` correctly excludes `/` from its protected-route list, since nothing ever pointed there). Confirmed Phase 8 itself was genuinely complete and merged to `main` (`e652bc8`) — every real page (`/home`, `/watchlists`, `/alerts`, `/settings/*`, `/admin/prompts`) was reachable directly by URL, just not linked from `/`. Fixed with an instant client-side redirect mirroring `(dashboard)/layout.tsx`'s existing auth-gate pattern; verified against the real `/auth/refresh` endpoint's both branches (`401` unauthenticated → `/login`, `200` authenticated → `/home`) and confirmed live in a real browser by the repo owner. |
| 2026-07-31 | Engineering (AI-assisted) | Phase 9 Milestone 4 (Frontend Billing) complete on `feat/VS-phase9-billing`: `/settings/billing` added as a fourth Settings tab — current-subscription summary, usage & limits (reusing Phase 5's `GET /usage` as-is), a plan comparison table sourced directly from `@viralscopes/shared`'s `PLANS`/`PLAN_LIMITS` (Pricing_Strategy.md's actual source of truth, not re-typed), and an honest "not available yet" billing-history placeholder (no invoice-list endpoint exists). `apps/web` depends on `@viralscopes/shared` for the first time — `Dockerfile.web`'s build step switched to `turbo run build --filter=@viralscopes/web` so `packages/shared/dist` builds first, mirroring BLK-004's fix for `Dockerfile.api`. Checkout and the billing portal are redirect-only (create the session server-side, hand the tab to Stripe's hosted URL) — no Stripe.js/Elements/card fields anywhere in the frontend, per the explicit "no payment logic in the frontend" instruction. RBAC gates the queries themselves, not just the UI: a member never issues the `GET /billing/subscription` request the backend would 403 anyway; checkout/downgrade stay owner-only, matching `billing.routes.ts` exactly; downgrade routes to the billing portal rather than a second checkout call, since `createCheckoutSession` only accepts upgrades (Milestone 2). Live-verified against the real running backend, not mocked: all three billing response shapes (`/billing/plan`, `/billing/subscription`, `/usage`) confirmed to match the frontend's types; `502 STRIPE_ERROR`/`402 NO_BILLING_ACCOUNT` confirmed to surface through the error-toast path; member role confirmed `403` on `/subscription` vs `200` on `/plan`, matching the frontend's per-query gate. `type-check`/`lint`/`build` green across all 4 packages; `apps/web`'s Docker image rebuilt (first time depending on `packages/shared`) and booted against the real dev Postgres/Redis/`apps/api` compose network, with `/`, `/api/health`, and the `/settings/*` → `/login` middleware redirect all confirmed working from inside the container. Corrected `ROADMAP.md`'s "Billing UI embedded in Settings" item to checked (11/19 Phase 9 tasks now complete). No feature-limit enforcement beyond what Phase 5 already gates server-side, no billing emails, no invoice UI — Milestone 5+ scope, not built here. |
| 2026-07-31 | Engineering (AI-assisted) | Phase 9 Milestone 4 complete manual verification pass, requested before approving Milestone 5: re-confirmed all 14 checklist items against the real running backend rather than reusing Milestone 4's own report. Seeded real `usage_events` rows to confirm `UsageMeter`'s warning/error thresholds land exactly where expected (85% → warning, 100% → error, 4% → default); temporarily inserted a Stripe-backed `subscriptions` row to push the billing-portal request one level deeper than its default `402`, confirming it correctly reaches `503 STRIPE_ERROR` (Stripe not configured) — the deepest boundary reachable without a live Stripe account; temporarily promoted the seeded member to `admin` to independently re-verify the full 3-role RBAC matrix (owner: full access; admin: view-only, `403` on mutations; member: `403` on subscription/mutations, `200` on plan only) — all reverted afterward, confirmed via a final DB check that the seeded org is back to its exact original state. Confirmed "Organisation switching" cannot be tested because the feature doesn't exist yet (no org-switcher UI, single `orgId` per JWT — TD-011); confirmed "refresh preserves state" via both branches of the real `/auth/refresh` endpoint, the same mechanism every other page in this app already depends on. Stopped and restarted the real `apps/api` dev server mid-verification to exercise the error-state code paths against a genuine `ECONNREFUSED`, not a simulated one. `lint`/`type-check`/`build` re-run clean; Docker not re-run since no code changed this pass (Milestone 4's own report already covers a full rebuild+boot). No regressions found; no code changes were necessary. |
| 2026-07-31 | Engineering (AI-assisted) | Phase 9 Milestone 5 (Feature Enforcement) complete on `feat/VS-phase9-billing`: connected the existing Phase 5 plan-limit checks (`watchlist.service.ts`, `alert.service.ts`, `api-key.service.ts`) to real subscription state instead of the JWT's `planTier` claim, via a new `getEnforcedPlanTier()` (`lib/plan-enforcement.ts`) that reads the org's live subscription/plan from the database — per `docs/architecture/billing/02-system-architecture.md`'s "Option A" (JWT is a hint, DB is authoritative), never previously wired up. No new plan logic — same `PLAN_LIMITS`, same error codes; only the source of the plan value changed, so upgrades/downgrades/grace-period-expiry now take effect on the very next request rather than waiting up to 15 minutes for token refresh. Added a daily (06:00 UTC) BullMQ repeatable job (`jobs/grace-period-expiry.job.ts` + `lib/billing-maintenance-queue.ts`, an in-process task per the architecture's explicit rejection of an n8n workflow for this) that downgrades subscriptions whose grace period expired and purges `billing_events` older than 90 days, matching `07-subscription-lifecycle.md`'s resolved decision exactly — this keeps persisted state eventually-consistent for display, while the real-time enforcement boundary is `getEnforcedPlanTier()`'s own live grace-period check, active independent of the job's schedule. Found a genuine architectural gap while implementing: `subscriptions` has RLS, so no single query can scan every org's grace periods at once under the `app_user` role — resolved with a per-org loop using the existing `withTenant()`, not a new RLS-bypass precedent. Found and fixed a real bug during direct testing (not caught by type-check): `purgeOldBillingEvents` used a raw `sql` template that couldn't serialize a JS `Date` for the postgres.js driver — switched to drizzle's own `lt()` operator, matching every other timestamp comparison in this codebase. Frontend: `/settings/api-keys` now hides the "New API key" action using the real `apiAccess` flag from `GET /billing/plan` (existing keys remain visible/revocable regardless, matching the backend's own list-vs-create distinction); a new `UpgradeRequiredNotice` (proactive, for binary flags) and `PlanLimitErrorMessage` (reactive, for count-based `403`s) both link to `/settings/billing`. Deliberately did NOT implement the architecture's "Alert channel restriction (Starter+)" — the `deliveryChannels` field has no defined shape anywhere in the codebase and no UI to set it at all, so there is nothing real to validate against yet; building it now would be inventing new data-shape logic, not reusing existing infrastructure. Live-verified end-to-end against the real backend: created a watchlist at the Free-tier limit, confirmed the next was rejected, then — using the same still-Free JWT, no re-login — upgraded the org directly in the database and confirmed the next watchlist immediately succeeded, then downgraded and confirmed immediate re-rejection; repeated the same immediate-effect proof for API-key `apiAccess`; confirmed the live grace-period check overrides an as-yet-unprocessed `status='active'` subscription row the instant `grace_period_ends_at` is in the past; verified Enterprise (unlimited); ran the new job directly against the real database and confirmed correct persistence + audit logging + retention purge; re-confirmed RLS unaffected. `type-check`/`lint`/`build` green across all 4 packages; `apps/api`'s Docker image rebuilt and booted against the real compose network, full plan-check pipeline exercised from inside the container, maintenance queue started with no errors. No ROADMAP.md checkbox changes — this connects existing checks to real state rather than completing a new, separately-tracked item (11/19 Phase 9 tasks unchanged). No billing emails, no invoice UI, no new quota-tracking infrastructure for video_analyzed/api_request/export_created (still blocked on TD-020/TD-025/TD-016) — Milestone 6+ scope, not built here. |
| 2026-08-01 | Engineering (AI-assisted) | Phase 9 Milestone 6 (Hardening & Testing) complete on `feat/VS-phase9-billing` — **Phase 9 (Subscription & Billing) is now complete, all 6 milestones delivered.** A comprehensive security/reliability review of the entire billing implementation (not just this milestone's own code) found and fixed two real, previously-undiscovered issues, not theoretical ones: (1) a genuine, exploitable quota-bypass vulnerability in `handleSubscriptionUpdated` — Stripe's `customer.subscription.updated` can carry a terminal status (`canceled`/`unpaid`/`incomplete_expired`/`paused`) without the plan metadata text changing, and the existing `if (existing.plan !== plan)` guard meant `organizations.plan` never got reset to `free` in that case, permanently retaining paid-tier access for a canceled subscription that never went through `customer.subscription.deleted` — fixed by always syncing `organizations.plan` to the subscription's effective state, forcing `free` for any terminal status while deliberately excluding `past_due` to preserve the grace period's "retain current plan features" behavior; (2) a webhook idempotency/retry-safety bug — a `'failed'` `billing_events` row was treated identically to a `'processed'` one by the idempotency check, meaning any webhook that failed partway through could never be reprocessed again (not by Stripe, since the route always answers 200; not manually, since the idempotency check would just skip it) — fixed by only short-circuiting on `'processed'`/`'skipped'` and making `recordBillingEvent` a real upsert (`onConflictDoUpdate`) instead of a plain insert. Both fixes live-verified end-to-end: reproduced each bug first, then confirmed the fix, including a full regression pass inside a rebuilt Docker image. Additional hardening: the Stripe client now has an explicit 15s timeout (was the SDK's 80s default); `billing.service.ts` translates any provider-layer failure into the existing `502 STRIPE_ERROR` shape instead of leaking a generic 500; fixed a real, codebase-wide (not billing-specific) logging-hygiene gap where `errorHandlerPlugin` never logged `AppError` instances even at 5xx severity. Reviewed and consciously accepted (logged as TD-026, not silently dropped) a narrower, timing-dependent race-condition window in `upsertSubscriptionForOrg`'s non-locking SELECT-then-branch pattern — empirically didn't trigger under a genuine concurrent-delivery test, and even in the worst case the database's own unique constraint plus the new retry-safety fix mean it fails safely and recoverably rather than corrupting data. Comprehensive re-verification across the full authorization matrix (Free/Professional/Enterprise, expired-via-grace-period, cancelled, grace period, owner/admin/member), the complete webhook lifecycle (checkout/upgrade/downgrade/cancellation/renewal/failed-payment/grace-period/duplicate/invalid-signature/replay-timestamp-rejection/out-of-order/unknown-events), and confirmed via code review that no privilege-escalation path exists (no route touches `organization_members.role`; `requireRole()` never references platform `super_admin`). Reviewed every remaining billing-related technical debt item and classified each rather than silently dropping any: TD-008 (retention/rotation) partially resolved (`billing_events` done, rest still deferred), TD-010 (email) confirmed as the actual root cause of every "no billing emails" note across all 6 milestones, TD-017 (webhooks) marked resolved for Stripe specifically, TD-025 (API-key auth path) explicitly re-confirmed still blocked with no shortcuts taken, new TD-026 logged for the reviewed-and-accepted transactional-boundary/race-condition finding. `type-check`/`lint`/`build` green across all 4 packages; `apps/api`'s Docker image rebuilt and booted against the real compose network with the full webhook pipeline (including both fixes) re-verified from inside the container; production configuration (`docker-compose.prod.yml`'s `env_file` pattern, `.env.example`) confirmed sound. No live Stripe account exists in this environment, so real-provider-traffic verification remains the one genuinely unverifiable item across the entire phase — everything else was live-tested against a real running backend and real database, not assumed. |
| 2026-08-01 | Engineering (AI-assisted) | **Phase 9 closeout.** PR #21 (`feat/VS-phase9-billing`, 8 commits across all 6 milestones plus the unrelated root-page-redirect fix found during Milestone 4) opened against `main`. CI's `Lint, Type-check, Build, Format, Secrets` check failed on first run — `apps/api/src/routes/webhook.routes.ts` had drifted from Prettier's formatting rules since Milestone 3, uncaught locally because `format:check` specifically (as opposed to `eslint`/`type-check`) was never run in isolation during that milestone's own verification. Fixed with a pure-formatting commit, re-ran the full CI-equivalent sequence locally first, then confirmed all checks green on the PR (`Lint, Type-check, Build, Format, Secrets`, both `CodeQL` runs, `Dependency Audit`, `Dependency Review`) with zero open CodeQL alerts repo-wide. Squash-merged via the REST API per BLK-003's documented resolution (commit `6832590`). Verified `main` builds clean post-merge (`type-check`/`lint`/`build` re-run, not assumed); `develop` fast-forwarded to match and pushed; `feat/VS-phase9-billing` deleted from both remote and local (local deletion required `-D` since a squash-merged branch's commits are never literal ancestors of the squash commit — expected, not a sign anything went wrong); stale remote-tracking refs pruned; confirmed zero open PRs. Corrected one remaining stale cross-reference found during closeout: the Phase Progress table's Phase 10 row still said "Parallel with Phase 9," inaccurate now that Phase 9 is actually complete rather than in progress. Annotated tag `phase-9-complete` created on this state. **Phase 9 (Subscription & Billing) is fully closed out** — see the Phase 9 Completion Summary in §2 for the consolidated retrospective. |
| 2026-08-01 | Engineering (AI-assisted) | Phase 10 Milestone 1 (Security Architecture Review) complete — a review milestone, no code/migrations/configuration changed, per instruction. Reviewed all 22 requested subsystems (authentication, session management, JWT lifecycle, refresh tokens, RBAC, multi-tenant RLS, billing, subscription enforcement, API keys, n8n workflows, AI Prompt Library, admin APIs, frontend authentication, Redis, queue workers, Docker, secrets, environment variables, logging, audit logs, rate limiting, CSP/CORS/CSRF, OAuth, third-party integrations) against the real, current implementation rather than the aspirational `Security_Architecture.md` spec — every claim checked against an actual file, not inferred. Produced six review documents under `docs/reviews/security/` (executive summary, architecture review, threat model, trust-boundary diagram, security findings, risk register, prioritized remediation plan). Result: **0 Critical, 0 High, 5 Medium, 2 Low, 3 Informational findings** — no exploitable cross-tenant data access, authentication bypass, or privilege-escalation path found anywhere. The five Medium findings: API key create/revoke isn't restricted to owner/admin as the documented permission matrix requires (low impact today since API keys don't authenticate any request yet — TD-025); `audit_logs`' RLS policy would reject the org-less writes TD-013's own resolution needs (a correctness gap that must be fixed as the first step of that work, not a live exploit); no Content-Security-Policy anywhere in the API or frontend (defense-in-depth gap against a currently-low XSS surface — zero `dangerouslySetInnerHTML`/`eval` found anywhere in `apps/web`); no rate limiting ahead of authentication on protected routes (the documented Cloudflare mitigation doesn't exist in this environment, leaving a real application-layer availability gap); no column-level encryption for OAuth provider tokens (disk-level only — low practical exposure today since nothing currently reads these tokens back). All five already have a scoped home in the previously-approved Milestone 2–4 plan; this review confirmed that plan was correctly targeted rather than surfacing anything requiring a redesign. Also confirmed several real, positive controls by direct inspection rather than assumption: platform-admin status is never a JWT claim (always a live DB read, DEC-017); `apps/api` holds no database owner/migration-role credential at all (confirmed via `.env` inspection); the frontend access token is memory-only; n8n's webhook calls are authenticated in both directions (confirmed against the actual workflow JSON, not a diagram). Found 3 documentation-vs-reality mismatches in `Security_Architecture.md` (an unimplemented `viewer` role, an OAuth-token-encryption claim, a password-blocklist claim) — deliberately **not** corrected in this milestone; deferred to Milestone 2 so the doc and its corresponding code fix land together rather than drifting apart again. |
| 2026-08-01 | Engineering (AI-assisted) | Phase 10 Milestone 2 (Application Security Hardening) complete on `feat/VS-phase10-security` — all 5 confirmed Medium findings from Milestone 1's review fixed, each independently live-verified (real HTTP requests, real DB queries, or both — nothing assumed): **F-04** (audit_logs RLS) — migration `0012_audit_logs_null_org_write.sql` relaxes only `WITH CHECK` to permit `org_id IS NULL`, leaving `USING` untouched; verified a null-org insert now succeeds while a tenant-scoped read still can't see it (read isolation intact), and a mismatched-org insert is still rejected. Found and documented a real gotcha for whoever wires TD-013 next: `INSERT ... RETURNING` on a null-org row still raises the RLS error under any tenant context, because Postgres also enforces the unchanged `USING` clause when computing `RETURNING` output — insert without `.returning()` for org-less events. **F-05** (API key RBAC) — `requireRole('owner', 'admin')` added to `POST`/`DELETE /api-keys`; verified live against the real dev server with real seeded accounts: `member` gets `403` on create/revoke, `owner` unaffected, `GET` (list) deliberately left open since it wasn't part of this finding. **F-08** (CSP) — Helmet (`default-src 'none'`, since `apps/api` returns JSON only) plus the full HSTS/Referrer-Policy/Permissions-Policy set from `Security_Architecture.md` §14 on the API; nonce-based CSP (`default-src 'self'`, `script-src 'self' 'nonce-{nonce}'`) generated per-request in `apps/web/src/proxy.ts`, matching §11 exactly. Verified: headers present on both apps; confirmed via raw HTML inspection that Next.js automatically applies the middleware nonce to every one of its own framework-injected `<script>` tags; protected-route redirect and CORS unaffected. **F-10** (pre-auth rate limiting) — `plugins/rate-limit.plugin.ts` flipped from `global: false` to `global: true` with a 300/min/IP default, hooking Fastify's `onRequest` phase (ahead of `authenticate` by construction) on every route; existing per-route overrides (login, etc.) unaffected. Verified live with a real 320-request flood against an unauthenticated protected route: exactly 300 succeeded (`401`), the 301st onward correctly got `429`. Found and fixed a real, pre-existing latent bug while verifying this (present since Phase 4, never before exercised because `global:false` meant no route had ever actually hit a limit): `errorResponseBuilder` returned a plain object instead of an `AppError`, so every rate-limit rejection fell through the error handler's generic branch as an unstyled `500` instead of `429` — fixed by returning a proper `AppError` with `context.statusCode`. **F-03** (OAuth token encryption) — new `lib/encryption.ts` (AES-256-GCM, matching `Security_Architecture.md` §7's own spec exactly, optional `DB_ENCRYPTION_KEY`, fails closed — throws rather than silently storing plaintext — if invoked with no key configured) wired transparently into `oauth.repository.ts`'s create/find functions; `createOAuthAccount`'s input type extended to accept the token fields it previously silently dropped (oauth.service.ts's real callers, which never pass tokens today, are unaffected — confirmed no regression). Verified directly against the real database: the stored column is genuine ciphertext (`iv:authTag:data`, base64), and the repository's round-trip returns the exact original plaintext. Full OAuth browser handshake itself remains Unable to Verify in this environment (no Google/GitHub credentials configured, same limitation as every prior phase) — but that's unchanged by this fix; the repository layer it touches is fully verified. Also completed, while already inside `security-headers.plugin.ts`/`proxy.ts` for F-08: added the `Permissions-Policy` header (denying camera/microphone/geolocation/payment/USB) to both apps, closing the one remaining sub-item of `ROADMAP.md`'s "Helmet.js: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy" line (now checked, 1/18 Phase 10 tasks). Updated `docs/reviews/security/05-risk-register.md` (SEC-RISK-01 through 05 all marked Resolved) and `Security_Architecture.md` (§14's Helmet example now matches the actual `default-src 'none'` API policy; §15 now accurately describes two separate rate-limit layers — the new global pre-auth floor and the pre-existing post-auth plan-tier limiter — rather than the single combined mechanism an earlier draft described but was never built). F-01 (password blocklist) and F-02 (RBAC doc mismatch) were deliberately **not** in this milestone's approved scope and remain open. `type-check`/`lint`/`build` green across all 4 packages. |
| 2026-08-01 | Engineering (AI-assisted) | Phase 10 Milestone 3 (API Security & Abuse Protection) complete on `feat/VS-phase10-security`. F-10 (the one finding originally scoped to this milestone) had already been resolved in Milestone 2 at the repo owner's request, so this milestone's work was three fresh audits against the running application: (1) **Auth-route rate-limit table cross-check** — compared `Security_Architecture.md`'s documented per-endpoint limits against the real routes and found three drifts (F-12, informational, not exploitable): the login row's "Lockout" column conflated the IP rate limit with the separate account-keyed lockout mechanism; the OAuth row claimed `20/min` for a wildcard while the real callback routes use `10/min` and the `@fastify/oauth2`-registered start-redirect routes have no dedicated limit reachable through that library's own options (protected only by the global 300/min/IP floor); `/auth/logout`/`/auth/refresh` weren't listed at all. Verified live by temporarily configuring fake OAuth credentials to actually register the start-redirect route and confirming its `x-ratelimit-limit` header reads `300` (the global default), not a dedicated value — corrected the table to describe reality, including why `/auth/refresh` has no dedicated limit (rotation + reuse-detection is the real defense, not request-volume throttling). (2) **Open-redirect audit — found and fixed a real Medium-severity vulnerability (F-11 / SEC-RISK-08):** `apps/web`'s login page read the `from` query parameter and passed it unvalidated into `router.push()`. Rather than assume this was safe or exploitable, traced it through Next.js's own router source (`router-reducer/reducers/navigate-reducer.js`, `segment-cache/navigation.js`) and confirmed an external URL there sets `mpaNavigation: true` with the raw external `href` — a genuine full-page browser redirect, the same code path that explicitly blocks `javascript:` URLs but does not block plain `http(s)://` targets. Fixed with `safeRedirectTarget()`, accepting only same-app paths (rejecting absolute URLs, protocol-relative `//`, and backslash-prefixed variants that browsers can normalise into an external URL); verified against a battery of attack payloads (all correctly falling back to `/home`) and real in-app paths (all passing through unchanged), then confirmed the exact fix logic present in the compiled JS inside a rebuilt production Docker image, not just the source file. (3) **SSRF audit** — traced every outbound server-side HTTP call in the codebase (OAuth provider profile fetches, n8n webhook dispatch) and confirmed each targets either a hardcoded host or uses request input only as a safe `Map`-lookup key, never concatenated into a URL; confirmed no user-configurable webhook/callback-URL feature exists anywhere in the schema; confirmed Next's image optimizer has no `remotePatterns` configured (same-origin only). Conclusion: no SSRF vector exists in this codebase today — a genuine clean result, not a gap. Updated `docs/reviews/security/04-security-findings.md` (added F-11, F-12) and `05-risk-register.md` (added SEC-RISK-08, resolved; corrected SEC-RISK-07's stale "bundled with Milestone 2" note) and `Security_Architecture.md`'s Auth Endpoint Rate Limits table. `lint`/`type-check`/`format:check`/`build` green across all 4 packages; `apps/web`'s Docker image rebuilt and booted against the real compose network with the fix confirmed present in the compiled bundle. |
| 2026-08-01 | Engineering (AI-assisted) | Phase 10 Milestone 4 (Infrastructure Security) complete on `feat/VS-phase10-security`. F-09 (Docker digest pinning) resolved, plus the broader infrastructure review the repo owner explicitly requested this milestone (Dockerfiles, Compose configuration, GitHub Actions, secrets handling, container hardening, production configuration — not just the one pre-identified finding). **Found and fixed a real, previously-undetected gap** while reviewing Traefik's config: the `web` entrypoint (port 80) had no router or redirect attached to it at all — `redirect-to-https`, a middleware written in Phase 2, was confirmed dead code (never referenced by any router) back in Milestone 1's review, but the actual consequence had never been traced through: a plain `http://` request to any service would hit Traefik's default 404, not the "all HTTP redirects to HTTPS" behavior `Security_Architecture.md` §8 has documented since Phase 2. Fixed with an entrypoint-level redirect in `infra/traefik/traefik.yml` (`web` entrypoint's `http.redirections.entryPoint`) rather than finally wiring the old middleware into every router individually — covers every current and future service on port 80 unconditionally. Verified live, not just by static review: spun up a real `traefik:v3` container with the actual repo config against a dummy backend, confirmed `http://localhost/` returns `301 Moved Permanently` → `https://localhost/`, and that host/path are preserved correctly on the redirect. Corrected `Security_Architecture.md` §8's own line, which said `307 Temporary Redirect` — the real, and better, choice is `301` (permanent), since this redirect policy is unconditional, not situational, and a permanent redirect lets browsers cache it and skip the plaintext round-trip on every subsequent request, a real security improvement over 307 (no repeated downgrade window per request) as well as a performance one. **F-09 itself:** both `FROM node:22-alpine` lines in `Dockerfile.api` and both in `Dockerfile.web` pinned to the digest verified via a fresh `docker pull node:22-alpine` immediately before pinning (`sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32`); both images rebuilt and reconfirmed booting correctly (`/ready`, `/health`, CSP/security headers, login redirect all functioning) against the real dev network. **Additional hardening beyond the original findings list:** added `.github/dependabot.yml` (npm workspace root, github-actions, and docker ecosystems, weekly cadence, grouped by production/dev dependency-type so security patches never get bundled behind an unrelated group); SHA-pinned every third-party GitHub Action referenced in both `ci.yml`/`security.yml` (`actions/checkout`, `actions/setup-node`, `actions/dependency-review-action`, `github/codeql-action/{init,analyze}`) — each commit SHA independently verified against the real upstream repos via the GitHub API (not guessed), including discovering that `dependency-review-action@v5` resolves to a movable, unprotected branch rather than a fixed tag, which is exactly the kind of reference SHA-pinning exists to defend against; added explicit least-privilege `permissions: contents: read` at the top of both workflows (matches the repo's own `default_workflow_permissions=read` setting, confirmed via the API rather than assumed, but declared explicitly now so it can't silently change if that repo setting is ever loosened) — `codeql`'s own broader job-level permissions are unaffected since job-level always overrides workflow-level. Reviewed the npm audit allowlist (`.github/security/audit-allowlist.json`) and confirmed all 4 entries are current, not stale (`reviewBy: 2026-10-26`, ~3 months out) via `check-audit.mjs`; cross-checked against GitHub's live Dependabot Alerts API directly (not just the local `npm audit`) and found exactly one other real alert (`esbuild`, medium, dev-dependency only) — correctly outside this project's own allowlist mechanism by design (dev-only, below the high/critical blocking threshold), not a gap. Container hardening added to `docker-compose.prod.yml`: `no-new-privileges` on every service (safe, universal); `read_only` root filesystem + `tmpfs /tmp` on `api`/`web` specifically — the two images this project builds and fully controls — both rebuilt and live-verified still booting and serving correctly under the hardened flags against the real dev network. Deliberately did **not** extend `read_only` to the third-party images (traefik, redis, n8n, prometheus, grafana, loki): each would need its own per-image verification of what it writes to its own root filesystem at runtime, and Traefik specifically binds privileged ports 80/443 where a wrong capability/read-only combination could break it outright with no live deployment to verify against — logged as a follow-up rather than guessed at. Updated `docs/reviews/security/04-security-findings.md`/`05-risk-register.md` (F-09/SEC-RISK-06 marked Resolved) and `ROADMAP.md` (3 more Phase 10 checklist items now checked: Dependabot/digest-pinning, HTTPS redirect, and `npm audit` in CI — the last one already implemented in an earlier phase, just never checked off, re-verified live this milestone — 4/18 Phase 10 tasks now complete). `lint`/`type-check`/`format:check`/`build`/`secretlint` all green across all 4 packages; `docker compose config` validated the full production compose file end-to-end. |
| 2026-08-04 | Engineering (AI-assisted) | Phase 10 Milestone 5 (Compliance & Privacy) complete on `feat/VS-phase10-security` — `Security_Architecture.md` §19's GDPR "Right to access"/"Right to deletion" implemented for the first time, no migration needed (`users.deleted_at` already existed from Phase 3). **`GET /api/v1/account/export`** (new `account.repository.ts`/`account.service.ts`/`account.routes.ts`) returns profile, current-org membership, linked OAuth providers (no tokens), session metadata, API key metadata (no hashes), watchlists, and alert rules as JSON — scoped to the requester's current org context since this app has no multi-org switching yet (TD-011), documented explicitly rather than silently incomplete. **`DELETE /api/v1/account`** immediately scrubs PII (email replaced with a deterministic `deleted-<id>@deleted.invalid` placeholder, name/avatar/password hash cleared) and hard-deletes OAuth links and sessions; refuses with `409 ACCOUNT_DELETION_BLOCKED_BY_OWNERSHIP` if the requester solely owns an organisation with other members (no ownership-transfer flow exists yet — TD-011 — so this guards against orphaning teammates rather than silently proceeding). A new daily job (`lib/privacy-maintenance-queue.ts` + `jobs/account-purge.job.ts`, mirroring Phase 9 Milestone 5's billing-maintenance-queue pattern) attempts to physically remove tombstone rows 30 days after deletion, catching foreign-key violations per-row (watchlists/alert_rules/api_keys/organizations frequently still reference an active account) rather than crashing the batch — the row already holds no PII by that point regardless of whether physical removal succeeds. Both endpoints deliberately do **not** require `requireOrgContext`, since a user with no organisation yet must still be able to export or delete their own account. Live-verified end-to-end against the real running app and real seeded accounts, not assumed: the seeded org owner (owns a multi-member org) correctly blocked with `409`; a plain org member correctly deleted, with the audit-log entry (`account.deletion_requested`) confirmed written directly in the database; a freshly-registered no-org user's export and deletion both verified, including confirming the account can no longer log in with its original email afterward and that the DB row shows every PII field scrubbed; the purge job directly tested against three seeded scenarios (a purgeable 40-day-old tombstone with no references — correctly hard-deleted; a 40-day-old tombstone still owning an organisation — correctly retained without crashing the job; a 5-day-old tombstone — correctly left untouched). Frontend: a `CookieConsentBanner` (Accept/Reject, 1-year `cookie_consent` cookie) mounted in the root layout — disclosure only, since no non-essential cookies exist anywhere in this app to actually gate; draft Privacy Policy (`/privacy`) and Terms of Service (`/terms`) pages, both visibly marked **not legally reviewed** rather than silently presented as finished (an AI coding assistant cannot provide that review), linked from every `(auth)`-group page; a new "Privacy & data" card on Settings → Profile with "Download my data" (client-side JSON blob download) and "Delete my account" actions. Confirmed the cookie-consent read/write logic and the CookieConsentBanner component's presence in the compiled bundle (no browser tool available this session to visually confirm the banner itself, an honest limitation, not skipped). **Found and honestly disclosed a real, pre-existing gap while correcting `Security_Architecture.md` §19's compliance table to match reality:** the table claimed "right to rectification" was already an "MVP" (built) feature via Settings — no `PATCH` profile endpoint exists anywhere in `apps/api`; Settings → Profile is read-only today. Corrected the doc's status rather than either silently building the feature (outside this milestone's approved scope) or leaving the false claim in place — logged as a gap for a later milestone. Also created `docs/guides/gdpr-requests.md`, referenced by `README.md`'s own FAQ since before this milestone but never actually written; documents the self-serve path plus an honest description of the manual-fulfilment path for a user who cannot log in (no admin-initiated deletion API exists either — direct database access is genuinely required today, not glossed over). `lint`/`type-check`/`format:check`/`build` green across all 4 packages; both Docker images rebuilt and reconfirmed booting correctly (`/ready`, new account routes, privacy pages, cookie banner all functioning) under the same hardened flags (`read_only`, `tmpfs`, `no-new-privileges`) introduced in Milestone 4. **Found and fixed a real dependency vulnerability while running this milestone's own security checks (not a pre-identified finding):** pushing this milestone's commit surfaced a new GitHub Dependabot alert (`fast-uri`, high) alongside a new advisory on an already-allowlisted package (`postcss`, `GHSA-fxqj-rqcc-2cmp`) that broke `check-audit.mjs`'s own blocking gate. Investigated rather than reflexively allowlisting: `fast-uri` turned out to be a transient false positive (npm's advisory index was briefly stale — confirmed via `npm cache clean --force` and the GitHub Advisory API directly, which showed the installed versions, `3.1.5`/`4.1.2`, are in fact the first-patched versions); `postcss`'s bundled CVEs (previously allowlisted since Milestone 1 with the justification "no fix without a 7-major-version Next.js downgrade") turned out to now have a genuine non-breaking fix available — `next@16.3.0`, a minor bump `npm audit` itself confirmed as `isSemVerMajor: false`. Upgraded `apps/web`'s `next` dependency from `16.2.12` to `16.3.0`, which resolved postcss's and sharp's bundled high-severity CVEs entirely; `.github/security/audit-allowlist.json` emptied (all 4 previous entries are now genuinely fixed, not just accepted). Re-ran the full verification pipeline and both Docker rebuilds after the dependency change, including a full re-run of every account export/deletion test against the upgraded build — all still passing. |

---

*This document must be updated every Monday and after every phase completion, blocker change, or significant decision. Assign a specific person to own status updates — without ownership, they do not happen.*

*Next scheduled update: 2026-08-03*

---

**Related Documents:**
- [ROADMAP.md](./ROADMAP.md) — Full phase breakdown with task checklists
- [CHANGELOG.md](./CHANGELOG.md) — Version history of shipped features
- [PRD.md](./PRD.md) — Product requirements and success metrics
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure stage and upgrade triggers
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards and Definition of Done
