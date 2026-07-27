# PROJECT_STATUS.md
# ViralScopes.io — Project Status

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Pre-Development — Documentation Complete
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
| **Current phase** | Phase 3 — Database & Core Schema (schema/migrations/seeds layer complete; see TD-008/TD-009 for deferred operational automation) |
| **Overall MVP completion** | ~13% |
| **Infrastructure stage** | Stage 0 (not yet provisioned) |
| **Active engineers** | TBD |
| **Target MVP launch** | Week 19–20 from project initiation |
| **Critical path item** | Phase 4 — Authentication & Authorisation |
| **Active blockers** | None |
| **Open risks** | 2 (YouTube API quota strategy, AI cost model) |
| **Last status update** | 2026-07-26 |
| **Next milestone** | M3 — Schema Complete (Week 4) |

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

### Next Phase: Phase 4 — Authentication & Authorisation

**Start condition:** Phase 3 fully complete.

---

## 3. Overall Completion

### MVP Progress (Phases 1–14)

```
Pre-Development  ████████████████████  100%  ✅ Complete
Phase 1          ████████████████████  100%  ✅ Complete
Phase 2          ████████████████████  100%  ✅ Complete (see TD-006 for deferred infra items)
Phase 3          ███████████████░░░░░   76%  ✅ Schema/migrations/seeds complete (see TD-008/TD-009 for deferred automation)
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
Overall MVP      ██░░░░░░░░░░░░░░░░░░   13%  🚧 In progress
```

### Task Completion Summary

| Category | Total tasks | Complete | In progress | Pending |
|---|---|---|---|---|
| Pre-Development (docs) | 8 | 8 | 0 | 0 |
| Phase 1 — Foundation | 14 | 14 | 0 | 0 |
| Phase 2 — Infrastructure | 28 | 23 | 0 | 5 |
| Phase 3 — Database | 42 | 32 | 0 | 10 |
| Phase 4 — Auth | 26 | 0 | 0 | 26 |
| Phase 5 — Backend API | 58 | 0 | 0 | 58 |
| Phase 6 — n8n Workflows | 52 | 0 | 0 | 52 |
| Phase 7 — Prompt Library | 12 | 0 | 0 | 12 |
| Phase 8 — Frontend | 48 | 0 | 0 | 48 |
| Phase 9 — Billing | 22 | 0 | 0 | 22 |
| Phase 10 — Security | 18 | 0 | 0 | 18 |
| Phase 11 — Admin Panel | 16 | 0 | 0 | 16 |
| Phase 12 — Testing | 24 | 0 | 0 | 24 |
| Phase 13 — Documentation | 12 | 0 | 0 | 12 |
| Phase 14 — Deployment | 14 | 0 | 0 | 14 |
| **Total** | **444** | **77** | **0** | **367** |

---

## 4. Phase Progress

| Phase | Name | Status | Completion | Target week | Notes |
|---|---|---|---|---|---|
| Pre-Dev | Documentation | ✅ Complete | 100% | Week 0 | All 8 documents authored |
| Phase 1 | Foundation & Project Setup | ✅ Complete | 100% | Week 1 | BLK-001/BLK-002 resolved 2026-07-26 |
| Phase 2 | Infrastructure & DevOps | ✅ Complete | 23/28 tasks | Week 1–3 | All 6 milestones done; 5 tasks deferred to Phase 14/ongoing (TD-006), not silently dropped |
| Phase 3 | Database & Core Schema | ✅ Complete (schema layer) | 32/42 tasks | Week 3–4 | Retention/partition automation + dead-letter admin endpoint deferred (TD-008, TD-009) — business logic/API, out of this phase's scope |
| Phase 4 | Authentication & Authorisation | ⏳ Not started | 0% | Week 4–6 | Ready to begin |
| Phase 5 | Core Backend API | ⏳ Not started | 0% | Week 6–9 | Parallel with Phase 8 |
| Phase 6 | n8n Workflow Engine | ⏳ Not started | 0% | Week 9–12 | Parallel with Phase 5 |
| Phase 7 | AI Prompt Library | ⏳ Not started | 0% | Week 10–12 | Parallel with Phase 6 |
| Phase 8 | Frontend Dashboard | ⏳ Not started | 0% | Week 6–13 | Parallel with Phase 5 |
| Phase 9 | Subscription & Billing | ⏳ Not started | 0% | Week 13–15 | Depends on Phase 5 |
| Phase 10 | Security & Compliance | ⏳ Not started | 0% | Week 15–16 | Parallel with Phase 9 |
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

---

## 6. In-Progress Tasks

*No tasks are currently in progress. Phase 3 (schema/migrations/seeds layer) is complete; Phase 4 has not yet started.*

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
| **Status** | Open — decision required before Phase 5 begins |

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
| **Status** | Open — cost model must be validated before Phase 6 begins |

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
| M1 | Project Ready | Week 1 | Phase 1 | ⏳ Pending | Repo initialised, tooling configured, design system done |
| M2 | Infrastructure Live | Week 3 | Phase 2 | ⏳ Pending | Docker running, CI/CD deployed to staging, monitoring live |
| M3 | Schema Complete | Week 4 | Phase 3 | ⏳ Pending | All migrations applied, RLS active, ERD published |
| M4 | Auth Complete | Week 6 | Phase 4 | ⏳ Pending | Full auth system + all email templates live in staging |
| M5 | API v1 Complete | Week 9 | Phase 5 | ⏳ Pending | All endpoints live, OpenAPI spec published |
| M6 | Workflows Live | Week 12 | Phase 6 | ⏳ Pending | All 14 n8n workflows running, dead-letter queue active |
| M7 | Prompts Live | Week 12 | Phase 7 | ⏳ Pending | All 8 prompts versioned, cached, test harness working |
| M8 | Dashboard Complete | Week 13 | Phase 8 | ⏳ Pending | All MVP pages live in staging, onboarding tested |
| M9 | Billing Live | Week 15 | Phase 9 | ⏳ Pending | Stripe billing live in staging, usage tracking active |
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
| **Phases affected** | Phase 3, Phase 6 |
| **Status** | Accepted (intentional, deferred) |

**Description:** `Database_Schema.md` §13/§18 and `ROADMAP.md`'s Phase 3 checklist call for automated nightly retention-purge jobs (transcripts, job_logs, usage_events, audit_logs, dead_letter_jobs) and a monthly partition creation/rotation job for `usage_events`/`job_logs`. Neither exists yet — only the structural pieces (partitioned tables, initial `2026_07`/`2026_08` partitions) were built.

**Why accepted:** These are scheduled jobs — business logic/automation, not schema or data-layer structure — and were explicitly out of scope for Phase 3 per the approved scope ("schema and data layer only... no business logic"). n8n (the workflow engine these would naturally run on) doesn't exist yet either; it's Phase 6.

**Resolution plan:** Implement as n8n scheduled workflows once Phase 6 (n8n Workflow Engine) lands. Until then, `usage_events`/`job_logs` will need a manually-created partition past 2026-08, and no retention data is purged (acceptable at current data volumes — zero production traffic exists yet).

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
| 🟠 P2 | Decide YouTube API quota strategy (RISK-01) | Engineering Lead | Decision needed before Phase 5 |
| 🟠 P2 | Run AI cost model prototype — sample 100 videos, measure actual cost (RISK-02) | Engineering Lead | Decision needed before Phase 6 |

### Next Up — Phase 4: Authentication & Authorisation

| Priority | Task | Owner | Notes |
|---|---|---|---|
| 🔴 P1 | Implement JWT + OAuth (Google/GitHub) auth against the `users`/`oauth_accounts`/`sessions` schema Phase 3 already built | Engineer | Phase 4 critical path — schema (DEC-014's `app_user` role, RLS policies) is ready to receive it |
| 🟠 P2 | Wire `apps/api`'s `/ready` endpoint to a real database check (`packages/db`'s `createDbClient`) | Engineer | `/ready` already reports `not_implemented` honestly for this — see `health.plugin.ts` |
| 🟡 P3 | Provision a real Coolify server + domain, hosted Supabase project | Repo owner | Unblocks TD-006 and the hosted-Supabase item in TD-009's category — not a Phase 4 blocker |

### Backlog (Next 4 Weeks)

- Begin Phase 4 (Authentication & Authorisation)
- Begin Phase 5 (Core Backend API) once auth lands — this is where `DATABASE_APP_URL`/`app_user` (DEC-014) gets its first real caller
- First stakeholder demo: staging environment with auth + empty dashboard shell (target: Week 6)

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
