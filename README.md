# README.md
# ViralScopes.io

> **AI-powered content intelligence for creators, agencies, and media teams.**
> Understand why content goes viral. Create originally.

[![CI](https://github.com/KevinG1456/viralscopes.io/actions/workflows/ci.yml/badge.svg)](https://github.com/KevinG1456/viralscopes.io/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x_LTS-green)](https://nodejs.org/)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Installation](#5-installation)
6. [Local Development](#6-local-development)
7. [Environment Variables](#7-environment-variables)
8. [Running the Application](#8-running-the-application)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Folder Structure](#11-folder-structure)
12. [Contributing](#12-contributing)
13. [Frequently Asked Questions](#13-frequently-asked-questions)
14. [License](#14-license)

---

## 1. Project Overview

ViralScopes.io is an **AI-powered content intelligence platform** that analyses YouTube videos at scale to extract the structural patterns behind viral performance — hook types, title formulas, thumbnail compositions, narrative arcs, engagement drivers, and topic trends.

It surfaces those patterns as **original, ethically generated creative guidance** for content creators, agencies, and media teams.

### What it does

- **Discovers** high-performing YouTube videos every 6 hours across any niche, language, or category
- **Analyses** each video with a multi-stage AI pipeline: metadata → transcript → thumbnail → full content analysis
- **Scores** every video with a proprietary **Viral Score (0–100)** based on 9 weighted signals
- **Detects trends** daily: emerging, evergreen, and declining topics with velocity and opportunity scoring
- **Recommends** original title concepts, hook ideas, content outlines, and thumbnail strategies — never copying any creator
- **Alerts** teams via Email, Discord, Slack, Telegram, or webhook when tracked channels publish or trends spike
- **Exports** data to CSV, Excel, JSON, and PDF for client reporting and internal analysis

### What it does not do

ViralScopes.io analyses **patterns**, not content. It will never:
- Reproduce, paraphrase, or facilitate copying of any creator's original script
- Help users imitate a specific creator in an identifiable way
- Violate YouTube's Terms of Service

---

## 2. Features

### Core Platform (MVP)

| Feature | Description |
|---|---|
| **Video Discovery Engine** | Automated 6-hour discovery cycle. Filters by views, engagement, category, language, and region. |
| **Viral Score Engine** | Proprietary weighted score (0–100) from 9 signals: title formula, thumbnail CTR, hook confidence, engagement velocity, trend alignment, and more. |
| **AI Analysis Pipeline** | Transcript analysis, thumbnail vision analysis, hook classification, title formula detection, full content analysis with narrative structure breakdown. |
| **Trend Detection** | Daily AI topic clustering. Classifies topics as emerging, evergreen, or declining. Computes velocity and opportunity scores. |
| **Opportunity Engine** | Ranks content opportunities by demand × growth ÷ competition. Surfaces untapped niches before they peak. |
| **Ethical Recommendation Engine** | Generates original title concepts, hook ideas, content outlines, thumbnail descriptions, and keyword suggestions — structurally inspired, never copied. |
| **Watchlists** | Monitor specific channels, keywords, niches, or competitors. Get notified when they upload or when tracked topics spike. |
| **Alert Dispatch** | Multi-channel alerts: Email, Discord, Slack, Telegram, custom webhook. Throttled to 1 alert/rule/hour. |
| **Unified Search** | Search across videos, channels, and trends with 8 filter dimensions and cursor-based pagination. |
| **Export System** | Async export to CSV, Excel, JSON, and PDF. Signed download URLs. |
| **Multi-Tenant Workspaces** | Organisations, workspaces, projects, RBAC (5 roles), member invitations, session management. |
| **Prompt Library** | Versioned AI prompts stored in the database. Edit and deploy new prompt versions without code changes. |
| **AI Response Caching** | All AI outputs cached by `(prompt_version, sha256(input))`. No video is analysed twice. |
| **Dead-Letter Queue** | Failed background jobs are captured, inspected, and retried via the Admin Panel. |
| **Super Admin Panel** | Internal management: organisations, users, billing, job logs, prompt editing, system health. |

### Billing & Plans

| Plan | Target user | Key limits |
|---|---|---|
| **Free** | Hobbyist creators | 20 videos/month, 1 watchlist, email alerts only |
| **Starter** | Independent creators | 200 videos/month, 5 watchlists, all alert channels |
| **Professional** | Full-time creators | 1,000 videos/month, 20 watchlists, exports, API access |
| **Business** | Agencies | 5,000 videos/month, unlimited watchlists, 5 seats, scheduled reports |
| **Enterprise** | Media companies | Custom limits, unlimited seats, SLA, dedicated support |

### Post-MVP (v1.5 / v2.0)

- AI Chat Interface (ask natural language questions about your niche)
- Scheduled weekly PDF reports
- Chrome Extension (one-click analysis from YouTube)
- TikTok and Instagram connectors
- Mobile Application (iOS + Android)
- Public API and SDKs

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14+ | React framework with App Router, SSR, ISR |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript across the entire stack |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Utility-first CSS with design system tokens |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Accessible component library built on Radix UI |
| [TanStack Query](https://tanstack.com/query) | 5.x | Server state management, caching, background refetch |
| [next-intl](https://next-intl-docs.vercel.app/) | Latest | Internationalisation (i18n) |
| [Recharts](https://recharts.org/) | Latest | Data visualisation (charts, heatmaps, histograms) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [Fastify](https://fastify.dev/) | 4.x | High-performance Node.js HTTP framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe server-side code |
| [Zod](https://zod.dev/) | 3.x | Runtime input validation and type inference |
| [Drizzle ORM](https://orm.drizzle.team/) | Latest | Type-safe SQL queries and schema migrations |
| [Pino](https://getpino.io/) | Latest | Structured JSON logging |
| [BullMQ](https://docs.bullmq.io/) | Latest | Redis-backed job queue |

### Data

| Technology | Version | Purpose |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Primary relational database |
| [Supabase](https://supabase.com/) | Latest | PostgreSQL hosting + PgBouncer only — this project uses its own JWT/OAuth auth, not Supabase Auth |
| [Redis](https://redis.io/) | 7.x | Cache, rate limiting, BullMQ queue backend |
| [Drizzle ORM](https://orm.drizzle.team/) | Latest | Schema definition and migrations |

### Infrastructure & DevOps

| Technology | Version | Purpose |
|---|---|---|
| [Docker](https://www.docker.com/) | Latest | Containerisation for all services |
| [Docker Compose](https://docs.docker.com/compose/) | v2 | Multi-container orchestration |
| [Coolify](https://coolify.io/) | Latest | Self-hosted PaaS for deployment |
| [Traefik](https://traefik.io/) | v3 | Reverse proxy, SSL termination, service routing |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD pipeline |
| [Turborepo](https://turbo.build/) | Latest | Monorepo task orchestration and build caching |

### AI & External Services

| Service | Purpose |
|---|---|
| [Anthropic Claude API](https://anthropic.com/) | Strategic analysis, recommendations (reasoning tasks) |
| [OpenAI API](https://openai.com/) | Structured data extraction, vision analysis |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | Video discovery and metadata |
| [n8n](https://n8n.io/) (self-hosted) | Workflow automation for the AI pipeline |
| [Stripe](https://stripe.com/) | Subscription billing, Customer Portal |
| [SendGrid](https://sendgrid.com/) / [Resend](https://resend.com/) | Transactional email |
| [Cloudflare](https://cloudflare.com/) | CDN, DDoS protection, WAF, R2 object storage |

### Monitoring

| Technology | Purpose |
|---|---|
| [Prometheus](https://prometheus.io/) | Metrics collection |
| [Grafana](https://grafana.com/) | Dashboards and alerting |
| [Loki](https://grafana.com/oss/loki/) | Log aggregation |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Cloudflare                    │
│          (CDN, WAF, DDoS, DNS Proxy)            │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────┐
│              Traefik (Reverse Proxy)            │
│           SSL Termination · Routing             │
└──────┬──────────────────────┬───────────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐       ┌───────────────┐
│  Next.js    │       │  Fastify API  │
│  Frontend   │◀─────▶│  /api/v1/...  │
│  (App       │       │               │
│   Router)   │       └───────┬───────┘
└─────────────┘               │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
             ┌──────────┐ ┌──────┐ ┌──────────┐
             │PostgreSQL│ │Redis │ │Object    │
             │(Supabase)│ │Cache │ │Storage   │
             │+ RLS     │ │Queue │ │(R2/S3)   │
             └──────────┘ └──┬───┘ └──────────┘
                             │
                    ┌────────▼────────┐
                    │   n8n Workflows  │
                    │  (BullMQ queue) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        YouTube API    Claude API     OpenAI API
        (Discovery)    (Analysis)   (Vision/Extract)
```

### Data Flow

1. **Discovery** — n8n runs every 6 hours, calls YouTube Data API, filters videos by engagement criteria, deduplicates, and stores in PostgreSQL.
2. **Analysis** — For each new video, n8n runs the sequential pipeline: metadata → transcript → thumbnail (AI Vision) → full AI analysis → viral score → recommendations.
3. **Serving** — Fastify API serves data from PostgreSQL (with Redis caching for hot paths) to the Next.js frontend via TanStack Query.
4. **Alerts** — When a viral score exceeds a threshold or a watched channel uploads, the alert dispatch workflow sends notifications via the configured channels.

### Multi-Tenancy

Every organisation's data is isolated using **Row Level Security (RLS)** at the PostgreSQL level (active since Phase 3 — see `Database_Schema.md` §12), scoped via session-local settings (`app.current_org_id` / `app.current_user_id`) rather than Supabase Auth's `auth.uid()`, since this project uses its own JWT/OAuth system. The API enforces `org_id` filtering at the service layer as a second line of defence.

### AI Pipeline

All AI calls are **asynchronous** — triggered by the n8n workflow engine, never blocking API request handlers. All prompts are **versioned in the database**. All AI outputs are **validated against Zod schemas** before storage.

---

## 5. Installation

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 22.x LTS | [nodejs.org](https://nodejs.org/) or `nvm install 22` |
| npm | 10.x+ | Bundled with Node.js |
| Docker | Latest | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | v2.x | Bundled with Docker Desktop |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Clone the Repository

```bash
git clone https://github.com/KevinG1456/viralscopes.io.git
cd viralscopes.io
```

### Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces in the monorepo via npm workspaces.

### Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. See [Environment Variables](#7-environment-variables) for the full required-now/future breakdown.

At this phase, nothing is actually required to start the application shell — `apps/api` boots with its built-in defaults (`APP_ENV=development`, `PORT=3001`) even with an empty `.env.local`. `DATABASE_URL`, `JWT_SECRET`, and the rest do nothing yet; they become load-bearing once the phase that reads them (3, 4, ...) lands.

External service keys (YouTube API, OpenAI, Anthropic, Stripe, SendGrid) are required for full functionality but not for running the application shell locally.

---

## 6. Local Development

### Starting the Full Stack

The supporting infrastructure (everything except the app code itself) starts with a single command:

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **Postgres** on port `5432`
- **Redis** on port `6379`
- **n8n** on port `5678`
- **MinIO** (local S3) on port `9000` (console on `9001`)
- **Prometheus** on port `9090`
- **Grafana** on port `3002`
- **Loki** on port `3100`

> **This entire file is optional for basic frontend/API development.** `apps/web` and `apps/api` run natively (see below) and don't require any of these containers to start up, build, or serve their placeholder content. You only need this stack running if you're working on something that actually talks to Postgres, Redis, n8n, or the monitoring tools — it is not a prerequisite for `npm run dev`.

> **Postgres is a plain `postgres:17-alpine` container, not the Supabase CLI.** This project authenticates with its own JWT/OAuth system (see §7 and `Security_Architecture.md` §5), not Supabase Auth, so the app only ever needs Postgres itself — which is also all that Supabase provides in production. Running the Supabase CLI locally would start GoTrue/Storage/Realtime containers the app never talks to.

Check everything came up healthy:

```bash
docker compose -f docker-compose.dev.yml ps
```

`postgres`, `redis`, and `minio` report a Docker-level health status; the rest are considered up once their container status shows `Up`.

Then, in separate terminals:

```bash
# Terminal 1 — Start the Fastify API (with hot reload)
npm run dev --workspace=apps/api

# Terminal 2 — Start the Next.js frontend (with hot reload)
npm run dev --workspace=apps/web
```

Or run both simultaneously:

```bash
npm run dev
```

### Service URLs (Development)

| Service | URL |
|---|---|
| Next.js Frontend | http://localhost:3000 |
| Fastify API | http://localhost:3001 |
| n8n Workflow Editor | http://localhost:5678 |
| MinIO Console | http://localhost:9001 |
| Grafana Dashboards | http://localhost:3002 |
| Prometheus | http://localhost:9090 |
| Loki | http://localhost:3100 |

> API Swagger docs aren't live yet — those land with the API endpoints (Phase 5). Drizzle Studio (`npm run db:studio`, since Phase 3) is the DB browser instead of Supabase Studio, since this project doesn't run the Supabase CLI locally (see above).

### Health Checks

```bash
# Liveness — is the process up?
curl http://localhost:3001/health
curl http://localhost:3000/api/health

# Readiness — are dependencies actually wired up and working?
curl http://localhost:3001/ready
```

`/ready` currently reports `not_ready` with a `checks` object explaining which dependencies (database, Redis, queue) aren't wired into the API yet — that's expected until later phases add real clients for them. It's not a bug; it's the API being honest about its own state.

### Logging

`apps/api` logs structured JSON via Pino (`apps/api/src/plugins/logger.plugin.ts`) — every log line carries `service`, `version`, and `environment`, plus an ISO timestamp:

```bash
LOG_LEVEL=debug npm run dev --workspace=apps/api
```

`LOG_LEVEL` controls verbosity (`error` \| `warn` \| `info` \| `debug` \| `trace`, default `info`) and is validated at startup like every other environment variable — an invalid value fails fast rather than silently falling back. `error`/`warn`/`info` are used deliberately, not interchangeably: `app.log.warn` fires once at boot to flag unimplemented dependencies, `app.log.error` covers unexpected failures (e.g. a failed graceful shutdown), and `info` covers normal request/response and lifecycle events (Fastify logs every request automatically).

The following fields are redacted (`[REDACTED]`) wherever they appear in a logged object, matching `Security_Architecture.md` §9 / `Monitoring_and_Operations.md` §3's "never log" list: `password`, `password_hash`, `token`, `apiKey`/`api_key`, `secret`, `authorization` (including the `Authorization` and `Cookie` request headers), `email`, `name`, `ip_address`. This is real, tested redaction — not aspirational configuration: logging an object containing these fields today produces `[REDACTED]` in the output, verified directly against the built logger.

### Database Setup

`packages/db` holds the Drizzle schema (26 tables — see `Database_Schema.md`), hand-written SQL migrations, and dev seed data. First-time setup, once Postgres is running (`docker compose -f docker-compose.dev.yml up -d postgres`):

```bash
npm run db:migrate         # Apply all pending migrations (idempotent — skips already-applied ones)
npm run db:setup-roles     # Create/update the restricted app_user role RLS-protected queries run as
npm run db:seed            # Insert dev seed data (idempotent — safe to re-run)
```

`db:migrate` and `db:seed` both read `DATABASE_URL` (the Postgres superuser/owner connection — required for DDL). `db:setup-roles` additionally reads `APP_DB_USER`/`APP_DB_PASSWORD` and creates the role that `DATABASE_APP_URL` points at.

**Why a separate app role matters:** Postgres superusers and table owners bypass Row Level Security unconditionally, regardless of policies. `DATABASE_URL`'s role owns the tables (it ran the migrations), so it must never be what the running application queries with — RLS would silently do nothing. From Phase 5 onward, the API connects via `DATABASE_APP_URL` (the `app_user` role) instead. This was confirmed the hard way while verifying Phase 3: a tenant-isolation test returned all tenants' rows when run as the migration role, and correctly isolated per-tenant once run as `app_user`.

Other database commands:

```bash
npm run db:migrate:status  # List which migrations are applied vs pending
npm run db:migrate:down    # Roll back the most recently applied migration (down N to roll back N)
npm run db:reset           # Drop and recreate the public schema (local dev only — refuses non-localhost hosts)
npm run db:studio          # Open Drizzle Studio (visual DB browser) against DATABASE_URL
```

A full reset-and-rebuild cycle:

```bash
npm run db:reset && npm run db:migrate && npm run db:setup-roles && npm run db:seed
```

### Building the Production Docker Images

The build context is always the repository root (not `apps/api` or `apps/web`) — both Dockerfiles need access to the whole workspace:

```bash
docker build -f infra/docker/Dockerfile.api -t viralscopes/api .
docker build -f infra/docker/Dockerfile.web -t viralscopes/web .
```

`Dockerfile.api` uses `turbo prune` internally to build a sub-monorepo containing only `apps/api` and the workspace packages it actually imports — this keeps the API image from bundling `apps/web`'s entire Next.js dependency tree (a naive `npm ci` at the root would otherwise hoist everything into one shared `node_modules`). `Dockerfile.web` relies on Next.js's `output: 'standalone'` build mode for the same kind of automatic pruning.

Run a built image directly:

```bash
docker run -p 3001:3001 -e PORT=3001 viralscopes/api
docker run -p 3000:3000 viralscopes/web
```

`docker-compose.prod.yml` is written and validated (`docker compose -f docker-compose.prod.yml config`) but not deployed anywhere — it needs a provisioned server, a real domain, and a `.env.production` file with real secrets, none of which exist yet.

### Useful Development Commands

```bash
# Monorepo-wide commands
npm run dev              # Start all apps in development mode
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run type-check       # TypeScript type-check all packages
npm run test             # Run all test suites
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run Playwright E2E tests

# Database (see "Database Setup" above for the full explanation)
npm run db:migrate       # Apply pending migrations
npm run db:migrate:down  # Roll back the most recently applied migration
npm run db:migrate:status # List applied vs pending migrations
npm run db:setup-roles   # Create/update the restricted app_user role
npm run db:seed          # Seed development data (idempotent)
npm run db:reset         # Drop and recreate the public schema (local only)
npm run db:studio        # Open Drizzle Studio (visual DB browser)

# Code generation
npm run generate:types   # Generate TypeScript types from DB schema
npm run generate:openapi # Re-generate OpenAPI spec from Zod schemas

# n8n workflows
npm run workflows:export # Export all n8n workflows to /infra/n8n-workflows/
npm run workflows:import # Import workflows from /infra/n8n-workflows/ into n8n
```

---

## 7. Environment Variables

All environment variables are documented in `.env.example`, organised into four categories:

| Category | Meaning |
|---|---|
| **Required now** | Read by code (`apps/api/src/config.ts`) or by `docker-compose.dev.yml`/`docker-compose.prod.yml` today. Missing or invalid values fail fast at API startup, or break `docker compose up`. |
| **Optional now** | Read today, but has a safe, documented default. |
| **Required starting Phase N** | Not read by any code yet — reserved for a specific upcoming phase (e.g. `DATABASE_URL` does nothing until Phase 3 adds a database client). Setting these early has no effect and isn't necessary. |
| **Development-only** | Meaningful only in local dev (e.g. MinIO credentials, dev-mode defaults) — production uses different values or a different service entirely. |

Create your local environment file:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored (see `.gitignore`) and never committed. Fill in only the "Required now" section to get the app running locally — everything else can stay blank until the phase that needs it lands.

> **Security:** Never commit `.env.local`, `.env.production`, or any file containing real secrets. Only `.env.example` (placeholder values only, itself scanned by secretlint) is committed.

### Startup Validation

`apps/api` validates its environment variables at startup using a Zod schema (`apps/api/src/config.ts`). An invalid value fails immediately with a specific error — it never falls back to a value that would silently mask a misconfiguration:

```
$ PORT=not-a-number npm run start --workspace=apps/api
Error: Invalid environment configuration:
  - PORT: Expected number, received nan
```

Only `APP_ENV`, `PORT`, and `APP_VERSION` are validated today — those are the only environment variables any code actually reads yet. Each phase that wires in a new dependency (database, Redis, JWT, ...) adds its variables to this same schema rather than reading `process.env` ad hoc elsewhere.

### Required Now

| Variable | Read by | Description | Default |
|---|---|---|---|
| `APP_ENV` | apps/api | `development` \| `staging` \| `production` \| `test` | `development` |
| `PORT` | apps/api | API listen port | `3001` |
| `APP_VERSION` | apps/api | Version string shown by `GET /health`; CI sets this to the git SHA in built images | `unknown` |
| `APP_URL` | Docker Compose | Public URL of the frontend | — |
| `LOG_LEVEL` | apps/api (validated) | Pino log level: `error` \| `warn` \| `info` \| `debug` \| `trace` | `info` |
| `N8N_BASIC_AUTH_USER` / `N8N_BASIC_AUTH_PASSWORD` / `N8N_ENCRYPTION_KEY` | Docker Compose | n8n admin credentials | dev-only defaults in `docker-compose.dev.yml`; no default in prod |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Docker Compose | MinIO (dev) / Cloudflare R2 (prod) credentials | dev-only defaults (`minioadmin`) |
| `GRAFANA_ADMIN_PASSWORD` | Docker Compose | Grafana admin password | `admin` in dev only |
| `REDIS_PASSWORD` | Docker Compose | Redis auth password | none in dev (see `INFRASTRUCTURE_GROWTH_PLAN.md` §8.3); required in prod |
| `APP_DOMAIN` / `API_DOMAIN` / `N8N_DOMAIN` / `GRAFANA_DOMAIN` | `docker-compose.prod.yml` | Traefik routing rules | example `viralscopes.io` subdomains — not deployed anywhere yet |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Docker Compose | Local Postgres container credentials | `postgres` / `postgres` / `viralscopes` |
| `DATABASE_URL` | `packages/db` (migrate/seed/reset/setup-roles) | Postgres superuser/owner connection — DDL privileges, used only for migrations, seeding, and admin scripts. **Never** what the running application queries with (see §6 "Database Setup" for why). | — |
| `DATABASE_POOL_SIZE` | reserved | Pool size for a future PgBouncer-fronted connection | `10` |
| `APP_DB_USER` / `APP_DB_PASSWORD` | `packages/db/src/setup-roles.ts` | Credentials for the restricted, non-superuser role RLS-protected application queries run as | `app_user` / — |
| `DATABASE_APP_URL` | reserved for apps/api (Phase 5) | Connection string using the `app_user` role — what the API will actually connect with once it exists | — |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_APP_URL` | apps/web (public) | Frontend build-time public URLs | — |

> Production still targets a Supabase-hosted Postgres instance (see `Database_Schema.md` header), but only Postgres itself — this project authenticates with its own JWT/OAuth system, not Supabase Auth, so Supabase's `anon`/`service_role` API keys are never used and intentionally aren't in `.env.example`.

### Required Starting Phase 5 — Core Backend API

| Variable | Description |
|---|---|
| `REDIS_URL` | Redis connection URL (the container already runs; no client reads this yet) |
| `S3_BUCKET` / `S3_REGION` / `S3_ENDPOINT` | Object storage location |
| `S3_FORCE_PATH_STYLE` | `true` for MinIO (path-style addressing); `false` for Cloudflare R2 / AWS S3 (virtual-hosted style) |
| `YOUTUBE_API_KEY` / `YOUTUBE_QUOTA_LIMIT` / `RAPIDAPI_YOUTUBE_KEY` | Video discovery |

### Required Starting Phase 4 — Authentication & Authorisation

| Variable | Description |
|---|---|
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets (min 32 chars) |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token lifetimes (defaults `15m` / `30d`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `SENDGRID_API_KEY` / `EMAIL_FROM_ADDRESS` / `EMAIL_FROM_NAME` | Transactional email |

### Required Starting Phase 6 — n8n Workflow Engine

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | AI analysis pipeline |

### Required Starting Phase 9 — Subscription & Billing

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe billing |

---

## 8. Running the Application

### Development Mode

```bash
# Start infrastructure (Redis, n8n, MinIO, monitoring — see §6 for why PostgreSQL isn't here)
docker compose -f docker-compose.dev.yml up -d

# Start the API with hot reload
npm run dev --workspace=apps/api

# Start the frontend with hot reload
npm run dev --workspace=apps/web
```

### Production Mode (Local)

```bash
# Build all packages
npm run build

# Start with production Docker Compose
docker compose -f docker-compose.prod.yml up -d
```

### Individual Service Commands

```bash
# API only
npm run dev --workspace=apps/api       # Development
npm run start --workspace=apps/api     # Production

# Frontend only
npm run dev --workspace=apps/web       # Development
npm run start --workspace=apps/web     # Production (after build)

# Database
npm run db:migrate                     # Apply migrations
npm run db:seed                        # Seed data

# n8n
# Access the n8n editor at http://localhost:5678
# Import workflows: npm run workflows:import
```

### Health Checks

Once running, verify all services are healthy:

```bash
# API health
curl http://localhost:3001/health
# Expected: { "status": "ok", "uptime": 42, "version": "1.0.0" }

# API readiness (checks DB + Redis)
curl http://localhost:3001/ready
# Expected: { "status": "ready", "db": "ok", "redis": "ok", "queue": "ok" }

# Frontend
curl http://localhost:3000
# Expected: 200 OK
```

---

## 9. Testing

### Test Stack

| Type | Tool | Command |
|---|---|---|
| Unit tests | Vitest | `npm run test:unit` |
| Integration tests | Vitest + Supertest | `npm run test:integration` |
| E2E tests | Playwright | `npm run test:e2e` |
| Load tests | k6 | `npm run test:load` |
| All tests | Vitest + Playwright | `npm run test` |
| Coverage report | Vitest v8 | `npm run test:coverage` |

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

# Run unit tests only (fast — no DB or external services)
npm run test:unit

# Run integration tests (requires running DB and Redis)
npm run test:integration

# Run E2E tests (requires full stack running)
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:ui

# Run AI prompt regression tests
npm run test:prompts

# Watch mode (re-run on file change)
npm run test:watch

# Run a specific test file
npx vitest run apps/api/__tests__/unit/services/viral-score.service.unit.test.ts
```

### Coverage Targets

| Layer | Target |
|---|---|
| Unit tests | ≥ 80% line coverage |
| Integration tests | ≥ 70% endpoint coverage |

Coverage is enforced in CI. Pull requests that decrease coverage below the target are blocked from merging.

### Writing Tests

Tests live in `__tests__/` directories co-located with the code they test:

```
apps/api/src/services/viral-score.service.ts
apps/api/__tests__/unit/services/viral-score.service.unit.test.ts
```

Test file naming convention:
- `*.unit.test.ts` — unit tests (all dependencies mocked)
- `*.integration.test.ts` — integration tests (real DB and Redis, mocked external APIs)
- `*.e2e.test.ts` — end-to-end tests (full browser, Playwright)

Example unit test:

```typescript
// apps/api/__tests__/unit/services/viral-score.service.unit.test.ts
import { describe, it, expect } from "vitest";
import { computeViralScore } from "../../../src/services/viral-score.service";
import { mockVideoSignals } from "../../fixtures/video.fixture";

describe("computeViralScore", () => {
  it("returns a score between 0 and 100 for valid inputs", () => {
    const score = computeViralScore(mockVideoSignals.highPerforming);
    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(100);
  });

  it("returns a lower score for videos with low engagement velocity", () => {
    const high = computeViralScore(mockVideoSignals.highPerforming);
    const low = computeViralScore(mockVideoSignals.lowEngagement);
    expect(high.value).toBeGreaterThan(low.value);
  });

  it("is deterministic — same inputs always produce the same score", () => {
    const first = computeViralScore(mockVideoSignals.highPerforming);
    const second = computeViralScore(mockVideoSignals.highPerforming);
    expect(first.value).toBe(second.value);
  });
});
```

---

## 10. Deployment

ViralScopes.io is deployed using **Coolify** (self-hosted PaaS) via **GitHub Actions** CI/CD.

### Deployment Pipeline

```
Push to feature branch
    └── GitHub Actions CI
        ├── Lint + type-check
        ├── Unit + integration tests
        ├── Security scan (npm audit)
        └── Pass / Fail ✓

Merge to develop
    └── GitHub Actions
        ├── Build Docker images
        ├── Push to GitHub Container Registry (GHCR)
        └── Deploy to staging via Coolify webhook ✓

Manual approval on GitHub
    └── GitHub Actions
        ├── Deploy to production via Coolify webhook
        ├── Run smoke tests on production
        └── Notify Slack ✓
```

### Manual Deployment (Emergency)

```bash
# 1. Build and push Docker images manually
docker build -f infra/docker/Dockerfile.api -t ghcr.io/keving1456/viralscopes-api:latest .
docker push ghcr.io/keving1456/viralscopes-api:latest

# 2. Trigger Coolify redeploy via webhook
curl -X POST https://coolify.viralscopes.io/api/v1/deploy   -H "Authorization: Bearer $COOLIFY_WEBHOOK_TOKEN"   -d '{"serviceId": "viralscopes-api"}'
```

### Rollback

Coolify retains the previous Docker image and supports one-click rollback from the dashboard, or via the CLI:

```bash
# Rollback API to previous version
coolify rollback --service viralscopes-api --version previous
```

### Environment-Specific Configuration

| Environment | Branch | Deploy trigger | URL |
|---|---|---|---|
| Development | Any feature branch | Local only | `http://localhost:3000` |
| Staging | `develop` | Auto on merge | `https://staging.viralscopes.io` |
| Production | `main` | Manual approval | `https://app.viralscopes.io` |

### Production Smoke Tests

After each production deployment, the following checks run automatically:

```bash
npm run smoke:production
```

This checks:
- `GET /health` returns `200 OK`
- `GET /ready` returns `200 OK` with all dependencies healthy
- `GET /api/v1/videos` returns `401` (auth enforced)
- Frontend loads with `200 OK`
- Grafana dashboards are receiving metrics

### Database Migrations in Production

Migrations run automatically as part of the deployment pipeline, before the new container version starts serving traffic:

```bash
# Migration step in CI/CD (runs before new API container starts)
npm run db:migrate --workspace=packages/db
```

All migrations are designed for **zero-downtime** — no table locks, no breaking column changes.

---

## 11. Folder Structure

```
viralscopes/
├── apps/
│   ├── web/                  # Next.js 14 frontend (App Router)
│   │   ├── app/              # Pages, layouts, API routes
│   │   ├── components/       # UI components (feature + shared)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, routes, utilities
│   │   └── i18n/             # Internationalisation
│   │
│   └── api/                  # Fastify REST API
│       └── src/
│           ├── plugins/       # Fastify plugins (auth, cors, rate-limit)
│           ├── middleware/    # Request lifecycle middleware
│           ├── routes/        # Endpoint definitions + Zod validation
│           ├── controllers/   # Request orchestration
│           ├── services/      # All business logic
│           ├── repositories/  # Database access (Drizzle ORM)
│           ├── schemas/       # Zod request/response schemas
│           └── errors/        # Typed error classes
│
├── packages/
│   ├── shared/               # Shared TypeScript types, Zod schemas, constants
│   └── db/                   # Drizzle ORM schema, migrations, seeds, RLS
│
├── infra/
│   ├── docker/               # Dockerfiles per service
│   ├── n8n-workflows/        # Version-controlled n8n workflow JSON
│   ├── monitoring/           # Prometheus rules, Grafana dashboards, Loki config
│   └── traefik/              # Reverse proxy configuration
│
├── docs/                     # All project documentation
│   ├── guides/               # Installation, deployment, scaling, troubleshooting
│   ├── workflows/            # n8n workflow diagrams
│   ├── database/             # ERD, schema reference
│   └── decisions/            # Architecture Decision Records (ADRs)
│
├── .github/
│   └── workflows/            # GitHub Actions CI/CD pipelines
│
├── docker-compose.dev.yml    # Development environment
├── docker-compose.prod.yml   # Production environment
├── turbo.json                # Turborepo pipeline configuration
├── tsconfig.base.json        # Base TypeScript configuration
└── .env.example              # Environment variable reference
```

For the complete annotated file tree including every file, see [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md).

> **Note:** All project documentation (including this file) lives at the repository root, not under `docs/`. `REPOSITORY_STRUCTURE.md`'s folder diagram shows a `docs/` layout as a future-state convention; it hasn't been adopted yet.

---

## 12. Contributing

### Before You Start

1. Read [PROJECT_RULES.md](./PROJECT_RULES.md) — all engineering standards, conventions, and the Definition of Done.
2. Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current phase and active work.
3. Check [ROADMAP.md](./ROADMAP.md) for upcoming priorities.
4. Open an issue or discuss in the team channel before starting work on a large feature.

### Contribution Workflow

```bash
# 1. Create a branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/VS-123-your-feature-name

# 2. Make your changes
# ... write code, write tests, update docs ...

# 3. Run checks locally before pushing
npm run lint
npm run type-check
npm run test:unit
npm run test:integration

# 4. Commit using conventional commits
git commit -m "feat(api): add viral score breakdown endpoint"

# 5. Push and open a pull request to develop
git push origin feature/VS-123-your-feature-name
```

### Pull Request Requirements

- [ ] Title follows the Conventional Commits format
- [ ] Description explains what changed and why
- [ ] Ticket ID linked (`Closes VS-123`)
- [ ] Screenshots for any UI changes
- [ ] All CI checks green
- [ ] At least 1 approving review
- [ ] PR checklist completed (see [PROJECT_RULES.md](./PROJECT_RULES.md))

> **This is enforced, not just documented.** `main` and `develop` both require a PR (no direct pushes) and 1 approving review — GitHub rejects self-approval, so as a solo maintainer without a second reviewer yet, the repo owner merges via repo-admin bypass (configured on the ruleset) rather than the normal review flow. Every PR runs two required workflows automatically: `.github/workflows/ci.yml` (lint, type-check, build, format check, secret scan) and `.github/workflows/security.yml` (production-aware dependency audit, CodeQL, Dependency Review).

### Code Standards (Summary)

- TypeScript strict mode — no `any`, no `console.log`, no hardcoded strings
- Unit tests for all new service methods
- Integration tests for all new API endpoints
- `CHANGELOG.md` updated for user-facing changes
- Inline comments for non-obvious logic (explain *why*, not *what*)

For the full standards, see [PROJECT_RULES.md](./PROJECT_RULES.md).

### AI Assistant Usage

AI coding assistants (Copilot, Claude, Cursor) are permitted for boilerplate, test generation, and documentation drafts. Rules:

- Do not merge AI-generated code you cannot explain line by line
- Do not use AI to generate security-sensitive code without expert review
- Disclose significant AI assistance in the PR description
- Never use AI to generate content that could reproduce or closely paraphrase a creator's work

See the full AI Assistant Rules in [PROJECT_RULES.md](./PROJECT_RULES.md#15-ai-assistant-rules).

---

## 13. Frequently Asked Questions

### General

**Q: What does ViralScopes.io actually do?**

It discovers high-performing YouTube videos, analyses the structural patterns behind their performance (hook type, title formula, thumbnail composition, narrative arc, engagement velocity), and generates an original Viral Score plus original creative recommendations. It never copies or reproduces creator content.

**Q: Does it scrape YouTube or violate their Terms of Service?**

No. ViralScopes.io uses the official **YouTube Data API v3** for all video discovery and metadata. It operates within the API's quota system and Terms of Service.

**Q: Is the content analysis ethical?**

Yes. The platform analyses patterns — not specific content. Recommendations are always original, generated by AI with explicit instructions not to reproduce any creator's work. See the [Ethical AI Principle](#1-project-overview) section.

---

### Technical

**Q: Why Fastify instead of Express?**

Fastify is 2–3× faster than Express on raw throughput benchmarks, has first-class TypeScript support, a plugin-based architecture that maps cleanly to our service design, and built-in JSON schema validation. See [ADR-002](./docs/decisions/ADR-002-fastify-over-express.md).

**Q: Why n8n for the AI pipeline instead of writing custom workers?**

n8n provides a visual workflow editor, built-in retry logic, credential management, and a large library of integrations. For a team building an AI pipeline with many sequential steps and external service dependencies, n8n significantly reduces boilerplate. See [ADR-003](./docs/decisions/ADR-003-n8n-for-workflows.md).

**Q: Why two AI providers (Claude + OpenAI)?**

Claude (Anthropic) is used for strategic reasoning tasks (content analysis, recommendation generation) where nuanced understanding outperforms raw speed. GPT-4o is used for structured data extraction and vision tasks. Using two providers also provides resilience — if one is unavailable, the other can serve as fallback. See [ADR-005](./docs/decisions/ADR-005-dual-ai-providers.md).

**Q: Why Drizzle ORM instead of Prisma?**

Drizzle is lighter, generates cleaner SQL, has better performance on complex queries, and its migration system gives us full control over the SQL. Prisma's abstraction layer can generate suboptimal queries for the kind of analytics workloads ViralScopes handles. See [ADR-004](./docs/decisions/ADR-004-drizzle-orm.md).

**Q: How is the Viral Score calculated?**

The Viral Score is a weighted algorithm combining 9 signals: title formula score, thumbnail CTR prediction, hook classification confidence, views-per-day velocity, likes ratio, comments ratio, topic trend score, growth rate, and publication timing. The weights are configurable via the Super Admin Panel without code deployment. The algorithm is deterministic — the same inputs always produce the same score.

**Q: What happens when the YouTube API quota is exhausted?**

The Quota Manager Service tracks daily unit consumption. When usage approaches 80%, discovery is rate-limited. At 100%, the system automatically switches to supplemental data sources (RapidAPI YouTube or Apify). The admin is notified via Grafana alert and email.

**Q: How does the AI response caching work?**

Every AI call is cached in Redis keyed by `(prompt_version, sha256(normalised_input))` with a 24-hour TTL. If the same video is analysed again within 24 hours with the same active prompt version, the cached result is returned immediately without an API call. This is the primary cost control mechanism for AI spend.

---

### Operations

**Q: How do I import n8n workflows after a fresh environment setup?**

```bash
npm run workflows:import
```

This imports all JSON files from `/infra/n8n-workflows/` into the running n8n instance.

**Q: How do I retry a failed job from the dead-letter queue?**

Via the Super Admin Panel at `/admin/dead-letter`, or via the API:

```bash
curl -X POST http://localhost:3001/api/v1/admin/dead-letter/{jobId}/retry   -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Q: How do I manually trigger the video discovery workflow?**

```bash
curl -X POST http://localhost:3001/api/v1/jobs/video-discovery/trigger   -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Q: How do I reset the YouTube API quota counter?**

```bash
curl -X POST http://localhost:3001/api/v1/admin/quota/reset   -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Q: How do I update an AI prompt without deploying code?**

Navigate to the Super Admin Panel → Prompts, edit the prompt content, and save as a new version. Set the new version as active. The next workflow execution will pick up the new version automatically.

**Q: How do I fulfil a GDPR data deletion request?**

The user can self-serve via `DELETE /api/v1/account`. For manual fulfilment (e.g. the user cannot access their account), see [docs/guides/gdpr-requests.md](./docs/guides/gdpr-requests.md).

---

## 14. License

```
MIT License

Copyright (c) 2026 ViralScopes.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

**Documentation:** [PROJECT_RULES.md](./docs/PROJECT_RULES.md) · [ROADMAP.md](./docs/ROADMAP.md) · [PRD.md](./docs/PRD.md) · [REPOSITORY_STRUCTURE.md](./docs/REPOSITORY_STRUCTURE.md) · [INFRASTRUCTURE_GROWTH_PLAN.md](./docs/INFRASTRUCTURE_GROWTH_PLAN.md) · [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) · [CHANGELOG.md](./docs/CHANGELOG.md)
