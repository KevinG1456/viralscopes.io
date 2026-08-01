# ROADMAP.md
# ViralScopes.io — Development Roadmap

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [PRD.md](./PRD.md) · [PROJECT_STATUS.md](./PROJECT_STATUS.md) · [PROJECT_RULES.md](./PROJECT_RULES.md)

---

## Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [Guiding Principles](#2-guiding-principles)
3. [MVP Scope Definition](#3-mvp-scope-definition)
4. [Phase Overview](#4-phase-overview)
5. [Detailed Phase Breakdown](#5-detailed-phase-breakdown)
6. [Dependency Graph](#6-dependency-graph)
7. [Parallel Development Opportunities](#7-parallel-development-opportunities)
8. [Version 1 — Post-MVP Additions](#8-version-1--post-mvp-additions)
9. [Version 2 — Platform Expansion](#9-version-2--platform-expansion)
10. [Version 3 — Enterprise & Marketplace](#10-version-3--enterprise--marketplace)
11. [Version 4+ — Advanced AI Systems](#11-version-4--advanced-ai-systems)
12. [Priority Matrix](#12-priority-matrix)
13. [Risk Register](#13-risk-register)
14. [Milestone Calendar](#14-milestone-calendar)

---

## 1. Vision & Goals

### Vision

> **ViralScopes.io is the intelligence layer between a creator and their next breakthrough.**

An AI-powered content intelligence platform that helps creators, agencies, and media teams understand *why* content goes viral — and how to create original content with the same structural characteristics, without copying anyone.

### Strategic Goals

| # | Goal | Timeframe | Success Metric |
|---|---|---|---|
| G1 | Launch a production-ready MVP serving paying customers | Month 5 | 100 paying customers |
| G2 | Achieve initial product-market fit | Month 8 | NPS > 40, churn < 5% |
| G3 | Reach £75,000 MRR | Month 12 | Stripe dashboard |
| G4 | Expand to two additional platforms (TikTok, Instagram) | Month 18 | v2.0 live |
| G5 | Launch public API enabling developer ecosystem | Month 24 | 50+ API integrations |
| G6 | Reach enterprise tier with white-label capability | Month 30 | 10+ Enterprise customers |

### Non-Goals (Explicitly Out of Scope Forever)

- The platform will **never** reproduce, store, or facilitate copying of creator scripts or creative works.
- The platform will **never** provide services that violate YouTube's Terms of Service.
- The platform will **never** build its own video hosting or streaming infrastructure.

---

## 2. Guiding Principles

1. **Ship working software incrementally.** Every phase ends with a deployable, usable product. No big-bang releases.
2. **MVP first, optimise second.** Correctness and coverage before performance tuning.
3. **Build for change.** Abstract external dependencies. Version APIs and prompts. Design schemas for evolution.
4. **Ethical by default.** The ethical content constraint is enforced at every layer — product, prompt, code, and review.
5. **Complexity earns its place.** Advanced features (Financial AI, ML pricing) are deferred until the data exists to make them useful.
6. **Testing is not optional.** Unit and integration tests are written alongside features, not after the fact.

---

## 3. MVP Scope Definition

The MVP (Phases 1–14) delivers a complete, production-grade SaaS product. It is the smallest set of features that delivers genuine, recurring value to paying customers.

### MVP Includes

| Feature Area | What is included |
|---|---|
| Content Discovery | YouTube video discovery (6-hour cycle), metadata extraction, transcript pipeline |
| AI Analysis | Thumbnail analysis, full video AI analysis, title formula detection, hook classification |
| Viral Scoring | Proprietary weighted Viral Score (0–100) with confidence level |
| Trend Detection | Daily topic clustering, emerging/evergreen/declining classification, opportunity ranking |
| Recommendations | Ethically-generated original title, hook, outline, thumbnail concept, keywords |
| Dashboard | All core pages: Home, Trending, Videos, Video Detail, Channels, Trends, Opportunities, Recommendations, Watchlists, Alerts, Search, Export, Settings, Admin |
| Watchlists | Channel, keyword, niche, and competitor watchlists |
| Alerts | Email, Discord, Slack, Telegram, and custom webhook alert dispatch |
| Search | Unified search with advanced filters and cursor-based pagination |
| Export | CSV, Excel, JSON, PDF exports with async generation |
| Authentication | Email/password, Google OAuth, GitHub OAuth, email verification, RBAC |
| Multi-Tenancy | Organisations, workspaces, projects, member invitations, role management |
| Onboarding | 3-step onboarding flow with product tour |
| Billing | Stripe Checkout, Customer Portal, plan enforcement, usage tracking |
| Security | HTTPS, security headers, CSRF, GDPR (deletion, export, consent) |
| Infrastructure | Docker, CI/CD, monitoring (Prometheus + Grafana + Loki), health checks |
| Admin Panel | Super Admin Panel for internal platform management |
| Documentation | All 8 project documents; API reference; deployment guide |

### MVP Excludes (Explicitly Deferred)

| Feature | Deferred to |
|---|---|
| TikTok / Instagram connectors | v2.0 |
| AI Chat Interface | v1.5 |
| Chrome Extension | v1.5 |
| Mobile Application | v2.0 |
| Paddle billing | v1.5 |
| Crypto billing | v2.0 |
| Affiliate / referral system | v2.0 |
| Public API & SDKs | v2.0 |
| White-label deployments | v3.0 |
| Scheduled PDF reports | v1.5 |
| Team collaboration (comments, tasks) | v2.0 |
| Autonomous Financial AI | v4.0+ |

---

## 4. Phase Overview

| Phase | Name | Complexity | Est. Duration | MVP | Parallel with |
|---|---|---|---|---|---|
| 1 | Foundation & Project Setup | Small | 1 week | Yes | Phase 2 |
| 2 | Infrastructure & DevOps | Medium | 1–2 weeks | Yes | Phase 1 |
| 3 | Database & Core Schema | Medium | 1 week | Yes | Phase 2 |
| 4 | Authentication & Authorisation | Medium | 1–2 weeks | Yes | Phase 3 |
| 5 | Core Backend API | Large | 2–3 weeks | Yes | Phase 8 |
| 6 | n8n Workflow Engine | Large | 2–3 weeks | Yes | Phase 5 |
| 7 | AI Prompt Library & Versioning | Small | 3–5 days | Yes | Phase 6 |
| 8 | Frontend Dashboard | Large | 3–4 weeks | Yes | Phase 5 |
| 9 | Subscription & Billing | Medium | 1–2 weeks | Yes | — |
| 10 | Security Hardening & Compliance | Medium | 1 week | Yes | Phase 9 |
| 11 | Super Admin Panel | Medium | 1–2 weeks | No* | Phase 12 |
| 12 | Testing | Medium | Ongoing + 1-week sprint | Yes | All phases |
| 13 | Documentation | Small | Ongoing + 3–5 days | Yes | All phases |
| 14 | Production Deployment | Medium | 3–5 days | Yes | — |
| 15 | Affiliate & Referral System | Large | 3–4 weeks | No | Post-launch |
| 16 | Advanced Billing | Large | 2–3 weeks | No | Post-launch |
| 17 | Platform Expansion | Very Large | 8–12 weeks | No | Post-launch |
| 18 | Advanced Financial AI | Very Large | 12+ weeks | No | v4+ only |

*Phase 11 (Super Admin Panel) is required within 30 days of launch.

**Total MVP estimate:** 16–20 weeks from project initiation to production deployment.

---

## 5. Detailed Phase Breakdown

---

### Phase 1 — Foundation & Project Setup
**Complexity:** Small | **Duration:** ~1 week | **Parallel with:** Phase 2

#### Deliverables
- Initialised monorepo with all packages
- TypeScript, ESLint, Prettier, Husky configured across all packages
- Git repository with branch protection rules configured
- Design system: colour palette, typography, dark/light mode tokens
- Logo placeholder, favicon, loading screen, icon set
- `.env.example` for all services with all required keys documented
- Pre-commit hook blocking secret commits
- README with setup instructions

#### Tasks
- [ ] Initialise monorepo: `apps/web`, `apps/api`, `packages/shared`, `packages/db`
- [ ] Configure TypeScript strict mode across all packages
- [ ] Set up ESLint with import ordering, no-any, and no-unused-vars rules
- [ ] Configure Prettier with project settings
- [ ] Set up Husky pre-commit hooks (lint-staged + secret detection)
- [ ] Configure Git repository with branch protection rules for `main` and `develop`
- [ ] Establish Turborepo build pipeline configuration
- [ ] Finalise colour palette (dark mode + light mode tokens)
- [ ] Define typography scale (font families, weights, sizes)
- [ ] Build Tailwind CSS design tokens
- [ ] Create logo placeholder (SVG), favicon, and loading screen
- [ ] Design dashboard icon set
- [ ] Document all environment variables in `.env.example` for every service
- [ ] Write initial README.md with setup instructions

**Milestone:** Repository initialised, design system documented, all tooling configured, no secrets in code.

---

### Phase 2 — Infrastructure & DevOps
**Complexity:** Medium | **Duration:** 1–2 weeks | **Parallel with:** Phase 1

#### Deliverables
- All services running locally with a single `docker compose up` command
- CI/CD pipeline deployed to GitHub Actions
- Staging environment auto-deploying from `develop` via Coolify
- Prometheus + Grafana + Loki monitoring stack live
- Health check endpoints on all services
- S3-compatible object storage configured for dev and production

#### Tasks

**Docker Setup**
- [ ] Write Dockerfiles for: Next.js frontend, Node.js API, n8n, Redis, MinIO (local S3)
- [ ] Write `docker-compose.dev.yml` (hot reload, local ports exposed)
- [ ] Write `docker-compose.prod.yml` (health checks, restart policies, named volumes)
- [ ] Configure named volumes: PostgreSQL, Redis, n8n workflows, object storage
- [ ] Define internal Docker network topology
- [ ] Test one-command startup: `docker compose up`

**Reverse Proxy & Networking**
- [ ] Configure Traefik as reverse proxy with automatic service discovery
- [ ] Set up SSL/TLS via Let's Encrypt through Coolify
- [ ] Define service routing rules (frontend, API, n8n, Grafana)
- [ ] Configure per-environment CORS policies

**CI/CD Pipeline**
- [ ] GitHub Actions: lint + type-check on every pull request
- [ ] GitHub Actions: run all tests on every pull request
- [ ] GitHub Actions: build and push Docker images on merge to `main`
- [ ] GitHub Actions: deploy to Coolify staging on successful build
- [ ] GitHub Actions: deploy to Coolify production with manual approval gate
- [ ] Add `npm audit` vulnerability scan — fail CI on high-severity CVEs
- [ ] Configure Dependabot or Renovate for weekly dependency update PRs

**Monitoring & Observability**
- [ ] Deploy Prometheus with scrape targets for all services
- [ ] Configure Grafana dashboards: API latency, queue depth, job success/failure, DB connections, memory/CPU
- [ ] Deploy Loki for centralised log aggregation from all containers
- [ ] Wire all service logs and n8n workflow logs into Loki
- [ ] Configure alerting: service down, queue backlog spike, error rate spike, disk > 80%
- [ ] Set up PagerDuty or email alerting for critical production failures

**Health Checks**
- [ ] Implement `GET /health` on API: `{ status, uptime, version }`
- [ ] Implement `GET /ready` on API: checks DB, Redis, and queue connectivity
- [ ] Implement equivalent health routes on n8n and background workers
- [ ] Register all health endpoints with Coolify and Traefik health probes
- [ ] Add health check status panel to Grafana

**Object Storage**
- [ ] Configure MinIO for local development
- [ ] Configure Cloudflare R2 or AWS S3 for production
- [ ] Define bucket structure: `thumbnails/`, `exports/`, `reports/`, `prompt-cache/`
- [ ] Implement storage abstraction layer (provider-agnostic interface)

**Milestone:** Full local dev environment with one command. CI/CD deployed to staging. Monitoring live. Health checks registered.

---

### Phase 3 — Database & Core Schema
**Complexity:** Medium | **Duration:** ~1 week | **Parallel with:** Phase 2

#### Deliverables
- All database tables created via reversible migrations
- RLS policies active on every table from creation
- Dead-letter queue table and data retention automation
- ERD diagram published to `/docs/`
- Seed data scripts for development

#### Tasks

**Setup**
- [ ] Initialise Supabase project (local dev + hosted)
- [ ] Configure PgBouncer connection pooling
- [ ] Enable RLS on all tables from creation
- [ ] Set up Drizzle ORM with migration tooling
- [ ] Add migration dry-run check to CI pipeline

**Core Schema — User & Organisation**
- [ ] `users`: id, email, name, avatar, role, email_verified, created_at, updated_at
- [ ] `organizations`: id, name, plan, owner_id, created_at
- [ ] `organization_members`: org_id, user_id, role, invited_at, joined_at
- [ ] `workspaces`: id, org_id, name, settings (jsonb), created_at
- [ ] `projects`: id, workspace_id, name, created_at
- [ ] `sessions`: id, user_id, token_hash, ip_address, user_agent, created_at, expires_at
- [ ] `audit_logs`: id, org_id, user_id, action, resource_type, resource_id, metadata (jsonb), created_at

**Core Schema — Billing & Usage**
- [ ] `subscriptions`: id, org_id, plan, status, billing_provider, provider_subscription_id, period_start, period_end
- [ ] `usage_events`: id, org_id, user_id, event_type, quantity, created_at — partitioned by month
- [ ] `api_keys`: id, org_id, key_hash, name, scopes, last_used_at, created_at, revoked_at
- [ ] `invoices`: id, org_id, provider, amount, currency, status, paid_at, created_at

**Core Schema — Content**
- [ ] `channels`: id, platform, channel_id, name, avg_views, upload_frequency, subscriber_estimate, growth_score
- [ ] `videos`: id, platform, video_id, url, title, description, channel_id, views, likes, comments, published_at, duration, thumbnail_url, language, category, viral_score, viral_score_confidence, analysis_status
- [ ] `transcripts`: id, video_id, raw_transcript, summary, hook, cta, ending, sections (jsonb), status
- [ ] `thumbnail_analyses`: id, video_id, emotion, objects (jsonb), faces (jsonb), colors (jsonb), contrast, text_density, ctr_prediction, raw_analysis (jsonb)
- [ ] `title_analyses`: id, video_id, formula, keywords (jsonb), power_words (jsonb), length, score
- [ ] `video_analyses`: id, video_id, summary, hook_type, hook_confidence, story_structure, target_audience, emotion, cta, retention_tactics (jsonb), key_themes (jsonb), virality_drivers (jsonb), weaknesses (jsonb), raw_output (jsonb), prompt_version
- [ ] `recommendations`: id, video_id, org_id, new_title, new_hook, outline (jsonb), thumbnail_prompt, keywords (jsonb)
- [ ] `trends`: id, topic, platform, velocity, growth, competition, opportunity_score, status
- [ ] `watchlists`: id, org_id, name, type, target, created_at
- [ ] `alert_rules`: id, org_id, trigger_type, threshold, channels (jsonb), active
- [ ] `alert_events`: id, org_id, rule_id, payload (jsonb), channel, sent_at
- [ ] `job_logs`: id, workflow_name, workflow_id, status, started_at, completed_at, error, retry_count, metadata (jsonb) — partitioned by month
- [ ] `prompt_library`: id, name, version, model, system_prompt, user_template, output_schema (jsonb), active

**Dead-Letter Queue**
- [ ] `dead_letter_jobs`: id, workflow_name, original_payload (jsonb), error_message, retry_attempts, last_attempt_at, resolved, created_at
- [ ] Admin endpoint to inspect, retry, and dismiss dead-letter jobs
- [ ] Grafana panel: dead-letter queue depth over time

**Data Retention**
- [ ] Define retention rules: raw transcripts 90d, job_logs 60d, usage_events 13m, audit_logs 2y, dead_letter_jobs 30d post-resolution
- [ ] Implement automated nightly purge jobs enforcing retention rules
- [ ] Surface retention settings in organisation admin settings

**Optimisation**
- [ ] Define indexes on all foreign keys and frequently queried columns
- [ ] Implement table partitioning for `usage_events` and `job_logs`
- [ ] Write seed data scripts for development and testing
- [ ] Publish full schema ERD to `/docs/database-erd.png`

**Milestone:** All migrations applied cleanly. RLS active. ERD published. Retention automation running.

---

### Phase 4 — Authentication & Authorisation
**Complexity:** Medium | **Duration:** 1–2 weeks | **Parallel with:** Phase 3

#### Deliverables
- Full auth system (email, OAuth, password reset, verification)
- Transactional email service with all 7 email templates
- RBAC enforced at route and service layers
- Organisation, workspace, and member management
- Session management with audit logging

#### Tasks

**Authentication**
- [ ] JWT access tokens (15-min expiry) + refresh token rotation (HTTP-only cookies)
- [ ] Email + password registration and login
- [ ] Google OAuth integration
- [ ] GitHub OAuth integration
- [ ] Password reset flow (email link, 1-hour expiry)
- [ ] Email verification required before dashboard access
- [ ] Account lockout after 5 consecutive failed login attempts

**Transactional Email Service**
- [ ] Integrate SendGrid or Resend
- [ ] Email template: Welcome (on signup)
- [ ] Email template: Email verification link
- [ ] Email template: Password reset link
- [ ] Email template: Member invitation to organisation
- [ ] Email template: Alert notification digest
- [ ] Email template: Billing confirmation (subscription started, plan changed, payment failed)
- [ ] Email template: Usage quota warning (at 80% and 100% of monthly limit)
- [ ] Configure sending domain with SPF, DKIM, DMARC
- [ ] Add unsubscribe link and preference management to non-transactional emails
- [ ] Log all sent emails to `audit_logs`

**RBAC**
- [ ] Define roles: Super Admin, Admin, Owner, Team Member, Viewer
- [ ] Implement role-based middleware on all API routes
- [ ] Implement permission checks at service layer
- [ ] Write and publish permission matrix document

**Organisation & Workspace Management**
- [ ] Organisation CRUD
- [ ] Member invitation flow (email invite → accept link → join)
- [ ] Member removal and role change (with audit log)
- [ ] Multiple workspace support per organisation
- [ ] Project management within workspaces
- [ ] Ownership transfer flow

**Session Management**
- [ ] Active session listing per user
- [ ] Remote session revocation (individual + "sign out all other devices")
- [ ] Audit log for all auth events

**Milestone:** Full auth system end-to-end. All email templates tested and delivering. RBAC enforced everywhere.

---

### Phase 5 — Core Backend API
**Complexity:** Large | **Duration:** 2–3 weeks | **Parallel with:** Phase 8

#### Deliverables
- All MVP REST endpoints implemented and documented
- OpenAPI spec published at `/api/v1/docs`
- Redis-backed rate limiting per plan
- YouTube API quota manager service
- API key management system
- Webhook signature verification on all handlers

#### Tasks

**API Foundation**
- [ ] Fastify + TypeScript API server
- [ ] Zod schema validation on all request inputs
- [ ] Standardised response format: `{ success, data, error: { code, message, details }, meta }`
- [ ] Global error handler — no stack traces in production responses
- [ ] Request logging with correlation IDs (Pino)
- [ ] API versioning: `/api/v1/`
- [ ] OpenAPI / Swagger auto-generated from Zod schemas via `fastify-swagger`

**Rate Limiting & Quota**
- [ ] Redis-backed rate limiter per API key and authenticated user
- [ ] Per-plan limits: requests per minute and per day
- [ ] Soft warning at 80% — trigger quota warning email
- [ ] Hard block at 100%: `429 Too Many Requests` with `Retry-After` header
- [ ] Feature flags cached in Redis — no DB hit per request

**YouTube API Quota Manager**
- [ ] Daily unit consumption tracking against 10,000/day limit
- [ ] Per-org quota allocation per subscription plan
- [ ] Cache-first strategy: serve from DB if analysed within 24h
- [ ] RapidAPI YouTube or Apify fallback at quota limit
- [ ] Admin override endpoint: `POST /api/v1/admin/quota/reset`
- [ ] Grafana panel: daily YouTube quota consumption vs limit

**Endpoints — Videos**
- [ ] `GET /api/v1/videos` — list with filters (date, category, language, viral score, platform)
- [ ] `GET /api/v1/videos/:id` — full detail with all analyses
- [ ] `POST /api/v1/videos/analyze` — trigger analysis for a URL
- [ ] `POST /api/v1/videos/refresh` — re-analyse (bypass 24h cache)

**Endpoints — Channels**
- [ ] `GET /api/v1/channels` — list with filters
- [ ] `GET /api/v1/channels/:id` — full profile and growth history

**Endpoints — Trends & Opportunities**
- [ ] `GET /api/v1/trends` — list with filters (status, velocity, platform)
- [ ] `GET /api/v1/trends/opportunities` — ranked opportunity list

**Endpoints — Analytics**
- [ ] `GET /api/v1/analytics/overview` — org-level KPIs
- [ ] `GET /api/v1/analytics/viral-scores` — score distribution over time
- [ ] `GET /api/v1/analytics/engagement` — engagement trends

**Endpoints — Recommendations**
- [ ] `GET /api/v1/recommendations` — list for org
- [ ] `GET /api/v1/recommendations/:videoId` — recommendations for a video

**Endpoints — Watchlists**
- [ ] `GET /api/v1/watchlists`
- [ ] `POST /api/v1/watchlists`
- [ ] `PUT /api/v1/watchlists/:id`
- [ ] `DELETE /api/v1/watchlists/:id`

**Endpoints — Alerts**
- [ ] `GET /api/v1/alerts/rules`
- [ ] `POST /api/v1/alerts/rules`
- [ ] `PUT /api/v1/alerts/rules/:id`
- [ ] `DELETE /api/v1/alerts/rules/:id`
- [ ] `GET /api/v1/alerts/events`

**Endpoints — Search**
- [ ] `GET /api/v1/search` — unified search, cursor-based pagination, all filter types

**Endpoints — Export**
- [ ] `POST /api/v1/exports` — trigger async export (CSV, Excel, JSON, PDF)
- [ ] `GET /api/v1/exports/:id` — check status
- [ ] `GET /api/v1/exports/:id/download` — signed S3 URL

**Endpoints — API Keys**
- [ ] `GET /api/v1/api-keys` — list (hashed, never plaintext)
- [ ] `POST /api/v1/api-keys` — create (plaintext returned once)
- [ ] `DELETE /api/v1/api-keys/:id` — revoke immediately

**Endpoints — Webhooks**
- [ ] Stripe webhook handler with signature verification
- [ ] Outgoing webhook dispatch for user alert channels

**Endpoints — Usage**
- [ ] `GET /api/v1/usage` — current period usage, quota remaining, reset date

**Endpoints — Admin**
- [ ] `GET /api/v1/admin/users`
- [ ] `GET /api/v1/admin/organizations`
- [ ] `GET /api/v1/admin/jobs`
- [ ] `GET /api/v1/admin/dead-letter`
- [ ] `POST /api/v1/admin/dead-letter/:id/retry`
- [ ] `GET /api/v1/admin/metrics`
- [ ] `POST /api/v1/admin/quota/reset`

**Milestone:** All endpoints implemented, documented, tested. OpenAPI spec live. Rate limiting and quota enforcement active.

---

### Phase 6 — n8n Workflow Engine
**Complexity:** Large | **Duration:** 2–3 weeks | **Parallel with:** Phase 5

#### Deliverables
- All 14 production workflows running and monitored
- Dead-letter queue live with admin retry capability
- All CRON schedules configured
- All workflow JSON files committed to `/infra/n8n-workflows/`

#### Tasks

**Setup**
- [ ] Deploy n8n in Docker with persistent named volume
- [ ] Configure Redis queue (BullMQ) integration
- [ ] Set up credentials store for all external services
- [ ] Create base workflow template: logging, error capture, dead-letter output
- [ ] Define retry strategy: max 3 attempts, exponential backoff
- [ ] Dead-letter handling: on max retries → write to `dead_letter_jobs` → admin notification

**Workflows**
- [ ] **Video Discovery** — CRON every 6h + manual trigger; 50k–300k views; duplicate prevention
- [ ] **Metadata Pipeline** — fetch all video fields; normalise; store; enqueue next stage
- [ ] **Transcript Pipeline** — fetch captions; handle unavailable gracefully; enqueue for AI
- [ ] **Thumbnail Analysis** — download thumbnail; Claude/OpenAI Vision; CTR prediction; schema-validate; store
- [ ] **AI Analysis Pipeline** — fetch active prompt; call AI; Zod-validate output; cache response; store with prompt_version
- [ ] **Title Formula Detection** — classify title pattern; generate template; store
- [ ] **Hook Classification** — classify first 60s; return label + confidence; store
- [ ] **Engagement Analytics** — compute views/day, ratios, velocity, growth rate; store
- [ ] **Viral Score Engine** — compute weighted score (0–100) + confidence; trigger alert if above threshold
- [ ] **Trend Detection** — daily; AI topic clustering; classify emerging/evergreen/declining; store
- [ ] **Opportunity Engine** — rank high demand + low competition + fast growth; store top opportunities
- [ ] **Ethical Recommendation Engine** — original output only; validate; store in recommendations
- [ ] **Channel Intelligence** — track upload frequency, avg views, topic focus, growth; update channel profiles
- [ ] **Alert Dispatch** — check alert_rules; dispatch to email/Discord/Slack/Telegram/webhook; throttle 1/hour/rule; log

**Scheduler**
- [ ] Every 6 hours: Video Discovery
- [ ] Daily: Trend Detection, Channel Intelligence, Alert Sweep, Data Retention Purge
- [ ] Weekly: Opportunity Engine full refresh
- [ ] Monthly: Channel growth scoring update
- [ ] Manual trigger: `POST /api/v1/jobs/:workflow/trigger`

**Version Control**
- [ ] Export all workflow JSON to `/infra/n8n-workflows/`
- [ ] Add workflow description field to every exported JSON
- [ ] Publish workflow diagrams to `/docs/workflows/`

**Milestone:** All 14 workflows running. Dead-letter queue live. All CRON schedules active. All JSON committed.

---

### Phase 7 — AI Prompt Library & Versioning
**Complexity:** Small | **Duration:** 3–5 days | **Parallel with:** Phase 6

#### Deliverables
- All 6 production prompts stored, versioned, and active in the database
- AI response caching live with hit rate monitoring
- Prompt test harness functional in admin panel

#### Tasks
- [x] `prompt_library` table with full versioning schema
- [x] All prompts stored in DB (not in code): thumbnail analysis, title formula, hook classification, full video analysis, trend clustering, ethical recommendation generation — corrected from an earlier 8-item list that also named "transcript analysis" and "opportunity detection". Neither is an AI prompt: `n8n_Workflow_Diagrams.md` WF-03 (Transcript Pipeline) only fetches YouTube captions with no AI call (transcript summarisation is produced by the `video_analysis` prompt above), and WF-11 (Opportunity Engine) is explicitly "no AI calls — purely computational ranking". See DEC-020 in `PROJECT_STATUS.md`.
- [x] AI response caching: Redis key = `(prompt_version, sha256(input))`, 24h TTL
- [x] Cache hit rate tracked (`GET /api/v1/admin/metrics`'s `aiCache` field) — "displayed in admin dashboard" is Phase 8 (Frontend Dashboard) scope, not started; the backend data it would render is live now
- [x] Prompt test harness: select prompt + version → run against test video → view formatted output + schema validation — `POST /admin/prompts/:name/test` against 10 committed fixture videos (`apps/api/test-fixtures/videos/`), dispatched via the same queue→n8n pattern as every other workflow (`infra/n8n-workflows/prompt-test.json`). Live-verified end to end up to the AI-provider call itself: auth, template rendering, cache check, provider routing, error handling, and retry/dead-letter all confirmed working by observing the call fail predictably (no `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` anywhere in this environment — TD-023, more fundamental than RISK-02's unresolved cost model) and correctly dead-letter. The cache-hit path (no AI call needed) was verified with a real cached result.
- [x] Diff view between two prompt versions — `GET /admin/prompts/:name/diff`
- [x] Regression runner: all active prompts against the 10 fixed test fixture videos — `npm run ai:regression`, deliberately **not** wired into CI as a merge-blocking gate per `PROJECT_RULES.md` section 9.5, since that would run real, uncontrolled AI spend on every PR with no credentials or budget approval in place yet (TD-023). Live-run against the 5 video-scoped active prompts × 10 fixtures = 50 combinations (`trend_clustering`, the 6th active prompt, is correctly excluded — its input is a topic batch, not a single video), reporting each as `PENDING` (blocked on TD-023) rather than a false failure; exits non-zero only on a genuine schema-validation failure of an output that did come back.

**Milestone:** Prompt storage, versioning, caching, the test harness, and the regression runner are all live and built as completely as possible without AI provider credentials (TD-023) — the one thing left unverified anywhere in Phase 7 is the actual content of a real AI response. Cost visibility backend is live; the admin dashboard UI to display it is Phase 8.

---

### Phase 8 — Frontend Dashboard
**Complexity:** Large | **Duration:** 3–4 weeks | **Parallel with:** Phase 5

#### Deliverables
- Full production dashboard with all MVP pages
- Onboarding flow tested end-to-end
- API key management UI
- Changelog page
- i18n architecture in place (English at launch)

#### Tasks

**Scope note (2026-07-28):** Delivered against explicit, reduced requirements from the repo owner (Application Shell, Authentication, Dashboard, CRUD for Watchlists/Alerts/API Keys/Profile/Organisation, Phase 7 AI integration, state management) rather than this full 45-item aspirational list — 17/45 ROADMAP items are checked below; the rest are deferred for documented reasons (empty content tables — TD-020; no org-management endpoint — TD-011; Phase 9 billing; no OAuth provider credentials to verify against; i18n/Changelog/full Admin panel/onboarding not requested). See DEC-023 through DEC-025 and TD-024 in `PROJECT_STATUS.md`.

**Foundation**
- [x] Next.js 14+ App Router + TypeScript (16.2, scaffolded Phase 1, now actually wired with real pages)
- [x] Tailwind CSS + design tokens from Phase 1 (existed since Phase 1, now actually used)
- [x] shadcn/ui component library — hand-built on Radix primitives + `cva` + `tailwind-merge`, matching shadcn's own actual model (copied source, not an installed runtime package)
- [x] TanStack Query for all server state
- [x] Typed API client layer in `apps/web/src/lib/api/`
- [x] Route paths as constants in `apps/web/src/lib/routes.ts`
- [ ] `next-intl` i18n integration from day one — not requested, not built
- [x] Global error boundary and loading state components
- [x] Responsive layout shell: collapsible sidebar (mobile drawer) + topbar

**Authentication Pages**
- [ ] Login: email/password + Google + GitHub OAuth buttons — email/password built and live-verified; OAuth buttons not added (backend OAuth is code-complete but was never exercised against real provider credentials as of Phase 4's own status, and remains so — can't be live-verified)
- [x] Registration with email verification gate
- [x] Password reset request and confirmation pages
- [x] Email verification landing page
- [ ] OAuth callback handler — not built, same reason as the OAuth buttons above

**Onboarding Flow**
- [ ] Step 1: Create or join organisation (invite code support) — no self-service org-creation endpoint exists (TD-011); this step cannot function
- [ ] Step 2: Choose plan or confirm free tier — depends on Step 1
- [ ] Step 3: Set first watchlist — depends on Step 1
- [ ] Step 4: Product tour — depends on Step 1
- [ ] Track completion per user — depends on Step 1

**Dashboard Pages**
- [x] **Home** — KPI stat cards (watchlists/alert rules/alerts-30d/API keys/usage-quota) + recent-activity lists (watchlists, recommendations, alerts), per the repo owner's explicit Dashboard requirements rather than this bullet's exact framing
- [ ] **Trending** — not built; `videos`/`trends` tables are empty (TD-020)
- [ ] **Videos** — not built (TD-020)
- [ ] **Video Detail** — not built (TD-020)
- [ ] **Channels** — not built (TD-020)
- [ ] **Trends** — not built (TD-020)
- [ ] **Opportunities** — not built (TD-020)
- [ ] **Recommendations** — shown as a recent-activity list on Home, not a dedicated filterable page
- [x] **Watchlists** — create/list/delete (optimistic); no per-watchlist "latest activity" feed
- [x] **Alerts** — rule builder (create/toggle/delete) + read-only history tab; no separate "channel configuration" beyond the watchlist a rule targets
- [ ] **Search** — not built; no unified search endpoint exists yet (TD-015)
- [ ] **Export** — not built; needs Cloudflare R2 (TD-016) and a backend endpoint that doesn't exist yet
- [ ] **Settings** — profile and API keys built; organisation is read-only (TD-011); billing/team/notifications need Phase 9 and TD-011
- [ ] **Admin** — only the AI Prompt Library (Phase 7 integration) was requested and built; job logs/dead-letter/quota/system-health pages not built (their backend endpoints exist from Phase 5/6 but have no frontend yet)

**API Key Management UI**
- [x] List keys: name, creation date, last used, scopes (never key value after creation)
- [x] Create key: name → generated key shown once with copy + warning
- [x] Revoke key with confirmation dialog

**Changelog Page**
- [ ] Accessible from sidebar footer and Settings — not requested, not built
- [ ] Reverse-chronological releases with date and summary
- [ ] "New release" sidebar badge until visited
- [ ] Content from Markdown file — no deploy needed to update

**Charts**
- [ ] Growth line chart (views, likes, viral score over time) — not built; needs real video/trend data (TD-020)
- [ ] Viral Score distribution histogram
- [ ] Trend velocity area chart
- [ ] Channel upload frequency heatmap
- [ ] Engagement ratio bar chart

**Milestone:** The repo owner's explicit Phase 8 requirements (shell, auth, dashboard, Watchlists/Alerts/API Keys/Profile/Organisation CRUD, Phase 7 AI integration, state management) are live, responsive, and live-verified end to end against the real backend. i18n, onboarding, full ROADMAP page coverage, and charts are deferred, not silently dropped -- see the scope note above.

---

### Phase 9 — Subscription & Billing
**Complexity:** Medium | **Duration:** 1–2 weeks

#### Deliverables
- Stripe billing live with all 5 plan tiers
- Usage tracking real-time in Redis, persisted to PostgreSQL
- Plan enforcement active on all quota-gated endpoints
- Billing confirmation and quota warning emails sending

#### Tasks

**Plan Definition**
- [x] Define 5 tiers: Free, Starter, Professional, Business, Enterprise
- [x] Define per-plan limits for all quota-gated resources
- [ ] Feature flags: stored in DB, cached in Redis, no DB hit per request

**Stripe Integration**
- [x] Stripe Checkout for new subscriptions
- [x] Stripe Customer Portal for plan changes, payment updates, cancellation
- [x] Monthly and annual billing with annual discount
- [x] Webhook handler with signature verification:
  - [x] `invoice.paid` → activate/renew
  - [ ] `invoice.payment_failed` → grace period + failure email (grace period live; failure email deferred, out of Milestone 3 scope)
  - [x] `customer.subscription.updated` → sync plan
  - [x] `customer.subscription.deleted` → downgrade to free
- [x] 3-day grace period on payment failure
- [ ] Billing confirmation email on successful payment

**Usage Tracking**
- [ ] Event emission for every billable action
- [ ] Events: `video_analyzed`, `api_request`, `export_created`, `ai_chat_message`, `alert_triggered`
- [ ] Real-time Redis increment; async batch persist every 5 minutes
- [ ] Usage reset at billing period start
- [ ] Quota warning email at 80% of monthly limit
- [x] Billing UI embedded in Settings (Stripe Customer Portal)

**Milestone:** Stripe billing live. Usage tracked. Plan limits enforced. Emails sending. Grace period tested.

---

### Phase 10 — Security Hardening & Compliance
**Complexity:** Medium | **Duration:** ~1 week | **Parallel with:** Phase 9

#### Deliverables
- All security headers configured
- GDPR endpoints live (deletion, export, consent)
- CI blocking on high-severity CVEs
- Security checklist verified

#### Tasks

- [ ] HTTPS enforced; HTTP → HTTPS redirect at Traefik
- [x] Helmet.js: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy (Phase 10 Milestone 2, F-08 — `apps/api/src/plugins/security-headers.plugin.ts` + `apps/web/src/proxy.ts`)
- [ ] CORS: locked to allowed origins; no wildcard in production
- [ ] CSRF protection on all state-changing browser-session endpoints
- [ ] XSS: sanitise all user-generated content before rendering
- [ ] SQL injection: ORM parameterised queries only — no raw string interpolation
- [ ] API key storage: `sha256(key)` only in DB — never plaintext
- [ ] JWT secret rotation procedure documented
- [ ] Environment variables encrypted at rest in Coolify
- [ ] `npm audit` in CI: high/critical CVEs block the build
- [ ] Dependabot/Renovate active; Docker base images pinned
- [ ] GDPR: `DELETE /api/v1/account` (hard delete, 30-day purge)
- [ ] GDPR: `GET /api/v1/account/export` (JSON ZIP)
- [ ] GDPR: Cookie consent banner on first visit
- [ ] Privacy Policy page (legally reviewed)
- [ ] Terms of Service page

**Milestone:** Security checklist complete. GDPR endpoints live. CI blocks on CVEs.

---

### Phase 11 — Super Admin Panel
**Complexity:** Medium | **Duration:** 1–2 weeks | **Required within 30 days of launch**

#### Deliverables
- Internal management tool for the ViralScopes team
- All major admin operations accessible without database access

#### Tasks
- [ ] Organisation management: list, plan override, suspend, read-only impersonation (logged)
- [ ] User management: search, force verify, force password reset, suspend
- [ ] Billing & quota: view subscriptions, reset usage, apply credits
- [ ] Job & workflow: view logs, inspect dead-letter, retry/dismiss, manually trigger workflows
- [ ] Prompt library: view/edit/version/set-active, run test harness
- [ ] System health: Grafana panels, YouTube quota, Redis usage, dead-letter depth
- [ ] All admin actions logged to `audit_logs`

**Milestone:** All management operations functional. Every admin action audited.

---

### Phase 12 — Testing
**Complexity:** Medium | **Duration:** Ongoing from Phase 3; 1-week dedicated sprint before Phase 14

#### Deliverables
- All test suites passing in CI
- Coverage targets met (≥80% unit, ≥70% integration)
- Load test results documented

#### Tasks
- [ ] Unit tests: Viral Score, analytics, formula detection, hook classification, quota manager, data retention (≥80% coverage)
- [ ] Integration tests: all API endpoints, auth flows, webhook signature verification, usage tracking, dead-letter (≥70% coverage)
- [ ] Database tests: migration integrity, RLS enforcement, retention purge correctness
- [ ] Workflow tests: happy path and failure path per n8n workflow; idempotency verification
- [ ] E2E (Playwright): signup → onboarding → search → analysis → export; plan upgrade; API key lifecycle
- [ ] AI prompt regression: all active prompts against 10 fixed test videos — Zod schema must pass
- [ ] Load test (k6): 100 concurrent (baseline), 500 concurrent (stress), 1,000 queued jobs
- [ ] All tests in CI on every PR — merge blocked on failure

**Milestone:** All suites green in CI. Coverage targets met. Load test documented.

---

### Phase 13 — Documentation
**Complexity:** Small | **Duration:** Ongoing; 3–5 days before Phase 14

#### Deliverables
- All 8 project documents complete and published
- API reference auto-generated and current
- n8n workflow diagrams published

#### Tasks
- [ ] Installation Guide
- [ ] Deployment Guide (Coolify, env vars, Docker Compose prod)
- [ ] API Reference (auto-generated + hand-written examples)
- [ ] Database Schema Reference + ERD
- [ ] n8n Workflow Diagrams (one per workflow, failure paths annotated)
- [ ] Configuration Reference (all env vars)
- [ ] Scaling Guide
- [ ] Troubleshooting Guide
- [ ] Security Guide (rotation, RLS audit, breach response)
- [ ] Prompt Library Reference
- [ ] Data Retention Reference + GDPR request handling guide

**Milestone:** All documentation published and reviewed before production deployment.

---

### Phase 14 — Production Deployment
**Complexity:** Medium | **Duration:** 3–5 days

#### Deliverables
- All services live in production
- Monitoring active and alerting configured
- Daily backups verified with test restore
- Rollback procedure documented and tested

#### Tasks
- [ ] Deploy all services to production via Coolify
- [ ] Configure production Supabase (hosted, PgBouncer enabled)
- [ ] Configure production Redis (managed or self-hosted with persistence)
- [ ] Configure production S3 (Cloudflare R2 or AWS S3)
- [ ] Deploy production Prometheus + Grafana + Loki
- [ ] Configure PagerDuty or email alerting for critical failures
- [ ] Run full smoke test suite against production
- [ ] Configure DNS and CDN (Cloudflare)
- [ ] Enable DDoS protection and WAF rules
- [ ] Configure automated daily database backups (30-day retention)
- [ ] Execute test restore from backup
- [ ] Write deployment runbook
- [ ] Test rollback procedure for every service
- [ ] Confirm: all health checks green, all monitoring live, all alerts active

**Milestone:** Production live. All services healthy. Backups verified. Rollback tested. 🚀

---

## 6. Dependency Graph

```
Phase 1 (Foundation)
    └─→ Phase 2 (Infrastructure)         ← parallel with Phase 1
        └─→ Phase 3 (Database Schema)    ← parallel with Phase 2
            └─→ Phase 4 (Auth)
                    ├─→ Phase 5 (API)           ← parallel with Phase 8
                    │       ├─→ Phase 6 (n8n)   ← parallel with Phase 5
                    │       └─→ Phase 7 (Prompts) ← parallel with Phase 6
                    ├─→ Phase 8 (Frontend)       ← parallel with Phase 5
                    ├─→ Phase 9 (Billing)        ← depends on Phase 4 + 5
                    └─→ Phase 10 (Security)      ← parallel with Phase 9

Phase 11 (Admin Panel)    ← depends on Phase 5, 6, 9
Phase 12 (Testing)        ← runs incrementally from Phase 3; sprint before Phase 14
Phase 13 (Docs)           ← runs incrementally from Phase 5; complete before Phase 14
Phase 14 (Deployment)     ← depends on all prior phases
```

---

## 7. Parallel Development Opportunities

| Stream A | Stream B | Notes |
|---|---|---|
| Phase 1 — Foundation | Phase 2 — Infrastructure | Fully independent until first Docker run |
| Phase 2 — Infrastructure | Phase 3 — Database Schema | Schema design proceeds while infra is built |
| Phase 4 — Auth | Phase 3 — Database Schema | Auth table design alongside app schema |
| Phase 5 — Backend API | Phase 8 — Frontend | Frontend uses fixture data until API is ready |
| Phase 6 — n8n Workflows | Phase 7 — Prompt Library | Design prompts first; workflows consume them |
| Phase 6 — n8n Workflows | Phase 5 — Backend API | Both depend on Phase 3/4 but are independent of each other |
| Phase 9 — Billing | Phase 10 — Security | Both depend on Phase 5; independent of each other |
| Phase 11 — Admin Panel | Phase 12 — Testing | Both proceed after Phase 5/6/9 are complete |
| Phase 12 — Testing | Phase 13 — Documentation | Fully independent; both run incrementally throughout |

---

## 8. Version 1 — Post-MVP Additions

*Target: Months 6–9 post-launch*

### v1.5 Features

| Feature | Complexity | Rationale |
|---|---|---|
| AI Chat Interface | Medium | Highest-requested feature in pre-launch research; drives engagement and retention |
| Scheduled PDF Reports | Medium | Key value-add for agency customers; reduces manual export workflow |
| Trend Prediction Engine | Large | Differentiator over competitors; requires 3–6 months of trend history data |
| Chrome Extension | Medium | Lowers friction for ad hoc analysis; viral growth potential |
| Paddle Billing | Medium | Required for global VAT compliance; unblocks non-US enterprise sales |
| Database Read Replicas | Small | Required when read traffic warrants separation from write traffic |
| ClickHouse (analytics) | Large | Required when PostgreSQL query performance degrades on analytics workloads |

### v1.5 Tasks
- [ ] AI Chat Interface: floating widget, SSE streaming, contextual answers, deep links to detail pages
- [ ] Scheduled reports: weekly PDF digest, configurable day/time, email delivery
- [ ] Trend Prediction Engine: momentum scoring, growth probability, "about to peak" classification
- [ ] Chrome Extension: one-click YouTube video analysis from the browser
- [ ] Paddle integration: merchant of record, webhook handler with signature verification
- [ ] Read replica provisioning and routing for analytics queries
- [ ] ClickHouse deployment and analytics query migration

---

## 9. Version 2 — Platform Expansion

*Target: Months 10–18 post-launch*

### v2.0 Features

| Feature | Complexity | Rationale |
|---|---|---|
| TikTok analytics connector | Large | Second-largest short-form video platform; major creator demand |
| Instagram analytics connector | Large | Reels growth makes this the third-priority platform |
| Mobile Application (React Native) | Very Large | Enables real-time alert consumption on mobile; reduces churn |
| Public API & SDKs | Large | Unlocks developer ecosystem; enterprise integration stories |
| Team Collaboration | Medium | Required for agency and enterprise retention; comments, tasks, annotations |
| Crypto Billing | Medium | Requested by international and privacy-conscious users |
| Affiliate & Referral System (simplified) | Large | Primary viral growth lever; referral codes, commissions, PayPal payouts |
| White-label deployment (basic) | Large | Agency revenue multiplier; premium pricing tier |
| Multi-language content support | Large | Unlocks Spanish, Portuguese, German, French, Hindi markets |

### v2.0 Tasks
- [ ] TikTok Data API integration and connector architecture
- [ ] Instagram Graph API integration
- [ ] React Native app (iOS + Android): alerts, quick analysis, trend feed
- [ ] Public REST API documentation portal
- [ ] JavaScript and Python SDKs with code examples
- [ ] Team collaboration: comment threads on analyses, task assignments, @mentions
- [ ] Crypto billing: USDC/USDT invoice generation, FX rate lock, blockchain confirmation
- [ ] Affiliate system: referral codes, click and conversion tracking, commission engine, PayPal payouts
- [ ] White-label: custom domain, logo, colour scheme per agency workspace
- [ ] Language detection and multi-language trend clustering

---

## 10. Version 3 — Enterprise & Marketplace

*Target: Months 18–30 post-launch*

### v3.0 Features

| Feature | Complexity | Rationale |
|---|---|---|
| Plugin Marketplace | Very Large | Ecosystem play; third-party revenue sharing |
| Custom AI Models | Large | Fine-tuned viral scoring per niche; premium differentiator |
| Facebook / X / LinkedIn / Podcast connectors | Very Large | Full cross-platform intelligence |
| Enterprise SSO (SAML, OIDC) | Medium | Required for large enterprise sales |
| Advanced Fraud Detection (ML) | Large | Required at scale to protect affiliate payouts and billing integrity |
| Dynamic Pricing Intelligence | Large | Rule-based first; ML-based when data volume is sufficient |
| Full Multi-Tier Affiliate System | Large | Regional rules, AI optimisation, crypto payouts |

### v3.0 Tasks
- [ ] Plugin marketplace infrastructure: submission, review, publishing, revenue sharing
- [ ] Fine-tuning pipeline for niche-specific viral scoring models
- [ ] Facebook Graph API, X API, LinkedIn API, and podcast RSS connectors
- [ ] Enterprise SSO: SAML 2.0 and OIDC integration
- [ ] ML fraud detection: velocity analysis, device fingerprinting, network graph analysis
- [ ] Rule-based dynamic pricing: geo, usage pattern, cohort-based pricing rules
- [ ] Full affiliate system: multi-tier, regional commission rules, AI optimisation suggestions

---

## 11. Version 4+ — Advanced AI Systems

*Target: 24+ months post-launch — requires 2+ years of real transaction and behavioural data*

> ⚠️ **These features must not be built before the data exists to make them function correctly.** An AI system trained on insufficient data will make uninformed decisions, erode user trust, and introduce significant regulatory and financial risk. These are listed here for completeness, not as near-term priorities.

| Feature | Minimum Data Requirement | Estimated Complexity |
|---|---|---|
| Autonomous Financial AI (pricing autopilot) | 2 years of transaction data, 10,000+ customers | Very Large |
| Self-Evolving Monetisation OS | 2 years of behavioural data, A/B test history | Very Large |
| Global Payment Routing AI (ML-based) | 1M+ transactions across 3+ providers | Very Large |
| Multi-Touch Attribution Engine | 18+ months of affiliate and referral data | Large |
| Reinforcement Learning Pricing | 2 years of pricing experiment data | Very Large |

---

## 12. Priority Matrix

Tasks are prioritised using the **Impact vs Effort** framework.

| Quadrant | Description | Action |
|---|---|---|
| **High Impact, Low Effort** | Quick wins | Do first |
| **High Impact, High Effort** | Strategic investments | Plan and commit resources |
| **Low Impact, Low Effort** | Fill-in tasks | Do when bandwidth allows |
| **Low Impact, High Effort** | Traps | Avoid or defer indefinitely |

### Current Priority Ranking (MVP)

| Priority | Task / Feature | Impact | Effort | Quadrant |
|---|---|---|---|---|
| 1 | YouTube API Quota Manager | Critical | Low | ✅ Quick Win |
| 2 | CI/CD Pipeline | Critical | Low | ✅ Quick Win |
| 3 | Viral Score Engine | Critical | Medium | 🎯 Strategic |
| 4 | Auth + RBAC | Critical | Medium | 🎯 Strategic |
| 5 | n8n Discovery + Analysis Pipeline | Critical | High | 🎯 Strategic |
| 6 | Core Dashboard (all pages) | High | High | 🎯 Strategic |
| 7 | Stripe Billing | High | Medium | 🎯 Strategic |
| 8 | GDPR Compliance | High | Low | ✅ Quick Win |
| 9 | Transactional Email Service | High | Low | ✅ Quick Win |
| 10 | Super Admin Panel | Medium | Medium | 🎯 Strategic |
| 11 | Trend Prediction Engine | High | High | 🎯 Strategic (v1.5) |
| 12 | Crypto Billing | Low | High | ⚠️ Defer |
| 13 | Autonomous Financial AI | Low (at launch) | Very High | 🚫 Avoid until v4 |

---

## 13. Risk Register

| ID | Risk | Probability | Impact | Phase affected | Mitigation |
|---|---|---|---|---|---|
| R-01 | YouTube API quota exhaustion | High | Critical | Phase 5, 6 | Quota manager; cache-first; RapidAPI/Apify fallback |
| R-02 | AI cost overrun | High | High | Phase 6, 7 | Tiered analysis; aggressive caching; cost alerts |
| R-03 | n8n instability at volume | Medium | High | Phase 6 | Dead-letter queue; idempotency; horizontal scaling |
| R-04 | MVP scope creep | High | High | All | Strict scope definition; post-MVP backlog |
| R-05 | GDPR non-compliance | Low | Critical | Phase 10 | Baked into pre-launch roadmap |
| R-06 | Creator community backlash | Medium | High | All | Ethical constraint at product, prompt, and code levels |
| R-07 | Stripe downtime | Low | High | Phase 9 | Grace period; Paddle Post-MVP |
| R-08 | Supabase degradation | Low | Critical | Phase 3 | PgBouncer; daily backups; tested restore |
| R-09 | Security breach | Low | Critical | Phase 10 | RLS; audit logs; key hashing; dependency scanning |
| R-10 | Key person risk | Medium | Medium | All | Engineering standards documented; pair programming |
| R-11 | YouTube API terms change | Low | High | Phase 5, 6 | Multi-source strategy; platform-agnostic data model |
| R-12 | AI model deprecation | Medium | Medium | Phase 6, 7 | Abstraction layer; dual providers; prompt versioning |

---

## 14. Milestone Calendar

> All durations are estimates from project initiation (Week 0). Adjust based on actual team size and velocity.

| Milestone | Target Week | Phase | Deliverable |
|---|---|---|---|
| M1 — Project Ready | Week 1 | Phase 1 | Repo initialised, tooling configured, design system done |
| M2 — Infrastructure Live | Week 3 | Phase 2 | Docker running, CI/CD deployed to staging, monitoring live |
| M3 — Schema Complete | Week 4 | Phase 3 | All migrations applied, RLS active, ERD published |
| M4 — Auth Complete | Week 6 | Phase 4 | Full auth system + email templates live in staging |
| M5 — API v1 Complete | Week 9 | Phase 5 | All endpoints live, OpenAPI spec published |
| M6 — Workflows Live | Week 12 | Phase 6 | All 14 n8n workflows running, dead-letter queue active |
| M7 — Prompts Live | Week 12 | Phase 7 | All 8 prompts versioned, cached, test harness working |
| M8 — Dashboard Complete | Week 13 | Phase 8 | All MVP pages live in staging, onboarding tested |
| M9 — Billing Live | Week 15 | Phase 9 | Stripe billing live in staging, usage tracking active |
| M10 — Security Complete | Week 16 | Phase 10 | Security checklist done, GDPR endpoints live |
| M11 — Tests Green | Week 18 | Phase 12 | All test suites passing, coverage targets met |
| M12 — Docs Complete | Week 18 | Phase 13 | All documentation published and reviewed |
| M13 — Production Launch | Week 19–20 | Phase 14 | All services live in production 🚀 |
| M14 — Admin Panel | Week 22 | Phase 11 | Super Admin Panel live (within 30 days of launch) |
| M15 — v1.5 Launch | Week 36 | Post-MVP | AI Chat, Scheduled Reports, Chrome Extension, Paddle |
| M16 — v2.0 Launch | Week 72 | v2.0 | TikTok, Instagram, Mobile App, Public API |

---

*This roadmap is a living document. It is updated at every phase completion, whenever priorities change, and whenever new information invalidates an assumption. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [PRD.md](./PRD.md) — Product requirements and user stories
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current progress against this roadmap
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure evolution per phase
- [CHANGELOG.md](./CHANGELOG.md) — Version history
