# Deployment_Guide.md
# ViralScopes.io — Deployment Guide

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [README.md](./README.md) · [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) · [Security_Architecture.md](./Security_Architecture.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Architecture](#2-environment-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Local Development Setup](#4-local-development-setup)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Secrets Management](#6-secrets-management)
7. [Build Process](#7-build-process)
8. [Database Migrations](#8-database-migrations)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Staging Deployment](#10-staging-deployment)
11. [Production Deployment](#11-production-deployment)
12. [Zero-Downtime Deployment Strategy](#12-zero-downtime-deployment-strategy)
13. [Blue/Green & Canary Deployments](#13-bluegreen--canary-deployments)
14. [SSL Configuration](#14-ssl-configuration)
15. [DNS Configuration](#15-dns-configuration)
16. [CDN Setup](#16-cdn-setup)
17. [Monitoring After Deployment](#17-monitoring-after-deployment)
18. [Post-Deployment Verification](#18-post-deployment-verification)
19. [Rollback Procedures](#19-rollback-procedures)
20. [Backup Procedures](#20-backup-procedures)
21. [Disaster Recovery](#21-disaster-recovery)
22. [Release Checklist](#22-release-checklist)

---

## 1. Overview

### Deployment Stack

| Component | Technology | Hosting |
|---|---|---|
| Container orchestration | Docker Compose (Stage 1), Kubernetes (Stage 3) | Self-hosted via Coolify |
| PaaS layer | Coolify | Installed on Hetzner VPS |
| Reverse proxy | Traefik v3 | Docker container on VPS |
| CI/CD | GitHub Actions | GitHub-hosted runners |
| Image registry | GitHub Container Registry (GHCR) | `ghcr.io/viralscopes/*` |
| Database | PostgreSQL via Supabase | Supabase hosted |
| Object storage | Cloudflare R2 | Cloudflare edge |
| DNS & CDN | Cloudflare | Cloudflare edge |

### Deployment Flow Summary

```
Developer pushes code
        │
        ▼
GitHub Actions CI
  lint → typecheck → test → security scan
        │
        ▼ (on merge to develop)
Build Docker images
Push to ghcr.io
        │
        ▼
Deploy to STAGING (automatic)
Run smoke tests on staging
        │
        ▼ (manual approval in GitHub)
Deploy to PRODUCTION
Run smoke tests on production
Notify Slack #deployments
```

---

## 2. Environment Architecture

### Three Environments

| Environment | Branch | Deploy trigger | URL | Purpose |
|---|---|---|---|---|
| **Development** | Any feature branch | Local only | `http://localhost:3000` | Active development, hot reload |
| **Staging** | `develop` | Auto on merge | `https://staging.viralscopes.io` | Integration testing, QA, demo |
| **Production** | `main` | Manual approval | `https://app.viralscopes.io` | Live customer traffic |

### Environment Differences

| Setting | Development | Staging | Production |
|---|---|---|---|
| Database | Supabase local (Docker) | Supabase hosted (free tier) | Supabase hosted (Pro + addons) |
| Redis | Docker (no persistence) | Docker (no persistence) | Managed Redis or Docker + AOF |
| Object storage | MinIO (local Docker) | Cloudflare R2 (staging bucket) | Cloudflare R2 (production bucket) |
| Email | Console output / Mailtrap | SendGrid (test domain) | SendGrid (live domain) |
| Stripe | Test mode (`sk_test_*`) | Test mode (`sk_test_*`) | Live mode (`sk_live_*`) |
| AI APIs | Real keys (shared budget) | Real keys (£20/month cap) | Real keys (full budget) |
| Log level | `debug` | `info` | `info` |
| SSL | Self-signed / none | Let's Encrypt | Let's Encrypt |
| CORS | `localhost:3000` | `staging.viralscopes.io` | `app.viralscopes.io` |

---

## 3. Prerequisites

### Required on Developer Machine

| Tool | Version | Install |
|---|---|---|
| Node.js | 22.x LTS | `nvm install 22` or [nodejs.org](https://nodejs.org/) |
| npm | 10.x+ | Bundled with Node.js |
| Docker Desktop | Latest | [docker.com/get-docker](https://www.docker.com/get-docker/) |
| Docker Compose | v2.x | Bundled with Docker Desktop |
| Git | 2.x+ | `brew install git` or [git-scm.com](https://git-scm.com/) |
| nvm | Latest | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash` |

### Required on Production Server

| Tool | Install command |
|---|---|
| Docker | `curl -fsSL https://get.docker.com | sh` |
| Docker Compose v2 | Bundled with Docker Engine |
| Coolify | `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash` |
| Git | `apt install git` |

### Required Accounts & Services

Before deploying to production, ensure the following accounts and services are configured:

- [ ] **GitHub:** Repository access, GitHub Actions enabled, GHCR access
- [ ] **Hetzner:** VPS provisioned, SSH key added
- [ ] **Supabase:** Project created, connection string ready
- [ ] **Cloudflare:** Domain added, R2 bucket created, API token with R2 permissions
- [ ] **Stripe:** Account created, webhook endpoint registered
- [ ] **SendGrid or Resend:** Account created, domain verified (SPF/DKIM/DMARC)
- [ ] **Anthropic:** API key generated with sufficient credit
- [ ] **OpenAI:** API key generated with sufficient credit
- [ ] **YouTube Data API:** API key created in Google Cloud Console
- [ ] **PagerDuty (Stage 2+):** Service created, integration key ready

---

## 4. Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/viralscopes/viralscopes.git
cd viralscopes
```

### Step 2: Install Node.js (via nvm)

```bash
# Install and use the correct Node.js version
nvm install    # reads .nvmrc automatically
nvm use        # activates the correct version
node --version # should match .nvmrc
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces via npm workspaces.

### Step 4: Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the minimum required values for local development:

```bash
# Minimum required for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-jwt-secret-minimum-64-characters-long-abc123
JWT_REFRESH_SECRET=local-dev-refresh-secret-minimum-64-characters-abc456
APP_ENV=development
APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, n8n, MinIO, Prometheus, Grafana, Loki
docker compose -f docker-compose.dev.yml up -d
```

Wait for all services to be healthy (~30 seconds):

```bash
docker compose -f docker-compose.dev.yml ps
# All should show "Up" or "healthy"
```

### Step 6: Run Database Migrations & Seed

```bash
# Apply all pending migrations
npm run db:migrate

# Seed with development data
npm run db:seed
```

### Step 7: Start Application Services

```bash
# In one terminal: start the Fastify API
npm run dev --workspace=apps/api

# In another terminal: start the Next.js frontend
npm run dev --workspace=apps/web
```

Or use the root convenience command (starts both):

```bash
npm run dev
```

### Step 8: Verify Everything is Running

```bash
# API health check
curl http://localhost:3001/health
# Expected: {"status":"ok","uptime":...}

# API readiness check
curl http://localhost:3001/ready
# Expected: {"status":"ready","checks":{"database":"ok","redis":"ok","queue":"ok"}}

# Frontend
open http://localhost:3000
```

### Development Service URLs

| Service | URL | Credentials |
|---|---|---|
| Next.js Frontend | http://localhost:3000 | — |
| Fastify API | http://localhost:3001 | — |
| API Swagger Docs | http://localhost:3001/api/v1/docs | — |
| n8n Workflow Editor | http://localhost:5678 | admin / admin (local only) |
| Supabase Studio | http://localhost:54323 | — |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| Grafana | http://localhost:3002 | admin / admin |
| Prometheus | http://localhost:9090 | — |

### Stopping the Development Environment

```bash
# Stop all Docker services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (full reset)
docker compose -f docker-compose.dev.yml down -v
```

---

## 5. Environment Variables Reference

All environment variables are defined in `.env.example` at the repository root. This section provides the complete reference with validation requirements.

### Application

```bash
APP_ENV=production           # Required: development | staging | production
APP_URL=https://app.viralscopes.io   # Required: public URL of the frontend
APP_VERSION=1.0.0            # Set automatically by CI/CD
LOG_LEVEL=info               # Optional: error | warn | info | debug (default: info)
```

### Database

```bash
DATABASE_URL=postgresql://user:password@host:6543/postgres?pgbouncer=true
# Required: PostgreSQL connection string (use port 6543 for PgBouncer)

DATABASE_POOL_SIZE=10        # Optional: PgBouncer pool size (default: 10)

SUPABASE_URL=https://your-project.supabase.co
# Required: Supabase project API URL

SUPABASE_ANON_KEY=eyJ...
# Required: Supabase anon (public) key — safe to expose to clients

SUPABASE_SERVICE_ROLE_KEY=eyJ...
# Required: Supabase service role key — NEVER expose to clients
```

### Redis

```bash
REDIS_URL=redis://localhost:6379
# Required: Redis connection URL

REDIS_PASSWORD=your-redis-password
# Optional: Required if Redis auth is enabled

REDIS_TLS=false
# Optional: Set to true for managed Redis with TLS (e.g. Upstash)
```

### Authentication

```bash
JWT_SECRET=minimum-64-character-random-string-generate-with-openssl
# Required: Minimum 64 characters. Generate: openssl rand -hex 64

JWT_REFRESH_SECRET=different-minimum-64-character-random-string
# Required: Must differ from JWT_SECRET

JWT_ACCESS_EXPIRY=15m
# Optional: Access token expiry (default: 15m)

JWT_REFRESH_EXPIRY=30d
# Optional: Refresh token expiry (default: 30d)

GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
# Optional: Required for Google OAuth

GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
# Optional: Required for Google OAuth

GITHUB_CLIENT_ID=Iv1.abc123def456
# Optional: Required for GitHub OAuth

GITHUB_CLIENT_SECRET=abc123def456ghi789
# Optional: Required for GitHub OAuth
```

### AI APIs

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
# Required for AI analysis: Anthropic Claude API key

OPENAI_API_KEY=sk-proj-...
# Required for AI analysis: OpenAI API key

AI_DAILY_SPEND_LIMIT_GBP=50
# Optional: Maximum daily AI spend before workflows pause (default: 50)
```

### YouTube Data API

```bash
YOUTUBE_API_KEY=AIzaSy...
# Required for video discovery: YouTube Data API v3 key

YOUTUBE_QUOTA_LIMIT=10000
# Optional: Daily quota unit limit (default: 10000)

RAPIDAPI_YOUTUBE_KEY=abc123...
# Optional: RapidAPI YouTube fallback key (used when quota exhausted)
```

### Stripe

```bash
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for staging)
# Required for billing: Stripe secret key

STRIPE_WEBHOOK_SECRET=whsec_...
# Required for billing: Stripe webhook signing secret

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
# Required for billing: Stripe publishable key (frontend)
```

### Email

```bash
SENDGRID_API_KEY=SG.abc123...
# Required for email: SendGrid API key (or use RESEND_API_KEY)

RESEND_API_KEY=re_abc123...
# Alternative: Resend API key (if using Resend instead of SendGrid)

EMAIL_FROM_ADDRESS=hello@viralscopes.io
# Required: Sender email address

EMAIL_FROM_NAME=ViralScopes
# Optional: Sender display name (default: ViralScopes)
```

### Object Storage

```bash
S3_BUCKET=viralscopes-production
# Required: Object storage bucket name

S3_REGION=auto
# Required: Region (use 'auto' for Cloudflare R2, 'eu-west-2' for AWS S3)

S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
# Required: Storage endpoint URL

S3_ACCESS_KEY=abc123...
# Required: Storage access key ID

S3_SECRET_KEY=secretabc123...
# Required: Storage secret access key

S3_PUBLIC_URL=https://cdn.viralscopes.io
# Optional: CDN URL for public assets (thumbnails)
```

### n8n

```bash
N8N_BASIC_AUTH_USER=admin
# Required: n8n admin username

N8N_BASIC_AUTH_PASSWORD=your-secure-password
# Required: n8n admin password

N8N_ENCRYPTION_KEY=random-32-character-string
# Required: n8n credentials encryption key

N8N_WEBHOOK_URL=https://n8n.viralscopes.io
# Required: n8n public webhook base URL

N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
```

### Frontend (Public Variables — Exposed to Browser)

```bash
NEXT_PUBLIC_API_URL=https://api.viralscopes.io
# Required: Backend API base URL

NEXT_PUBLIC_APP_URL=https://app.viralscopes.io
# Required: Frontend public URL

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# Required: Stripe publishable key

NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
# Optional: Sentry DSN for frontend error tracking (Stage 2+)
```

### Database Encryption

```bash
DB_ENCRYPTION_KEY=64-character-hex-string-for-aes-256
# Required: AES-256 key for encrypting sensitive DB columns
# Generate: openssl rand -hex 32
```

---

## 6. Secrets Management

### Generating Secrets

```bash
# Generate JWT secrets (minimum 64 characters)
openssl rand -hex 64
# → e.g. a3f8c2d1e4b7a9f0c3d6e8b1a4f7c2d5e8b3a6f9c2d5e8b1a4f7c2d5e8b3a6f9

# Generate n8n encryption key (32 characters)
openssl rand -hex 16

# Generate DB encryption key (AES-256 = 32 bytes = 64 hex chars)
openssl rand -hex 32
```

### Secret Storage by Environment

**Development (`.env.local`):**
- Stored locally on developer machine
- Never committed to git (enforced by `.gitignore` and Husky pre-commit hook)
- Can use weak test values

**Staging (Coolify environment variables):**
- Stored in Coolify's encrypted environment variable store
- Different values from production (separate API keys, Stripe test mode)

**Production (Coolify environment variables):**
- Stored in Coolify's encrypted environment variable store
- All secrets generated with `openssl rand -hex 64` or equivalent
- Access restricted to Coolify admin (engineering lead only)

**CI/CD (GitHub Actions secrets):**
- `COOLIFY_STAGING_WEBHOOK` — Coolify webhook URL for staging deploys
- `COOLIFY_PRODUCTION_WEBHOOK` — Coolify webhook URL for production deploys
- `GHCR_TOKEN` — GitHub token for pushing Docker images
- `SLACK_WEBHOOK_URL` — Slack notification webhook

### Secret Rotation Procedure

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 64)
echo "New secret: $NEW_SECRET"

# 2. For JWT: configure dual-validation (accept old + new) in API
# Update JWT_SECRET_OLD=<current value> in Coolify env vars
# Update JWT_SECRET=<new value>
# Deploy — API now accepts both

# 3. Wait for all access tokens to expire (max 15 minutes)
sleep 900

# 4. Remove dual-validation — remove JWT_SECRET_OLD
# Deploy final configuration

# 5. Confirm no auth errors in Grafana after final deploy
```

---

## 7. Build Process

### Docker Build

Each service has a multi-stage Dockerfile in `/infra/docker/`:

```dockerfile
# infra/docker/Dockerfile.api
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace configuration
COPY package.json package-lock.json turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

# Install all dependencies (including devDependencies)
RUN npm ci

# Build the API
RUN npm run build --workspace=apps/api

# Stage 2: Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy only production dependencies and compiled output
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/shared/dist ./node_modules/@viralscopes/shared

RUN npm ci --omit=dev

USER nodejs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3   CMD curl -f http://localhost:3001/ready || exit 1

CMD ["node", "dist/index.js"]
```

### Build Commands

```bash
# Build all packages (respects Turborepo dependency order)
npm run build

# Build specific package
npm run build --workspace=apps/api
npm run build --workspace=apps/web

# Build Docker images locally
docker build -f infra/docker/Dockerfile.api -t viralscopes/api:local .
docker build -f infra/docker/Dockerfile.web -t viralscopes/web:local .

# Build and push to GHCR (done by CI)
docker build -f infra/docker/Dockerfile.api   -t ghcr.io/viralscopes/api:${GIT_SHA}   -t ghcr.io/viralscopes/api:latest .
docker push ghcr.io/viralscopes/api:${GIT_SHA}
docker push ghcr.io/viralscopes/api:latest
```

### Image Tags

| Tag | Description | When created |
|---|---|---|
| `ghcr.io/viralscopes/api:latest` | Latest main branch build | On every merge to `main` |
| `ghcr.io/viralscopes/api:<sha>` | Specific commit SHA | On every merge to `main` |
| `ghcr.io/viralscopes/api:v1.0.0` | Version tag | On GitHub release creation |
| `ghcr.io/viralscopes/api:staging` | Latest staging build | On every merge to `develop` |

---

## 8. Database Migrations

### Migration Workflow

```
Developer writes migration file
        │
        ▼
npm run db:migrate:dry  (preview SQL without applying)
        │
        ▼
Code review of migration file
        │
        ▼
Merge to develop → apply to staging (CI)
        │
        ▼
Verify staging is working correctly
        │
        ▼
Merge to main → apply to production (CI, before container swap)
```

### Migration Commands

```bash
# Generate a new migration from schema changes
npm run db:generate --workspace=packages/db
# Output: packages/db/src/migrations/0005_add_trend_velocity.sql

# Preview what SQL will be applied (dry run — does not modify DB)
npm run db:migrate:dry --workspace=packages/db

# Apply pending migrations to the current environment
npm run db:migrate --workspace=packages/db

# Check migration status (which are applied, which are pending)
npm run db:migrate:status --workspace=packages/db

# Roll back the last migration (development only — never use in production)
npm run db:migrate:rollback --workspace=packages/db

# Seed development data
npm run db:seed --workspace=packages/db

# Reset (drop + migrate + seed) — development only
npm run db:reset --workspace=packages/db
```

### Migration Rules (Enforced)

- [ ] Every schema change is a migration file — no manual `ALTER TABLE` in any environment
- [ ] Every migration is reversible — both up and down sections are required
- [ ] Migrations run **before** the new application version starts serving traffic
- [ ] Large table alterations use `CREATE INDEX CONCURRENTLY` (non-locking)
- [ ] Column renames use the dual-write pattern (add new → migrate → remove old)
- [ ] Production rollbacks use the migration `down` path, not manual SQL

### Zero-Downtime Migration Example

```sql
-- 0006_add_video_language_code.sql
-- Up: Add new column as nullable first

ALTER TABLE videos ADD COLUMN language_code VARCHAR(10);
CREATE INDEX CONCURRENTLY idx_videos_language_code ON videos (language_code);

-- Down

DROP INDEX CONCURRENTLY idx_videos_language_code;
ALTER TABLE videos DROP COLUMN language_code;
```

```sql
-- 0007_backfill_language_code.sql
-- Up: Backfill data (in batches to avoid locking)

DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_val INTEGER := 0;
  rows_updated INTEGER;
BEGIN
  LOOP
    UPDATE videos
    SET language_code = LEFT(language, 2)
    WHERE id IN (
      SELECT id FROM videos
      WHERE language_code IS NULL
      LIMIT batch_size
    );
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    PERFORM pg_sleep(0.1); -- Brief pause between batches
  END LOOP;
END $$;

-- Down (no-op — backfill data can stay)
```

---

## 9. CI/CD Pipeline

### GitHub Actions Workflows

All workflow files live in `.github/workflows/`.

### Workflow 1: CI — Pull Request Checks

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: viralscopes_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/viralscopes_test
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: test-jwt-secret-minimum-64-characters-long-for-ci-testing
      JWT_REFRESH_SECRET: test-refresh-secret-minimum-64-characters-long-ci
      APP_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run db:seed
      - run: npm run test:integration

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Audit dependencies
        run: npm audit --audit-level=high
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@v3
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}

  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci && npm run build --workspace=apps/web
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/login
          uploadArtifacts: true
          budgetPath: ./lighthouse-budget.json
```

### Workflow 2: Build & Deploy to Staging

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  build:
    name: Build & Push Docker Images
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      sha: ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infra/docker/Dockerfile.api
          push: true
          tags: |
            ghcr.io/viralscopes/api:staging
            ghcr.io/viralscopes/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            APP_VERSION=${{ github.sha }}

      - name: Build & Push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infra/docker/Dockerfile.web
          push: true
          tags: |
            ghcr.io/viralscopes/web:staging
            ghcr.io/viralscopes/web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    environment: staging
    steps:
      - name: Run database migrations on staging
        run: |
          curl -X POST ${{ secrets.COOLIFY_STAGING_MIGRATION_URL }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"             -H "Content-Type: application/json"

      - name: Trigger Coolify staging deployment
        run: |
          curl -X POST ${{ secrets.COOLIFY_STAGING_WEBHOOK }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_WEBHOOK_SECRET }}"

      - name: Wait for staging to be healthy
        run: |
          for i in {1..20}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}"               https://staging.viralscopes.io/ready)
            if [ "$STATUS" = "200" ]; then
              echo "✅ Staging is healthy"
              exit 0
            fi
            echo "Attempt $i: status $STATUS, waiting 15s..."
            sleep 15
          done
          echo "❌ Staging did not become healthy in time"
          exit 1

      - name: Run staging smoke tests
        run: npm run smoke:staging
        env:
          STAGING_URL: https://staging.viralscopes.io

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "✅ Staging deployed: ${{ github.sha }}",
              "channel": "#deployments"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Workflow 3: Deploy to Production

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build:
    name: Build & Push Production Images
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push API image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infra/docker/Dockerfile.api
          push: true
          tags: |
            ghcr.io/viralscopes/api:latest
            ghcr.io/viralscopes/api:${{ github.sha }}
          build-args: |
            APP_VERSION=${{ github.sha }}

      - name: Build & Push Web image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infra/docker/Dockerfile.web
          push: true
          tags: |
            ghcr.io/viralscopes/web:latest
            ghcr.io/viralscopes/web:${{ github.sha }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    environment: production    # ← Requires manual approval in GitHub
    steps:
      - name: Take pre-deploy database snapshot
        run: |
          curl -X POST ${{ secrets.COOLIFY_SNAPSHOT_URL }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"

      - name: Run database migrations on production
        run: |
          curl -X POST ${{ secrets.COOLIFY_PRODUCTION_MIGRATION_URL }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"

      - name: Trigger Coolify production deployment
        run: |
          curl -X POST ${{ secrets.COOLIFY_PRODUCTION_WEBHOOK }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_WEBHOOK_SECRET }}"

      - name: Wait for production to be healthy
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}"               https://api.viralscopes.io/ready)
            if [ "$STATUS" = "200" ]; then
              echo "✅ Production is healthy"
              exit 0
            fi
            echo "Attempt $i: status $STATUS, waiting 15s..."
            sleep 15
          done
          echo "❌ Production did not become healthy — initiating rollback"
          curl -X POST ${{ secrets.COOLIFY_ROLLBACK_URL }}             -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"
          exit 1

      - name: Run production smoke tests
        run: npm run smoke:production

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "🚀 Production deployed: ${{ github.sha }}",
              "channel": "#deployments"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 10. Staging Deployment

### Coolify Staging Configuration

In Coolify, the staging environment is configured as:

```
Services:
  - viralscopes-api-staging
    Image: ghcr.io/viralscopes/api:staging
    Port: 3001
    Domain: api.staging.viralscopes.io
    Health check: /ready

  - viralscopes-web-staging
    Image: ghcr.io/viralscopes/web:staging
    Port: 3000
    Domain: staging.viralscopes.io
    Health check: /health

  - viralscopes-n8n-staging
    Image: n8nio/n8n:latest
    Port: 5678
    Domain: n8n.staging.viralscopes.io
    Volume: n8n-staging-data

  - viralscopes-redis-staging
    Image: redis:7-alpine
    Port: 6379 (internal only)

  - viralscopes-monitoring-staging
    Image: grafana/grafana:latest
    Port: 3000
    Domain: grafana.staging.viralscopes.io
```

### Manual Staging Deploy

To manually deploy to staging without going through CI:

```bash
# Build and push staging images
docker build -f infra/docker/Dockerfile.api   -t ghcr.io/viralscopes/api:staging . &&   docker push ghcr.io/viralscopes/api:staging

# Trigger Coolify webhook
curl -X POST $COOLIFY_STAGING_WEBHOOK   -H "Authorization: Bearer $COOLIFY_WEBHOOK_SECRET"

# Monitor deployment
watch -n 5 'curl -s https://api.staging.viralscopes.io/ready'
```

---

## 11. Production Deployment

### First-Time Production Setup

#### 1. Provision the Server

```bash
# Create Hetzner CCX33 server via Hetzner Cloud CLI
hcloud server create   --name viralscopes-prod   --type ccx33   --image ubuntu-24.04   --location nbg1   --ssh-key your-key-name

# Get server IP
hcloud server ip viralscopes-prod
```

#### 2. Configure Server

```bash
# SSH into the server
ssh root@<server-ip>

# Update packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Set up UFW firewall
ufw allow 22    # SSH
ufw allow 80    # HTTP (Traefik redirects to HTTPS)
ufw allow 443   # HTTPS
ufw enable
```

#### 3. Configure Coolify

1. Access Coolify at `http://<server-ip>:8000`
2. Create admin account
3. Add the server as a managed server
4. Configure GitHub source (connect GitHub app)
5. Create environment variables for all production secrets
6. Create services: API, Web, n8n, Redis, Prometheus, Grafana, Loki

#### 4. Configure Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: "3.9"

networks:
  viralscopes:
    driver: bridge

volumes:
  n8n-data:
  loki-data:
  prometheus-data:
  grafana-data:

services:
  traefik:
    image: traefik:v3
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=security@viralscopes.io"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--metrics.prometheus=true"
      - "--metrics.prometheus.addEntryPointsLabels=true"
      - "--metrics.prometheus.addServicesLabels=true"
    ports:
      - "80:80"
      - "443:443"
      - "8082:8082"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    networks:
      - viralscopes

  api:
    image: ghcr.io/viralscopes/api:latest
    restart: unless-stopped
    env_file: .env.production
    networks:
      - viralscopes
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.viralscopes.io`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=3001"
      - "traefik.http.routers.api.middlewares=security-headers@file"

  web:
    image: ghcr.io/viralscopes/web:latest
    restart: unless-stopped
    env_file: .env.production
    networks:
      - viralscopes
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`app.viralscopes.io`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"
      - "traefik.http.services.web.loadbalancer.server.port=3000"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - viralscopes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    env_file: .env.production
    networks:
      - viralscopes
    volumes:
      - n8n-data:/home/node/.n8n
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.viralscopes.io`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"

  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./infra/monitoring/prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    networks:
      - viralscopes
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=15d"

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./infra/monitoring/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - viralscopes
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.viralscopes.io`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"

  loki:
    image: grafana/loki:latest
    restart: unless-stopped
    volumes:
      - ./infra/monitoring/loki:/etc/loki
      - loki-data:/loki
    networks:
      - viralscopes
    command: -config.file=/etc/loki/loki.yml
```

---

## 12. Zero-Downtime Deployment Strategy

### How Coolify Achieves Zero Downtime

```
Step 1: Pull new Docker image
        │
        ▼
Step 2: Start new container alongside old
        (both are running, old receives traffic)
        │
        ▼
Step 3: New container passes health check (/ready → 200)
        │
        ▼
Step 4: Traefik begins routing new requests to new container
        │
        ▼
Step 5: Old container finishes serving in-flight requests
        (graceful shutdown timeout: 30 seconds)
        │
        ▼
Step 6: Old container stops
        │
        ▼
Step 7: Only new container is running
```

### Graceful Shutdown

The API handles `SIGTERM` gracefully to ensure in-flight requests complete:

```typescript
// apps/api/src/server.ts
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — starting graceful shutdown");

  // Stop accepting new connections
  await fastify.close();

  // Allow up to 30 seconds for in-flight requests to complete
  logger.info("Graceful shutdown complete");
  process.exit(0);
});
```

Docker stop sends `SIGTERM` and waits up to 30 seconds before force-killing:

```yaml
# docker-compose.prod.yml
services:
  api:
    stop_grace_period: 30s
    stop_signal: SIGTERM
```

---

## 13. Blue/Green & Canary Deployments

### Stage 1–2: Rolling Deploy (Current)

Coolify uses a rolling deploy strategy — the new container replaces the old one after passing health checks. This provides zero downtime but no traffic splitting.

### Stage 3: Canary Deployments via Kubernetes

At Stage 3 with Kubernetes, canary deployments route a percentage of traffic to the new version:

```yaml
# infra/k8s/api-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
spec:
  replicas: 1          # 1 of 10 total pods = 10% traffic
  selector:
    matchLabels:
      app: api
      version: canary
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/viralscopes/api:new-version
```

**Canary rollout procedure:**
1. Deploy canary (1 pod = 10% traffic)
2. Monitor error rate and latency for 30 minutes
3. If healthy: scale canary to 50% (5 of 10 pods)
4. Monitor for 30 more minutes
5. If healthy: promote canary to stable (10 of 10 pods), remove old version

### Stage 3: Blue/Green for Major Releases

For breaking changes:
1. Deploy "green" environment with the new version (no traffic)
2. Run full smoke tests against green
3. Instantly switch Cloudflare Load Balancer to send 100% traffic to green
4. Keep "blue" (old version) running for 1 hour as rollback safety net
5. Decommission blue if no rollback needed

---

## 14. SSL Configuration

### Automatic Certificate Management

SSL certificates are managed automatically by Traefik using Let's Encrypt ACME HTTP-01 challenge.

```yaml
# Traefik static config
certificatesResolvers:
  letsencrypt:
    acme:
      email: security@viralscopes.io
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web    # Port 80 must be open for challenge
```

### Certificate Renewal

- Let's Encrypt certificates are valid for 90 days
- Traefik automatically renews at 30 days before expiry
- Renewal requires port 80 to be open on the server (for HTTP challenge)
- Renewal failures alert via Grafana (certificate expiry metric from Traefik)

### Manual Certificate Check

```bash
# Check certificate expiry
echo | openssl s_client -connect api.viralscopes.io:443 2>/dev/null   | openssl x509 -noout -dates

# Check Traefik certificate store
docker exec traefik cat /letsencrypt/acme.json | jq '.letsencrypt.Certificates'
```

---

## 15. DNS Configuration

### Required DNS Records

All DNS records are managed in Cloudflare.

| Type | Name | Value | Proxy | TTL |
|---|---|---|---|---|
| A | `@` (viralscopes.io) | `<server-ip>` | ✅ Proxied | Auto |
| A | `app` | `<server-ip>` | ✅ Proxied | Auto |
| A | `api` | `<server-ip>` | ✅ Proxied | Auto |
| A | `n8n` | `<server-ip>` | ✅ Proxied | Auto |
| A | `cdn` | — | Cloudflare R2 custom domain | Auto |
| A | `grafana` | `<server-ip>` | ❌ DNS only (internal) | Auto |
| CNAME | `www` | `app.viralscopes.io` | ✅ Proxied | Auto |
| MX | `@` | `mail.sendgrid.net` | ❌ DNS only | Auto |
| TXT | `@` | SPF record | ❌ DNS only | Auto |
| TXT | `sendgrid._domainkey` | DKIM record | ❌ DNS only | Auto |
| TXT | `_dmarc` | DMARC policy | ❌ DNS only | Auto |

### Email DNS Records (SendGrid / Resend)

```
# SPF record (allows SendGrid to send on behalf of viralscopes.io)
TXT @ "v=spf1 include:sendgrid.net ~all"

# DKIM record (verify SendGrid signature)
CNAME sendgrid._domainkey <provided-by-sendgrid>

# DMARC record (policy for failed authentication)
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@viralscopes.io"
```

### DNS Propagation Check

```bash
# Check A record propagation
dig app.viralscopes.io A +short

# Check MX records
dig viralscopes.io MX +short

# Check SPF
dig viralscopes.io TXT +short | grep spf

# Check DMARC
dig _dmarc.viralscopes.io TXT +short
```

---

## 16. CDN Setup

### Cloudflare CDN Configuration

All traffic flows through Cloudflare when DNS records are proxied (orange cloud in Cloudflare dashboard).

#### Page Rules / Cache Rules

```
# Rule 1: Cache static assets aggressively
URL: app.viralscopes.io/_next/static/*
Cache Level: Cache Everything
Edge Cache TTL: 1 year
Browser Cache TTL: 1 year
Headers: Cache-Control: public, max-age=31536000, immutable

# Rule 2: Do not cache API responses
URL: api.viralscopes.io/api/*
Cache Level: Bypass
Headers: Cache-Control: no-store

# Rule 3: Cache health endpoints at edge
URL: api.viralscopes.io/health
Cache Level: Cache Everything
Edge Cache TTL: 30 seconds

# Rule 4: R2 thumbnails — cache at edge
URL: cdn.viralscopes.io/thumbnails/*
Cache Level: Cache Everything
Edge Cache TTL: 7 days
```

#### Cloudflare R2 Custom Domain

1. Go to R2 bucket settings in Cloudflare dashboard
2. Add custom domain: `cdn.viralscopes.io`
3. Cloudflare automatically creates the CNAME record
4. Files at `cdn.viralscopes.io/thumbnails/abc.jpg` are served from R2 via Cloudflare CDN

#### WAF Rules

```
# Block high-threat IPs
Expression: cf.threat_score gt 50
Action: Block

# Rate limit login attempts
Expression: http.request.uri.path eq "/api/v1/auth/login"
Rate limit: 10 requests per minute per IP

# Block suspicious user agents
Expression: http.user_agent contains "sqlmap" or
            http.user_agent contains "nikto" or
            http.user_agent contains "masscan"
Action: Block
```

---

## 17. Monitoring After Deployment

### Automated Post-Deploy Monitoring

After each production deployment, the CI pipeline automatically:

1. **Waits for health check** — polls `/ready` every 15 seconds for up to 7.5 minutes
2. **Runs smoke tests** — verifies core functionality
3. **Checks Grafana** — automated API call to verify no alert rules are firing

### Manual Post-Deploy Checklist (First 30 Minutes)

- [ ] `GET https://api.viralscopes.io/health` returns `200 OK`
- [ ] `GET https://api.viralscopes.io/ready` returns `{"status":"ready",...}`
- [ ] Grafana → API Performance dashboard shows healthy metrics (no error rate spike)
- [ ] Grafana → Queue Health dashboard shows normal queue depths
- [ ] No Prometheus alerts firing
- [ ] Login flow works on `https://app.viralscopes.io/login`
- [ ] Check Loki for any new error patterns in the last 5 minutes

### Deployment Rollback Decision

Initiate rollback if, within 30 minutes of deployment:

- Error rate exceeds 1% for more than 3 consecutive minutes
- p95 API latency exceeds 2,000ms for more than 3 consecutive minutes
- Any data integrity issue is detected
- Health check `/ready` returns 503

---

## 18. Post-Deployment Verification

### Smoke Test Suite

The smoke test suite (`scripts/smoke-test.sh`) verifies core functionality after every deployment:

```bash
#!/bin/bash
# scripts/smoke-test.sh
BASE_URL=${1:-"https://api.viralscopes.io"}
PASS=0
FAIL=0

check() {
  local name=$1
  local url=$2
  local expected_status=$3

  actual_status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

  if [ "$actual_status" = "$expected_status" ]; then
    echo "✅ PASS: $name ($actual_status)"
    ((PASS++))
  else
    echo "❌ FAIL: $name (expected $expected_status, got $actual_status)"
    ((FAIL++))
  fi
}

echo "=== Smoke Tests: $BASE_URL ==="

# Health checks
check "API Liveness"   "$BASE_URL/health"               "200"
check "API Readiness"  "$BASE_URL/ready"                "200"

# Auth: unauthenticated
check "Login page"     "https://app.viralscopes.io/login" "200"
check "Register page"  "https://app.viralscopes.io/register" "200"

# API: protected routes return 401 without auth
check "Videos (unauth)" "$BASE_URL/api/v1/videos"        "401"
check "Trends (unauth)" "$BASE_URL/api/v1/trends"        "401"
check "Search (unauth)" "$BASE_URL/api/v1/search?q=test" "401"

# API: public routes
check "Plans (public)"  "$BASE_URL/api/v1/billing/plans" "200"

# Webhooks: invalid signature returns 400
check "Stripe webhook (no sig)"   "$BASE_URL/api/v1/webhooks/stripe"   "400"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ $FAIL -gt 0 ]; then
  exit 1
fi
```

### Full Verification Checklist (Major Releases)

- [ ] Smoke tests all pass
- [ ] Can register a new account end-to-end
- [ ] Email verification email is received
- [ ] Can log in with the new account
- [ ] Onboarding flow completes successfully
- [ ] Dashboard loads with real data
- [ ] Video search returns results
- [ ] Alert rule can be created
- [ ] Export can be triggered and downloaded
- [ ] Stripe Checkout flow completes (test mode)
- [ ] Stripe Customer Portal is accessible
- [ ] n8n workflows are running on schedule (check job_logs table)
- [ ] Grafana dashboards show live data
- [ ] No new error patterns in Loki logs

---

## 19. Rollback Procedures

### Automated Rollback (CI Failure)

If health checks fail after deployment, the CI pipeline triggers automatic rollback:

```bash
# In deploy-production.yml
- name: Trigger rollback on health check failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.COOLIFY_ROLLBACK_URL }}       -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}"       -d '{"serviceId": "viralscopes-api"}'
```

### Manual Rollback via Coolify (UI)

1. Log in to Coolify at `https://coolify.viralscopes.io`
2. Navigate to the affected service
3. Click **Deployments** → select the previous successful deployment
4. Click **Redeploy**
5. Monitor health checks until service is healthy

### Manual Rollback via CLI

```bash
# Roll back to the previous Docker image tag
docker pull ghcr.io/viralscopes/api:<previous-sha>
docker tag ghcr.io/viralscopes/api:<previous-sha> ghcr.io/viralscopes/api:latest

# Trigger Coolify redeploy
curl -X POST $COOLIFY_PRODUCTION_WEBHOOK   -H "Authorization: Bearer $COOLIFY_WEBHOOK_SECRET"
```

### Database Migration Rollback

```bash
# Roll back the last database migration
npm run db:migrate:rollback --workspace=packages/db

# Verify current migration state
npm run db:migrate:status --workspace=packages/db
```

**Important:** Application code rollback and database migration rollback must be coordinated. If the old code is incompatible with the new schema, roll back the migration first, then roll back the code.

### Rollback Decision Tree

```
Deployment deployed
       │
       ▼
Error rate > 1% for 3 min?
  │         │
 Yes        No ──▶ Monitor for 30 min ──▶ Declare success
  │
  ▼
Is it a code bug or data issue?
  │              │
Code bug      Data issue
  │              │
  ▼              ▼
Rollback      Rollback code + migration
code only     + notify affected customers
```

---

## 20. Backup Procedures

### Automated Backups

All backups are automated. Manual intervention is only needed for verification.

| Backup | Schedule | Where | Retention |
|---|---|---|---|
| Supabase automated backup | Daily 02:00 UTC | Supabase infrastructure | 7 days |
| pg_dump export | Daily 03:00 UTC | Cloudflare R2 `backups/` | 30 days |
| Hetzner server snapshot | Weekly Sun 04:00 UTC | Hetzner snapshot storage | 4 weeks |
| n8n workflow export | On change (git commit) | GitHub `/infra/n8n-workflows/` | Git history |

### Manual Database Backup

```bash
# Create an immediate pg_dump
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="viralscopes-manual-${TIMESTAMP}.sql.gz"

pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE

# Upload to R2
aws s3 cp /tmp/$BACKUP_FILE   s3://viralscopes-backups/manual/$BACKUP_FILE   --endpoint-url $R2_ENDPOINT

echo "Backup created: $BACKUP_FILE"
```

### Backup Restoration

```bash
# Download backup from R2
aws s3 cp   s3://viralscopes-backups/2026-07-20/viralscopes-prod.sql.gz   /tmp/restore.sql.gz   --endpoint-url $R2_ENDPOINT

# Decompress
gunzip /tmp/restore.sql.gz

# Restore (CAUTION: this overwrites the target database)
psql $TARGET_DATABASE_URL < /tmp/restore.sql
```

---

## 21. Disaster Recovery

For full disaster recovery procedures, see [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) Section 17.

### Quick Reference: VPS Total Failure

```bash
# 1. Provision replacement server (5 min)
hcloud server create --name viralscopes-prod-new   --type ccx33 --image ubuntu-24.04 --location nbg1

# 2. Install Docker and Coolify (10 min)
ssh root@<new-ip>
curl -fsSL https://get.docker.com | sh
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 3. Import environment variables from secure backup (3 min)
# → Coolify UI → Import .env backup

# 4. Deploy services from GHCR (8 min)
# → Coolify UI → Deploy viralscopes-api:latest
# → Coolify UI → Deploy viralscopes-web:latest

# 5. Update DNS in Cloudflare (2 min)
# → A record: app.viralscopes.io → <new-ip>
# → A record: api.viralscopes.io → <new-ip>

# 6. Verify
curl https://api.viralscopes.io/ready
```

---

## 22. Release Checklist

Use this checklist for every production release.

### Pre-Release

- [ ] All PR checks passing (lint, type-check, unit tests, integration tests, security scan)
- [ ] Staging deployment successful and verified
- [ ] All smoke tests passing on staging
- [ ] Database migrations reviewed by at least one engineer
- [ ] `CHANGELOG.md` updated with release notes
- [ ] GitHub release created with version tag
- [ ] Pre-release database snapshot taken

### Deployment

- [ ] CI/CD pipeline triggered (merge to `main`)
- [ ] Docker images built and pushed to GHCR
- [ ] Database migrations applied to production
- [ ] Production deployment triggered via Coolify webhook
- [ ] Health checks passing (`/health` and `/ready` return 200)

### Post-Release Verification (First 30 Minutes)

- [ ] Smoke tests passing on production
- [ ] Grafana: no error rate spike
- [ ] Grafana: API latency within normal range
- [ ] Grafana: queue depth normal
- [ ] Loki: no new error patterns
- [ ] Login flow works end-to-end
- [ ] Core feature smoke test completed (see Section 18)

### Post-Release Communication

- [ ] Slack `#deployments` notification sent (automatic via CI)
- [ ] `PROJECT_STATUS.md` updated
- [ ] Release notes published to `https://app.viralscopes.io/changelog` (update `content/changelog.md`)
- [ ] Notify customers if the release includes user-facing changes (via in-app notification or email)

### Rollback Criteria (Monitor for 30 Minutes)

Initiate rollback immediately if:
- [ ] Error rate > 1% sustained for > 3 minutes
- [ ] p95 API latency > 2,000ms sustained for > 3 minutes
- [ ] Any data integrity issue detected
- [ ] Health check returning 503

---

*This document is updated whenever the deployment pipeline changes, new environments are added, or rollback procedures are revised. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [README.md](./README.md) — Quick start guide and local development overview
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — How the codebase is organised
- [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) — Post-deploy monitoring and operations
- [Security_Architecture.md](./Security_Architecture.md) — Secret management and security controls
- [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) — Infrastructure cost breakdown
- [Database_Schema.md](./Database_Schema.md) — Migration strategy and schema reference
