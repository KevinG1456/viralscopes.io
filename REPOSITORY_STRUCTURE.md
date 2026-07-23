# REPOSITORY_STRUCTURE.md

# ViralScopes.io — Repository Architecture & Structure

> **Version:** 1.2
> **Last Updated:** 2026-07-22
> **Status:** Active
> **Cross-references:** [README.md](./README.md) · [PROJECT_RULES.md](./PROJECT_RULES.md) · [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md)

> **Phase 2 note:** The hierarchy below is the target structure for the full MVP. As of Phase 2
> (Infrastructure & DevOps), `docker-compose.dev.yml`, `infra/docker/`, and `infra/monitoring/`
> are live and verified; `docker-compose.prod.yml`, `infra/traefik/`, and the Coolify deploy
> workflows are templates (BLK-002 — no VPS/domain exists). `apps/api` has a minimal Fastify
> bootstrap (health/readiness/metrics/storage only); `packages/shared` and `packages/db` remain
> empty stubs. See the inline "Phase 1"/"Phase 2" annotations in the tree below and
> [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current completion status.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Complete Folder Hierarchy](#2-complete-folder-hierarchy)
3. [Root Level Files](#3-root-level-files)
4. [apps/web — Next.js Frontend](#4-appsweb--nextjs-frontend)
5. [apps/api — Fastify Backend](#5-appsapi--fastify-backend)
6. [packages/shared — Shared Library](#6-packagesshared--shared-library)
7. [packages/db — Database Layer](#7-packagesdb--database-layer)
8. [infra/ — Infrastructure](#8-infra--infrastructure)
9. [docs/ — Project Documentation](#9-docs--project-documentation)
10. [Naming Conventions](#10-naming-conventions)
11. [Module Organisation](#11-module-organisation)
12. [Layer Responsibilities](#12-layer-responsibilities)
13. [Dependency Boundaries](#13-dependency-boundaries)
14. [Shared Components](#14-shared-components)
15. [Testing Structure](#15-testing-structure)
16. [Environment Configuration](#16-environment-configuration)

---

## 1. Overview

ViralScopes.io is a **monorepo** managed with **Turborepo**. It contains all application code, infrastructure configuration, workflow definitions, and project documentation in a single repository.

### Why a Monorepo

- Shared TypeScript types between the API and frontend are enforced at the package boundary — no type drift.
- A single CI/CD pipeline validates all packages together on every pull request.
- Cross-package refactoring is atomic — rename a type in `packages/shared` and the compiler immediately surfaces all affected callers.
- Consistent tooling (ESLint, Prettier, TypeScript) is configured once and inherited by all packages.

### Monorepo Manager

**Turborepo** handles task orchestration, build caching, and dependency graph resolution.

```
turbo run build          # Build all packages in dependency order
turbo run test           # Run all test suites
turbo run lint           # Lint all packages
turbo run dev            # Start all apps in development mode
```

---

## 2. Complete Folder Hierarchy

```
viralscopes/
│
├── apps/
│   ├── web/                          # Next.js 14+ frontend (App Router)
│   │   ├── app/                      # App Router pages and layouts
│   │   │   ├── (auth)/               # Auth route group (no sidebar layout)
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx        # Auth layout (centred, no sidebar)
│   │   │   │
│   │   │   ├── (dashboard)/          # Dashboard route group (sidebar layout)
│   │   │   │   ├── home/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── trending/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── videos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── channels/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── trends/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── opportunities/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── recommendations/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── watchlists/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── alerts/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── rules/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── export/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── organisation/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── team/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── api-keys/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── users/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── organisations/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── jobs/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── dead-letter/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── prompts/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── system/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx        # Dashboard layout (sidebar + topbar)
│   │   │   │
│   │   │   ├── (onboarding)/         # Onboarding route group
│   │   │   │   ├── welcome/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── create-org/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── choose-plan/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── first-watchlist/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── api/                  # Next.js API routes (thin proxies only)
│   │   │   │   └── auth/
│   │   │   │       └── callback/
│   │   │   │           └── route.ts  # OAuth callback handler
│   │   │   │
│   │   │   ├── changelog/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   ├── terms/
│   │   │   │   └── page.tsx
│   │   │   ├── error.tsx             # Global error boundary
│   │   │   ├── not-found.tsx         # 404 page
│   │   │   ├── layout.tsx            # Root layout (fonts, providers, metadata)
│   │   │   └── globals.css           # Tailwind v4 entrypoint + design tokens (@theme, no tailwind.config.ts)
│   │   │
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   # shadcn/ui base components (generated)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── ...              # Other shadcn/ui components
│   │   │   │
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   ├── MobileSidebar.tsx
│   │   │   │   └── PageHeader.tsx
│   │   │   │
│   │   │   ├── charts/               # Data visualisation components
│   │   │   │   ├── GrowthLineChart.tsx
│   │   │   │   ├── ViralScoreHistogram.tsx
│   │   │   │   ├── TrendVelocityChart.tsx
│   │   │   │   ├── UploadFrequencyHeatmap.tsx
│   │   │   │   └── EngagementBarChart.tsx
│   │   │   │
│   │   │   ├── videos/               # Video-specific components
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   ├── VideoTable.tsx
│   │   │   │   ├── ViralScoreGauge.tsx
│   │   │   │   ├── HookTypeBadge.tsx
│   │   │   │   ├── ThumbnailAnalysisPanel.tsx
│   │   │   │   └── TranscriptSummaryCard.tsx
│   │   │   │
│   │   │   ├── watchlists/           # Watchlist components
│   │   │   │   ├── WatchlistCard.tsx
│   │   │   │   └── CreateWatchlistDialog.tsx
│   │   │   │
│   │   │   ├── alerts/               # Alert components
│   │   │   │   ├── AlertRuleBuilder.tsx
│   │   │   │   └── AlertEventFeed.tsx
│   │   │   │
│   │   │   ├── recommendations/      # Recommendation components
│   │   │   │   ├── RecommendationCard.tsx
│   │   │   │   └── RecommendationList.tsx
│   │   │   │
│   │   │   ├── billing/              # Billing components
│   │   │   │   ├── PlanCard.tsx
│   │   │   │   ├── UsageBar.tsx
│   │   │   │   └── BillingPortalButton.tsx
│   │   │   │
│   │   │   ├── auth/                 # Auth form components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── OAuthButton.tsx
│   │   │   │   └── PasswordResetForm.tsx
│   │   │   │
│   │   │   ├── onboarding/           # Onboarding step components
│   │   │   │   ├── OnboardingProgress.tsx
│   │   │   │   ├── CreateOrgStep.tsx
│   │   │   │   ├── ChoosePlanStep.tsx
│   │   │   │   ├── FirstWatchlistStep.tsx
│   │   │   │   └── ProductTour.tsx
│   │   │   │
│   │   │   └── shared/               # Generic shared UI components
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── CopyButton.tsx
│   │   │       ├── ConfirmDialog.tsx
│   │   │       ├── PageTitle.tsx
│   │   │       └── CookieConsent.tsx
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts            # Auth state and actions
│   │   │   ├── useOrganisation.ts    # Current org context
│   │   │   ├── useVideos.ts          # Video list query
│   │   │   ├── useVideoDetail.ts     # Single video query
│   │   │   ├── useTrends.ts          # Trends query
│   │   │   ├── useOpportunities.ts   # Opportunities query
│   │   │   ├── useWatchlists.ts      # Watchlist CRUD
│   │   │   ├── useAlertRules.ts      # Alert rule CRUD
│   │   │   ├── useUsage.ts           # Quota usage query
│   │   │   └── useSearch.ts          # Unified search query
│   │   │
│   │   ├── lib/                      # Frontend utility layer
│   │   │   ├── api/                  # Typed API client
│   │   │   │   ├── client.ts         # Base fetch wrapper with auth injection
│   │   │   │   ├── videos.ts         # Video API calls
│   │   │   │   ├── channels.ts       # Channel API calls
│   │   │   │   ├── trends.ts         # Trends and opportunities API calls
│   │   │   │   ├── watchlists.ts     # Watchlist CRUD API calls
│   │   │   │   ├── alerts.ts         # Alert rules and events API calls
│   │   │   │   ├── search.ts         # Search API calls
│   │   │   │   ├── exports.ts        # Export API calls
│   │   │   │   ├── auth.ts           # Auth API calls
│   │   │   │   ├── billing.ts        # Billing and usage API calls
│   │   │   │   ├── api-keys.ts       # API key management calls
│   │   │   │   └── admin.ts          # Admin API calls
│   │   │   │
│   │   │   ├── routes.ts             # All route path constants
│   │   │   ├── query-client.ts       # TanStack Query client configuration
│   │   │   ├── auth-context.tsx      # Auth React context provider
│   │   │   ├── org-context.tsx       # Organisation React context provider
│   │   │   └── utils.ts              # General frontend utilities
│   │   │
│   │   ├── i18n/                     # Internationalisation
│   │   │   ├── routing.ts            # next-intl routing config
│   │   │   ├── request.ts            # next-intl server request config
│   │   │   └── messages/
│   │   │       └── en.json           # English translations (launch language)
│   │   │
│   │   ├── public/                   # Static assets
│   │   │   ├── favicon.ico
│   │   │   ├── logo.svg
│   │   │   ├── og-image.png          # Open Graph image
│   │   │   └── icons/                # Dashboard icon set
│   │   │
│   │   ├── content/                  # Static content (no deploy needed to update)
│   │   │   └── changelog.md          # Changelog source for the Changelog page
│   │   │
│   │   ├── next.config.ts            # Next.js configuration
│   │   ├── postcss.config.mjs        # PostCSS configuration (loads @tailwindcss/postcss)
│   │   ├── eslint.config.mjs         # Package ESLint flat config (extends the root base)
│   │   ├── tsconfig.json             # TypeScript configuration (extends tsconfig.base.json)
│   │   ├── .env.local                # Local dev env vars (gitignored)
│   │   └── package.json
│   │
│   └── api/                          # Fastify backend API
│       │                             # Phase 2: minimal bootstrap only — server.ts,
│       │                             # plugins/{cors,health,metrics}.plugin.ts, and
│       │                             # services/storage.service.ts. No routes/, controllers/,
│       │                             # repositories/, middleware/, schemas/, or errors/ yet —
│       │                             # config.ts is plain (no Zod validation yet). The full
│       │                             # layered structure below lands in Phase 5.
│       ├── src/
│       │   ├── index.ts              # Application entry point
│       │   ├── server.ts             # Fastify server factory and plugin registration
│       │   ├── config.ts             # Environment variable validation and config object
│       │   │
│       │   ├── plugins/              # Fastify plugins (cross-cutting concerns)
│       │   │   ├── auth.plugin.ts    # JWT + API key authentication plugin
│       │   │   ├── cors.plugin.ts    # CORS configuration plugin
│       │   │   ├── rate-limit.plugin.ts  # Redis-backed rate limiting plugin
│       │   │   ├── swagger.plugin.ts # OpenAPI documentation plugin
│       │   │   ├── health.plugin.ts  # /health and /ready endpoints
│       │   │   └── logger.plugin.ts  # Pino structured logging with correlation IDs
│       │   │
│       │   ├── middleware/           # Request middleware
│       │   │   ├── authenticate.ts   # JWT/API key authentication middleware
│       │   │   ├── authorize.ts      # RBAC role check middleware
│       │   │   ├── validate-org.ts   # Organisation membership validation
│       │   │   └── correlation-id.ts # Correlation ID injection
│       │   │
│       │   ├── routes/               # API route definitions (validation only)
│       │   │   ├── v1/
│       │   │   │   ├── index.ts      # Route registration for v1
│       │   │   │   ├── videos.routes.ts
│       │   │   │   ├── channels.routes.ts
│       │   │   │   ├── trends.routes.ts
│       │   │   │   ├── analytics.routes.ts
│       │   │   │   ├── recommendations.routes.ts
│       │   │   │   ├── watchlists.routes.ts
│       │   │   │   ├── alerts.routes.ts
│       │   │   │   ├── search.routes.ts
│       │   │   │   ├── exports.routes.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── billing.routes.ts
│       │   │   │   ├── api-keys.routes.ts
│       │   │   │   ├── usage.routes.ts
│       │   │   │   ├── webhooks.routes.ts
│       │   │   │   └── admin.routes.ts
│       │   │   └── health.routes.ts  # Health check routes (unversioned)
│       │   │
│       │   ├── controllers/          # Request orchestration (no business logic)
│       │   │   ├── videos.controller.ts
│       │   │   ├── channels.controller.ts
│       │   │   ├── trends.controller.ts
│       │   │   ├── analytics.controller.ts
│       │   │   ├── recommendations.controller.ts
│       │   │   ├── watchlists.controller.ts
│       │   │   ├── alerts.controller.ts
│       │   │   ├── search.controller.ts
│       │   │   ├── exports.controller.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── billing.controller.ts
│       │   │   ├── api-keys.controller.ts
│       │   │   ├── usage.controller.ts
│       │   │   ├── webhooks.controller.ts
│       │   │   └── admin.controller.ts
│       │   │
│       │   ├── services/             # Business logic (all domain rules live here)
│       │   │   ├── video.service.ts
│       │   │   ├── channel.service.ts
│       │   │   ├── trend.service.ts
│       │   │   ├── analytics.service.ts
│       │   │   ├── recommendation.service.ts
│       │   │   ├── watchlist.service.ts
│       │   │   ├── alert.service.ts
│       │   │   ├── search.service.ts
│       │   │   ├── export.service.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── billing.service.ts
│       │   │   ├── api-key.service.ts
│       │   │   ├── usage.service.ts
│       │   │   ├── viral-score.service.ts  # Viral score computation
│       │   │   ├── quota.service.ts        # YouTube API quota manager
│       │   │   ├── email.service.ts        # Transactional email abstraction
│       │   │   ├── storage.service.ts      # S3/R2 object storage abstraction
│       │   │   ├── queue.service.ts        # BullMQ job queue interface
│       │   │   ├── cache.service.ts        # Redis cache abstraction
│       │   │   ├── webhook.service.ts      # Outgoing webhook dispatch
│       │   │   ├── stripe.service.ts       # Stripe payment integration
│       │   │   └── admin.service.ts
│       │   │
│       │   ├── repositories/         # Data access layer (DB queries only)
│       │   │   ├── video.repository.ts
│       │   │   ├── channel.repository.ts
│       │   │   ├── trend.repository.ts
│       │   │   ├── recommendation.repository.ts
│       │   │   ├── watchlist.repository.ts
│       │   │   ├── alert.repository.ts
│       │   │   ├── user.repository.ts
│       │   │   ├── organisation.repository.ts
│       │   │   ├── subscription.repository.ts
│       │   │   ├── usage.repository.ts
│       │   │   ├── api-key.repository.ts
│       │   │   ├── job-log.repository.ts
│       │   │   ├── dead-letter.repository.ts
│       │   │   ├── prompt-library.repository.ts
│       │   │   └── audit-log.repository.ts
│       │   │
│       │   ├── schemas/              # Zod request/response schemas
│       │   │   ├── video.schema.ts
│       │   │   ├── channel.schema.ts
│       │   │   ├── trend.schema.ts
│       │   │   ├── watchlist.schema.ts
│       │   │   ├── alert.schema.ts
│       │   │   ├── search.schema.ts
│       │   │   ├── export.schema.ts
│       │   │   ├── auth.schema.ts
│       │   │   ├── billing.schema.ts
│       │   │   ├── api-key.schema.ts
│       │   │   └── admin.schema.ts
│       │   │
│       │   ├── errors/               # Typed application errors
│       │   │   ├── app-error.ts      # Base AppError class
│       │   │   ├── auth-errors.ts    # Authentication and authorisation errors
│       │   │   ├── billing-errors.ts # Billing and quota errors
│       │   │   ├── validation-errors.ts
│       │   │   └── not-found-errors.ts
│       │   │
│       │   └── utils/                # Backend utilities
│       │       ├── hash.ts           # SHA256 and bcrypt helpers
│       │       ├── jwt.ts            # JWT sign/verify helpers
│       │       ├── pagination.ts     # Cursor-based pagination helpers
│       │       ├── retry.ts          # Exponential backoff retry helper
│       │       └── correlation.ts    # Correlation ID generation
│       │
│       ├── __tests__/                # Test root (mirrors src/ structure)
│       │   ├── unit/
│       │   │   ├── services/
│       │   │   │   ├── viral-score.service.unit.test.ts
│       │   │   │   ├── quota.service.unit.test.ts
│       │   │   │   └── ...
│       │   │   └── utils/
│       │   │       └── pagination.unit.test.ts
│       │   ├── integration/
│       │   │   ├── routes/
│       │   │   │   ├── videos.integration.test.ts
│       │   │   │   ├── auth.integration.test.ts
│       │   │   │   └── ...
│       │   │   └── webhooks/
│       │   │       └── stripe.integration.test.ts
│       │   └── fixtures/
│       │       ├── video.fixture.ts
│       │       ├── user.fixture.ts
│       │       └── organisation.fixture.ts
│       │
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared types, constants, and Zod schemas
│   │   │                             # Phase 1: stub only (index.ts, package.json, tsconfig.json,
│   │   │                             # eslint.config.mjs). Populated starting Phase 3/5 below.
│   │   ├── src/
│   │   │   ├── types/                # All shared TypeScript interfaces and types
│   │   │   │   ├── video.types.ts
│   │   │   │   ├── channel.types.ts
│   │   │   │   ├── trend.types.ts
│   │   │   │   ├── analysis.types.ts
│   │   │   │   ├── recommendation.types.ts
│   │   │   │   ├── watchlist.types.ts
│   │   │   │   ├── alert.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── organisation.types.ts
│   │   │   │   ├── billing.types.ts
│   │   │   │   ├── job.types.ts
│   │   │   │   └── api.types.ts      # API response envelope types
│   │   │   │
│   │   │   ├── schemas/              # Shared Zod schemas (used by both API and frontend)
│   │   │   │   ├── video.schema.ts
│   │   │   │   ├── viral-score.schema.ts
│   │   │   │   ├── ai-output.schema.ts   # Zod schemas for validating AI JSON output
│   │   │   │   └── pagination.schema.ts
│   │   │   │
│   │   │   ├── constants/            # Shared constants
│   │   │   │   ├── plans.ts          # Plan names, tier levels
│   │   │   │   ├── roles.ts          # RBAC role definitions
│   │   │   │   ├── platforms.ts      # Supported platform identifiers
│   │   │   │   ├── alert-types.ts    # Alert trigger types
│   │   │   │   ├── error-codes.ts    # All application error code strings
│   │   │   │   └── limits.ts         # Default quota limits per plan
│   │   │   │
│   │   │   ├── utils/                # Pure utility functions (no side effects)
│   │   │   │   ├── format.ts         # Number, date, duration formatting
│   │   │   │   ├── validate.ts       # Common validation helpers
│   │   │   │   └── slug.ts           # Slug generation utilities
│   │   │   │
│   │   │   └── index.ts              # Package barrel export
│   │   │
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── db/                           # Database schema and migrations
│       │                             # Phase 1: stub only (index.ts, package.json, tsconfig.json,
│       │                             # eslint.config.mjs). No Drizzle dependency yet — schema,
│       │                             # migrations, RLS, and drizzle.config.ts land in Phase 3.
│       ├── src/
│       │   ├── schema/               # Drizzle ORM table definitions
│       │   │   ├── users.ts
│       │   │   ├── organisations.ts
│       │   │   ├── workspaces.ts
│       │   │   ├── sessions.ts
│       │   │   ├── audit-logs.ts
│       │   │   ├── subscriptions.ts
│       │   │   ├── usage-events.ts
│       │   │   ├── api-keys.ts
│       │   │   ├── invoices.ts
│       │   │   ├── videos.ts
│       │   │   ├── channels.ts
│       │   │   ├── transcripts.ts
│       │   │   ├── thumbnail-analyses.ts
│       │   │   ├── title-analyses.ts
│       │   │   ├── video-analyses.ts
│       │   │   ├── recommendations.ts
│       │   │   ├── trends.ts
│       │   │   ├── watchlists.ts
│       │   │   ├── alert-rules.ts
│       │   │   ├── alert-events.ts
│       │   │   ├── job-logs.ts
│       │   │   ├── dead-letter-jobs.ts
│       │   │   └── prompt-library.ts
│       │   │
│       │   ├── migrations/           # Drizzle migration files (auto-generated + reviewed)
│       │   │   ├── 0001_initial_schema.sql
│       │   │   ├── 0002_add_rls_policies.sql
│       │   │   ├── 0003_add_partitioning.sql
│       │   │   └── meta/
│       │   │       └── _journal.json # Drizzle migration journal
│       │   │
│       │   ├── seeds/                # Development seed data
│       │   │   ├── index.ts          # Seed runner
│       │   │   ├── users.seed.ts
│       │   │   ├── organisations.seed.ts
│       │   │   ├── videos.seed.ts
│       │   │   └── prompts.seed.ts
│       │   │
│       │   ├── rls/                  # Row Level Security policy definitions
│       │   │   ├── videos.rls.sql
│       │   │   ├── organisations.rls.sql
│       │   │   └── ...
│       │   │
│       │   ├── client.ts             # Drizzle client factory
│       │   └── index.ts              # Package barrel export
│       │
│       ├── drizzle.config.ts         # Drizzle ORM configuration
│       ├── tsconfig.json
│       └── package.json
│
├── infra/                            # Infrastructure configuration
│   ├── docker/                       # Dockerfiles per service
│   │   ├── Dockerfile.web            # Next.js frontend
│   │   ├── Dockerfile.api            # Fastify API
│   │   └── Dockerfile.worker         # Background worker (future)
│   │
│   ├── n8n-workflows/                # Exported n8n workflow JSON (version-controlled)
│   │   ├── video-discovery.json
│   │   ├── metadata-pipeline.json
│   │   ├── transcript-pipeline.json
│   │   ├── thumbnail-analysis.json
│   │   ├── ai-analysis-pipeline.json
│   │   ├── title-formula-detection.json
│   │   ├── hook-classification.json
│   │   ├── engagement-analytics.json
│   │   ├── viral-score-engine.json
│   │   ├── trend-detection.json
│   │   ├── opportunity-engine.json
│   │   ├── ethical-recommendation.json
│   │   ├── channel-intelligence.json
│   │   └── alert-dispatch.json
│   │
│   ├── monitoring/                   # Observability configuration
│   │   ├── prometheus/
│   │   │   ├── prometheus.yml        # Prometheus scrape configuration
│   │   │   └── alerts/
│   │   │       ├── api-alerts.yml    # API latency and error rate alerts
│   │   │       ├── queue-alerts.yml  # Queue depth and job failure alerts
│   │   │       └── infra-alerts.yml  # Disk, memory, and service health alerts
│   │   ├── grafana/
│   │   │   ├── provisioning/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── datasources.yml
│   │   │   │   └── dashboards/
│   │   │   │       └── dashboards.yml
│   │   │   └── dashboards/
│   │   │       ├── api-performance.json
│   │   │       ├── queue-health.json
│   │   │       ├── database-metrics.json
│   │   │       ├── youtube-quota.json
│   │   │       └── business-metrics.json
│   │   └── loki/
│   │       └── loki.yml              # Loki log aggregation configuration
│   │
│   ├── traefik/                      # Reverse proxy configuration
│   │   ├── traefik.yml               # Traefik static configuration
│   │   └── dynamic/
│   │       └── middlewares.yml       # Security headers, rate limiting middleware
│   │
│   └── coolify/                      # Coolify deployment notes and environment templates
│       ├── staging.env.template      # Staging environment variable template
│       └── production.env.template   # Production environment variable template
│
├── docs/                             # Project documentation
│   ├── PROJECT_RULES.md
│   ├── ROADMAP.md
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── PRD.md
│   ├── PROJECT_STATUS.md
│   ├── REPOSITORY_STRUCTURE.md
│   ├── INFRASTRUCTURE_GROWTH_PLAN.md
│   │
│   ├── api/                          # API documentation
│   │   └── openapi.json              # Auto-generated OpenAPI spec
│   │
│   ├── database/                     # Database documentation
│   │   ├── database-erd.png          # Entity-relationship diagram
│   │   └── schema-reference.md       # Table-by-table descriptions
│   │
│   ├── workflows/                    # n8n workflow diagrams
│   │   ├── video-discovery.md
│   │   ├── ai-analysis-pipeline.md
│   │   ├── viral-score-engine.md
│   │   └── alert-dispatch.md
│   │
│   ├── guides/                       # Operational guides
│   │   ├── installation.md
│   │   ├── deployment.md
│   │   ├── scaling.md
│   │   ├── troubleshooting.md
│   │   ├── security.md
│   │   └── gdpr-requests.md
│   │
│   └── decisions/                    # Architecture Decision Records (ADRs)
│       ├── ADR-001-monorepo.md
│       ├── ADR-002-fastify-over-express.md
│       ├── ADR-003-n8n-for-workflows.md
│       ├── ADR-004-drizzle-orm.md
│       └── ADR-005-dual-ai-providers.md
│
├── .github/                          # GitHub configuration
│   ├── workflows/                    # GitHub Actions CI/CD — all 5 live as of Phase 2
│   │   ├── ci.yml                    # Lint, type-check, build, test on every PR — verified locally
│   │   ├── build.yml                 # Docker build and push to GHCR on merge to main — verified locally
│   │   ├── deploy-staging.yml        # TEMPLATE: skips gracefully without Coolify secrets (BLK-002)
│   │   ├── deploy-production.yml     # TEMPLATE: skips gracefully without Coolify secrets (BLK-002)
│   │   └── security.yml              # npm audit (blocks on high/critical) + weekly scheduled re-scan
│   ├── dependabot.yml                # npm (root + workspaces), github-actions, docker — weekly
│   ├── CODEOWNERS                    # Not yet created — no team to assign yet
│   ├── PULL_REQUEST_TEMPLATE.md      # Not yet created
│   └── ISSUE_TEMPLATE/               # Not yet created
│       ├── bug_report.md
│       └── feature_request.md
│
├── docker-compose.dev.yml            # Development Docker Compose — verified working (Phase 2)
├── docker-compose.prod.yml           # Production Docker Compose — TEMPLATE, unverified (BLK-002)
├── turbo.json                        # Turborepo task pipeline configuration
├── package.json                      # Root package.json (workspace definition)
├── tsconfig.base.json                # Base TypeScript configuration (extended by all packages)
├── eslint.config.mjs                 # Root ESLint flat config (lints stray top-level files only)
├── eslint.config.base.mjs            # Shared ESLint flat-config rules, imported by every package's own config
├── .prettierrc.json                  # Prettier configuration
├── .prettierignore                   # Prettier ignore patterns
├── .secretlintrc.json                # secretlint rule configuration (secret-commit scanning)
├── .secretlintignore                 # secretlint ignore patterns (binaries, build output)
├── .lintstagedrc.json                # lint-staged configuration (runs on pre-commit)
├── .husky/                           # Husky git hooks (pre-commit runs lint-staged)
├── .nvmrc                            # Node.js version pin
├── .gitignore
├── .env.example                      # All required environment variables with descriptions
└── README.md                         # Project overview and quick-start guide
```

---

## 3. Root Level Files

| File                                       | Purpose                                                                                                                                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.dev.yml`                   | Local development environment: all services, hot reload, exposed ports. **Verified working** (Phase 2).                                                                                                  |
| `docker-compose.prod.yml`                  | Production environment: health checks, restart policies, named volumes, no exposed ports except via Traefik. **Template, unverified** — no VPS/domain exists (BLK-002).                                  |
| `turbo.json`                               | Turborepo pipeline: defines build order, cache inputs, and task dependencies                                                                                                                             |
| `package.json`                             | Workspace root: defines all workspaces, shared dev dependencies, and monorepo scripts                                                                                                                    |
| `tsconfig.base.json`                       | Base TypeScript config inherited by all packages. Sets `strict: true`, target `ES2022`, path aliases                                                                                                     |
| `eslint.config.mjs`                        | Root ESLint flat config. Flat config does not cascade across directories, so this only lints stray top-level files — every package has its own `eslint.config.mjs` that imports `eslint.config.base.mjs` |
| `eslint.config.base.mjs`                   | Shared ESLint rules (no-`any`, no-unused-vars, import ordering) inherited by every package's own flat config                                                                                             |
| `.secretlintrc.json` / `.secretlintignore` | Secret-scanning configuration (`secretlint`, run via the pre-commit hook). `detect-secrets` is an acceptable alternative if a future need arises                                                         |
| `.lintstagedrc.json` / `.husky/pre-commit` | Pre-commit gate: Prettier + ESLint `--fix` on staged code, secret scan on all staged files                                                                                                               |
| `.prettierrc`                              | Prettier formatting configuration: single quotes, 100 char line length, trailing commas                                                                                                                  |
| `.nvmrc`                                   | Pins the Node.js LTS version. Used by CI and nvm for consistent runtime                                                                                                                                  |
| `.env.example`                             | Documents every required environment variable with type, description, and example value                                                                                                                  |
| `.gitignore`                               | Excludes: `node_modules/`, `.env*` (except `.env.example`), build outputs, editor files                                                                                                                  |
| `README.md`                                | Project overview, quick-start guide, and links to all documentation                                                                                                                                      |

---

## 4. apps/web — Next.js Frontend

### Architecture

The frontend uses **Next.js 14+ App Router** with a clear separation between:

- **Server Components** — pages that fetch data on the server (no client-side JavaScript bundle cost)
- **Client Components** — interactive components that require browser APIs or React state

### Route Groups

Next.js route groups (folders wrapped in parentheses) are used to apply different layouts to different sections without affecting the URL:

| Route Group     | Layout                  | Pages                                             |
| --------------- | ----------------------- | ------------------------------------------------- |
| `(auth)/`       | Centred, no sidebar     | Login, Register, Verify Email, Reset Password     |
| `(dashboard)/`  | Full sidebar + topbar   | All main app pages                                |
| `(onboarding)/` | Stepped progress layout | Welcome, Create Org, Choose Plan, First Watchlist |

### Key Directories

| Directory               | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `app/`                  | All pages, layouts, and Next.js API routes (thin proxies only)                |
| `components/ui/`        | shadcn/ui base components — generated, never manually edited                  |
| `components/charts/`    | Chart components wrapping Recharts or similar                                 |
| `components/shared/`    | Generic components used across multiple features                              |
| `components/<feature>/` | Components specific to one feature domain                                     |
| `hooks/`                | Custom React hooks — each hook owns one server state slice via TanStack Query |
| `lib/api/`              | Typed API client layer — all HTTP calls go here, never in components directly |
| `lib/routes.ts`         | All route path constants — never hardcode paths in components                 |
| `i18n/`                 | next-intl configuration and translation files                                 |
| `content/`              | Markdown content files updated without code deployment                        |
| `public/`               | Static assets served directly                                                 |

### Key Conventions

- **Pages are Server Components by default.** Add `"use client"` only when browser APIs or interactivity are required.
- **All data fetching uses TanStack Query** on the client and native Next.js `fetch` in Server Components.
- **No `fetch()` calls in components.** All calls go through `lib/api/<domain>.ts`.
- **No hardcoded route strings.** All paths come from `lib/routes.ts`.
- **No business logic in components.** Logic lives in hooks or utility functions.

---

## 5. apps/api — Fastify Backend

### Architecture

The API follows a strict **4-layer architecture**:

```
Route → Controller → Service → Repository
```

| Layer      | File suffix      | Responsibility                                              | Contains business logic? |
| ---------- | ---------------- | ----------------------------------------------------------- | ------------------------ |
| Route      | `.routes.ts`     | Define endpoints, apply middleware, validate input with Zod | No                       |
| Controller | `.controller.ts` | Orchestrate service calls, format response                  | No                       |
| Service    | `.service.ts`    | All business logic and domain rules                         | Yes                      |
| Repository | `.repository.ts` | All database queries via Drizzle ORM                        | No                       |

### Plugins vs Middleware

- **Plugins** (`plugins/`) — Fastify-idiomatic cross-cutting concerns registered at startup: auth, CORS, rate limiting, Swagger, logging.
- **Middleware** (`middleware/`) — Request-lifecycle functions applied per-route or per-route-group: authentication checks, authorisation guards, org validation.

### Error Handling

All errors are instances of typed classes from `errors/`. The global error handler in `server.ts` catches all unhandled errors and returns the standard `{ success: false, error: { code, message, details } }` response. Stack traces are never included in production responses.

### Services — Key Abstractions

| Service                  | Purpose                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `email.service.ts`       | Abstraction over SendGrid/Resend. Swap providers without touching callers.                 |
| `storage.service.ts`     | Abstraction over S3/R2/MinIO. Single interface for all object storage operations.          |
| `queue.service.ts`       | BullMQ job queue interface. Enqueues jobs for n8n consumption.                             |
| `cache.service.ts`       | Redis abstraction for get/set/del/ttl. Used by rate limiter, feature flags, AI cache.      |
| `quota.service.ts`       | YouTube API quota tracking and enforcement. Cache-first video lookup.                      |
| `viral-score.service.ts` | Proprietary Viral Score algorithm. Pure function — same inputs always produce same output. |

---

## 6. packages/shared — Shared Library

### Purpose

`packages/shared` is the **single source of truth for all types and constants** used by both the API and the frontend. This prevents type drift between the two applications.

### What Lives Here

| Directory    | Contents                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------ |
| `types/`     | TypeScript interfaces for all domain entities (Video, Channel, Trend, etc.)                |
| `schemas/`   | Zod schemas shared between API input validation and frontend form validation               |
| `constants/` | Plan definitions, RBAC roles, platform identifiers, error codes, quota limits              |
| `utils/`     | Pure utility functions with no side effects and no dependencies on Node.js or browser APIs |

### What Does Not Live Here

- API-specific logic (HTTP, database queries, external service calls)
- Frontend-specific logic (React hooks, browser APIs, UI state)
- Secrets or configuration values

### Import Rule

Both `apps/web` and `apps/api` import from `@viralscopes/shared`. They never import from each other directly.

---

## 7. packages/db — Database Layer

### Purpose

`packages/db` owns the **Drizzle ORM schema definitions**, **migration files**, **RLS policy SQL**, and **seed data scripts**. It is the authoritative source of the database schema.

### What Lives Here

| Directory     | Contents                                                     |
| ------------- | ------------------------------------------------------------ |
| `schema/`     | One Drizzle table definition file per database table         |
| `migrations/` | Auto-generated SQL migration files, reviewed before applying |
| `rls/`        | Row Level Security policy SQL, applied in migrations         |
| `seeds/`      | Development and test seed data scripts                       |
| `client.ts`   | Drizzle client factory, used by `apps/api`                   |

### Migration Rules

- All schema changes go through a migration file.
- Migration files are named with a zero-padded sequence number: `0001_`, `0002_`, etc.
- Every migration is **reversible** — both `up` and `down` operations are defined.
- The `meta/_journal.json` file is managed by Drizzle and must not be manually edited.

---

## 8. infra/ — Infrastructure

> **Phase 2 note:** `docker/`, `monitoring/`, and `traefik/` are live as of Phase 2 (see
> `PROJECT_STATUS.md`) — `docker/` and `monitoring/` are verified working; `traefik/` is a
> template, unverified (BLK-002: no real domain/server exists). `n8n-workflows/` remains empty
> until Phase 6.

### docker/

Custom Dockerfiles exist only for the two services this repo actually builds — `Dockerfile.web`
and `Dockerfile.api`. n8n, Redis, MinIO, Postgres, and the monitoring stack all use official
images pinned to a resolved digest directly in the compose files (see DEC-011 in
`PROJECT_STATUS.md`) — no wrapper Dockerfile needed since nothing is customised. Both Dockerfiles
use multi-stage builds:

1. **Build stage** — installs all dependencies (`--ignore-scripts`, since the root `prepare: husky`
   script has nothing to attach to in a Docker build context) and compiles TypeScript
2. **Production stage** — copies only the compiled output and production dependencies

### n8n-workflows/

Empty until Phase 6. All n8n workflow definitions will be exported as JSON and committed here.
This ensures:

- Workflow changes are tracked in version control
- Workflows can be restored after environment rebuild
- Workflow history is reviewable via `git log`

**Convention:** Never make workflow changes only in the n8n UI. Export and commit after every change.

### monitoring/

| Directory                   | Contents                                                                                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prometheus/prometheus.yml` | Scrape config for api, n8n, postgres-exporter, redis-exporter, prometheus itself — verified, 5/5 targets up                                                                                                                |
| `grafana/provisioning/`     | Datasource (Prometheus + Loki) and dashboard provisioning, auto-loaded on Grafana startup                                                                                                                                  |
| `grafana/dashboards/`       | One consolidated `infrastructure-overview.json` dashboard — see scope note in `PROJECT_STATUS.md` (the 5 dashboards named in earlier drafts of this document are deferred until Phases 5/6/9 emit the metrics they'd need) |
| `loki/loki.yml`             | Loki log aggregation configuration                                                                                                                                                                                         |
| `loki/promtail.yml`         | Promtail scrape config — ships every container's logs into Loki via Docker service discovery, verified                                                                                                                     |

### traefik/

**Template only — unverified, no real domain/server exists (BLK-002).** Traefik is the reverse
proxy and SSL terminator for `docker-compose.prod.yml`. The configuration is split into:

- `traefik.yml` — static configuration (entrypoints, Let's Encrypt certificate resolver, API)
- `dynamic/middlewares.yml` — security headers middleware (HSTS, CSP-adjacent headers per
  `PROJECT_RULES.md` 4.4)

---

## 9. docs/ — Project Documentation

| File / Directory                | Contents                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `PROJECT_RULES.md`              | Engineering standards, coding conventions, git workflow, Definition of Done      |
| `ROADMAP.md`                    | Development phases, milestones, MVP scope, v1–v4 features                        |
| `README.md`                     | Project overview, quick start, architecture summary                              |
| `CHANGELOG.md`                  | Version history in Keep a Changelog format                                       |
| `PRD.md`                        | Product requirements, user stories, personas, success metrics                    |
| `PROJECT_STATUS.md`             | Current phase, completion %, blockers, next priorities                           |
| `REPOSITORY_STRUCTURE.md`       | This document                                                                    |
| `INFRASTRUCTURE_GROWTH_PLAN.md` | Infrastructure evolution from MVP to scale                                       |
| `api/openapi.json`              | Auto-generated OpenAPI specification                                             |
| `database/database-erd.png`     | Entity-relationship diagram                                                      |
| `workflows/`                    | n8n workflow diagrams with failure paths annotated                               |
| `guides/`                       | Operational guides: installation, deployment, scaling, troubleshooting, security |
| `decisions/`                    | Architecture Decision Records (ADRs)                                             |

### Architecture Decision Records (ADRs)

ADRs document significant architectural decisions with context, options considered, decision made, and consequences. They live in `docs/decisions/` and are named `ADR-NNN-short-description.md`.

Every significant architectural decision should have an ADR. Examples:

- Choosing Fastify over Express
- Choosing Drizzle ORM over Prisma
- Using n8n for workflow orchestration
- Running two AI providers (Claude + OpenAI)

---

## 10. Naming Conventions

### Files and Directories

| Context                 | Convention                  | Example                            |
| ----------------------- | --------------------------- | ---------------------------------- |
| All directories         | `kebab-case`                | `video-analyses/`, `dead-letter/`  |
| TypeScript source files | `kebab-case`                | `viral-score.service.ts`           |
| React component files   | `PascalCase`                | `VideoDetailPage.tsx`              |
| Test files              | `kebab-case.<type>.test.ts` | `viral-score.service.unit.test.ts` |
| Migration files         | `NNNN_snake_case.sql`       | `0001_initial_schema.sql`          |
| Workflow JSON files     | `kebab-case.json`           | `video-discovery.json`             |
| Grafana dashboards      | `kebab-case.json`           | `api-performance.json`             |
| ADR files               | `ADR-NNN-kebab-case.md`     | `ADR-001-monorepo.md`              |
| Environment files       | `.env.context`              | `.env.example`, `.env.local`       |

### Exports

- Each package has a single barrel export at `src/index.ts`.
- Barrel files are **not** used within feature modules — only at package boundaries.
- Named exports are always preferred over default exports in application code.
- React components use default exports (Next.js page convention).

---

## 11. Module Organisation

### Feature Module Pattern (API)

Each feature domain is self-contained within the layered architecture:

```
src/
├── routes/v1/videos.routes.ts          # Input validation + endpoint registration
├── controllers/videos.controller.ts    # Orchestration
├── services/video.service.ts           # Business logic
├── repositories/video.repository.ts    # DB queries
└── schemas/video.schema.ts             # Zod schemas
```

All files for one feature share the same prefix (`video.*`). Finding all code for a feature requires only grepping for the prefix.

### Shared Service Pattern

Services that are used by multiple feature modules (email, storage, queue, cache, quota) live in `services/` with no feature prefix. They are injected into feature services via constructor injection or a service locator.

### No Circular Dependencies

- `packages/shared` → no dependencies on `apps/`
- `packages/db` → depends on `packages/shared` (for types)
- `apps/api` → depends on `packages/shared`, `packages/db`
- `apps/web` → depends on `packages/shared` only
- `apps/api` and `apps/web` → never depend on each other

---

## 12. Layer Responsibilities

### Route Layer (`routes/`)

**Allowed:**

- Register the endpoint path and HTTP method
- Apply middleware (authenticate, authorize, validate-org)
- Validate request input with Zod (schema reference)
- Call the controller
- Return the controller's response

**Not allowed:**

- Business logic of any kind
- Direct database access
- Direct external service calls

---

### Controller Layer (`controllers/`)

**Allowed:**

- Extract validated data from the request
- Call one or more service methods
- Aggregate service results
- Format and return the API response

**Not allowed:**

- Business logic
- Database access
- External service calls

---

### Service Layer (`services/`)

**Allowed:**

- All business logic and domain rules
- Calling repositories for data
- Calling other services
- Calling abstracted external services (email, storage, queue, cache)
- Throwing typed `AppError` instances

**Not allowed:**

- Direct database access (use repositories)
- Direct external HTTP calls (use abstraction services)
- Formatting HTTP responses

---

### Repository Layer (`repositories/`)

**Allowed:**

- Drizzle ORM queries
- Constructing complex SQL via the Drizzle query builder
- Mapping raw database rows to domain types

**Not allowed:**

- Business logic
- Calling other repositories (use the service layer to compose)
- External service calls

---

## 13. Dependency Boundaries

```
┌─────────────────────────────────────┐
│           apps/web                  │
│   (Next.js, React, TanStack Query)  │
└──────────────────┬──────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────┐
│         packages/shared             │
│   (Types, Zod schemas, Constants)   │
└──────────────────┬──────────────────┘
                   │ imports ←── also imported by apps/api
                   ▼
┌─────────────────────────────────────┐
│           apps/api                  │
│   (Fastify, Services, Repos)        │
└──────────────────┬──────────────────┘
                   │ imports
                   ▼
┌─────────────────────────────────────┐
│           packages/db               │
│   (Drizzle ORM, Migrations, Seeds)  │
└─────────────────────────────────────┘
```

**Rules:**

- `apps/web` never imports from `apps/api`
- `apps/api` never imports from `apps/web`
- `packages/shared` never imports from any `apps/` package
- `packages/db` imports from `packages/shared` (for shared types) but not from `apps/`
- Circular imports anywhere are a build error (enforced by ESLint `import/no-cycle`)

---

## 14. Shared Components

### Shared Types (`packages/shared/types/`)

Every domain entity has a TypeScript interface defined in `packages/shared`. The API and frontend both import these types. Example:

```typescript
// packages/shared/src/types/video.types.ts
export interface Video {
  id: string;
  platform: Platform;
  videoId: string;
  url: string;
  title: string;
  viralScore: number | null;
  viralScoreConfidence: number | null;
  analysisStatus: AnalysisStatus;
  publishedAt: Date;
  createdAt: Date;
}

export type AnalysisStatus =
  'pending' | 'processing' | 'complete' | 'failed' | 'transcript_unavailable';
```

### Shared Zod Schemas (`packages/shared/schemas/`)

Zod schemas for validating AI output are shared because both the n8n workflow (via the API) and the admin prompt test harness (frontend) need to validate against the same schema.

### Shared Constants (`packages/shared/constants/`)

Plan definitions, RBAC roles, platform identifiers, and error codes are defined once and imported everywhere. No magic strings.

```typescript
// packages/shared/src/constants/plans.ts
export const PLAN_TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;

export type PlanTier = (typeof PLAN_TIERS)[keyof typeof PLAN_TIERS];
```

---

## 15. Testing Structure

### Test Location Convention

Tests live in `__tests__/` directories **co-located with the code they test**, not in a separate top-level `tests/` directory:

```
apps/api/
├── src/
│   └── services/
│       └── viral-score.service.ts
└── __tests__/
    └── unit/
        └── services/
            └── viral-score.service.unit.test.ts
```

### Test File Types

| Suffix                 | Type                  | Scope                                             |
| ---------------------- | --------------------- | ------------------------------------------------- |
| `.unit.test.ts`        | Unit test             | Single function or class, all dependencies mocked |
| `.integration.test.ts` | Integration test      | Multiple real layers, mocked external services    |
| `.e2e.test.ts`         | E2E test (Playwright) | Full user journey in a real browser               |

### Fixture Files

All test fixtures live in `__tests__/fixtures/` within each app:

```
apps/api/__tests__/fixtures/
├── video.fixture.ts          # Returns mock Video objects
├── user.fixture.ts           # Returns mock User objects
└── organisation.fixture.ts   # Returns mock Organisation objects
```

AI prompt regression test fixtures (the 10 fixed test videos) live in:

```
apps/api/__tests__/fixtures/prompt-regression/
├── video-001.json
├── video-002.json
└── ... (10 total, never modified after creation)
```

### E2E Test Structure

```
apps/web/
└── e2e/
    ├── auth.e2e.test.ts          # Login, register, OAuth, password reset
    ├── onboarding.e2e.test.ts    # Full onboarding flow
    ├── videos.e2e.test.ts        # Search, filter, view detail
    ├── watchlists.e2e.test.ts    # Create, manage, receive alert
    ├── billing.e2e.test.ts       # Upgrade plan, verify feature unlock
    └── api-keys.e2e.test.ts      # Create, use, revoke API key
```

---

## 16. Environment Configuration

All environment variables are documented in `.env.example` at the repository root. Every package reads its own variables from the environment — there is no shared config file at runtime.

### Variable Naming

All environment variables use `SCREAMING_SNAKE_CASE` with a service prefix:

| Prefix                  | Service                    |
| ----------------------- | -------------------------- |
| `DATABASE_`             | PostgreSQL / Supabase      |
| `REDIS_`                | Redis                      |
| `SUPABASE_`             | Supabase client            |
| `YOUTUBE_`              | YouTube Data API           |
| `OPENAI_`               | OpenAI API                 |
| `ANTHROPIC_`            | Anthropic / Claude API     |
| `STRIPE_`               | Stripe                     |
| `SENDGRID_` / `RESEND_` | Email service              |
| `S3_` / `R2_`           | Object storage             |
| `JWT_`                  | JWT signing secrets        |
| `N8N_`                  | n8n configuration          |
| `APP_`                  | Application-level settings |

### Variable Categories

| Category    | Examples                                                    | Scope        |
| ----------- | ----------------------------------------------------------- | ------------ |
| Database    | `DATABASE_URL`, `DATABASE_POOL_SIZE`                        | API only     |
| Cache       | `REDIS_URL`, `REDIS_PASSWORD`                               | API, n8n     |
| Auth        | `JWT_SECRET`, `JWT_REFRESH_SECRET`                          | API only     |
| AI          | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`                       | n8n only     |
| YouTube     | `YOUTUBE_API_KEY`, `YOUTUBE_QUOTA_LIMIT`                    | n8n, API     |
| Payments    | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                | API only     |
| Email       | `SENDGRID_API_KEY`, `EMAIL_FROM_ADDRESS`                    | API only     |
| Storage     | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`  | API, n8n     |
| Frontend    | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web only     |
| Application | `APP_ENV`, `APP_URL`, `LOG_LEVEL`                           | All services |

### Secret Injection

In production, secrets are injected at runtime by **Coolify** as environment variables. They are never stored in files, never committed to version control, and never logged.

---

_This document is updated whenever new directories are added, significant restructuring occurs, or naming conventions change. All changes require a pull request with at least one approving review._

---

**Related Documents:**

- [README.md](./README.md) — Project overview and quick start
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards and conventions
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — How the infrastructure evolves
- [ROADMAP.md](./ROADMAP.md) — Development phases
