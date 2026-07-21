# PROJECT_STATUS.md

# ViralScopes.io — Project Status

> **Version:** 1.2
> **Last Updated:** 2026-07-21
> **Status:** Phase 1 — Foundation & Project Setup (Complete)
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

| Property                   | Value                                                          |
| -------------------------- | -------------------------------------------------------------- |
| **Current phase**          | Phase 1 — Foundation & Project Setup (complete) — Phase 2 next |
| **Overall MVP completion** | 5%                                                             |
| **Infrastructure stage**   | Stage 0 (not yet provisioned)                                  |
| **Active engineers**       | TBD                                                            |
| **Target MVP launch**      | Week 19–20 from project initiation                             |
| **Critical path item**     | Phase 2 — Infrastructure & DevOps                              |
| **Active blockers**        | None                                                           |
| **Open risks**             | 2 (YouTube API quota strategy, AI cost model)                  |
| **Last status update**     | 2026-07-21                                                     |
| **Next milestone**         | M1 — Project Ready (Week 1)                                    |

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

**Known limitation:** with 1 required approval and no bypass, a solo maintainer cannot self-merge PRs on either branch until a second collaborator joins or the ruleset is temporarily relaxed. Not currently addressed — flagging for whoever hits it first.

**Next phase:** Phase 2 — Infrastructure & DevOps (Docker, CI/CD, monitoring stack). Not yet started.

---

## 3. Overall Completion

### MVP Progress (Phases 1–14)

```
Pre-Development  ████████████████████  100%  ✅ Complete
Phase 1          ████████████████████  100%  ✅ Complete
Phase 2          ░░░░░░░░░░░░░░░░░░░░    0%  ⏳ Not started
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
Overall MVP      █░░░░░░░░░░░░░░░░░░░    5%  🚧 In progress
```

### Task Completion Summary

| Category                 | Total tasks | Complete | In progress | Pending |
| ------------------------ | ----------- | -------- | ----------- | ------- |
| Pre-Development (docs)   | 8           | 8        | 0           | 0       |
| Phase 1 — Foundation     | 14          | 14       | 0           | 0       |
| Phase 2 — Infrastructure | 28          | 0        | 0           | 28      |
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
| **Total**                | **444**     | **22**   | **0**       | **422** |

---

## 4. Phase Progress

| Phase    | Name                           | Status         | Completion | Target week         | Notes                                                            |
| -------- | ------------------------------ | -------------- | ---------- | ------------------- | ---------------------------------------------------------------- |
| Pre-Dev  | Documentation                  | ✅ Complete    | 100%       | Week 0              | All 8 documents authored                                         |
| Phase 1  | Foundation & Project Setup     | ✅ Complete    | 100%       | Week 1              | 14/14 tasks done; GitHub remote live, branch rulesets configured |
| Phase 2  | Infrastructure & DevOps        | ⏳ Not started | 0%         | Week 1–3            | Parallel with Phase 1                                            |
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

### Next Up — Phase 2: Infrastructure & DevOps

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

**Known follow-on limitation (not a blocker, just a note):** with 1 required approval and no bypass, a solo maintainer cannot self-merge PRs on either branch. Revisit once a second collaborator joins, or relax the ruleset temporarily.

**Still pending (tracked in Phase 2, not this blocker):** adding "require status checks to pass" to both rulesets once GitHub Actions CI exists.

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

### Next Week (Phase 2 Start)

| Priority | Task                                                                     | Owner        | Notes                                                   |
| -------- | ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------- |
| 🔴 P1    | Write Dockerfiles + `docker-compose.dev.yml` / `docker-compose.prod.yml` | Engineer 1   | Phase 2 critical path                                   |
| 🔴 P1    | Set up GitHub Actions CI/CD pipeline (lint, type-check, test, build)     | Engineer 1/2 | Once live, add "require status checks" to both rulesets |
| 🟠 P2    | Configure Supabase local dev environment                                 | Engineer 2   | Phase 3 preparation                                     |
| 🟡 P3    | Draft Stripe product and pricing configuration                           | Product Lead | Needed before Phase 9                                   |

### Backlog (Next 4 Weeks)

- Complete Phase 2 milestones
- Begin Phase 3 (Database Schema) immediately after Phase 2 infrastructure is stable
- Begin Phase 4 (Auth) immediately after Phase 3 core schema is complete
- First stakeholder demo: staging environment with auth + empty dashboard shell (target: Week 6)

---

## Status Update History

| Date       | Updated by                           | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-20 | Engineering Lead                     | Initial document created. Pre-development phase complete. All 8 project documents authored. Development not yet started.                                                                                                                                                                                                                                                                                                                |
| 2026-07-21 | Engineering (Phase 1 implementation) | Phase 1 — Foundation & Project Setup: 13/14 tasks complete. Monorepo scaffolded (Turborepo, npm workspaces, 4 packages), TypeScript/ESLint/Prettier/Husky/secretlint configured, design tokens and placeholder brand assets added, `.env.example` written. Remaining task (branch protection) blocked on a GitHub remote existing — logged as BLK-001. Added DEC-007 (Tailwind v4), DEC-008 (secretlint), DEC-009 (flat-config ESLint). |
| 2026-07-21 | Engineering (Phase 1 implementation) | **Phase 1 complete (14/14).** BLK-001 resolved: created `KevinG1456/viralscopes.io` (private) on GitHub, renamed `master` → `main`, pushed `main` and `develop` (both tracking cleanly at `0cb7a44`), configured `main-protection`/`develop-protection` rulesets (PR + 1 approval, no force-push/delete, no admin bypass; status checks deferred to Phase 2). Phase 2 — Infrastructure & DevOps is now the critical path item.          |

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
