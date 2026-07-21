# README.md

# ViralScopes.io

> **AI-powered content intelligence for creators, agencies, and media teams.**
> Understand why content goes viral. Create originally.

[![CI](https://github.com/viralscopes/viralscopes/actions/workflows/ci.yml/badge.svg)](https://github.com/viralscopes/viralscopes/actions/workflows/ci.yml)
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

| Feature                           | Description                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Video Discovery Engine**        | Automated 6-hour discovery cycle. Filters by views, engagement, category, language, and region.                                                         |
| **Viral Score Engine**            | Proprietary weighted score (0–100) from 9 signals: title formula, thumbnail CTR, hook confidence, engagement velocity, trend alignment, and more.       |
| **AI Analysis Pipeline**          | Transcript analysis, thumbnail vision analysis, hook classification, title formula detection, full content analysis with narrative structure breakdown. |
| **Trend Detection**               | Daily AI topic clustering. Classifies topics as emerging, evergreen, or declining. Computes velocity and opportunity scores.                            |
| **Opportunity Engine**            | Ranks content opportunities by demand × growth ÷ competition. Surfaces untapped niches before they peak.                                                |
| **Ethical Recommendation Engine** | Generates original title concepts, hook ideas, content outlines, thumbnail descriptions, and keyword suggestions — structurally inspired, never copied. |
| **Watchlists**                    | Monitor specific channels, keywords, niches, or competitors. Get notified when they upload or when tracked topics spike.                                |
| **Alert Dispatch**                | Multi-channel alerts: Email, Discord, Slack, Telegram, custom webhook. Throttled to 1 alert/rule/hour.                                                  |
| **Unified Search**                | Search across videos, channels, and trends with 8 filter dimensions and cursor-based pagination.                                                        |
| **Export System**                 | Async export to CSV, Excel, JSON, and PDF. Signed download URLs.                                                                                        |
| **Multi-Tenant Workspaces**       | Organisations, workspaces, projects, RBAC (5 roles), member invitations, session management.                                                            |
| **Prompt Library**                | Versioned AI prompts stored in the database. Edit and deploy new prompt versions without code changes.                                                  |
| **AI Response Caching**           | All AI outputs cached by `(prompt_version, sha256(input))`. No video is analysed twice.                                                                 |
| **Dead-Letter Queue**             | Failed background jobs are captured, inspected, and retried via the Admin Panel.                                                                        |
| **Super Admin Panel**             | Internal management: organisations, users, billing, job logs, prompt editing, system health.                                                            |

### Billing & Plans

| Plan             | Target user          | Key limits                                                           |
| ---------------- | -------------------- | -------------------------------------------------------------------- |
| **Free**         | Hobbyist creators    | 20 videos/month, 1 watchlist, email alerts only                      |
| **Starter**      | Independent creators | 200 videos/month, 5 watchlists, all alert channels                   |
| **Professional** | Full-time creators   | 1,000 videos/month, 20 watchlists, exports, API access               |
| **Business**     | Agencies             | 5,000 videos/month, unlimited watchlists, 5 seats, scheduled reports |
| **Enterprise**   | Media companies      | Custom limits, unlimited seats, SLA, dedicated support               |

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

| Technology                                      | Version | Purpose                                                                                    |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| [Next.js](https://nextjs.org/)                  | 16+     | React framework with App Router, SSR, ISR                                                  |
| [TypeScript](https://www.typescriptlang.org/)   | 5.x     | Type-safe JavaScript across the entire stack                                               |
| [Tailwind CSS](https://tailwindcss.com/)        | 4.x     | Utility-first CSS with design system tokens (CSS-native `@theme`, no `tailwind.config.ts`) |
| [shadcn/ui](https://ui.shadcn.com/)             | Latest  | Accessible component library built on Radix UI                                             |
| [TanStack Query](https://tanstack.com/query)    | 5.x     | Server state management, caching, background refetch                                       |
| [next-intl](https://next-intl-docs.vercel.app/) | Latest  | Internationalisation (i18n)                                                                |
| [Recharts](https://recharts.org/)               | Latest  | Data visualisation (charts, heatmaps, histograms)                                          |

### Backend

| Technology                                    | Version | Purpose                                     |
| --------------------------------------------- | ------- | ------------------------------------------- |
| [Fastify](https://fastify.dev/)               | 4.x     | High-performance Node.js HTTP framework     |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     | Type-safe server-side code                  |
| [Zod](https://zod.dev/)                       | 3.x     | Runtime input validation and type inference |
| [Drizzle ORM](https://orm.drizzle.team/)      | Latest  | Type-safe SQL queries and schema migrations |
| [Pino](https://getpino.io/)                   | Latest  | Structured JSON logging                     |
| [BullMQ](https://docs.bullmq.io/)             | Latest  | Redis-backed job queue                      |

### Data

| Technology                                | Version | Purpose                                    |
| ----------------------------------------- | ------- | ------------------------------------------ |
| [PostgreSQL](https://www.postgresql.org/) | 15+     | Primary relational database                |
| [Supabase](https://supabase.com/)         | Latest  | PostgreSQL hosting, Auth, RLS, PgBouncer   |
| [Redis](https://redis.io/)                | 7.x     | Cache, rate limiting, BullMQ queue backend |
| [Drizzle ORM](https://orm.drizzle.team/)  | Latest  | Schema definition and migrations           |

### Infrastructure & DevOps

| Technology                                            | Version | Purpose                                         |
| ----------------------------------------------------- | ------- | ----------------------------------------------- |
| [Docker](https://www.docker.com/)                     | Latest  | Containerisation for all services               |
| [Docker Compose](https://docs.docker.com/compose/)    | v2      | Multi-container orchestration                   |
| [Coolify](https://coolify.io/)                        | Latest  | Self-hosted PaaS for deployment                 |
| [Traefik](https://traefik.io/)                        | v3      | Reverse proxy, SSL termination, service routing |
| [GitHub Actions](https://github.com/features/actions) | —       | CI/CD pipeline                                  |
| [Turborepo](https://turbo.build/)                     | Latest  | Monorepo task orchestration and build caching   |

### AI & External Services

| Service                                                           | Purpose                                               |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| [Anthropic Claude API](https://anthropic.com/)                    | Strategic analysis, recommendations (reasoning tasks) |
| [OpenAI API](https://openai.com/)                                 | Structured data extraction, vision analysis           |
| [YouTube Data API v3](https://developers.google.com/youtube/v3)   | Video discovery and metadata                          |
| [n8n](https://n8n.io/) (self-hosted)                              | Workflow automation for the AI pipeline               |
| [Stripe](https://stripe.com/)                                     | Subscription billing, Customer Portal                 |
| [SendGrid](https://sendgrid.com/) / [Resend](https://resend.com/) | Transactional email                                   |
| [Cloudflare](https://cloudflare.com/)                             | CDN, DDoS protection, WAF, R2 object storage          |

### Monitoring

| Technology                            | Purpose                 |
| ------------------------------------- | ----------------------- |
| [Prometheus](https://prometheus.io/)  | Metrics collection      |
| [Grafana](https://grafana.com/)       | Dashboards and alerting |
| [Loki](https://grafana.com/oss/loki/) | Log aggregation         |

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

Every organisation's data is isolated using **Row Level Security (RLS)** at the PostgreSQL level. The API enforces `org_id` filtering at the service layer as a second line of defence.

### AI Pipeline

All AI calls are **asynchronous** — triggered by the n8n workflow engine, never blocking API request handlers. All prompts are **versioned in the database**. All AI outputs are **validated against Zod schemas** before storage.

### Design Tokens (Phase 1)

`apps/web` defines a semantic design token system in `src/app/globals.css`, using Tailwind v4's
CSS-native `@theme` configuration (no `tailwind.config.ts` file — see [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md)).
Components should use the semantic utility classes (`bg-background`, `text-foreground`,
`bg-surface`, `border-border`, `text-muted`, `bg-primary`, `bg-accent`, `bg-success` /
`bg-warning` / `bg-danger` / `bg-info`) rather than raw Tailwind colours, so the palette can be
swapped without touching component code.

The current palette (light + dark, defined via CSS custom properties) is a **provisional**
neutral + single-accent set — not final brand colours. It is expected to be refined once brand
guidelines exist; see the decision log in [PROJECT_STATUS.md](./PROJECT_STATUS.md).

Typography adopts Tailwind's default type scale (`text-xs` – `text-9xl`) paired with **Geist
Sans** (UI/body copy) and **Geist Mono** (code, metrics, tabular data) — no custom scale was
introduced, since Tailwind's default scale already meets the project's needs.

---

## 5. Installation

> **Current implementation status:** This repository is in **Phase 1 — Foundation & Project Setup**
> (see [PROJECT_STATUS.md](./PROJECT_STATUS.md)). The monorepo, tooling, and design tokens described
> below are live today. `apps/api`, `packages/shared`, and `packages/db` are empty workspace
> skeletons — no Fastify server, database schema, or Docker/CI setup exists yet. Only
> `npm install` and `npm run dev --workspace=@viralscopes/web` are runnable right now; the
> `docker compose` flow and the rest of the local development stack below describe the target
> state that lands in later phases.

### Prerequisites

| Tool           | Version  | Install                                                |
| -------------- | -------- | ------------------------------------------------------ |
| Node.js        | 22.x LTS | [nodejs.org](https://nodejs.org/) or `nvm install 22`  |
| npm            | 10.x+    | Bundled with Node.js                                   |
| Docker         | Latest   | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | v2.x     | Bundled with Docker Desktop                            |
| Git            | Latest   | [git-scm.com](https://git-scm.com/)                    |

### Clone the Repository

```bash
git clone https://github.com/viralscopes/viralscopes.git
cd viralscopes
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

Open `.env.local` and fill in the required values. See [Environment Variables](#7-environment-variables) for the full reference.

The minimum required variables to start the application locally are:

```bash
# Database (Supabase local or hosted)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Auth
JWT_SECRET=your-local-jwt-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-local-refresh-secret-minimum-32-chars

# Redis
REDIS_URL=redis://localhost:6379

# Application
APP_ENV=development
APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

External service keys (YouTube API, OpenAI, Anthropic, Stripe, SendGrid) are required for full functionality but not for running the application shell locally.

---

## 6. Local Development

### Starting the Full Stack

The entire development environment starts with a single command:

```bash
docker compose -f docker-compose.dev.yml up
```

This starts:

- **PostgreSQL** (Supabase local) on port `54322`
- **Supabase Studio** on port `54323`
- **Redis** on port `6379`
- **n8n** on port `5678`
- **MinIO** (local S3) on port `9000` (console on `9001`)
- **Prometheus** on port `9090`
- **Grafana** on port `3002`
- **Loki** on port `3100`

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

| Service                     | URL                               |
| --------------------------- | --------------------------------- |
| Next.js Frontend            | http://localhost:3000             |
| Fastify API                 | http://localhost:3001             |
| API Documentation (Swagger) | http://localhost:3001/api/v1/docs |
| n8n Workflow Editor         | http://localhost:5678             |
| Supabase Studio             | http://localhost:54323            |
| MinIO Console               | http://localhost:9001             |
| Grafana Dashboards          | http://localhost:3002             |
| Prometheus                  | http://localhost:9090             |

### Database Setup

Run migrations to set up the database schema:

```bash
npm run db:migrate
```

Seed the database with development data:

```bash
npm run db:seed
```

Reset the database (drop + migrate + seed):

```bash
npm run db:reset
```

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

# Database
npm run db:migrate       # Apply pending migrations
npm run db:migrate:dry   # Preview migrations without applying
npm run db:seed          # Seed development data
npm run db:reset         # Drop, migrate, and seed
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

All environment variables are documented in `.env.example`. Below is the full reference.

> **Security:** Never commit `.env.local`, `.env.staging`, or `.env.production` to version control. Only `.env.example` (with placeholder values) is committed.

### Application

| Variable    | Required | Description                   | Example                                  |
| ----------- | -------- | ----------------------------- | ---------------------------------------- |
| `APP_ENV`   | Yes      | Environment name              | `development` / `staging` / `production` |
| `APP_URL`   | Yes      | Public URL of the application | `https://app.viralscopes.io`             |
| `LOG_LEVEL` | No       | Pino log level                | `info` (default)                         |

### Database (Supabase)

| Variable                    | Required | Description                                  | Example                               |
| --------------------------- | -------- | -------------------------------------------- | ------------------------------------- |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string                 | `postgresql://user:pass@host:5432/db` |
| `DATABASE_POOL_SIZE`        | No       | PgBouncer pool size                          | `10` (default)                        |
| `SUPABASE_URL`              | Yes      | Supabase project URL                         | `https://xyz.supabase.co`             |
| `SUPABASE_ANON_KEY`         | Yes      | Supabase anon/public key                     | `eyJ...`                              |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Supabase service role key (server-side only) | `eyJ...`                              |

### Redis

| Variable         | Required | Description                      | Example                  |
| ---------------- | -------- | -------------------------------- | ------------------------ |
| `REDIS_URL`      | Yes      | Redis connection URL             | `redis://localhost:6379` |
| `REDIS_PASSWORD` | No       | Redis password (if auth enabled) | `your-redis-password`    |

### Authentication

| Variable               | Required | Description                                     | Example                             |
| ---------------------- | -------- | ----------------------------------------------- | ----------------------------------- |
| `JWT_SECRET`           | Yes      | JWT access token signing secret (min 32 chars)  | `your-secret-minimum-32-characters` |
| `JWT_REFRESH_SECRET`   | Yes      | JWT refresh token signing secret (min 32 chars) | `your-refresh-secret-min-32-chars`  |
| `JWT_ACCESS_EXPIRY`    | No       | Access token expiry                             | `15m` (default)                     |
| `JWT_REFRESH_EXPIRY`   | No       | Refresh token expiry                            | `30d` (default)                     |
| `GOOGLE_CLIENT_ID`     | No       | Google OAuth Client ID                          | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | No       | Google OAuth Client Secret                      | `GOCSPX-...`                        |
| `GITHUB_CLIENT_ID`     | No       | GitHub OAuth App Client ID                      | `Iv1.abc123`                        |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth App Client Secret                  | `abc123def456`                      |

### YouTube Data API

| Variable               | Required            | Description                   | Example           |
| ---------------------- | ------------------- | ----------------------------- | ----------------- |
| `YOUTUBE_API_KEY`      | Yes (for discovery) | YouTube Data API v3 key       | `AIza...`         |
| `YOUTUBE_QUOTA_LIMIT`  | No                  | Daily quota unit limit        | `10000` (default) |
| `RAPIDAPI_YOUTUBE_KEY` | No                  | RapidAPI YouTube fallback key | `abc123...`       |

### AI APIs

| Variable            | Required              | Description              | Example      |
| ------------------- | --------------------- | ------------------------ | ------------ |
| `ANTHROPIC_API_KEY` | Yes (for AI analysis) | Anthropic Claude API key | `sk-ant-...` |
| `OPENAI_API_KEY`    | Yes (for AI analysis) | OpenAI API key           | `sk-...`     |

### Stripe

| Variable                             | Required          | Description                       | Example                       |
| ------------------------------------ | ----------------- | --------------------------------- | ----------------------------- |
| `STRIPE_SECRET_KEY`                  | Yes (for billing) | Stripe secret key                 | `sk_live_...` / `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`              | Yes (for billing) | Stripe webhook signing secret     | `whsec_...`                   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (for billing) | Stripe publishable key (frontend) | `pk_live_...`                 |

### Email

| Variable             | Required        | Description          | Example                |
| -------------------- | --------------- | -------------------- | ---------------------- |
| `SENDGRID_API_KEY`   | Yes (for email) | SendGrid API key     | `SG.abc...`            |
| `EMAIL_FROM_ADDRESS` | Yes (for email) | Sender email address | `hello@viralscopes.io` |
| `EMAIL_FROM_NAME`    | No              | Sender display name  | `ViralScopes`          |

### Object Storage

| Variable        | Required | Description               | Example                                |
| --------------- | -------- | ------------------------- | -------------------------------------- |
| `S3_BUCKET`     | Yes      | Storage bucket name       | `viralscopes-production`               |
| `S3_REGION`     | Yes      | Storage region            | `auto` (R2) / `eu-west-2` (S3)         |
| `S3_ENDPOINT`   | Yes      | Storage endpoint URL      | `https://xxx.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY` | Yes      | Storage access key ID     | `abc123`                               |
| `S3_SECRET_KEY` | Yes      | Storage secret access key | `secret123`                            |

### Frontend (Public Variables)

| Variable                             | Required | Description            | Example                      |
| ------------------------------------ | -------- | ---------------------- | ---------------------------- |
| `NEXT_PUBLIC_API_URL`                | Yes      | Backend API base URL   | `https://api.viralscopes.io` |
| `NEXT_PUBLIC_APP_URL`                | Yes      | Frontend public URL    | `https://app.viralscopes.io` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes      | Stripe publishable key | `pk_live_...`                |

### n8n

| Variable                  | Required | Description                    | Example                      |
| ------------------------- | -------- | ------------------------------ | ---------------------------- |
| `N8N_BASIC_AUTH_USER`     | Yes      | n8n admin username             | `admin`                      |
| `N8N_BASIC_AUTH_PASSWORD` | Yes      | n8n admin password             | `secure-password`            |
| `N8N_ENCRYPTION_KEY`      | Yes      | n8n credentials encryption key | `random-32-char-string`      |
| `N8N_WEBHOOK_URL`         | Yes      | n8n public webhook base URL    | `https://n8n.viralscopes.io` |

---

## 8. Running the Application

### Development Mode

```bash
# Start infrastructure (PostgreSQL, Redis, n8n, MinIO, monitoring)
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

| Type              | Tool                | Command                    |
| ----------------- | ------------------- | -------------------------- |
| Unit tests        | Vitest              | `npm run test:unit`        |
| Integration tests | Vitest + Supertest  | `npm run test:integration` |
| E2E tests         | Playwright          | `npm run test:e2e`         |
| Load tests        | k6                  | `npm run test:load`        |
| All tests         | Vitest + Playwright | `npm run test`             |
| Coverage report   | Vitest v8           | `npm run test:coverage`    |

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

| Layer             | Target                  |
| ----------------- | ----------------------- |
| Unit tests        | ≥ 80% line coverage     |
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
import { describe, it, expect } from 'vitest';
import { computeViralScore } from '../../../src/services/viral-score.service';
import { mockVideoSignals } from '../../fixtures/video.fixture';

describe('computeViralScore', () => {
  it('returns a score between 0 and 100 for valid inputs', () => {
    const score = computeViralScore(mockVideoSignals.highPerforming);
    expect(score.value).toBeGreaterThanOrEqual(0);
    expect(score.value).toBeLessThanOrEqual(100);
  });

  it('returns a lower score for videos with low engagement velocity', () => {
    const high = computeViralScore(mockVideoSignals.highPerforming);
    const low = computeViralScore(mockVideoSignals.lowEngagement);
    expect(high.value).toBeGreaterThan(low.value);
  });

  it('is deterministic — same inputs always produce the same score', () => {
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
docker build -f infra/docker/Dockerfile.api -t ghcr.io/viralscopes/api:latest .
docker push ghcr.io/viralscopes/api:latest

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

| Environment | Branch             | Deploy trigger  | URL                              |
| ----------- | ------------------ | --------------- | -------------------------------- |
| Development | Any feature branch | Local only      | `http://localhost:3000`          |
| Staging     | `develop`          | Auto on merge   | `https://staging.viralscopes.io` |
| Production  | `main`             | Manual approval | `https://app.viralscopes.io`     |

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

### Code Standards (Summary)

- TypeScript strict mode — no `any`, no `console.log`, no hardcoded strings
- Unit tests for all new service methods
- Integration tests for all new API endpoints
- `CHANGELOG.md` updated for user-facing changes
- Inline comments for non-obvious logic (explain _why_, not _what_)

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

**Documentation:** [PROJECT_RULES.md](./PROJECT_RULES.md) · [ROADMAP.md](./ROADMAP.md) · [PRD.md](./PRD.md) · [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) · [PROJECT_STATUS.md](./PROJECT_STATUS.md) · [CHANGELOG.md](./CHANGELOG.md)
