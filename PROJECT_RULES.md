# PROJECT_RULES.md
# ViralScopes.io — Engineering Standards & Project Rules

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Maintained by:** Engineering Lead
> **Cross-references:** [README.md](./README.md) · [ROADMAP.md](./ROADMAP.md) · [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md)

---

## Table of Contents

1. [Development Principles](#1-development-principles)
2. [Coding Standards](#2-coding-standards)
3. [Architecture Guidelines](#3-architecture-guidelines)
4. [Security Requirements](#4-security-requirements)
5. [Git Workflow](#5-git-workflow)
6. [Branch Naming Conventions](#6-branch-naming-conventions)
7. [Commit Message Conventions](#7-commit-message-conventions)
8. [Pull Request Requirements](#8-pull-request-requirements)
9. [Testing Requirements](#9-testing-requirements)
10. [Documentation Requirements](#10-documentation-requirements)
11. [Dependency Management](#11-dependency-management)
12. [Performance Expectations](#12-performance-expectations)
13. [Code Review Checklist](#13-code-review-checklist)
14. [Definition of Done](#14-definition-of-done)
15. [AI Assistant Rules](#15-ai-assistant-rules)

---

## 1. Development Principles

These principles are non-negotiable. Every engineering decision must be evaluated against them.

### 1.1 Core Principles

| # | Principle | Description |
|---|---|---|
| P1 | **Correctness first** | Working software beats clever software. Never sacrifice correctness for performance or elegance. |
| P2 | **Explicit over implicit** | Favour explicit code that is obvious to read over concise code that requires inference. |
| P3 | **Fail loudly in development, gracefully in production** | Throw hard errors in dev. Return structured error responses in production. Never silently swallow errors. |
| P4 | **Security by default** | Every feature is built with security considerations from the start. Security is never retrofitted. |
| P5 | **Incremental delivery** | Ship small, working increments. No big-bang releases. Every merge to main must leave the system in a deployable state. |
| P6 | **Observable systems** | If it is not logged, it did not happen. Every significant state change, job execution, and error must be observable. |
| P7 | **Ethical AI** | The platform analyses patterns and generates original content ideas. It must never reproduce, paraphrase closely, or facilitate copying of any creator's original script, title, or creative work. |
| P8 | **Data minimisation** | Collect only the data required to deliver the feature. Define retention periods at design time, not after launch. |
| P9 | **Idempotency** | All background jobs and webhook handlers must be safe to run more than once without producing duplicate or inconsistent results. |
| P10 | **Dependency on interfaces, not implementations** | Vendor and provider integrations (email, storage, AI models, payment providers) are accessed through abstraction layers so they can be swapped without changes to business logic. |

### 1.2 What We Do Not Do

- We do not ship code without tests for business logic.
- We do not merge to `main` with failing CI checks.
- We do not store secrets in code, configuration files, or version control.
- We do not hardcode strings (route paths, error codes, plan names) in components or services.
- We do not call external services directly from UI components.
- We do not reproduce, closely paraphrase, or facilitate copying of creator content.
- We do not manually alter database tables in production — all changes go through migrations.
- We do not add dependencies without reviewing their licence, size, maintenance status, and security history.

---

## 2. Coding Standards

### 2.1 Language & Runtime

- **TypeScript** is the only permitted language across all packages. JavaScript files (`.js`, `.mjs`) are not permitted in application code.
- TypeScript `strict` mode (`"strict": true`) is enforced in every `tsconfig.json`. No exceptions.
- Target: `ES2022` or later.
- Node.js: LTS version pinned in `.nvmrc` and `engines` field of `package.json`.

### 2.2 TypeScript Rules

```typescript
// ✅ CORRECT — explicit types, no any
interface VideoAnalysis {
  videoId: string;
  viralScore: number;
  confidence: number;
  analyzedAt: Date;
}

// ❌ WRONG — implicit any, loose typing
const analysis: any = {};
function processVideo(data) { ... }
```

- `any` is **prohibited**. Use `unknown` and narrow with type guards.
- `as` type assertions are permitted only in test files and at I/O boundaries with a comment explaining why.
- All exported functions must have explicit return types.
- All interfaces and types live in `packages/shared/types/` or co-located `*.types.ts` files.
- Use `type` for unions and utility types; use `interface` for object shapes that may be extended.

### 2.3 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Variables & functions | `camelCase` | `viralScore`, `calculateEngagement()` |
| Classes & interfaces | `PascalCase` | `VideoAnalysisService`, `IVideoRepository` |
| Type aliases | `PascalCase` | `ViralScoreResult`, `PlanTier` |
| Enum members | `SCREAMING_SNAKE_CASE` | `PlanTier.PROFESSIONAL` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS`, `DEFAULT_QUOTA_LIMIT` |
| Files & directories | `kebab-case` | `video-analysis.service.ts`, `viral-score/` |
| React components | `PascalCase` file + export | `VideoDetailPage.tsx` |
| Database tables | `snake_case` | `video_analyses`, `alert_rules` |
| Database columns | `snake_case` | `viral_score`, `created_at` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `YOUTUBE_API_KEY`, `DATABASE_URL` |
| API routes | `kebab-case`, plural nouns | `/api/v1/videos`, `/api/v1/alert-rules` |

### 2.4 Code Formatting

- **Prettier** is the canonical formatter. Its output is authoritative — do not override it.
- **ESLint** enforces rules not covered by Prettier (import ordering, no-unused-vars, etc.).
- Husky pre-commit hook runs `lint-staged`: formats changed files and blocks commits with lint errors.
- Line length: 100 characters (configured in Prettier).
- Semicolons: required.
- Quotes: single quotes in TypeScript/JavaScript; double quotes in JSON and HTML attributes.
- Trailing commas: `"all"` (ES5+).

### 2.5 Imports

```typescript
// Order (enforced by ESLint import/order plugin):
// 1. Node built-ins
import { readFileSync } from "fs";

// 2. External packages
import { z } from "zod";
import { FastifyRequest } from "fastify";

// 3. Internal monorepo packages
import { VideoAnalysis } from "@viralscopes/shared";

// 4. Local relative imports (deepest last)
import { viralScoreService } from "../services/viral-score.service";
import { videoRepository } from "./video.repository";
```

- Barrel files (`index.ts`) are permitted only at package boundaries, not within feature modules.
- Circular imports are prohibited. ESLint `import/no-cycle` is enabled.

### 2.6 Error Handling

```typescript
// ✅ All errors are typed and structured
class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ✅ API responses always use standardised shape
const response = {
  success: false,
  error: {
    code: "VIDEO_NOT_FOUND",
    message: "No video found with the provided ID.",
    details: { videoId }
  }
};

// ❌ Never expose stack traces in production responses
// ❌ Never silently catch and ignore errors
```

- Every service method that can fail must declare its error types explicitly.
- Unhandled promise rejections crash the process in production — this is intentional and caught by the process manager.
- Background jobs write failures to `dead_letter_jobs` after exhausting retries.

### 2.7 Logging

```typescript
// ✅ Structured logging with context
logger.info({ correlationId, videoId, phase: "viral-score" }, "Viral score computed");
logger.error({ correlationId, err, videoId }, "Failed to fetch transcript");

// ❌ Console.log is prohibited in application code
console.log("video:", video);
```

- Use **Pino** (API) or the Next.js logger (frontend server components) for structured JSON logging.
- Every log entry must include a `correlationId`.
- Log levels: `error` (system fault), `warn` (recoverable issue), `info` (business event), `debug` (developer context — disabled in production).
- Never log PII (email addresses, names, payment details) at any level.

---

## 3. Architecture Guidelines

### 3.1 Monorepo Structure

```
viralscopes/
├── apps/
│   ├── web/          # Next.js frontend (App Router)
│   └── api/          # Fastify backend API
├── packages/
│   ├── shared/       # Shared types, constants, Zod schemas
│   └── db/           # Drizzle ORM schema and migrations
├── infra/
│   ├── docker/       # Dockerfiles per service
│   ├── n8n-workflows/ # Exported n8n workflow JSON (version-controlled)
│   └── monitoring/   # Prometheus rules, Grafana dashboards
└── docs/             # Project documentation
```

### 3.2 Backend Architecture (API)

- **Pattern:** Layered architecture — Routes → Controllers → Services → Repositories → Database
- Routes validate input (Zod) and delegate to controllers. They contain no business logic.
- Controllers orchestrate service calls and format responses. They contain no business logic.
- Services contain all business logic. They are tested in isolation with mocked repositories.
- Repositories are the only layer that touches the database directly.
- Cross-cutting concerns (auth, logging, rate limiting) are implemented as Fastify plugins or middleware.

```
Request → Route (validate) → Controller (orchestrate) → Service (logic) → Repository (data)
                                                                      ↓
                                                              External Services
                                                         (AI APIs, Storage, Email)
```

### 3.3 Frontend Architecture (Next.js App Router)

- **Server Components** for all data-fetching pages — no `useEffect` for initial data.
- **Client Components** only for interactivity (forms, charts, modals, real-time updates).
- All API calls go through the typed API client in `apps/web/lib/api/` — never `fetch()` directly in components.
- **TanStack Query** manages all server state on the client side. `useState` is for UI state only (modal open/closed, tab selection).
- All route paths are defined as constants in `apps/web/lib/routes.ts`.
- No business logic in components — delegate to hooks and utility functions.

### 3.4 Data Flow

```
YouTube API / External Sources
        ↓
   n8n Workflows (via Redis Queue)
        ↓
   PostgreSQL (Supabase) ← Redis Cache
        ↓
   Fastify API (with RLS enforcement)
        ↓
   Next.js Frontend (TanStack Query)
```

### 3.5 AI Pipeline Rules

- **Never call AI APIs synchronously in API request handlers.** All AI calls happen in n8n background workflows.
- **Always validate AI JSON output** against a Zod schema before storing. Reject and dead-letter if invalid.
- **Cache all AI responses** in Redis keyed by `(prompt_version, sha256(normalized_input))`. Never re-call the same input with the same prompt version.
- **All prompts live in the `prompt_library` database table.** No prompt text is hardcoded in application code.
- **Model selection is explicit per workflow:** Claude for strategic/reasoning tasks; GPT-4o for structured data extraction. Document the reasoning.
- **Ethical constraint is enforced at the prompt layer:** system prompts explicitly prohibit reproducing creator content.

### 3.6 Queue & Workflow Rules

- The API enqueues jobs into Redis. n8n workers consume from Redis. They are never called directly.
- Every workflow must be idempotent. Re-running with the same input must produce the same result and no duplicates.
- Failed workflows write to `dead_letter_jobs` after exhausting retries (max 3, exponential backoff).
- All workflow executions are logged to `job_logs` with a `correlation_id`.
- Workflow JSON files are version-controlled in `/infra/n8n-workflows/`. Never edit workflows only in the n8n UI.

### 3.7 Database Rules

- **UUIDs** for all primary keys. No serial integers in public-facing tables.
- **Row Level Security (RLS)** is enabled on every table. The API never bypasses RLS except in explicitly documented admin service role contexts.
- **All schema changes go through migration files.** No manual `ALTER TABLE` in any environment.
- **Indexes** are defined at creation time for every foreign key and every column used in a `WHERE` clause.
- **Partitioning** is used for high-volume append-only tables (`usage_events`, `job_logs`) from the start.
- **No raw SQL string interpolation.** All queries go through the ORM with parameterized inputs.

### 3.8 Multi-Tenancy Rules

- Every database table that holds tenant data has an `org_id` column.
- Every API endpoint that returns tenant data filters by the authenticated user's `org_id`.
- RLS policies enforce this at the database level as a second line of defence.
- Tenant data isolation is verified by integration tests that assert cross-tenant data leakage is impossible.

---

## 4. Security Requirements

### 4.1 Authentication & Tokens

- JWT access tokens expire in **15 minutes**.
- Refresh tokens are stored in **HTTP-only, Secure, SameSite=Strict cookies**. Never in `localStorage`.
- Refresh tokens rotate on every use. Old tokens are invalidated immediately.
- API keys are stored as `sha256(key)` in the database. The plaintext key is shown once at creation and never stored or logged.
- Webhook payloads are verified using the provider's signature header before processing.

### 4.2 Input & Output

- Every API endpoint validates its input with a Zod schema. Invalid inputs return `422 Unprocessable Entity`.
- All user-generated content is sanitised before rendering. No raw HTML from external sources.
- SQL injection is prevented by ORM-enforced parameterized queries. Raw SQL with string interpolation is prohibited.
- CSRF tokens are required on all state-changing endpoints that accept browser-based session cookies.

### 4.3 Secrets Management

- Secrets are injected as environment variables by Coolify at runtime.
- No secrets in `.env` files committed to the repository. The committed `.env.example` contains only key names with placeholder values.
- The pre-commit hook runs [`secretlint`](https://github.com/secretlint/secretlint) (`@secretlint/secretlint-rule-preset-recommend`) to block accidental secret commits. Chosen over `git-secrets`/`detect-secrets` because it's npm-native and fits the all-TypeScript/Node tooling stack without adding a Python dependency.
- JWT signing secrets are rotated on a defined schedule (minimum annually, immediately on suspected compromise).

### 4.4 Transport Security

- HTTPS is enforced everywhere. HTTP requests are redirected to HTTPS at the reverse proxy.
- HSTS is enabled with `max-age=31536000; includeSubDomains; preload`.
- TLS 1.2 is the minimum. TLS 1.0 and 1.1 are disabled.
- Content Security Policy (CSP) is configured to prevent XSS and data injection.

### 4.5 Dependency Security

- `npm audit` runs in CI on every pull request. **High or Critical severity CVEs block the merge.**
- Dependabot or Renovate is configured to open PRs for dependency updates weekly.
- Docker base image digests are pinned and reviewed on update.

### 4.6 GDPR Requirements

- User accounts can be permanently deleted via `DELETE /api/v1/account`. All PII is purged within 30 days.
- Users can export all their personal data via `GET /api/v1/account/export`.
- A cookie consent banner is displayed on first visit. Non-essential cookies are not set before consent.
- Privacy Policy and Terms of Service are accessible from all auth pages and the dashboard footer.
- Data Processing Agreements (DPAs) are available for Enterprise customers on request.

### 4.7 Rate Limiting

- Auth endpoints: 10 requests per minute per IP.
- API endpoints (authenticated): per-plan limits enforced via Redis.
- Public endpoints: 30 requests per minute per IP.
- Brute force protection: account lockout after 5 consecutive failed login attempts.

---

## 5. Git Workflow

### 5.1 Branch Strategy

We follow a simplified **GitHub Flow** with a protected `main` branch and a `develop` integration branch.

```
main          ← production-ready at all times; protected; deploy on merge
develop       ← integration branch; staging deploys from here
feature/*     ← feature branches; branch from develop; merge to develop
fix/*         ← bug fix branches; branch from develop (or main for hotfixes)
hotfix/*      ← critical production fixes; branch from main; merge to both main and develop
release/*     ← release candidates; branch from develop; merge to main and develop
chore/*       ← tooling, dependencies, CI changes; no production impact
docs/*        ← documentation-only changes
```

### 5.2 Protected Branch Rules

**`main`:**
- Requires 1 approving review from a code owner
- Requires all CI checks to pass (lint, tests, build, security scan)
- No direct pushes. No force pushes. No deletion.
- Merge strategy: Squash and merge only

**`develop`:**
- Requires all CI checks to pass
- No force pushes
- Merge strategy: Squash and merge preferred; merge commit permitted

### 5.3 Workflow Steps

1. Branch from `develop`: `git checkout -b feature/VS-123-video-discovery`
2. Make small, focused commits
3. Push branch and open a Pull Request to `develop`
4. Ensure all CI checks pass
5. Request review from at least one other engineer
6. Address review comments
7. Squash and merge after approval
8. Delete the feature branch after merge

---

## 6. Branch Naming Conventions

**Format:** `<type>/<ticket-id>-<short-description>`

| Type | When to use | Example |
|---|---|---|
| `feature/` | New features | `feature/VS-45-viral-score-engine` |
| `fix/` | Bug fixes | `fix/VS-102-quota-overflow` |
| `hotfix/` | Critical production fix | `hotfix/VS-201-auth-token-expiry` |
| `chore/` | Tooling, deps, CI | `chore/upgrade-typescript-5-5` |
| `docs/` | Documentation only | `docs/VS-88-api-reference` |
| `release/` | Release candidates | `release/v1.2.0` |
| `refactor/` | Code restructuring (no behaviour change) | `refactor/VS-77-extract-quota-service` |
| `test/` | Adding or fixing tests only | `test/VS-91-e2e-onboarding-flow` |

**Rules:**
- All lowercase.
- Words separated by hyphens only.
- Ticket ID is required for feature, fix, and refactor branches.
- Maximum 60 characters total.
- No spaces, underscores, or special characters.

---

## 7. Commit Message Conventions

We follow the **Conventional Commits** specification.

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### 7.1 Types

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting changes (no logic change) |
| `refactor` | Code restructuring (no feature, no fix) |
| `test` | Adding or fixing tests |
| `chore` | Tooling, build, dependency updates |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |
| `revert` | Reverts a previous commit |

### 7.2 Scopes

| Scope | Description |
|---|---|
| `api` | Backend API service |
| `web` | Frontend Next.js application |
| `db` | Database schema, migrations |
| `n8n` | n8n workflow changes |
| `auth` | Authentication and authorisation |
| `billing` | Subscription and billing |
| `ai` | AI prompts and pipeline |
| `infra` | Docker, CI/CD, Coolify |
| `shared` | Shared packages |
| `security` | Security-related changes |

### 7.3 Examples

```bash
feat(api): add viral score breakdown endpoint

Adds GET /api/v1/videos/:id/viral-score which returns the weighted
component breakdown of the viral score computation for a given video.

Closes VS-145

---

fix(web): prevent duplicate API key display on creation

The API key was being shown twice when the user clicked "Create" rapidly.
Added a debounce and disabled the button after first click.

Fixes VS-201

---

chore(infra): pin Node.js base image to 22.4.0-alpine3.19

Prevents unexpected breaking changes from floating base image tags.

---

feat(billing)!: change plan limit enforcement to hard block

BREAKING CHANGE: Previously, quota overruns returned a warning.
Now they return 429 Too Many Requests with a Retry-After header.
Update client error handling accordingly.
```

### 7.4 Rules

- Subject line: imperative mood ("add", not "added" or "adds"), no capital first letter, no full stop at end.
- Subject line: maximum 72 characters.
- Body: wrap at 100 characters. Explain *why*, not *what* (the diff shows what).
- Footer: reference ticket IDs using `Closes VS-NNN` or `Fixes VS-NNN`.
- Breaking changes: append `!` after the type/scope and include a `BREAKING CHANGE:` footer.

---

## 8. Pull Request Requirements

### 8.1 Opening a Pull Request

Every PR must include:

- [ ] **Title** following the commit message convention (e.g. `feat(api): add watchlist CRUD endpoints`)
- [ ] **Description** explaining what changed, why, and any relevant context
- [ ] **Link to ticket** (e.g. `Closes VS-123`)
- [ ] **Screenshots or screen recordings** for any UI changes
- [ ] **Testing notes** describing how the reviewer can verify the change
- [ ] **Checklist** (see below) completed by the author

### 8.2 PR Checklist (Author)

```markdown
## PR Checklist

### Code Quality
- [ ] TypeScript strict mode passes with no errors
- [ ] ESLint passes with no warnings or errors
- [ ] No `any` types introduced
- [ ] No console.log statements in application code
- [ ] No hardcoded strings (routes, error codes, plan names)
- [ ] No secrets or credentials in code

### Tests
- [ ] Unit tests added or updated for all changed business logic
- [ ] Integration tests added or updated for any changed API endpoints
- [ ] All existing tests pass locally
- [ ] Test coverage has not decreased

### Security
- [ ] Input validation with Zod on any new API endpoints
- [ ] No new unvalidated external data flows
- [ ] RLS policies considered if new DB tables or columns added
- [ ] Webhook handlers verify signatures

### Database
- [ ] Schema changes use a reversible migration file
- [ ] New columns have appropriate indexes where needed
- [ ] Seed data updated if required

### Documentation
- [ ] Inline code comments added for non-obvious logic
- [ ] JSDoc updated for any changed public function signatures
- [ ] CHANGELOG.md updated if this is a user-facing change
- [ ] API docs updated for any changed or new endpoints
```

### 8.3 Reviewer Responsibilities

- Review within **1 business day** of being assigned.
- Review for correctness, security, performance, and alignment with these rules.
- Request changes with clear, actionable feedback — not vague comments.
- Approve only when all checklist items are satisfied and all previous comments are resolved.
- Do not approve PRs that have failing CI checks, even partially.

### 8.4 Merge Rules

- Minimum **1 approving review** required (2 for changes to `main`).
- All CI checks must be green.
- No unresolved review comments.
- Use **Squash and Merge** for feature branches. The squash commit title must follow the conventional commit format.
- Delete the branch after merging.

---

## 9. Testing Requirements

### 9.1 Testing Stack

| Layer | Tool |
|---|---|
| Unit tests | Vitest |
| Integration tests | Vitest + Supertest (API) |
| E2E tests | Playwright |
| Load tests | k6 |
| AI prompt regression | Vitest + fixture videos |
| Coverage reporting | Vitest coverage (v8) |

### 9.2 Coverage Targets

| Test type | Target |
|---|---|
| Unit tests | ≥ 80% line coverage |
| Integration tests | ≥ 70% endpoint coverage |
| E2E tests | All critical user journeys covered |

Coverage targets are enforced in CI. PRs that decrease coverage below the target are blocked.

### 9.3 What Must Have Tests

**Always:**
- All service layer functions containing business logic
- All utility/helper functions
- Viral Score calculation algorithm
- Engagement analytics calculations
- Quota enforcement logic
- Data retention purge logic
- Zod schemas (test valid and invalid inputs)
- All API endpoints (request/response shape, auth enforcement, error cases)

**Always for new features:**
- At least one unit test per new service method
- At least one integration test per new API endpoint
- E2E test if the feature introduces a new user journey

**Never acceptable:**
- Tests that only test the framework (e.g. "it calls the controller")
- Tests that mock so much they don't actually test anything
- Tests that rely on production data or external services (use fixtures and mocks)

### 9.4 Test File Conventions

```
apps/api/src/
└── videos/
    ├── video.controller.ts
    ├── video.service.ts
    ├── video.repository.ts
    └── __tests__/
        ├── video.service.unit.test.ts
        ├── video.controller.integration.test.ts
        └── fixtures/
            └── video.fixture.ts
```

- Test files live in a `__tests__/` directory co-located with the code they test.
- Fixtures live in a `fixtures/` subdirectory.
- File naming: `<module>.<type>.test.ts` where type is `unit`, `integration`, or `e2e`.
- Each test file tests a single module.
- Tests must not depend on execution order — each test must be independently runnable.

### 9.5 AI Prompt Regression Tests

- A fixed set of 10 test videos (stored as JSON fixtures) is used for all prompt regression tests.
- These fixtures are committed to the repository and **never modified** once established.
- Every active prompt in the `prompt_library` is run against all 10 fixtures on every PR that touches the AI pipeline.
- Assertions: output is valid JSON, matches the expected Zod schema, no required fields are null or empty.
- Prompt regression tests run in CI and block merge on failure.

---

## 10. Documentation Requirements

### 10.1 Code Documentation

- **JSDoc** is required for all exported functions, classes, and types in `packages/shared` and `apps/api/src/`.
- Inline comments are required for any logic that is not immediately obvious to a competent TypeScript developer.
- Comments explain *why*, not *what*. The code explains what.

```typescript
// ✅ Explains WHY — valuable context
// We use sha256 here rather than bcrypt because API keys are random
// high-entropy strings, not user-chosen passwords. SHA256 is sufficient
// and significantly faster at this lookup frequency.
const keyHash = sha256(rawKey);

// ❌ Explains WHAT — noise, not signal
// Hash the key
const keyHash = sha256(rawKey);
```

### 10.2 API Documentation

- Every API endpoint is documented in OpenAPI format, auto-generated from Zod schemas via `fastify-swagger`.
- Request schemas, response schemas, error codes, and auth requirements are documented for every endpoint.
- The OpenAPI spec is published at `/api/v1/docs` in development and staging environments.
- Breaking API changes require a version bump (`/api/v2/`) and a migration guide.

### 10.3 Project Documentation

The following documents must be kept up to date:

| Document | Update trigger |
|---|---|
| `CHANGELOG.md` | Every user-facing change merged to main |
| `PROJECT_STATUS.md` | Every week; every phase completion |
| `ROADMAP.md` | Every phase completion; priority change |
| `README.md` | New setup steps; new environment variables |
| `REPOSITORY_STRUCTURE.md` | New directories or significant restructuring |
| `INFRASTRUCTURE_GROWTH_PLAN.md` | Architectural changes; new services added |
| `PRD.md` | New features added to scope; requirements change |

### 10.4 n8n Workflow Documentation

- Every n8n workflow has a corresponding diagram in `/docs/workflows/`.
- The diagram shows: trigger, each step, the failure path, and the dead-letter output.
- Workflow diagrams are updated whenever the workflow JSON changes.
- All workflow JSON files in `/infra/n8n-workflows/` include a `description` field explaining the workflow's purpose and inputs.

---

## 11. Dependency Management

### 11.1 Adding a New Dependency

Before adding any dependency, answer these questions:

- [ ] Is it actively maintained? (Last commit < 6 months ago, or LTS release)
- [ ] Does it have a permissive licence compatible with our project? (MIT, Apache 2.0, BSD preferred)
- [ ] What is its bundle size impact? (Check `bundlephobia.com` for frontend deps)
- [ ] Does `npm audit` report any known vulnerabilities?
- [ ] Is there a simpler way to achieve this without a new dependency?
- [ ] Does it have TypeScript types (built-in or `@types/`)?

If all answers are satisfactory, add it with an exact version (`npm install --save-exact`) and document the reason in the PR description.

### 11.2 Dependency Update Policy

- **Security patches:** Apply within 48 hours of notification.
- **Minor versions:** Apply weekly via Renovate/Dependabot PRs.
- **Major versions:** Evaluate within 2 weeks of release. Plan migration if breaking changes exist.
- **Lock files** (`package-lock.json`) are committed to the repository and updated whenever dependencies change.

### 11.3 Prohibited Dependency Patterns

- Dependencies that are unmaintained (no commit in 2+ years) require explicit justification and a migration plan.
- Do not use multiple competing libraries for the same purpose (e.g. two HTTP clients, two date libraries).
- Do not use `require()` dynamic imports in TypeScript. Use `import()` with proper typing.

---

## 12. Performance Expectations

### 12.1 API Performance Targets

| Metric | Target | Critical threshold |
|---|---|---|
| p50 API response time | < 100ms | 200ms |
| p95 API response time | < 500ms | 1000ms |
| p99 API response time | < 1000ms | 2000ms |
| Error rate (5xx) | < 0.1% | 1% |
| Availability | > 99.9% | 99.5% |

### 12.2 Frontend Performance Targets

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3.5s |
| Lighthouse Performance Score | ≥ 85 |

### 12.3 Background Job Performance Targets

| Metric | Target |
|---|---|
| Video discovery cycle | Completes within 30 minutes |
| Single video analysis (full pipeline) | < 5 minutes |
| Alert dispatch latency | < 2 minutes from trigger |
| Trend detection cycle (daily) | Completes within 2 hours |
| Dead-letter job notification | < 5 minutes from failure |

### 12.4 Performance Monitoring

- Grafana dashboards monitor all API latency metrics with 1-minute resolution.
- Alerts fire when p95 latency exceeds the critical threshold for more than 5 consecutive minutes.
- Load tests (`k6`) run weekly in the staging environment and results are reviewed.

---

## 13. Code Review Checklist

Use this checklist when reviewing any pull request.

### Correctness
- [ ] Does the code do what the PR description says it does?
- [ ] Are all edge cases handled? (null, empty, zero, very large values)
- [ ] Are all error paths handled and returning appropriate responses?
- [ ] Does the code handle concurrent requests safely?

### Security
- [ ] Are all inputs validated with Zod before use?
- [ ] Is any user-generated content sanitised before rendering?
- [ ] Are there any new vectors for SQL injection, XSS, or CSRF?
- [ ] Are secrets handled correctly (not logged, not exposed in responses)?
- [ ] Are new webhook handlers verifying signatures?
- [ ] Are new database tables/columns protected by appropriate RLS policies?

### Architecture
- [ ] Does the code follow the layered architecture? (no business logic in routes/controllers)
- [ ] Are external services accessed through abstraction layers?
- [ ] Are there any circular dependencies introduced?
- [ ] Are shared types defined in `packages/shared` rather than duplicated?

### Data & Database
- [ ] Do new schema changes use a reversible migration?
- [ ] Are new columns indexed appropriately?
- [ ] Is the `org_id` filter applied for any new tenant-scoped queries?
- [ ] Is RLS enforced at the database level for new tables?

### Testing
- [ ] Are new service methods covered by unit tests?
- [ ] Are new API endpoints covered by integration tests?
- [ ] Do tests actually assert meaningful behaviour, not just that the code runs?
- [ ] Are test fixtures used instead of real external service calls?

### Performance
- [ ] Are there any obvious N+1 query patterns?
- [ ] Are expensive operations (AI calls, external API calls) deferred to background jobs?
- [ ] Is caching applied where appropriate and are cache keys designed to avoid collisions?

### Documentation
- [ ] Are public functions documented with JSDoc?
- [ ] Are non-obvious logic blocks explained with inline comments?
- [ ] Is `CHANGELOG.md` updated for user-facing changes?
- [ ] Is the API spec updated for new or changed endpoints?

---

## 14. Definition of Done

A task or feature is **Done** when all of the following are true:

### Code Complete
- [ ] All acceptance criteria from the ticket are implemented
- [ ] Code follows all standards defined in this document
- [ ] TypeScript compiles with no errors in strict mode
- [ ] ESLint passes with no errors or warnings
- [ ] No `console.log`, `TODO`, `FIXME`, or `any` in production code paths

### Tests Complete
- [ ] Unit tests written and passing for all new business logic
- [ ] Integration tests written and passing for all new API endpoints
- [ ] All existing tests still pass
- [ ] Coverage targets maintained (≥80% unit, ≥70% integration)
- [ ] AI prompt regression tests pass (if AI pipeline touched)

### Review Complete
- [ ] Pull request created with complete description and checklist
- [ ] At least 1 approving review received (2 for changes to `main`)
- [ ] All review comments resolved
- [ ] All CI checks green

### Deployed & Verified
- [ ] Feature is deployed to staging
- [ ] Feature is manually verified to work as expected in staging
- [ ] No regressions observed in monitoring dashboards
- [ ] Feature is deployed to production
- [ ] Post-deploy smoke test passed in production

### Documentation Complete
- [ ] `CHANGELOG.md` updated (user-facing changes)
- [ ] API documentation updated (new or changed endpoints)
- [ ] `PROJECT_STATUS.md` updated
- [ ] Relevant project docs updated (`README.md`, `ROADMAP.md` if applicable)

---

## 15. AI Assistant Rules

These rules govern how AI coding assistants (GitHub Copilot, Claude, GPT-4, Cursor, etc.) may be used when contributing to this repository.

### 15.1 Permitted Uses

- [ ] **Autocompletion** of code that follows established patterns in this codebase.
- [ ] **Boilerplate generation** for Zod schemas, Fastify routes, React components, and test files — subject to review.
- [ ] **Explaining existing code** to understand unfamiliar patterns.
- [ ] **Suggesting refactors** — but the human engineer must understand and validate every suggestion.
- [ ] **Generating test cases** — especially edge cases and error scenarios.
- [ ] **Writing documentation** drafts — which must be reviewed for accuracy and completeness.

### 15.2 Prohibited Uses

- [ ] **Merging AI-generated code that the contributor cannot fully explain.** If you cannot explain it line by line, do not merge it.
- [ ] **AI-generated database migrations** without human review of every SQL statement.
- [ ] **AI-generated security-sensitive code** (auth flows, cryptographic functions, RLS policies) without expert human review.
- [ ] **AI-generated AI prompts** in the `prompt_library` without manual evaluation against test fixtures.
- [ ] **AI-generated content** that could reproduce, closely paraphrase, or approximate any creator's original script, title, hook, or creative work.

### 15.3 AI Code Review Requirements

When a PR contains significant AI-generated code (more than ~20 lines), the PR description must include:

```markdown
## AI Assistance Disclosure
- Tool used: [e.g. Claude Sonnet 4.6, GitHub Copilot]
- Sections generated with AI assistance: [e.g. Zod schema in video.schema.ts, test fixtures]
- Review notes: [explain what you verified, what you modified, and what you tested]
```

### 15.4 AI and the Ethical Content Constraint

AI assistants must never be used to generate content that:
- Reproduces a specific creator's script, narration, or unique creative expression.
- Closely paraphrases a creator's work in a way that substitutes for the original.
- Facilitates plagiarism of any creator's content strategy in a specific, identifiable way.

The platform's purpose is to identify **patterns** and inspire **original** creation. This constraint applies to AI assistant usage in both development and in the product itself.

---

*These rules are a living document. Proposed changes require a PR to `main` with at least 2 approvals. All engineers are expected to have read and understood this document before making their first contribution.*

---

**Related Documents:**
- [README.md](./README.md) — Project overview and quick start
- [ROADMAP.md](./ROADMAP.md) — Development phases and milestones
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — Folder and file organisation
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure evolution
- [PRD.md](./PRD.md) — Product requirements
