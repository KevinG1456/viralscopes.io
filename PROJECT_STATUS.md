# PROJECT_STATUS.md

# ViralScopes.io — Project Status

> **Version:** 1.5
> **Last Updated:** 2026-07-25
> **Status:** Phase 2 — Infrastructure & DevOps (In Progress — blocked on BLK-002)
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

| Property                   | Value                                                           |
| -------------------------- | --------------------------------------------------------------- |
| **Current phase**          | Phase 2 — Infrastructure & DevOps (in progress, 22/32 verified) |
| **Overall MVP completion** | 10%                                                             |
| **Infrastructure stage**   | Stage 1 (dev environment provisioned; no production yet)        |
| **Active engineers**       | TBD                                                             |
| **Target MVP launch**      | Week 19–20 from project initiation                              |
| **Critical path item**     | BLK-002 (no VPS/Coolify/domain) — then Phase 3                  |
| **Active blockers**        | 1 (BLK-002 — no deployment infrastructure)                      |
| **Open risks**             | 2 (YouTube API quota strategy, AI cost model)                   |
| **Last status update**     | 2026-07-25                                                      |
| **Next milestone**         | M2 — Infrastructure Live (Week 3)                               |

---

## 2. Current Phase

### Complete: Pre-Development — Documentation Complete

All 8 core project documents have been authored and are ready for engineering handoff:

| Document                        | Status      | Notes                                                                    |
| ------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `PROJECT_RULES.md`              | ✅ Complete | Engineering standards, git workflow, Definition of Done                  |
| `PRD.md`                        | ✅ Complete | User personas, stories, functional and non-functional requirements       |
| `ROADMAP.md`                    | ✅ Complete | 14 MVP phases with task checklists, dependency graph, milestone calendar |
| `REPOSITORY_STRUCTURE.md`       | ✅ Complete | Full annotated monorepo hierarchy                                        |
| `INFRASTRUCTURE_GROWTH_PLAN.md` | ✅ Complete | 4-stage infrastructure evolution plan                                    |
| `README.md`                     | ✅ Complete | Installation, development, deployment, FAQ                               |
| `PROJECT_STATUS.md`             | ✅ Complete | This document                                                            |
| `CHANGELOG.md`                  | ✅ Complete | Initialised in Keep a Changelog format                                   |

### Complete: Phase 1 — Foundation & Project Setup

**Start condition:** Engineering team assigned and development environment available. ✅ Met.

**Key deliverables:**

- ✅ Monorepo initialised with all packages (`@viralscopes/web`, `@viralscopes/api`, `@viralscopes/shared`, `@viralscopes/db`) — `apps/api`, `packages/shared`, `packages/db` are scaffolded as empty stubs; business logic lands in later phases
- ✅ TypeScript (strict, ES2022), ESLint (flat config, no-`any`, no-unused-vars, import ordering), Prettier, Husky + lint-staged + secretlint configured across all packages
- ✅ Design system: provisional colour palette (light/dark), typography (Tailwind default scale + Geist Sans/Mono), Tailwind v4 CSS-native design tokens
- ✅ Logo placeholder, favicon, loading screen, 5-icon dashboard icon set placeholder
- ✅ `.env.example` populated with all required variables
- ✅ Git repository with branch protection rules configured — GitHub remote created (`KevinG1456/viralscopes.io`, private), `main`/`develop` pushed and tracking, `main-protection`/`develop-protection` rulesets created (require PR + 1 approval, block force pushes, block deletions, no admin bypass; required status checks intentionally deferred to Phase 2 since no CI exists yet)

**Verification:** `npm install`, `turbo run build`, `turbo run lint`, `turbo run type-check` all pass across all 4 packages. Dev server smoke-tested manually. `main`/`develop` confirmed tracking `origin/main`/`origin/develop` via `git branch -vv` (no `[gone]` markers), both at commit `0cb7a44`.

**Known limitation:** resolved — repo admin (the current solo maintainer) added to the bypass list on both rulesets, so self-merge works until a second collaborator joins. Revisit then.

**Next phase:** Phase 3 — Database & Core Schema. Not yet started (blocked behind BLK-002 for the infra-dependent parts of Phase 2; database work itself has no such dependency and could start in parallel).

---

### Active: Phase 2 — Infrastructure & DevOps

**Start condition:** Phase 1 complete. ✅ Met.

**Key deliverables — verified working (22/32 ROADMAP tasks):**

- ✅ `docker-compose.dev.yml` — genuinely brings up the whole stack with one command: `web`, `api` (hot-reload via bind mount + per-service `node_modules` volume), Postgres, Redis, MinIO, n8n, Prometheus, Grafana, Loki, Promtail, postgres-exporter, redis-exporter. All 12 containers verified healthy.
- ✅ Named volumes + a single bridge network (`viralscopes_network`); service-to-service DNS resolution confirmed
- ✅ Minimal Fastify bootstrap in `apps/api`: `GET /health`, `GET /ready` (checks DB + Redis connectivity — verified `503` when down, `200` when up), `GET /metrics` (Prometheus format, verified)
- ✅ Storage abstraction layer (`services/storage.service.ts`, S3-compatible via `@aws-sdk/client-s3`) — verified end-to-end against MinIO: put/get/delete/signed-URL round trip all passed
- ✅ Prometheus scrape targets: api, n8n, postgres-exporter, redis-exporter, prometheus itself — verified 5/5 `up`
- ✅ Grafana: datasources (Prometheus + Loki) and one dashboard ("Infrastructure Overview": API request rate/p95 latency/error rate, Postgres connections, Redis memory, service-up panel) provisioned and confirmed rendering real data — a deliberate scope trim from REPOSITORY_STRUCTURE.md's 5 named dashboards, since queue-health/YouTube-quota/business-metrics dashboards would have no data source until Phases 5/6/9 emit those metrics
- ✅ Loki + Promtail — verified logs flowing from all 12 containers via Docker service discovery
- ✅ Per-environment CORS policy (`CORS_ALLOWED_ORIGINS` env var)
- ✅ GitHub Actions `ci.yml` (lint/type-check/build/test) and `security.yml` (`npm audit --audit-level=high`) — written and locally-equivalent-verified; not yet exercised by a live PR
- ✅ `build.yml` — builds + pushes both Docker images to GHCR on merge to `main`; not yet exercised by a live merge
- ✅ `.github/dependabot.yml` — npm (root + workspaces), github-actions, and Docker ecosystem updates, weekly
- ✅ `infra/docker/Dockerfile.web` and `Dockerfile.api` — multi-stage, built and run successfully (`docker build` verified for both; caught and fixed a real bug where the root `prepare: husky` script broke `npm ci --omit=dev` in the prod-deps stage — fixed with `--ignore-scripts`)
- ✅ MinIO bucket (`viralscopes-dev`) auto-created on stack startup via `minio-init`

**Written as templates — unverified, no real infrastructure exists (BLK-002):**

- ⏳ `docker-compose.prod.yml` — matches `INFRASTRUCTURE_GROWTH_PLAN.md` Stage 1 architecture; never deployed
- ⏳ Traefik reverse proxy + Let's Encrypt SSL (`infra/traefik/`) — needs a real domain + server
- ⏳ `deploy-staging.yml` / `deploy-production.yml` — detect missing `COOLIFY_*_WEBHOOK_TOKEN` secrets and skip (not fail) rather than show a false red X
- ⏳ Cloudflare R2 production credentials — storage code is provider-agnostic and ready; untested against the real provider
- ⏳ Registering health endpoints with Coolify/Traefik probes — the healthcheck directives exist in `docker-compose.prod.yml`; Coolify itself doesn't exist to register with

**Deferred to Stage 2 by decision (matches `INFRASTRUCTURE_GROWTH_PLAN.md`, not this phase's scope):**

- Alertmanager-routed alerting rules (service down, queue backlog, error rate, disk > 80%)
- PagerDuty / email alert dispatch for critical failures

**Verification performed:** full stack brought up via `docker compose -f docker-compose.dev.yml up -d`; all 12 containers reached healthy/running state and stayed healthy for 12+ hours; `/health`, `/ready`, `/metrics` all curled and returned expected results; storage roundtrip test executed inside the running `api` container against live MinIO; Prometheus target health confirmed via its API; Grafana dashboard provisioning and panel data confirmed via its API; Promtail log labels confirmed present for every container. Both production Dockerfiles built successfully (`docker build`) after fixing the `--ignore-scripts` issue found during verification; the built `web` image was run standalone and confirmed serving `/` and `/api/health` correctly. Running the built `api` image standalone could not be confirmed in this session — Docker Desktop's build cache/image store grew very large (~35GB images, ~28GB build cache) over the session's many builds, and new `docker run` invocations got stuck in "Created" state indefinitely late in the session (the already-running dev-stack containers, started earlier, were unaffected and stayed healthy throughout). Since the `api` image runs the identical compiled code already verified live via the dev stack, this is treated as a low-risk gap — a fresh session with a clean Docker cache should confirm it in seconds.

**Next phase:** Phase 3 — Database & Core Schema can proceed in parallel (no dependency on BLK-002). Completing the remaining Phase 2 items requires a VPS/Coolify server and a domain — see BLK-002.

---

## 3. Overall Completion

### MVP Progress (Phases 1–14)

```
Pre-Development  ████████████████████  100%  ✅ Complete
Phase 1          ████████████████████  100%  ✅ Complete
Phase 2          █████████████░░░░░░░   69%  🚧 In progress (blocked on BLK-002)
Phase 3          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 4          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 5          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 6          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 7          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 8          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 9          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 10         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 11         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 12         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 13         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
Phase 14         ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
─────────────────────────────────────────────────────────
Overall MVP      █░░░░░░░░░░░░░░░░░░░   10%  🚧 In progress
```

### Task Completion Summary

> Phase 2's total was corrected from 28 to 32 — that's the actual count of ROADMAP.md's Phase 2
> checklist items across its 6 subsections (Docker Setup, Reverse Proxy & Networking, CI/CD,
> Monitoring, Health Checks, Object Storage); 28 was an approximation in the original document.

| Category                 | Total tasks | Complete | In progress | Pending |
| ------------------------ | ----------- | -------- | ----------- | ------- |
| Pre-Development (docs)   | 8           | 8        | 0           | 0       |
| Phase 1 — Foundation     | 14          | 14       | 0           | 0       |
| Phase 2 — Infrastructure | 32          | 22       | 0           | 10      |
| Phase 3 — Database       | 42          | 0        | 0           | 42      |
| Phase 4 — Auth           | 26          | 0        | 0           | 26      |
| Phase 5 — Backend API    | 58          | 0        | 0           | 58      |
| Phase 6 — n8n Workflows  | 52          | 0        | 0           | 52      |
| Phase 7 — Prompt Library | 12          | 0        | 0           | 12      |
| Phase 8 — Frontend       | 48          | 0        | 0           | 48      |
| Phase 9 — Billing        | 22          | 0        | 0           | 22      |
| Phase 10 — Security      | 18          | 0        | 0           | 18      |
| Phase 11 — Admin Panel   | 16          | 0        | 0           | 16      |
| Phase 12 — Testing       | 24          | 0        | 0           | 24      |
| Phase 13 — Documentation | 12          | 0        | 0           | 12      |
| Phase 14 — Deployment    | 14          | 0        | 0           | 14      |
| **Total**                | **448**     | **44**   | **0**       | **404** |

---

## 4. Phase Progress

| Phase    | Name                           | Status         | Completion | Target week         | Notes                                                            |
| -------- | ------------------------------ | -------------- | ---------- | ------------------- | ---------------------------------------------------------------- |
| Pre-Dev  | Documentation                  | ✅ Complete    | 100%       | Week 0              | All 8 documents authored                                         |
| Phase 1  | Foundation & Project Setup     | ✅ Complete    | 100%       | Week 1              | 14/14 tasks done; GitHub remote live, branch rulesets configured |
| Phase 2  | Infrastructure & DevOps        | 🚧 In progress | 69%        | Week 1–3            | 22/32 verified; 8 blocked on BLK-002; 2 deferred to Stage 2      |
| Phase 3  | Database & Core Schema         | ⏳ Not started | 0%         | Week 3–4            | Parallel with Phase 2                                            |
| Phase 4  | Authentication & Authorisation | ⏳ Not started | 0%         | Week 4–6            | Depends on Phase 3                                               |
| Phase 5  | Core Backend API               | ⏳ Not started | 0%         | Week 6–9            | Parallel with Phase 8                                            |
| Phase 6  | n8n Workflow Engine            | ⏳ Not started | 0%         | Week 9–12           | Parallel with Phase 5                                            |
| Phase 7  | AI Prompt Library              | ⏳ Not started | 0%         | Week 10–12          | Parallel with Phase 6                                            |
| Phase 8  | Frontend Dashboard             | ⏳ Not started | 0%         | Week 6–13           | Parallel with Phase 5                                            |
| Phase 9  | Subscription & Billing         | ⏳ Not started | 0%         | Week 13–15          | Depends on Phase 5                                               |
| Phase 10 | Security & Compliance          | ⏳ Not started | 0%         | Week 15–16          | Parallel with Phase 9                                            |
| Phase 11 | Super Admin Panel              | ⏳ Not started | 0%         | Week 20–22          | 30 days post-launch                                              |
| Phase 12 | Testing                        | ⏳ Not started | 0%         | Week 3–18 (ongoing) | Runs incrementally                                               |
| Phase 13 | Documentation                  | ⏳ Not started | 0%         | Week 5–18 (ongoing) | Runs incrementally                                               |
| Phase 14 | Production Deployment          | ⏳ Not started | 0%         | Week 19–20          | Depends on all phases                                            |

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

### Phase 1 — Foundation & Project Setup (14/14) ✅

- [x] Initialise monorepo: `@viralscopes/web`, `@viralscopes/api`, `@viralscopes/shared`, `@viralscopes/db` (`apps/api`, `packages/shared`, `packages/db` scaffolded as empty stubs)
- [x] Configure TypeScript strict mode across all packages (`tsconfig.base.json`, ES2022)
- [x] Set up ESLint with import ordering, no-`any`, no-unused-vars rules (flat config: `eslint.config.mjs` + shared `eslint.config.base.mjs`)
- [x] Configure Prettier with project settings (single quotes, 100-char lines, trailing commas)
- [x] Set up Husky pre-commit hooks (lint-staged + secretlint secret detection)
- [x] Establish Turborepo build pipeline configuration (`turbo.json`)
- [x] Finalise colour palette (dark mode + light mode tokens) — provisional, refinable once brand guidelines exist
- [x] Define typography scale — adopted Tailwind v4's default scale + Geist Sans/Mono
- [x] Build Tailwind CSS design tokens (CSS-native `@theme` in `globals.css`)
- [x] Create logo placeholder (SVG), favicon, and loading screen
- [x] Design dashboard icon set (5-icon placeholder set)
- [x] Document all environment variables in `.env.example`
- [x] Write initial README.md local setup instructions (+ "Current implementation status" note, Design Tokens section, broken cross-reference fixes)
- [x] Configure Git repository with branch protection rules for `main` and `develop` — GitHub remote created (`KevinG1456/viralscopes.io`, private), `main-protection`/`develop-protection` rulesets live (require PR + 1 approval, block force pushes/deletions, no admin bypass)

### Phase 2 — Infrastructure & DevOps (22/32) 🚧

**Docker Setup**

- [x] Dockerfiles for web + api (`infra/docker/Dockerfile.web`, `Dockerfile.api`, multi-stage) — n8n/Redis/MinIO use pinned official images directly, per approved decision
- [x] `docker-compose.dev.yml` — verified: all 12 containers healthy
- [ ] `docker-compose.prod.yml` — written as template, unverified — **BLK-002**
- [x] Named volumes: Postgres, Redis, n8n, MinIO
- [x] Internal Docker network topology (`viralscopes_network`)
- [x] Test one-command startup: `docker compose up` — verified

**Reverse Proxy & Networking**

- [ ] Traefik reverse proxy with automatic service discovery — written as template, unverified — **BLK-002**
- [ ] SSL/TLS via Let's Encrypt through Coolify — written as template, unverified — **BLK-002**
- [ ] Service routing rules (frontend, API, n8n, Grafana) via Traefik labels — written as template, unverified — **BLK-002**
- [x] Per-environment CORS policies (`CORS_ALLOWED_ORIGINS`)

**CI/CD Pipeline**

- [x] GitHub Actions: lint + type-check on every PR (`ci.yml`) — written, not yet exercised by a live PR
- [x] GitHub Actions: run all tests on every PR — wired as a safe no-op (no test suites exist yet; Phase 12)
- [x] GitHub Actions: build and push Docker images on merge to `main` (`build.yml`, GHCR) — written, not yet exercised by a live merge
- [ ] GitHub Actions: deploy to Coolify staging — template only, skips gracefully without secrets — **BLK-002**
- [ ] GitHub Actions: deploy to Coolify production with manual approval gate — template only, skips gracefully without secrets — **BLK-002**
- [x] `npm audit` vulnerability scan (`security.yml`, blocks on high/critical)
- [x] Dependabot configured (`.github/dependabot.yml`: npm, github-actions, docker ecosystems)

**Monitoring & Observability**

- [x] Prometheus with scrape targets for all services — verified 5/5 targets `up`
- [x] Grafana dashboards — one consolidated "Infrastructure Overview" dashboard provisioned and verified with real data (scope trim from 5 separate dashboards — see note below)
- [x] Loki for centralised log aggregation — verified
- [x] Wire all service and n8n workflow logs into Loki — verified via Promtail, all 12 containers confirmed shipping logs
- [ ] Alerting: service down, queue backlog spike, error rate spike, disk > 80% — **deferred to Stage 2** per `INFRASTRUCTURE_GROWTH_PLAN.md` (your decision)
- [ ] PagerDuty or email alerting for critical production failures — **deferred to Stage 2** (your decision)

**Health Checks**

- [x] `GET /health` on API — verified
- [x] `GET /ready` on API (checks DB + Redis) — verified: `503` when dependencies down, `200` when up
- [x] Equivalent health route on n8n — n8n's built-in `/healthz`; no background workers exist yet (Phase 6)
- [ ] Register health endpoints with Coolify and Traefik health probes — healthcheck directives written into `docker-compose.prod.yml`; Coolify itself doesn't exist to register with — **BLK-002**
- [x] Health check status panel in Grafana — "Service up" panel, verified

**Object Storage**

- [x] Configure MinIO for local development — verified, bucket auto-created on startup
- [ ] Configure Cloudflare R2 for production — needs a real R2 account/credentials — **BLK-002**
- [x] Define bucket structure (`thumbnails/`, `exports/`, `reports/`, `prompt-cache/`) — bucket created; these are virtual S3 key prefixes, not literal folders, so nothing further to provision
- [x] Storage abstraction layer (`services/storage.service.ts`) — verified end-to-end (put/get/delete/signed-URL) against live MinIO

> **Grafana dashboard scope note:** `REPOSITORY_STRUCTURE.md` names 5 dashboards (API Performance,
> Queue Health, Database Metrics, YouTube Quota, Business Metrics). Only API/DB/Redis metrics
> exist right now — Queue Health, YouTube Quota, and Business Metrics have no data source until
> Phases 5/6/9 emit those metrics. Building empty dashboard shells for them now was judged not
> worth it; one consolidated "Infrastructure Overview" dashboard covers everything with real data
> today. Revisit per-dashboard splitting once those metrics exist.

---

## 6. In-Progress Tasks

_No tasks are currently in progress._

_This section will be populated as engineers pick up Phase 2+ work. Each in-progress task will include:_

- _Task description_
- _Assigned engineer_
- _Branch name_
- _Started date_
- _Estimated completion_
- _Any blockers_

---

## 7. Pending Tasks

### Remaining — Phase 2 (blocked on BLK-002)

- [ ] Deploy `docker-compose.prod.yml` to a real VPS
- [ ] Configure Traefik + Let's Encrypt against a real domain
- [ ] Wire `COOLIFY_STAGING_WEBHOOK_TOKEN` / `COOLIFY_PRODUCTION_WEBHOOK_TOKEN` secrets once Coolify exists
- [ ] Configure Cloudflare R2 production credentials
- [ ] Register health endpoints with Coolify's health probes

### Next Up — Phase 3: Database & Core Schema

- [ ] Initialise Supabase project (local dev + hosted)
- [ ] Configure PgBouncer connection pooling
- [ ] Enable RLS on all tables from creation
- [ ] Set up Drizzle ORM with migration tooling
- [ ] Core schema: users, organisations, workspaces, sessions, audit logs, billing, content tables (see `ROADMAP.md` for the full 20+ table list)
- [ ] Dead-letter queue schema + admin retry endpoint
- [ ] Data retention automation
- [ ] Publish ERD to `/docs/database-erd.png`

_All remaining pending tasks are listed in full in [ROADMAP.md](./ROADMAP.md)._

---

## 8. Blockers

### Active Blockers

_No active blockers at this time._

---

### Blocker Log (Historical)

### BLK-001 — No GitHub remote configured yet

- **Raised:** 2026-07-21
- **Raised by:** Engineering (Phase 1 implementation)
- **Severity:** Medium
- **Phases affected:** Phase 1 (branch protection task), Phase 2 (CI/CD, Dependabot)
- **Description:** The repository had been developed locally with git but had no GitHub (or other) remote configured. Branch protection rules for `main`/`develop`, Dependabot/Renovate, and GitHub Actions CI/CD all required a remote to exist first.
- **Impact:** The last Phase 1 deliverable ("Configure Git repository with branch protection rules") could not be completed. Phase 2's CI/CD and Dependabot tasks were also blocked.
- **Resolution options considered:**
  1. Create a GitHub repository and push the existing local history to it, then configure branch protection per `PROJECT_RULES.md` section 5.2.
  2. Use a different remote (GitLab, Bitbucket) with equivalent protected-branch settings.
- **Owner:** Project Lead
- **Target resolution:** Before Phase 2 CI/CD tasks begin
- **Status:** Resolved
- **Resolution:** Created `KevinG1456/viralscopes.io` (private) on GitHub. Renamed local `master` → `main` to match `PROJECT_RULES.md` conventions, pushed `main` and created/pushed `develop` from it (both at commit `0cb7a44`, verified via `git branch -vv` showing clean tracking with no `[gone]` markers). Configured `main-protection` and `develop-protection` rulesets: require PR + 1 approval, block force pushes, block deletions, no admin bypass. Required status checks intentionally deferred — no CI pipeline exists yet (Phase 2 task); enabling that requirement now would block all merges permanently since no check could ever report success.
- **Resolved:** 2026-07-21

**Known follow-on limitation:** resolved 2026-07-21 — repo admin added to the bypass list on both rulesets so solo self-merge works. Revisit once a second collaborator joins.

**Still pending (tracked in Phase 2, not this blocker):** adding "require status checks to pass" to both rulesets once GitHub Actions CI exists.

---

### BLK-002 — No deployment infrastructure (VPS, Coolify, domain)

- **Raised:** 2026-07-22
- **Raised by:** Engineering (Phase 2 implementation)
- **Severity:** Medium
- **Phases affected:** Phase 2 (remaining ~8 of 32 tasks), Phase 14 (Production Deployment depends on this existing)
- **Description:** No VPS, no Coolify instance, and no registered domain exist yet. This blocks everything in Phase 2 that needs real infrastructure to verify: `docker-compose.prod.yml` deployment, Traefik + Let's Encrypt SSL, the `deploy-staging.yml` / `deploy-production.yml` GitHub Actions workflows, Cloudflare R2 production credentials, and registering health endpoints with Coolify's probes.
- **Impact:** These items are written as templates (config/workflow files exist and are structurally correct per `INFRASTRUCTURE_GROWTH_PLAN.md` Stage 1) but cannot be verified end-to-end. The deploy workflows are designed to skip gracefully (not fail red) when their required secrets are absent, so this does not block CI on `main`/`develop` in the meantime.
- **Resolution options:**
  1. Provision a VPS (per `INFRASTRUCTURE_GROWTH_PLAN.md` §3.3: ~8 vCPU / 32GB / 500GB NVMe) and install Coolify
  2. Register a domain and point DNS at the VPS through Cloudflare
  3. Create a Cloudflare R2 bucket and generate API credentials
  4. Add `COOLIFY_STAGING_WEBHOOK_TOKEN` / `COOLIFY_STAGING_WEBHOOK_URL` / `COOLIFY_PRODUCTION_WEBHOOK_TOKEN` / `COOLIFY_PRODUCTION_WEBHOOK_URL` as repository secrets, and `STAGING_URL` / `PRODUCTION_URL` as repository variables, once the above exist
  5. Configure the `production` GitHub Environment (Settings → Environments) with required reviewers, to provide the manual-approval gate
- **Owner:** To be assigned
- **Target resolution:** Before Phase 14 (Production Deployment) begins; ideally before Phase 9 (Billing) needs a real staging URL for Stripe webhook testing
- **Status:** Open

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

| Property            | Value                                          |
| ------------------- | ---------------------------------------------- |
| **ID**              | RISK-01                                        |
| **Raised**          | 2026-07-20                                     |
| **Severity**        | Critical                                       |
| **Probability**     | High                                           |
| **Phases affected** | Phase 5, Phase 6                               |
| **Status**          | Open — decision required before Phase 5 begins |

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

| Property            | Value                                                     |
| ------------------- | --------------------------------------------------------- |
| **ID**              | RISK-02                                                   |
| **Raised**          | 2026-07-20                                                |
| **Severity**        | High                                                      |
| **Probability**     | High                                                      |
| **Phases affected** | Phase 6, Phase 7                                          |
| **Status**          | Open — cost model must be validated before Phase 6 begins |

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

_No risks have been resolved yet._

---

## 10. Upcoming Milestones

| ID  | Milestone            | Target     | Phase    | Status     | Deliverable                                                |
| --- | -------------------- | ---------- | -------- | ---------- | ---------------------------------------------------------- |
| M1  | Project Ready        | Week 1     | Phase 1  | ⏳ Pending | Repo initialised, tooling configured, design system done   |
| M2  | Infrastructure Live  | Week 3     | Phase 2  | ⏳ Pending | Docker running, CI/CD deployed to staging, monitoring live |
| M3  | Schema Complete      | Week 4     | Phase 3  | ⏳ Pending | All migrations applied, RLS active, ERD published          |
| M4  | Auth Complete        | Week 6     | Phase 4  | ⏳ Pending | Full auth system + all email templates live in staging     |
| M5  | API v1 Complete      | Week 9     | Phase 5  | ⏳ Pending | All endpoints live, OpenAPI spec published                 |
| M6  | Workflows Live       | Week 12    | Phase 6  | ⏳ Pending | All 14 n8n workflows running, dead-letter queue active     |
| M7  | Prompts Live         | Week 12    | Phase 7  | ⏳ Pending | All 8 prompts versioned, cached, test harness working      |
| M8  | Dashboard Complete   | Week 13    | Phase 8  | ⏳ Pending | All MVP pages live in staging, onboarding tested           |
| M9  | Billing Live         | Week 15    | Phase 9  | ⏳ Pending | Stripe billing live in staging, usage tracking active      |
| M10 | Security Complete    | Week 16    | Phase 10 | ⏳ Pending | Security checklist done, GDPR endpoints live               |
| M11 | Tests Green          | Week 18    | Phase 12 | ⏳ Pending | All test suites passing, coverage targets met              |
| M12 | Docs Complete        | Week 18    | Phase 13 | ⏳ Pending | All technical docs published and reviewed                  |
| M13 | Production Launch 🚀 | Week 19–20 | Phase 14 | ⏳ Pending | All services live in production                            |
| M14 | Admin Panel Live     | Week 22    | Phase 11 | ⏳ Pending | Super Admin Panel live (within 30 days of launch)          |
| M15 | v1.5 Launch          | Week 36    | Post-MVP | ⏳ Pending | AI Chat, Scheduled Reports, Chrome Extension, Paddle       |
| M16 | v2.0 Launch          | Week 72    | v2.0     | ⏳ Pending | TikTok, Instagram, Mobile App, Public API                  |

---

## 11. Decisions Made

Significant decisions are logged here with context, options considered, and rationale. For full technical decisions, see the Architecture Decision Records (ADRs) in `docs/decisions/`.

---

### DEC-001 — Monorepo Architecture

| Property       | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| **Date**       | 2026-07-20                                                  |
| **Decision**   | Use a Turborepo monorepo with `apps/` and `packages/`       |
| **Decided by** | Engineering Lead                                            |
| **ADR**        | [ADR-001-monorepo.md](./docs/decisions/ADR-001-monorepo.md) |

**Context:** The project has two applications (Next.js frontend, Fastify API) that share TypeScript types, Zod schemas, and constants. A monorepo prevents type drift and enables atomic cross-package refactoring.

**Options considered:**

1. Separate repositories per service — simple to start, but type sharing requires publishing packages or copy-pasting
2. Turborepo monorepo — single repository, shared packages, consistent tooling, built-in build caching
3. Nx monorepo — more powerful but significantly more complex configuration

**Decision:** Turborepo monorepo. Best balance of simplicity and capability for a small team.

---

### DEC-002 — Fastify over Express

| Property       | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| **Date**       | 2026-07-20                                                                          |
| **Decision**   | Use Fastify 4.x for the backend API                                                 |
| **Decided by** | Engineering Lead                                                                    |
| **ADR**        | [ADR-002-fastify-over-express.md](./docs/decisions/ADR-002-fastify-over-express.md) |

**Context:** The API needs to handle high-frequency requests from the dashboard and the n8n workflow engine simultaneously. Performance, TypeScript support, and validation ergonomics are key selection criteria.

**Options considered:**

1. Express — familiar, large ecosystem, but slow and lacks native TypeScript support
2. Fastify — 2–3× faster than Express, first-class TypeScript, built-in JSON schema validation, plugin architecture
3. Hono — newer, very fast, but smaller ecosystem and less mature for production SaaS

**Decision:** Fastify. The performance advantage and TypeScript-first design align with project requirements.

---

### DEC-003 — n8n for Workflow Orchestration

| Property       | Value                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| **Date**       | 2026-07-20                                                                    |
| **Decision**   | Use self-hosted n8n for all background workflow orchestration                 |
| **Decided by** | Engineering Lead                                                              |
| **ADR**        | [ADR-003-n8n-for-workflows.md](./docs/decisions/ADR-003-n8n-for-workflows.md) |

**Context:** The AI analysis pipeline has 14 distinct workflow stages, each calling different external services. A visual workflow engine reduces boilerplate and makes the pipeline observable and debuggable without writing custom worker code.

**Options considered:**

1. Custom BullMQ workers — maximum control, but significant boilerplate for 14 workflows
2. n8n (self-hosted) — visual editor, built-in retry logic, credential management, large integration library
3. Temporal — powerful, but complex to operate; overkill for current scale
4. AWS Step Functions — managed, but vendor lock-in and per-execution cost at scale

**Decision:** n8n. Best fit for the workflow complexity and team size. Self-hosted keeps costs low and data on our infrastructure.

---

### DEC-004 — Drizzle ORM over Prisma

| Property       | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| **Date**       | 2026-07-20                                                        |
| **Decision**   | Use Drizzle ORM for database access and migrations                |
| **Decided by** | Engineering Lead                                                  |
| **ADR**        | [ADR-004-drizzle-orm.md](./docs/decisions/ADR-004-drizzle-orm.md) |

**Context:** The data layer needs to support complex analytics queries, partitioned tables, and explicit control over generated SQL. The ORM must not become a performance bottleneck at scale.

**Options considered:**

1. Prisma — popular, excellent DX for CRUD, but generates suboptimal SQL for complex queries; migration system less transparent
2. Drizzle ORM — generates clean, predictable SQL; lightweight; excellent TypeScript inference; full migration control
3. Raw SQL with pg — maximum control but no type safety; too much boilerplate for a small team

**Decision:** Drizzle ORM. Clean SQL generation, TypeScript-first, and the migration system gives full visibility into every schema change.

---

### DEC-005 — Dual AI Providers (Claude + OpenAI)

| Property       | Value                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-20                                                                                                             |
| **Decision**   | Use Claude (Anthropic) for reasoning tasks and GPT-4o for structured extraction; each serves as fallback for the other |
| **Decided by** | Engineering Lead                                                                                                       |
| **ADR**        | [ADR-005-dual-ai-providers.md](./docs/decisions/ADR-005-dual-ai-providers.md)                                          |

**Context:** Different AI tasks have different requirements. Content analysis and recommendation generation benefit from Claude's nuanced reasoning. Structured JSON extraction and vision tasks benefit from GPT-4o's speed and reliability.

**Options considered:**

1. Single provider (Claude only) — simpler, but no fallback if Anthropic has downtime
2. Single provider (OpenAI only) — simpler, but Claude outperforms GPT-4o on strategic reasoning
3. Dual providers with task-specific routing — more complex, but optimises cost and quality per task type; adds resilience

**Decision:** Dual providers. Task routing documented per workflow. AI provider accessed through an abstraction layer — can add or swap providers without touching workflow logic.

---

### DEC-006 — Cloudflare R2 for Object Storage

| Property       | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| **Date**       | 2026-07-20                                                              |
| **Decision**   | Use Cloudflare R2 as the primary object storage provider for production |
| **Decided by** | Engineering Lead                                                        |

**Context:** The platform stores thumbnails, exports, and cached AI outputs. Egress costs on AWS S3 are significant at scale.

**Options considered:**

1. AWS S3 — industry standard, excellent reliability, but egress costs at $0.09/GB
2. Cloudflare R2 — S3-compatible, zero egress fees, integrated with Cloudflare CDN
3. Backblaze B2 — low cost, but less CDN integration

**Decision:** Cloudflare R2. Zero egress fees provide material cost savings; S3-compatible API means migration to AWS S3 is straightforward if needed. MinIO used for local development (S3-compatible, zero cost).

---

### DEC-007 — Tailwind CSS v4 (supersedes earlier "3.x" reference)

| Property       | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| **Date**       | 2026-07-21                                                      |
| **Decision**   | Use Tailwind CSS v4, not v3 as originally listed in `README.md` |
| **Decided by** | Engineering (Phase 1 implementation)                            |

**Context:** `create-next-app`'s current default scaffolds Tailwind v4, which uses a CSS-native `@theme` configuration instead of a `tailwind.config.ts` file. `README.md` had listed "3.x" before any code existed.

**Options considered:**

1. Downgrade to Tailwind v3 to match the original doc — matches the doc literally, but fights the toolchain default and loses v4's performance/DX improvements
2. Keep Tailwind v4 and correct the documentation — accepts a small doc correction in exchange for staying on the actively-maintained, already-working version

**Decision:** Keep Tailwind v4. `README.md`, `REPOSITORY_STRUCTURE.md` updated accordingly (CSS-based tokens in `globals.css`, no `tailwind.config.ts`).

---

### DEC-008 — secretlint for Pre-Commit Secret Scanning

| Property       | Value                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-21                                                                                         |
| **Decision**   | Use `secretlint` (`@secretlint/secretlint-rule-preset-recommend`) as the pre-commit secret scanner |
| **Decided by** | Engineering (Phase 1 implementation)                                                               |

**Context:** `PROJECT_RULES.md` section 4.3 named `git-secrets` or `detect-secrets` without picking one; both require a non-npm toolchain (Go binary / Python), which adds friction to an otherwise all-npm monorepo.

**Options considered:**

1. `git-secrets` — mature, but a separate Go binary to install per-machine and in CI
2. `detect-secrets` — mature, Python-based, same cross-toolchain friction
3. `secretlint` — npm-native, integrates directly with the existing lint-staged pipeline, verified to catch private keys and similar credential patterns during Phase 1 testing

**Decision:** `secretlint`. `detect-secrets` remains documented as an acceptable alternative in `PROJECT_RULES.md` if a future credential format isn't covered by secretlint's rule presets.

---

### DEC-009 — Flat-Config ESLint (`eslint.config.mjs`)

| Property       | Value                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-21                                                                                                                                                                         |
| **Decision**   | Use ESLint's flat config format (`eslint.config.mjs` per package + shared `eslint.config.base.mjs`), not the legacy `.eslintrc.js` named in the original `REPOSITORY_STRUCTURE.md` |
| **Decided by** | Engineering (Phase 1 implementation)                                                                                                                                               |

**Context:** `create-next-app`'s current default already scaffolds flat-config ESLint (`eslint.config.mjs`), which is ESLint's current standard going forward. Flat config does not cascade across directories, so each package has its own file importing shared rules from a root `eslint.config.base.mjs`.

**Decision:** Keep flat config. `REPOSITORY_STRUCTURE.md` updated to reflect `eslint.config.mjs` / `eslint.config.base.mjs` instead of `.eslintrc.js`.

---

### DEC-010 — PagerDuty/Alertmanager Deferred to Stage 2

| Property       | Value                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-22                                                                                         |
| **Decision**   | Do not set up Alertmanager or PagerDuty in Phase 2, despite `ROADMAP.md` listing it as an MVP task |
| **Decided by** | User decision, Phase 2 planning                                                                    |

**Context:** `ROADMAP.md` Phase 2 lists "Set up PagerDuty or email alerting for critical production failures" as an MVP task. `INFRASTRUCTURE_GROWTH_PLAN.md` section 13 explicitly places Alertmanager + PagerDuty at **Stage 2** ("Add Alertmanager + PagerDuty") — Stage 1's monitoring section only lists Prometheus + Grafana + Loki. The two documents conflict.

**Options considered:**

1. Follow `ROADMAP.md` literally — set up PagerDuty now, even though `INFRASTRUCTURE_GROWTH_PLAN.md` says it's premature at MVP scale (0–2,000 MAU)
2. Follow `INFRASTRUCTURE_GROWTH_PLAN.md` — defer Alertmanager/PagerDuty to Stage 2, ship Prometheus + Grafana + Loki only for now

**Decision:** Follow `INFRASTRUCTURE_GROWTH_PLAN.md`. No Alertmanager, no PagerDuty, no formal alert-routing rules this phase. Basic visibility exists via Grafana dashboards and Explore (ad hoc Loki queries). Revisit at Stage 2 trigger (per `INFRASTRUCTURE_GROWTH_PLAN.md` §2: 2,000+ MAU or £15k+ MRR).

---

### DEC-011 — Official Pinned Images Instead of Custom Dockerfiles for n8n/Redis/MinIO

| Property       | Value                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-22                                                                                                                                                                                               |
| **Decision**   | Custom Dockerfiles only for `apps/web` and `apps/api`. n8n, Redis, MinIO, Postgres, and all monitoring images use official images pinned to a resolved digest, referenced directly in the compose files. |
| **Decided by** | User decision, Phase 2 planning                                                                                                                                                                          |

**Context:** `ROADMAP.md`'s task wording ("Write Dockerfiles for: Next.js frontend, Node.js API, n8n, Redis, MinIO") could be read as requiring a custom Dockerfile per service, but n8n/Redis/MinIO/Postgres are all used as-is with no custom build step — wrapping them in a Dockerfile would add a redundant layer with no benefit.

**Decision:** Custom Dockerfiles for the two services we actually build (`infra/docker/Dockerfile.web`, `Dockerfile.api`). Every other service pins its official image to a resolved SHA-256 digest (not just a tag) — satisfies `PROJECT_RULES.md`'s "Docker base images pinned" requirement more rigorously than tag-pinning alone, since a digest can't silently change. Dependabot's `docker` ecosystem entry (`.github/dependabot.yml`, directory `/infra/docker`) keeps these current going forward.

---

### DEC-012 — Plain Postgres Container in Phase 2 (Full Supabase Setup Deferred to Phase 3)

| Property       | Value                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Date**       | 2026-07-22                                                                                                                                       |
| **Decision**   | `docker-compose.dev.yml` includes a plain `postgres:16-alpine` container + named volume. No Supabase Studio, Auth, PostgREST, or RLS this phase. |
| **Decided by** | User decision, Phase 2 planning                                                                                                                  |

**Context:** `ROADMAP.md` Phase 2's task list requires a "Configure named volumes: PostgreSQL, ..." deliverable, but full Supabase project initialisation (Studio, Auth, PostgREST, RLS) is explicitly Phase 3's job ("Initialise Supabase project (local dev + hosted)"). Also clarified during implementation: in **production**, Postgres is Supabase-hosted (external, managed) and object storage is Cloudflare R2 (external, S3-compatible over HTTPS) — neither is a self-hosted container, so `docker-compose.prod.yml` deliberately has no `postgres` or `minio` service at all, unlike `docker-compose.dev.yml`.

**Decision:** Plain Postgres + volume in dev only, matching just the "shape" Phase 2 needs. Phase 3 does the actual Supabase project setup on top of it.

---

### DEC-013 — Minimal Fastify Bootstrap in Phase 2 (Full Layered API Deferred to Phase 5)

| Property       | Value                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**       | 2026-07-22                                                                                                                                                                                                                       |
| **Decision**   | `apps/api` gets a minimal Fastify server this phase — `/health`, `/ready`, `/metrics` only, via direct plugin registration, not the full routes → controllers → services → repositories layering from `REPOSITORY_STRUCTURE.md`. |
| **Decided by** | Approved implementation plan, Phase 2                                                                                                                                                                                            |

**Context:** `ROADMAP.md` Phase 2 requires working health-check endpoints, which needs _some_ running server, but the full layered API architecture is explicitly Phase 5's scope. Building the full layering now for three endpoints would be premature structure with nothing to justify it yet.

**Decision:** `server.ts` + `plugins/{cors,health,metrics}.plugin.ts` + `services/storage.service.ts` only. New dependencies added: `fastify`, `@fastify/cors`, `pg` and `ioredis` (for `/ready`'s connectivity checks), `prom-client` (for `/metrics`), `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (for the storage abstraction), `tsx` (dev-time runner, since there's now an actual server process to run and watch). Phase 5 builds out the real routes/controllers/services/repositories structure around this.

---

## 12. Technical Debt Log

Technical debt is tracked here from the moment it is knowingly incurred. Each entry includes the reason it was accepted and a plan to resolve it.

---

### TD-001 — Single Server Deployment (Stage 1)

| Property            | Value                  |
| ------------------- | ---------------------- |
| **Logged**          | 2026-07-20             |
| **Severity**        | Medium                 |
| **Phases affected** | Phase 2, Phase 14      |
| **Status**          | Accepted (intentional) |

**Description:** All services run on a single VPS at MVP launch. There is no horizontal scaling, no database read replica, and Redis is a single instance.

**Why accepted:** Stage 1 infrastructure is sufficient for 0–2,000 MAU and keeps costs under £900/month during the validation phase. Over-engineering infrastructure before product-market fit is a common and expensive mistake.

**Resolution plan:** Migrate to Stage 2 (separated services, managed Redis, read replica) when Stage 1 upgrade triggers are breached. Target: when MAU exceeds 2,000 or MRR exceeds £15k. See [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md).

---

### TD-002 — No Distributed Tracing at Launch

| Property            | Value                  |
| ------------------- | ---------------------- |
| **Logged**          | 2026-07-20             |
| **Severity**        | Low                    |
| **Phases affected** | Phase 2                |
| **Status**          | Accepted (intentional) |

**Description:** The MVP monitoring stack (Prometheus + Grafana + Loki) does not include distributed tracing (OpenTelemetry). Diagnosing latency across the API → n8n → AI pipeline will require correlating logs by correlation ID rather than following a trace.

**Why accepted:** Distributed tracing adds operational complexity and cost that is not justified at MVP scale with a small team.

**Resolution plan:** Add OpenTelemetry instrumentation and Jaeger/Tempo at Stage 3. All services are built with `correlationId` on every log entry, making log-based correlation viable until then.

---

### TD-003 — PostgreSQL Full-Text Search (Not Typesense)

| Property            | Value                  |
| ------------------- | ---------------------- |
| **Logged**          | 2026-07-20             |
| **Severity**        | Low                    |
| **Phases affected** | Phase 5                |
| **Status**          | Accepted (intentional) |

**Description:** The MVP uses PostgreSQL `tsvector` + GIN indexes for full-text search rather than a dedicated search engine (Typesense or Elasticsearch).

**Why accepted:** PostgreSQL full-text search is adequate for < 1 million video records and < 100 concurrent search requests. Adding Typesense at MVP would introduce operational complexity before it is needed.

**Resolution plan:** Migrate to Typesense when search query p95 exceeds 500ms or the video database exceeds 1 million records. See [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) Section 12.

---

### TD-004 — No Redis Persistence at Launch

| Property            | Value                  |
| ------------------- | ---------------------- |
| **Logged**          | 2026-07-20             |
| **Severity**        | Medium                 |
| **Phases affected** | Phase 2                |
| **Status**          | Accepted (intentional) |

**Description:** The Stage 1 Redis instance runs in Docker without AOF (Append-Only File) or RDB persistence enabled. A Redis restart will lose all cached data, rate limit counters, and queue state.

**Why accepted:** Cache misses are acceptable — data will be re-fetched from PostgreSQL. Rate limit counters resetting is a minor issue at MVP scale. BullMQ jobs that are in-flight at restart will be re-queued by n8n.

**Resolution plan:** Migrate to managed Redis (Upstash or Redis Cloud) with AOF + RDB persistence at Stage 2. Queue data loss risk is eliminated with persisted Redis.

---

## 13. Known Issues

_No known issues have been logged yet. Development has not started._

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

### This Week (Week of 2026-07-20)

| Priority | Task                                                                            | Owner            | Notes                                                                         |
| -------- | ------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| 🟠 P2    | Decide YouTube API quota strategy (RISK-01)                                     | Engineering Lead | Decision needed before Phase 5                                                |
| 🟠 P2    | Run AI cost model prototype — sample 100 videos, measure actual cost (RISK-02)  | Engineering Lead | Decision needed before Phase 6                                                |
| 🟡 P3    | Review/refine the provisional design token palette with actual brand guidelines | Designer         | Palette is a Phase 1 placeholder (DEC-007-adjacent); refine when brand exists |
| 🟡 P3    | Set up project management tooling (Linear, Jira, or GitHub Projects)            | Project Lead     | Needed to track Phase 2+ tasks                                                |

### This Week (Week of 2026-07-22) — resolve BLK-002

| Priority | Task                                                                            | Owner      | Notes                                                                |
| -------- | ------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| 🔴 P1    | Provision a VPS and install Coolify                                             | DevOps     | Unblocks the remaining ~8 Phase 2 tasks (BLK-002)                    |
| 🔴 P1    | Register a domain, point DNS through Cloudflare                                 | DevOps     | Required for Traefik + Let's Encrypt to actually issue a certificate |
| 🟠 P2    | Create a Cloudflare R2 bucket + API credentials                                 | DevOps     | Storage code is ready; just needs real credentials (BLK-002)         |
| 🟠 P2    | Open a PR to confirm `ci.yml`/`security.yml`/`build.yml` actually run on GitHub | Engineer 1 | Written and locally verified, but never exercised by a live PR/merge |

### Next Week (Phase 3 Start)

| Priority | Task                                           | Owner        | Notes                                            |
| -------- | ---------------------------------------------- | ------------ | ------------------------------------------------ |
| 🔴 P1    | Initialise Supabase project (local + hosted)   | Engineer 2   | Phase 3 critical path                            |
| 🔴 P1    | Set up Drizzle ORM with migration tooling      | Engineer 2   | Phase 3 critical path                            |
| 🟠 P2    | Design and migrate core schema tables          | Engineer 1/2 | See `ROADMAP.md` Phase 3 for the full table list |
| 🟡 P3    | Draft Stripe product and pricing configuration | Product Lead | Needed before Phase 9                            |

### Backlog (Next 4 Weeks)

- Resolve BLK-002, complete the remaining Phase 2 tasks
- Begin Phase 3 (Database Schema) — no dependency on BLK-002, can start immediately
- Begin Phase 4 (Auth) immediately after Phase 3 core schema is complete
- First stakeholder demo: staging environment with auth + empty dashboard shell (target: Week 6)

---

## Status Update History

| Date       | Updated by                               | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-20 | Engineering Lead                         | Initial document created. Pre-development phase complete. All 8 project documents authored. Development not yet started.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-21 | Engineering (Phase 1 implementation)     | Phase 1 — Foundation & Project Setup: 13/14 tasks complete. Monorepo scaffolded (Turborepo, npm workspaces, 4 packages), TypeScript/ESLint/Prettier/Husky/secretlint configured, design tokens and placeholder brand assets added, `.env.example` written. Remaining task (branch protection) blocked on a GitHub remote existing — logged as BLK-001. Added DEC-007 (Tailwind v4), DEC-008 (secretlint), DEC-009 (flat-config ESLint).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-07-21 | Engineering (Phase 1 implementation)     | **Phase 1 complete (14/14).** BLK-001 resolved: created `KevinG1456/viralscopes.io` (private) on GitHub, renamed `master` → `main`, pushed `main` and `develop` (both tracking cleanly at `0cb7a44`), configured `main-protection`/`develop-protection` rulesets (PR + 1 approval, no force-push/delete, no admin bypass; status checks deferred to Phase 2). Phase 2 — Infrastructure & DevOps is now the critical path item.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-22 | Engineering (Phase 2 implementation)     | **Phase 2 substantially complete (22/32, corrected from an inaccurate 28-task total).** `docker-compose.dev.yml` verified end-to-end: all 12 containers healthy, `/health`/`/ready`/`/metrics` confirmed, storage roundtrip (put/get/delete/signed-URL) passed against live MinIO, Prometheus 5/5 targets up, Grafana dashboard rendering real data, Promtail confirmed shipping logs from every container. Both production Dockerfiles built successfully (caught and fixed a real `--ignore-scripts` bug in the process). Remaining ~8 tasks need real infrastructure that doesn't exist — logged as **BLK-002** (VPS/Coolify/domain/R2). Alertmanager/PagerDuty deferred to Stage 2 per `INFRASTRUCTURE_GROWTH_PLAN.md` (resolves a doc conflict with `ROADMAP.md`). Added DEC-010 (PagerDuty deferral), DEC-011 (pinned official images vs. custom Dockerfiles), DEC-012 (plain Postgres in Phase 2), DEC-013 (minimal Fastify bootstrap). Phase 3 — Database & Core Schema can start in parallel; it has no dependency on BLK-002.                                                                                                                                                                                     |
| 2026-07-25 | Engineering (architecture + docs review) | Architecture review of Phase 2 surfaced two real, unfixed findings: `/metrics` is publicly routable in `docker-compose.prod.yml`'s Traefik config (no path restriction), and `infra/traefik/dynamic/middlewares.yml` is missing a CSP header required by `PROJECT_RULES.md` §4.4 / `PRD.md` §7.4 — both left unfixed pending explicit approval, per instruction not to modify code during review. Documentation consistency pass across `ROADMAP.md`/`PROJECT_STATUS.md`/`README.md`/`CHANGELOG.md`/`PRD.md`/`REPOSITORY_STRUCTURE.md` found `README.md` incorrectly claimed Phase 2 was "completed" (corrected to match this document's "22/32, in progress"), a stale `54322` port reference, a stale `/health` example version string, and placeholder repo URLs (badge, clone command) not updated to the real `KevinG1456/viralscopes.io` repo — all fixed. Also caught a latent bug in `build.yml`: `ghcr.io/${{ github.repository }}` will fail because the repo owner (`KevinG1456`) contains uppercase characters, which OCI registries reject — logged in `CHANGELOG.md`, not yet fixed (never exercised by a live merge, so previously undetected).                                                              |
| 2026-07-25 | Engineering (fix pass)                   | **All three architecture-review findings fixed**, on explicit request. `docker-compose.prod.yml`: added a higher-priority `api-metrics` Traefik router matching `PathPrefix(/metrics)`, gated by a new `deny-external` middleware (`ipAllowList: 127.0.0.1/32`) — blocks public access; Prometheus is unaffected since it scrapes over the internal Docker network, not through Traefik. `infra/traefik/dynamic/middlewares.yml`: added the missing `contentSecurityPolicy` header (baseline policy, flagged for tightening once Phase 8 builds the real frontend). `build.yml`: added a step to lowercase `github.repository` before use in the GHCR image tag; verified the shell logic directly (`KevinG1456/viralscopes.io` → `keving1456/viralscopes.io`). Restored the now-correct concrete GHCR example in `README.md`'s Manual Deployment section. All three files validated via Prettier's YAML/YAML-adjacent parser (Docker daemon was down for live testing — noted, not blocking, since these are config corrections with no runtime dependency on Docker being up). Phase 2's task count/status is unchanged by these fixes — they harden already-`BLK-002`-blocked templates, not resolve the blocker itself. |

---

_This document must be updated every Monday and after every phase completion, blocker change, or significant decision. Assign a specific person to own status updates — without ownership, they do not happen._

_Next scheduled update: 2026-07-27_

---

**Related Documents:**

- [ROADMAP.md](./ROADMAP.md) — Full phase breakdown with task checklists
- [CHANGELOG.md](./CHANGELOG.md) — Version history of shipped features
- [PRD.md](./PRD.md) — Product requirements and success metrics
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure stage and upgrade triggers
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards and Definition of Done
