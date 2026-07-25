# CHANGELOG.md

# ViralScopes.io — Changelog

> All notable changes to ViralScopes.io are documented in this file.
>
> This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
> and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Changelog Format Guide

Each version entry uses the following change categories:

| Category         | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `Added`          | New features, endpoints, pages, or capabilities           |
| `Changed`        | Changes to existing functionality (non-breaking)          |
| `Deprecated`     | Features that will be removed in a future version         |
| `Removed`        | Features removed in this version                          |
| `Fixed`          | Bug fixes                                                 |
| `Security`       | Security patches, vulnerability fixes, compliance updates |
| `Performance`    | Performance improvements                                  |
| `Infrastructure` | Infrastructure, DevOps, CI/CD, deployment changes         |
| `Documentation`  | Documentation additions or corrections                    |

---

## Versioning Policy

| Version type        | When used                                  | Example |
| ------------------- | ------------------------------------------ | ------- |
| **Major** (`X.0.0`) | Breaking API changes, major product pivots | `2.0.0` |
| **Minor** (`x.Y.0`) | New features, non-breaking additions       | `1.3.0` |
| **Patch** (`x.y.Z`) | Bug fixes, security patches, minor updates | `1.2.4` |

**Pre-release identifiers:**

- `alpha` — Internal only, unstable (`1.0.0-alpha.1`)
- `beta` — External beta testing (`1.0.0-beta.3`)
- `rc` — Release candidate, feature-complete (`1.0.0-rc.1`)

---

## [Unreleased]

> Changes merged to `develop` but not yet released to production.
> This section is moved to a versioned entry on each production release.

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

### Added — Phase 1: Foundation & Project Setup

- Turborepo monorepo scaffolded with npm workspaces: `@viralscopes/web`, `@viralscopes/api`, `@viralscopes/shared`, `@viralscopes/db`
- Existing Next.js frontend relocated into `apps/web`; `apps/api`, `packages/shared`, and `packages/db` scaffolded as empty workspace members (business logic for these lands in later phases)
- Root TypeScript strict-mode base config (`tsconfig.base.json`, ES2022) extended by every package
- Root ESLint flat config (`eslint.config.mjs` + shared `eslint.config.base.mjs`) enforcing no-`any`, no-unused-vars, and import ordering across all packages
- Prettier configured (single quotes, 100-char lines, trailing commas) with `format` / `format:check` scripts
- Husky pre-commit hook running `lint-staged` (Prettier + ESLint --fix + secret scanning) on every commit
- Secret scanning via `secretlint` (`@secretlint/secretlint-rule-preset-recommend`) — verified to catch private keys and similar credential patterns; `detect-secrets` documented as an optional alternative
- Semantic design token system (light/dark) in `apps/web/src/app/globals.css` using Tailwind v4's CSS-native `@theme` — provisional neutral + single-accent palette, refinable once brand guidelines exist
- Placeholder brand assets: logo (`apps/web/public/logo.svg`), favicon (`apps/web/src/app/icon.svg`), loading screen (`apps/web/src/app/loading.tsx`), and a 5-icon dashboard icon set placeholder (`apps/web/public/icons/`)
- `.env.example` at repository root documenting every environment variable referenced in `README.md`
- `.nvmrc` pinning Node.js 22

### Changed — Phase 1

- `README.md`: Tailwind CSS entry updated from 3.x to 4.x; added a "Current implementation status" note and a "Design Tokens (Phase 1)" section; fixed cross-references that pointed to a non-existent `docs/` subfolder
- `REPOSITORY_STRUCTURE.md`: updated to reflect `eslint.config.mjs` (flat config) instead of `.eslintrc.js`, Tailwind v4's CSS-based configuration instead of `tailwind.config.ts`, and Phase 1 stub status for `apps/api`, `packages/shared`, `packages/db`
- `PROJECT_RULES.md`: secret-scanning tooling updated to name `secretlint` as the chosen tool, with `detect-secrets` retained as an optional alternative

### Added — Phase 2: Infrastructure & DevOps

- `docker-compose.dev.yml` — one-command local dev stack: `web`/`api` (hot reload via bind mount), Postgres, Redis, MinIO, n8n, Prometheus, Grafana, Loki, Promtail, postgres-exporter, redis-exporter. Verified: all 12 containers healthy, service-to-service DNS resolution confirmed.
- `docker-compose.prod.yml` — Stage 1 production topology per `INFRASTRUCTURE_GROWTH_PLAN.md` (template only — no VPS/domain exists yet)
- `infra/docker/Dockerfile.web`, `infra/docker/Dockerfile.api` — multi-stage production images, both built and run successfully
- Minimal Fastify bootstrap in `apps/api`: `GET /health`, `GET /ready` (verified DB + Redis connectivity checks), `GET /metrics` (Prometheus format)
- Provider-agnostic object storage abstraction (`services/storage.service.ts`) — verified end-to-end (put/get/delete/signed-URL) against live MinIO
- `apps/web` `GET /api/health` route
- GitHub Actions: `ci.yml` (lint/type-check/build/test), `security.yml` (`npm audit --audit-level=high`), `build.yml` (build + push both images to GHCR on merge to `main`), `deploy-staging.yml`/`deploy-production.yml` (templates — skip gracefully without Coolify secrets)
- `.github/dependabot.yml` — weekly npm, github-actions, and Docker ecosystem updates
- Prometheus scrape config, Grafana provisioning (datasources + one consolidated "Infrastructure Overview" dashboard), Loki + Promtail log shipping — all verified with real data
- MinIO bucket auto-creation (`viralscopes-dev`) on stack startup

### Changed — Phase 2

- `apps/api/next.config.ts` (web): added `output: 'standalone'` for the minimal production Docker image
- `.env.example`: Postgres port corrected from `54322` to `15432` (54322 falls inside a Windows dynamic port exclusion range on some dev machines); added `S3_FORCE_PATH_STYLE`
- `README.md`: rewrote "Local Development" with a real, verified Docker workflow section; updated "Running the Application" and "Deployment" implementation-status callouts
- `PROJECT_STATUS.md`: Phase 2 progress, BLK-002, DEC-010 through DEC-013, corrected Phase 2's task total from an approximate 28 to the actual 32

### Known Issues — Phase 2

- Alertmanager/PagerDuty alerting rules deferred to Stage 2 (DEC-010) — no automated alert routing exists yet, only Grafana dashboards and ad hoc Loki queries
- `deploy-staging.yml`/`deploy-production.yml`, Traefik/Let's Encrypt, and Cloudflare R2 production credentials are untested — no deployment infrastructure exists (BLK-002 in `PROJECT_STATUS.md`)

### Changed — Documentation consistency review (2026-07-25)

- `README.md`: corrected a claim that Phase 2 was "completed" (it's 22/32, in progress) to match `PROJECT_STATUS.md`; fixed a stale `DATABASE_URL` example still showing port `54322` instead of `15432`; corrected the `/health` example response's version string (`1.0.0` → `0.1.0`, matching actual behaviour); updated the CI badge and clone URL from a placeholder org to the real repository (`KevinG1456/viralscopes.io`)

### Fixed — Architecture review findings (2026-07-25)

Three real issues found during the Phase 2 architecture review, all fixed and verified (YAML/workflow syntax validated via Prettier; Docker daemon was down for live testing, see `PROJECT_STATUS.md`):

- `docker-compose.prod.yml`: `/metrics` was publicly routable via the `api` service's Traefik router with no restriction. Added a higher-priority `api-metrics` router matching `PathPrefix(/metrics)`, gated by a new `deny-external` middleware (`ipAllowList` restricted to `127.0.0.1/32`) — Prometheus never needs this, since it scrapes `api:3001/metrics` directly over the internal Docker network, not through Traefik.
- `infra/traefik/dynamic/middlewares.yml`: added the `contentSecurityPolicy` header that `PROJECT_RULES.md` §4.4 and `PRD.md` §7.4 both require and which was missing. Baseline policy for Phase 2; flagged for tightening (nonce-based `script-src`) once Phase 8 builds the real frontend.
- `build.yml`: fixed the GHCR case-sensitivity bug — `github.repository` (`KevinG1456/viralscopes.io`) contains uppercase characters, which OCI registries reject. Added a step to lowercase it before use in the image tag. Restored the concrete (now-correct) GHCR example in `README.md`'s Manual Deployment section.

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

| Version         | Status      | Target / Released  | Key deliverable                            |
| --------------- | ----------- | ------------------ | ------------------------------------------ |
| Pre-development | ✅ Complete | 2026-07-20         | All 8 core project documents               |
| `1.0.0-alpha.1` | ⏳ Planned  | Week 6             | Foundation, infra, DB, auth                |
| `1.0.0-alpha.2` | ⏳ Planned  | Week 13            | API, n8n workflows, prompts, dashboard     |
| `1.0.0-beta.1`  | ⏳ Planned  | Week 16            | Billing, security, GDPR, full test suite   |
| `1.0.0-rc.1`    | ⏳ Planned  | Week 18–19         | Bug fixes, admin panel, all docs           |
| `1.0.0`         | ⏳ Planned  | Week 19–20         | Public launch 🚀                           |
| `1.1.0`         | ⏳ Planned  | Week 36 (Month 8)  | AI Chat, Reports, Chrome Extension, Paddle |
| `2.0.0`         | ⏳ Planned  | Week 72 (Month 18) | TikTok, Instagram, Mobile App, Public API  |
| `3.0.0`         | ⏳ Planned  | Month 24–30        | Plugin marketplace, Enterprise SSO, SOC 2  |
| `4.0.0`         | ⏳ Planned  | Month 30+          | Autonomous Financial AI (data-gated)       |

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
