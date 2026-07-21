# URL_&_API_Structure.md

# ViralScopes.io — URL & API Structure

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Base URL (production):** `https://app.viralscopes.io`
> **API Base URL (production):** `https://api.viralscopes.io`
> **Cross-references:** [Database_Schema.md](./Database_Schema.md) · [Security_Architecture.md](./Security_Architecture.md) · [README.md](./README.md)

---

## Table of Contents

1. [URL Structure Overview](#1-url-structure-overview)
2. [Frontend Routes](#2-frontend-routes)
3. [API Versioning Strategy](#3-api-versioning-strategy)
4. [Naming Conventions](#4-naming-conventions)
5. [Authentication Endpoints](#5-authentication-endpoints)
6. [Video Endpoints](#6-video-endpoints)
7. [Channel Endpoints](#7-channel-endpoints)
8. [Trend & Opportunity Endpoints](#8-trend--opportunity-endpoints)
9. [Analytics Endpoints](#9-analytics-endpoints)
10. [Recommendation Endpoints](#10-recommendation-endpoints)
11. [Watchlist Endpoints](#11-watchlist-endpoints)
12. [Alert Endpoints](#12-alert-endpoints)
13. [Search Endpoints](#13-search-endpoints)
14. [Export Endpoints](#14-export-endpoints)
15. [API Key Endpoints](#15-api-key-endpoints)
16. [Billing & Usage Endpoints](#16-billing--usage-endpoints)
17. [Webhook Endpoints](#17-webhook-endpoints)
18. [Admin Endpoints](#18-admin-endpoints)
19. [Health & System Endpoints](#19-health--system-endpoints)
20. [Request & Response Standards](#20-request--response-standards)
21. [Error Handling](#21-error-handling)
22. [Pagination](#22-pagination)
23. [Filtering & Sorting](#23-filtering--sorting)
24. [Rate Limiting](#24-rate-limiting)
25. [Third-Party Integrations](#25-third-party-integrations)
26. [Webhook Outbound Design](#26-webhook-outbound-design)
27. [API Security](#27-api-security)
28. [Future API Roadmap](#28-future-api-roadmap)

---

## 1. URL Structure Overview

### Domain Architecture

| Domain                  | Purpose                             | Example                                         |
| ----------------------- | ----------------------------------- | ----------------------------------------------- |
| `viralscopes.io`        | Marketing site (static)             | `https://viralscopes.io`                        |
| `app.viralscopes.io`    | Next.js frontend application        | `https://app.viralscopes.io/dashboard`          |
| `api.viralscopes.io`    | Fastify REST API                    | `https://api.viralscopes.io/api/v1/videos`      |
| `n8n.viralscopes.io`    | n8n workflow editor (internal)      | `https://n8n.viralscopes.io`                    |
| `cdn.viralscopes.io`    | Cloudflare R2 asset delivery        | `https://cdn.viralscopes.io/thumbnails/abc.jpg` |
| `status.viralscopes.io` | Public status page (Post-MVP)       | `https://status.viralscopes.io`                 |
| `docs.viralscopes.io`   | API documentation portal (Post-MVP) | `https://docs.viralscopes.io`                   |

### Path Prefix Summary

| Prefix                                    | Location | Auth required           | Description              |
| ----------------------------------------- | -------- | ----------------------- | ------------------------ |
| `/`                                       | Frontend | No                      | Public marketing pages   |
| `/login`, `/register`                     | Frontend | No                      | Auth pages               |
| `/onboarding/*`                           | Frontend | Yes                     | New user onboarding flow |
| `/dashboard/*` (aliased as `/home`, etc.) | Frontend | Yes                     | Main application         |
| `/admin/*`                                | Frontend | Yes (admin role)        | Super Admin Panel        |
| `/api/v1/*`                               | API      | Yes (JWT or API key)    | REST API v1              |
| `/api/v1/webhooks/*`                      | API      | No (signature verified) | Inbound webhooks         |
| `/health`, `/ready`                       | API      | No                      | Health checks            |

---

## 2. Frontend Routes

All frontend routes are served by Next.js App Router. Routes are grouped by layout.

### Public Routes (No Auth)

| Route        | Page             | Description                   |
| ------------ | ---------------- | ----------------------------- |
| `/`          | Marketing home   | Product landing page          |
| `/pricing`   | Pricing          | Plan comparison page          |
| `/privacy`   | Privacy Policy   | GDPR-compliant privacy policy |
| `/terms`     | Terms of Service | Terms of service              |
| `/changelog` | Changelog        | Release notes                 |

### Auth Routes (No Sidebar Layout)

| Route                     | Page                   | Description                              |
| ------------------------- | ---------------------- | ---------------------------------------- |
| `/login`                  | Login                  | Email/password + OAuth login             |
| `/register`               | Register               | New account registration                 |
| `/verify-email`           | Email Verification     | Email link landing page                  |
| `/reset-password`         | Password Reset Request | Request reset email                      |
| `/reset-password/confirm` | Password Reset Confirm | New password form (token in query param) |
| `/auth/callback`          | OAuth Callback         | Handles Google/GitHub OAuth redirect     |

### Onboarding Routes (Auth Required)

| Route                         | Page                | Description                        |
| ----------------------------- | ------------------- | ---------------------------------- |
| `/onboarding`                 | Onboarding Entry    | Redirect to current step           |
| `/onboarding/create-org`      | Create Organisation | Step 1: Create or join an org      |
| `/onboarding/choose-plan`     | Choose Plan         | Step 2: Select a subscription plan |
| `/onboarding/first-watchlist` | First Watchlist     | Step 3: Set first watchlist        |
| `/onboarding/tour`            | Product Tour        | Step 4: Guided dashboard tour      |

### Dashboard Routes (Auth + Sidebar Layout)

| Route                     | Page             | Description                             |
| ------------------------- | ---------------- | --------------------------------------- |
| `/home`                   | Home             | KPI cards and recent activity feed      |
| `/trending`               | Trending         | Latest high-scoring videos              |
| `/videos`                 | Videos           | Searchable, filterable video list       |
| `/videos/[id]`            | Video Detail     | Full analysis for one video             |
| `/channels`               | Channels         | Channel profiles and growth data        |
| `/channels/[id]`          | Channel Detail   | Individual channel profile              |
| `/trends`                 | Trends           | Topic trend velocity and classification |
| `/opportunities`          | Opportunities    | Ranked content opportunity list         |
| `/recommendations`        | Recommendations  | AI-generated content ideas              |
| `/watchlists`             | Watchlists       | Watchlist management                    |
| `/watchlists/[id]`        | Watchlist Detail | Activity for one watchlist              |
| `/alerts`                 | Alerts           | Alert rule management                   |
| `/alerts/history`         | Alert History    | Dispatched alert log                    |
| `/search`                 | Search           | Unified search results                  |
| `/export`                 | Export           | Export history and trigger              |
| `/settings`               | Settings         | Account and organisation settings       |
| `/settings/profile`       | Profile          | User profile and password               |
| `/settings/organisation`  | Organisation     | Org name, logo, settings                |
| `/settings/billing`       | Billing          | Stripe Customer Portal embed            |
| `/settings/team`          | Team             | Member management and invitations       |
| `/settings/api-keys`      | API Keys         | Create and revoke API keys              |
| `/settings/notifications` | Notifications    | Notification preferences                |

### Admin Routes (Auth + Super Admin / Admin Role)

| Route                  | Page                    | Description                   |
| ---------------------- | ----------------------- | ----------------------------- |
| `/admin`               | Admin Overview          | System health summary         |
| `/admin/users`         | User Management         | Search, suspend, verify users |
| `/admin/organisations` | Organisation Management | View, modify, suspend orgs    |
| `/admin/jobs`          | Job Logs                | n8n workflow execution log    |
| `/admin/dead-letter`   | Dead-Letter Queue       | Failed job viewer and retry   |
| `/admin/prompts`       | Prompt Library          | Edit and version AI prompts   |
| `/admin/system`        | System Health           | Embedded Grafana panels       |
| `/admin/quota`         | Quota Management        | YouTube API quota viewer      |

---

## 3. API Versioning Strategy

### Current Version: `v1`

All API routes are prefixed with `/api/v1/`. This prefix is immutable for the lifetime of the v1 API.

```
https://api.viralscopes.io/api/v1/videos
https://api.viralscopes.io/api/v1/trends
```

### Version Lifecycle

| Version | Status  | Sunset date | Notes                                        |
| ------- | ------- | ----------- | -------------------------------------------- |
| `v1`    | Active  | Not planned | Current version                              |
| `v2`    | Planned | —           | Will be introduced for breaking changes only |

### Breaking Change Policy

A new API version is introduced **only** when a change would break existing integrations. Breaking changes include:

- Removing an existing field from a response
- Renaming a field
- Changing a field's type
- Removing an endpoint
- Changing pagination behaviour

Non-breaking changes (adding optional fields, adding new endpoints) are applied to the current version without bumping.

### Version Negotiation

Clients specify the version in the URL path. No header-based versioning is used — URL versioning is explicit and cacheable.

When `v2` is introduced:

- `v1` remains fully operational for a minimum of 12 months
- Deprecation notices are sent via email to all API key holders
- A `Deprecation` response header is added to all `v1` responses 6 months before sunset

---

## 4. Naming Conventions

### URL Path Conventions

| Rule                                               | Example                                             |
| -------------------------------------------------- | --------------------------------------------------- |
| Lowercase, hyphen-separated                        | `/alert-rules`, not `/alertRules` or `/alert_rules` |
| Plural resource nouns                              | `/videos`, `/channels`, `/watchlists`               |
| Resource ID in path for single-resource operations | `/videos/:id`, `/watchlists/:id`                    |
| Sub-resources as nested paths                      | `/videos/:id/recommendations`                       |
| Actions that are not CRUD use verb-noun            | `/videos/:id/refresh`, `/exports/:id/download`      |
| Admin sub-namespace for admin operations           | `/admin/users`, `/admin/dead-letter`                |
| Webhook receivers prefixed with `/webhooks/`       | `/webhooks/stripe`, `/webhooks/paddle`              |

### Query Parameter Conventions

| Parameter         | Convention       | Example                          |
| ----------------- | ---------------- | -------------------------------- |
| Pagination cursor | `cursor`         | `?cursor=eyJ...`                 |
| Page size         | `limit`          | `?limit=25`                      |
| Filter fields     | `filter_<field>` | `?filter_language=en`            |
| Date range        | `from` / `to`    | `?from=2026-01-01&to=2026-07-01` |
| Sort field        | `sort_by`        | `?sort_by=viral_score`           |
| Sort direction    | `sort_dir`       | `?sort_dir=desc`                 |
| Search query      | `q`              | `?q=productivity+hacks`          |
| Platform filter   | `platform`       | `?platform=youtube`              |

---

## 5. Authentication Endpoints

All auth endpoints are under `/api/v1/auth/`.

### POST `/api/v1/auth/register`

Register a new user account.

**Auth:** None required

**Request:**

```json
{
  "email": "maya@example.com",
  "name": "Maya Chen",
  "password": "SecurePass123!"
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "01HXYZ...",
      "email": "maya@example.com",
      "name": "Maya Chen",
      "emailVerified": false
    },
    "message": "Verification email sent. Please check your inbox."
  }
}
```

**Errors:** `422` (validation), `409` (email already registered)

---

### POST `/api/v1/auth/login`

Authenticate with email and password.

**Auth:** None required

**Request:**

```json
{
  "email": "maya@example.com",
  "password": "SecurePass123!"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "01HXYZ...",
      "email": "maya@example.com",
      "name": "Maya Chen",
      "emailVerified": true,
      "onboardingDone": true
    }
  }
}
```

- `accessToken` is returned in the response body (15-minute JWT)
- Refresh token is set as an HTTP-only `Secure SameSite=Strict` cookie

**Errors:** `401` (invalid credentials), `403` (account locked), `403` (email not verified)

---

### POST `/api/v1/auth/logout`

Revoke the current session and invalidate the refresh token.

**Auth:** JWT required

**Request:** Empty body

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

### POST `/api/v1/auth/refresh`

Exchange a valid refresh token for a new access token. Refresh token is read from the HTTP-only cookie.

**Auth:** Refresh token cookie

**Response `200 OK`:**

```json
{
  "success": true,
  "data": { "accessToken": "eyJ..." }
}
```

**Errors:** `401` (expired or revoked refresh token)

---

### POST `/api/v1/auth/verify-email`

Verify a user's email address using the token from the verification email.

**Auth:** None

**Request:**

```json
{ "token": "abc123..." }
```

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Email verified successfully." } }
```

---

### POST `/api/v1/auth/forgot-password`

Send a password reset email.

**Auth:** None

**Request:**

```json
{ "email": "maya@example.com" }
```

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "If that email exists, a reset link has been sent." } }
```

_Always returns 200 regardless of whether the email exists (prevents user enumeration)._

---

### POST `/api/v1/auth/reset-password`

Reset password using a valid reset token.

**Auth:** None

**Request:**

```json
{
  "token": "abc123...",
  "password": "NewSecurePass456!"
}
```

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Password updated successfully." } }
```

---

### GET `/api/v1/auth/oauth/:provider`

Initiate OAuth flow. Redirects to the provider's authorisation URL.

**Auth:** None | **Providers:** `google`, `github`

**Response:** `302 Redirect` to OAuth provider

---

### GET `/api/v1/auth/oauth/:provider/callback`

OAuth callback handler. Called by the provider after user authorises.

**Auth:** None (provider-signed state parameter)

**Response:** `302 Redirect` to `/onboarding` (new user) or `/home` (existing user)

---

### GET `/api/v1/auth/sessions`

List all active sessions for the authenticated user.

**Auth:** JWT required

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "01HXYZ...",
        "ipAddress": "82.12.34.56",
        "userAgent": "Mozilla/5.0 ...",
        "lastUsedAt": "2026-07-20T09:00:00Z",
        "isCurrent": true
      }
    ]
  }
}
```

---

### DELETE `/api/v1/auth/sessions/:id`

Revoke a specific session.

**Auth:** JWT required

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Session revoked." } }
```

---

### DELETE `/api/v1/auth/sessions`

Revoke all sessions except the current one.

**Auth:** JWT required

**Response `200 OK`:**

```json
{ "success": true, "data": { "revokedCount": 3 } }
```

---

## 6. Video Endpoints

### GET `/api/v1/videos`

List videos with filters. Cursor-paginated.

**Auth:** JWT or API Key

**Query parameters:**

| Parameter                | Type           | Description                           | Example                            |
| ------------------------ | -------------- | ------------------------------------- | ---------------------------------- |
| `cursor`                 | string         | Pagination cursor                     | `?cursor=eyJ...`                   |
| `limit`                  | integer        | Results per page (max 50, default 25) | `?limit=25`                        |
| `filter_platform`        | string         | Platform filter                       | `?filter_platform=youtube`         |
| `filter_language`        | string         | ISO 639-1 language code               | `?filter_language=en`              |
| `filter_category`        | string         | Category name                         | `?filter_category=education`       |
| `filter_viral_score_min` | number         | Minimum viral score                   | `?filter_viral_score_min=60`       |
| `filter_viral_score_max` | number         | Maximum viral score                   | `?filter_viral_score_max=100`      |
| `filter_analysis_status` | string         | Analysis status filter                | `?filter_analysis_status=complete` |
| `from`                   | ISO 8601 date  | Published after                       | `?from=2026-07-01`                 |
| `to`                     | ISO 8601 date  | Published before                      | `?to=2026-07-20`                   |
| `sort_by`                | string         | Field to sort by                      | `?sort_by=viral_score`             |
| `sort_dir`               | `asc` / `desc` | Sort direction                        | `?sort_dir=desc`                   |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "01HXYZ...",
        "platform": "youtube",
        "platformVideoId": "dQw4w9WgXcQ",
        "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "How I Saved £10,000 in 6 Months on a Barista Salary",
        "thumbnailUrl": "https://cdn.viralscopes.io/thumbnails/abc.jpg",
        "channelId": "01HABC...",
        "channelName": "Finance With Freya",
        "publishedAt": "2026-07-15T14:00:00Z",
        "viewCount": 284000,
        "viralScore": 87.4,
        "viralScoreConfidence": 0.91,
        "analysisStatus": "complete",
        "hookType": "statistic",
        "titleFormula": "how_i_did_x_in_y"
      }
    ],
    "pagination": {
      "cursor": "eyJ...",
      "hasMore": true,
      "total": 4821
    }
  }
}
```

---

### GET `/api/v1/videos/:id`

Get full detail for a single video including all analysis outputs.

**Auth:** JWT or API Key

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "video": {
      "id": "01HXYZ...",
      "platform": "youtube",
      "title": "How I Saved £10,000 in 6 Months on a Barista Salary",
      "url": "https://youtube.com/watch?v=...",
      "publishedAt": "2026-07-15T14:00:00Z",
      "viewCount": 284000,
      "likeCount": 18200,
      "commentCount": 942,
      "viewsPerDay": 40571.4,
      "likesRatio": 0.0641,
      "viralScore": 87.4,
      "viralScoreConfidence": 0.91,
      "channel": { "id": "...", "name": "Finance With Freya", "subscriberEstimate": 89000 },
      "transcript": {
        "summary": "The creator shares a 6-step savings framework...",
        "hookText": "Most people think saving money on a low salary is impossible. Here is proof it is not.",
        "sections": [...]
      },
      "thumbnailAnalysis": {
        "emotion": "surprise",
        "facesCount": 1,
        "hasText": true,
        "textContent": "£10,000",
        "ctrPrediction": 78.2,
        "dominantColors": ["#1a1a2e", "#ffd700"]
      },
      "titleAnalysis": {
        "formulaType": "how_i_did_x_in_y",
        "formulaTemplate": "How I [Action] in [Timeframe] on [Constraint]",
        "powerWords": ["saved", "barista salary"],
        "titleScore": 84.1
      },
      "contentAnalysis": {
        "hookType": "statistic",
        "hookConfidence": 0.94,
        "storyStructure": "problem_solution",
        "targetAudience": "Young adults, 18-30, low-to-medium income, UK",
        "primaryEmotion": "hope",
        "retentionTactics": ["pattern_interrupt", "open_loop", "numbered_list"],
        "viralityDrivers": ["relatable_constraint", "specific_result", "actionable_steps"],
        "contentWeaknesses": ["no_b_roll_mentioned", "talking_head_only"]
      }
    }
  }
}
```

---

### POST `/api/v1/videos/analyze`

Trigger analysis for a specific YouTube URL. Enqueues a job and returns immediately.

**Auth:** JWT or API Key | **Plan:** Starter+

**Request:**

```json
{ "url": "https://youtube.com/watch?v=abc123" }
```

**Response `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "jobId": "job_01HXYZ...",
    "videoId": "01HABC...",
    "status": "queued",
    "estimatedCompletionSecs": 180
  }
}
```

**Errors:** `400` (invalid URL), `409` (already analysed within 24h — use `/refresh`), `429` (quota exceeded)

---

### POST `/api/v1/videos/:id/refresh`

Re-analyse a video, bypassing the 24-hour cache.

**Auth:** JWT or API Key | **Plan:** Professional+

**Response `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "jobId": "job_01HXYZ...",
    "status": "queued"
  }
}
```

---

### GET `/api/v1/videos/:id/recommendations`

Get AI-generated original recommendations for a specific video, scoped to the authenticated org.

**Auth:** JWT or API Key

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "recommendation": {
      "id": "01HXYZ...",
      "videoId": "01HABC...",
      "titleConcept": "I Tried to Save £500 a Month on My First Salary — Here Is What Actually Worked",
      "hookConcept": "Open with the exact bank balance on payday versus after bills — let the number do the talking.",
      "contentOutline": [
        { "section": "Hook", "description": "Show the numbers. No voiceover, just the screen." },
        {
          "section": "The problem",
          "description": "Explain why standard saving advice fails on a starter salary."
        },
        {
          "section": "Framework",
          "description": "Introduce your 3-step method with a memorable name."
        },
        { "section": "Step 1", "description": "..." }
      ],
      "thumbnailConcept": "Split screen: stressed face on left / happy face with money graphic on right. Bold number overlay.",
      "keywords": ["save money uk", "first job savings", "low income budgeting"],
      "ctaSuggestion": "Download the savings tracker spreadsheet linked below."
    }
  }
}
```

---

## 7. Channel Endpoints

### GET `/api/v1/channels`

List channels. Filterable and cursor-paginated.

**Auth:** JWT or API Key

**Query parameters:** `cursor`, `limit`, `filter_platform`, `sort_by` (`growth_score`, `avg_views`, `upload_frequency`), `sort_dir`

**Response `200 OK`:** Array of channel summaries with pagination.

---

### GET `/api/v1/channels/:id`

Get a full channel profile including growth history and top videos.

**Auth:** JWT or API Key

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "channel": {
      "id": "01HXYZ...",
      "platform": "youtube",
      "name": "Finance With Freya",
      "handle": "@financewithfreya",
      "subscriberEstimate": 89000,
      "avgViews": 142000,
      "avgDurationSecs": 847,
      "uploadFrequency": 1.8,
      "growthScore": 72.4,
      "topicFocus": ["personal finance", "saving", "investing", "uk money"],
      "postingSchedule": {
        "monday": false,
        "tuesday": true,
        "wednesday": false,
        "thursday": true,
        "friday": false,
        "saturday": false,
        "sunday": false,
        "preferredHour": 14
      },
      "topVideos": [{ "id": "...", "title": "...", "viralScore": 87.4, "viewCount": 284000 }]
    }
  }
}
```

---

## 8. Trend & Opportunity Endpoints

### GET `/api/v1/trends`

List topic trends from the most recent daily snapshot.

**Auth:** JWT or API Key

**Query parameters:**

| Parameter          | Description                                          | Example                    |
| ------------------ | ---------------------------------------------------- | -------------------------- |
| `filter_status`    | `emerging`, `evergreen`, `declining`                 | `?filter_status=emerging`  |
| `filter_language`  | ISO 639-1 code                                       | `?filter_language=en`      |
| `filter_platform`  | Platform                                             | `?filter_platform=youtube` |
| `sort_by`          | `velocity_score`, `opportunity_score`, `growth_rate` | `?sort_by=velocity_score`  |
| `sort_dir`         | `asc` / `desc`                                       | `?sort_dir=desc`           |
| `limit` / `cursor` | Pagination                                           | Standard                   |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "id": "01HXYZ...",
        "topic": "cortisol morning routine",
        "platform": "youtube",
        "language": "en",
        "status": "emerging",
        "velocityScore": 91.2,
        "growthRate": 0.38,
        "competitionScore": 24.1,
        "opportunityScore": 84.7,
        "videoCount": 142,
        "avgViralScore": 73.2,
        "snapshotDate": "2026-07-20"
      }
    ],
    "pagination": { "cursor": "eyJ...", "hasMore": true, "total": 312 }
  }
}
```

---

### GET `/api/v1/trends/opportunities`

Ranked content opportunity list. High demand + fast growth + low competition.

**Auth:** JWT or API Key

**Query parameters:** `limit`, `cursor`, `filter_language`, `filter_platform`, `filter_min_opportunity_score`

**Response `200 OK`:** Same structure as `/trends` sorted by `opportunityScore DESC`.

---

### GET `/api/v1/trends/:id`

Get a single trend with full detail and top videos for that topic.

**Auth:** JWT or API Key

**Response `200 OK`:** Full trend object plus array of top video summaries.

---

## 9. Analytics Endpoints

### GET `/api/v1/analytics/overview`

Organisation-level KPI dashboard metrics.

**Auth:** JWT

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "period": { "from": "2026-07-01", "to": "2026-07-20" },
    "videosAnalysed": 4821,
    "topViralScore": 94.2,
    "avgViralScore": 61.8,
    "activeAlertRules": 12,
    "alertsFired": 34,
    "activeWatchlists": 8,
    "trendsTracked": 47
  }
}
```

---

### GET `/api/v1/analytics/viral-scores`

Viral score distribution over time.

**Auth:** JWT or API Key

**Query parameters:** `from`, `to`, `filter_language`, `filter_category`, `granularity` (`day` / `week`)

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "series": [
      { "date": "2026-07-01", "avgScore": 59.2, "maxScore": 91.4, "videoCount": 234 },
      { "date": "2026-07-02", "avgScore": 61.8, "maxScore": 94.2, "videoCount": 198 }
    ]
  }
}
```

---

### GET `/api/v1/analytics/engagement`

Engagement ratio trends over time.

**Auth:** JWT or API Key

**Query parameters:** `from`, `to`, `granularity`

**Response `200 OK`:** Time series of avg likes_ratio, comments_ratio, and views_per_day.

---

### GET `/api/v1/analytics/hooks`

Hook type distribution across all analysed videos.

**Auth:** JWT or API Key

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "distribution": [
      { "hookType": "question", "count": 1842, "percentage": 22.4, "avgViralScore": 68.2 },
      { "hookType": "statistic", "count": 1541, "percentage": 18.7, "avgViralScore": 74.1 }
    ]
  }
}
```

---

### GET `/api/v1/analytics/title-formulas`

Title formula distribution with average viral scores.

**Auth:** JWT or API Key

**Response `200 OK`:** Same distribution format as hooks, keyed by `formulaType`.

---

## 10. Recommendation Endpoints

### GET `/api/v1/recommendations`

List all recommendations for the authenticated organisation.

**Auth:** JWT or API Key

**Query parameters:** `cursor`, `limit`, `filter_video_id`, `from`, `to`

**Response `200 OK`:** Array of recommendation summaries with pagination.

---

### GET `/api/v1/recommendations/:id`

Get a single recommendation with full detail.

**Auth:** JWT or API Key

**Response `200 OK`:** Full recommendation object (same schema as `/videos/:id/recommendations`).

---

## 11. Watchlist Endpoints

### GET `/api/v1/watchlists`

List all watchlists for the authenticated organisation.

**Auth:** JWT

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "watchlists": [
      {
        "id": "01HXYZ...",
        "name": "Finance Competitors",
        "type": "channel",
        "target": "UC_channel_id_here",
        "targetMetadata": { "name": "Freya Finance", "url": "https://youtube.com/@freyafinance" },
        "isActive": true,
        "alertRulesCount": 2,
        "createdAt": "2026-07-01T10:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/v1/watchlists`

Create a new watchlist.

**Auth:** JWT | **Plan:** Starter+

**Request:**

```json
{
  "name": "Finance Competitors",
  "type": "channel",
  "target": "UC_channel_id_here",
  "workspaceId": "01HXYZ..."
}
```

**Response `201 Created`:** Full watchlist object.

**Errors:** `422` (validation), `429` (plan watchlist limit exceeded)

---

### GET `/api/v1/watchlists/:id`

Get a watchlist with its recent activity.

**Auth:** JWT

**Response `200 OK`:** Watchlist object plus recent alert events and latest videos from the watched target.

---

### PUT `/api/v1/watchlists/:id`

Update a watchlist name or active status.

**Auth:** JWT (Owner or Admin role)

**Request:**

```json
{
  "name": "Finance Competitors — Updated",
  "isActive": false
}
```

**Response `200 OK`:** Updated watchlist object.

---

### DELETE `/api/v1/watchlists/:id`

Soft-delete a watchlist.

**Auth:** JWT (Owner or Admin role)

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Watchlist deleted." } }
```

---

## 12. Alert Endpoints

### GET `/api/v1/alerts/rules`

List all alert rules for the authenticated organisation.

**Auth:** JWT

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "01HXYZ...",
        "name": "High Viral Score Alert",
        "triggerType": "viral_score_threshold",
        "thresholdValue": 80,
        "deliveryChannels": [
          { "type": "discord", "webhookUrl": "https://discord.com/api/webhooks/..." },
          { "type": "email", "address": "team@example.com" }
        ],
        "watchlistId": "01HABC...",
        "isActive": true,
        "lastTriggeredAt": "2026-07-18T14:22:00Z"
      }
    ]
  }
}
```

---

### POST `/api/v1/alerts/rules`

Create a new alert rule.

**Auth:** JWT | **Plan:** Starter+

**Request:**

```json
{
  "name": "High Viral Score Alert",
  "watchlistId": "01HABC...",
  "triggerType": "viral_score_threshold",
  "thresholdValue": 80,
  "deliveryChannels": [
    { "type": "discord", "webhookUrl": "https://discord.com/api/webhooks/..." },
    { "type": "email", "address": "team@example.com" }
  ]
}
```

**Response `201 Created`:** Full alert rule object.

---

### PUT `/api/v1/alerts/rules/:id`

Update an alert rule.

**Auth:** JWT (Owner or Admin)

**Request:** Partial update — any combination of name, threshold, channels, isActive.

**Response `200 OK`:** Updated rule object.

---

### DELETE `/api/v1/alerts/rules/:id`

Soft-delete an alert rule.

**Auth:** JWT (Owner or Admin)

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "Alert rule deleted." } }
```

---

### GET `/api/v1/alerts/events`

Alert dispatch history for the organisation.

**Auth:** JWT

**Query parameters:** `cursor`, `limit`, `filter_alert_rule_id`, `filter_status`, `from`, `to`

**Response `200 OK`:** Array of alert events with pagination.

---

## 13. Search Endpoints

### GET `/api/v1/search`

Unified search across videos, channels, and trends.

**Auth:** JWT or API Key

**Query parameters:**

| Parameter                | Description                  | Example                      |
| ------------------------ | ---------------------------- | ---------------------------- |
| `q`                      | Search query (required)      | `?q=personal+finance+uk`     |
| `types`                  | Comma-separated result types | `?types=videos,channels`     |
| `filter_language`        | Language filter              | `?filter_language=en`        |
| `filter_platform`        | Platform filter              | `?filter_platform=youtube`   |
| `filter_category`        | Category filter              | `?filter_category=finance`   |
| `filter_viral_score_min` | Minimum viral score          | `?filter_viral_score_min=70` |
| `from` / `to`            | Date range                   | `?from=2026-07-01`           |
| `cursor` / `limit`       | Pagination                   | Standard                     |

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "query": "personal finance uk",
    "results": {
      "videos": {
        "items": [...],
        "total": 342
      },
      "channels": {
        "items": [...],
        "total": 28
      },
      "trends": {
        "items": [...],
        "total": 7
      }
    },
    "pagination": { "cursor": "eyJ...", "hasMore": true }
  }
}
```

---

## 14. Export Endpoints

### POST `/api/v1/exports`

Trigger an async export job.

**Auth:** JWT or API Key | **Plan:** Professional+ (PDF)

**Request:**

```json
{
  "type": "videos",
  "format": "csv",
  "filters": {
    "from": "2026-07-01",
    "to": "2026-07-20",
    "filter_language": "en",
    "filter_viral_score_min": 70
  },
  "columns": ["title", "viral_score", "view_count", "hook_type", "published_at"]
}
```

**Response `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "exportId": "01HXYZ...",
    "status": "queued",
    "estimatedRows": 847
  }
}
```

---

### GET `/api/v1/exports`

List export history for the organisation.

**Auth:** JWT

**Response `200 OK`:** Array of export records with status, format, row count, and download URL.

---

### GET `/api/v1/exports/:id`

Get status of a specific export.

**Auth:** JWT

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "export": {
      "id": "01HXYZ...",
      "type": "videos",
      "format": "csv",
      "status": "complete",
      "rowCount": 847,
      "fileSizeBytes": 284921,
      "downloadUrl": "https://cdn.viralscopes.io/exports/...",
      "expiresAt": "2026-07-21T12:00:00Z",
      "createdAt": "2026-07-20T12:00:00Z",
      "completedAt": "2026-07-20T12:00:42Z"
    }
  }
}
```

---

### GET `/api/v1/exports/:id/download`

Redirect to a signed download URL for the export file.

**Auth:** JWT

**Response:** `302 Redirect` to signed Cloudflare R2 URL (valid 24 hours)

---

## 15. API Key Endpoints

### GET `/api/v1/api-keys`

List all API keys for the organisation. Key values are never returned after creation.

**Auth:** JWT (Owner or Admin)

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "01HXYZ...",
        "name": "Tableau Integration",
        "keyPrefix": "vs_live_a1b2",
        "scopes": ["videos:read", "trends:read", "analytics:read"],
        "lastUsedAt": "2026-07-20T08:42:00Z",
        "expiresAt": null,
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ]
  }
}
```

---

### POST `/api/v1/api-keys`

Create a new API key. The plaintext key is returned once only.

**Auth:** JWT (Owner or Admin) | **Plan:** Professional+

**Request:**

```json
{
  "name": "Tableau Integration",
  "scopes": ["videos:read", "trends:read", "analytics:read"],
  "expiresAt": null
}
```

**Response `201 Created`:**

```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "01HXYZ...",
      "name": "Tableau Integration",
      "key": "vs_live_a1b2c3d4e5f6g7h8i9j0...",
      "keyPrefix": "vs_live_a1b2",
      "scopes": ["videos:read", "trends:read", "analytics:read"],
      "createdAt": "2026-07-20T10:00:00Z"
    },
    "warning": "This is the only time the full API key will be shown. Copy it now."
  }
}
```

---

### DELETE `/api/v1/api-keys/:id`

Revoke an API key immediately.

**Auth:** JWT (Owner or Admin)

**Response `200 OK`:**

```json
{ "success": true, "data": { "message": "API key revoked." } }
```

---

## 16. Billing & Usage Endpoints

### GET `/api/v1/usage`

Current period usage and quota remaining for the authenticated organisation.

**Auth:** JWT or API Key

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "period": {
      "start": "2026-07-01T00:00:00Z",
      "end": "2026-07-31T23:59:59Z"
    },
    "usage": {
      "videosAnalysed": { "used": 312, "limit": 1000, "percentUsed": 31.2 },
      "apiRequests": { "used": 8420, "limit": 50000, "percentUsed": 16.8 },
      "exportsCreated": { "used": 4, "limit": 20, "percentUsed": 20.0 },
      "alertsTriggered": { "used": 34, "limit": 500, "percentUsed": 6.8 }
    }
  }
}
```

---

### GET `/api/v1/billing/plans`

List all available plans with limits and pricing.

**Auth:** None (public endpoint)

**Response `200 OK`:** Array of plan objects with name, price, limits, and features.

---

### POST `/api/v1/billing/checkout`

Create a Stripe Checkout session for a plan upgrade.

**Auth:** JWT

**Request:**

```json
{
  "plan": "professional",
  "billingCycle": "annual",
  "successUrl": "https://app.viralscopes.io/settings/billing?success=true",
  "cancelUrl": "https://app.viralscopes.io/settings/billing"
}
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": { "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_..." }
}
```

---

### POST `/api/v1/billing/portal`

Create a Stripe Customer Portal session for plan management.

**Auth:** JWT

**Request:**

```json
{ "returnUrl": "https://app.viralscopes.io/settings/billing" }
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": { "portalUrl": "https://billing.stripe.com/session/bps_live_..." }
}
```

---

## 17. Webhook Endpoints

Inbound webhooks from third-party services. All payloads are signature-verified before processing.

### POST `/api/v1/webhooks/stripe`

Handles all Stripe subscription lifecycle events.

**Auth:** Stripe-Signature header (HMAC-SHA256)

**Events handled:**

- `invoice.paid` — activate or renew subscription
- `invoice.payment_failed` — start 3-day grace period, send failure email
- `customer.subscription.updated` — sync plan change
- `customer.subscription.deleted` — downgrade to free tier
- `customer.created` — store Stripe customer ID

**Response:** Always `200 OK` if the signature is valid (processing is async). `400` if the signature is invalid.

---

### POST `/api/v1/webhooks/paddle` _(Post-MVP)_

Handles Paddle subscription events.

**Auth:** Paddle-Signature header

---

### POST `/api/v1/webhooks/crypto` _(Post-MVP)_

Handles cryptocurrency payment confirmations.

**Auth:** Provider-specific signature

---

## 18. Admin Endpoints

Admin endpoints require `role = 'super_admin'` or `role = 'admin'` on the authenticated user.

### GET `/api/v1/admin/users`

List all platform users with search and filters.

**Auth:** JWT (Super Admin) | **Query:** `q` (search), `cursor`, `limit`, `filter_role`

---

### GET `/api/v1/admin/users/:id`

Get a single user with organisation memberships.

**Auth:** JWT (Super Admin)

---

### POST `/api/v1/admin/users/:id/suspend`

Suspend a user account.

**Auth:** JWT (Super Admin) | **Request:** `{ "reason": "..." }`

---

### POST `/api/v1/admin/users/:id/verify-email`

Manually verify a user's email address.

**Auth:** JWT (Super Admin)

---

### GET `/api/v1/admin/organisations`

List all organisations.

**Auth:** JWT (Super Admin) | **Query:** `q`, `cursor`, `limit`, `filter_plan`

---

### PUT `/api/v1/admin/organisations/:id/plan`

Override an organisation's plan (for trials, credits, support resolutions).

**Auth:** JWT (Super Admin) | **Request:** `{ "plan": "professional", "reason": "..." }`

---

### POST `/api/v1/admin/organisations/:id/suspend`

Suspend an organisation.

**Auth:** JWT (Super Admin) | **Request:** `{ "reason": "..." }`

---

### GET `/api/v1/admin/jobs`

List job execution logs.

**Auth:** JWT (Admin+) | **Query:** `cursor`, `limit`, `filter_workflow_name`, `filter_status`, `from`, `to`

---

### GET `/api/v1/admin/dead-letter`

List dead-letter jobs pending review.

**Auth:** JWT (Admin+) | **Query:** `cursor`, `limit`, `filter_workflow_name`, `filter_resolved`

---

### POST `/api/v1/admin/dead-letter/:id/retry`

Manually retry a dead-letter job.

**Auth:** JWT (Admin+)

**Response `202 Accepted`:** `{ "jobId": "...", "status": "queued" }`

---

### POST `/api/v1/admin/dead-letter/:id/dismiss`

Mark a dead-letter job as resolved without retrying.

**Auth:** JWT (Admin+) | **Request:** `{ "notes": "..." }`

---

### GET `/api/v1/admin/quota`

View YouTube API quota consumption.

**Auth:** JWT (Admin+)

**Response `200 OK`:** `{ "date": "2026-07-20", "unitsUsed": 7421, "unitsLimit": 10000, "percentUsed": 74.2 }`

---

### POST `/api/v1/admin/quota/reset`

Manually reset the YouTube API quota counter (emergency use).

**Auth:** JWT (Super Admin)

---

### POST `/api/v1/admin/jobs/:workflowName/trigger`

Manually trigger an n8n workflow.

**Auth:** JWT (Admin+)

**Request:** `{ "payload": {} }` (workflow-specific input)

**Response `202 Accepted`:** `{ "executionId": "...", "status": "triggered" }`

---

## 19. Health & System Endpoints

### GET `/health`

Basic liveness check. Always responds if the process is running.

**Auth:** None

**Response `200 OK`:**

```json
{
  "status": "ok",
  "uptime": 84321,
  "version": "1.0.0",
  "timestamp": "2026-07-20T10:00:00Z"
}
```

---

### GET `/ready`

Readiness check. Verifies that all dependencies are reachable.

**Auth:** None

**Response `200 OK`:**

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok",
    "storage": "ok"
  },
  "timestamp": "2026-07-20T10:00:00Z"
}
```

**Response `503 Service Unavailable`** (when any dependency is down):

```json
{
  "status": "not_ready",
  "checks": {
    "database": "ok",
    "redis": "error: ECONNREFUSED",
    "queue": "ok",
    "storage": "ok"
  }
}
```

---

## 20. Request & Response Standards

### Standard Response Envelope

All API responses use a consistent envelope:

```json
{
  "success": true | false,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description.",
    "details": { ... }
  },
  "meta": {
    "requestId": "req_01HXYZ...",
    "version": "1.0.0",
    "durationMs": 42
  }
}
```

- `data` is present when `success = true`
- `error` is present when `success = false`
- `meta` is always present
- `details` in errors contains field-level validation errors when applicable

### Request Headers

| Header          | Required            | Description                                   |
| --------------- | ------------------- | --------------------------------------------- |
| `Content-Type`  | Yes (POST/PUT)      | `application/json`                            |
| `Authorization` | Yes (authenticated) | `Bearer <access_token>` or `Bearer <api_key>` |
| `X-Request-ID`  | Optional            | Client-provided request ID for tracing        |

### Response Headers

| Header                  | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `X-Request-ID`          | Echo of client request ID or generated correlation ID   |
| `X-RateLimit-Limit`     | Maximum requests per window                             |
| `X-RateLimit-Remaining` | Requests remaining in current window                    |
| `X-RateLimit-Reset`     | Unix timestamp when the window resets                   |
| `Retry-After`           | Seconds until rate limit resets (on 429 responses only) |

---

## 21. Error Handling

### HTTP Status Codes

| Code  | Name                  | When used                                                           |
| ----- | --------------------- | ------------------------------------------------------------------- |
| `200` | OK                    | Successful GET, PUT, DELETE                                         |
| `201` | Created               | Successful POST that creates a resource                             |
| `202` | Accepted              | Async job enqueued                                                  |
| `204` | No Content            | Successful DELETE with no body                                      |
| `301` | Moved Permanently     | URL redirect                                                        |
| `302` | Found                 | Temporary redirect (OAuth, export download)                         |
| `400` | Bad Request           | Malformed request body or invalid JSON                              |
| `401` | Unauthorized          | Missing or expired authentication token                             |
| `403` | Forbidden             | Valid token but insufficient permissions                            |
| `404` | Not Found             | Resource does not exist                                             |
| `409` | Conflict              | Resource already exists (duplicate email, duplicate video analysis) |
| `422` | Unprocessable Entity  | Valid JSON but fails business validation (Zod schema errors)        |
| `429` | Too Many Requests     | Rate limit exceeded                                                 |
| `500` | Internal Server Error | Unexpected server error                                             |
| `503` | Service Unavailable   | Dependency down (returned by `/ready` only)                         |

### Error Response Examples

**Validation error (422):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        { "field": "email", "message": "Invalid email format." },
        { "field": "password", "message": "Password must be at least 8 characters." }
      ]
    }
  },
  "meta": { "requestId": "req_01HXYZ..." }
}
```

**Rate limit error (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded your plan rate limit. Upgrade your plan or wait for the window to reset.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2026-07-20T11:00:00Z"
    }
  },
  "meta": { "requestId": "req_01HXYZ..." }
}
```

**Not found (404):**

```json
{
  "success": false,
  "error": {
    "code": "VIDEO_NOT_FOUND",
    "message": "No video found with the provided ID.",
    "details": { "videoId": "01HXYZ..." }
  },
  "meta": { "requestId": "req_01HXYZ..." }
}
```

### Error Code Registry

| Code                        | HTTP Status | Description                                         |
| --------------------------- | ----------- | --------------------------------------------------- |
| `VALIDATION_ERROR`          | 422         | Input failed Zod schema validation                  |
| `AUTHENTICATION_REQUIRED`   | 401         | No token provided                                   |
| `TOKEN_EXPIRED`             | 401         | JWT access token has expired                        |
| `INVALID_CREDENTIALS`       | 401         | Wrong email or password                             |
| `ACCOUNT_LOCKED`            | 403         | Account locked after too many failed attempts       |
| `EMAIL_NOT_VERIFIED`        | 403         | Email address not verified                          |
| `INSUFFICIENT_PERMISSIONS`  | 403         | Role does not permit this action                    |
| `PLAN_LIMIT_EXCEEDED`       | 429         | Feature or quota limit for current plan             |
| `RATE_LIMIT_EXCEEDED`       | 429         | Per-minute or per-day rate limit hit                |
| `VIDEO_NOT_FOUND`           | 404         | Video ID does not exist                             |
| `CHANNEL_NOT_FOUND`         | 404         | Channel ID does not exist                           |
| `WATCHLIST_NOT_FOUND`       | 404         | Watchlist ID does not exist                         |
| `EXPORT_NOT_FOUND`          | 404         | Export ID does not exist                            |
| `DUPLICATE_EMAIL`           | 409         | Email already registered                            |
| `VIDEO_RECENTLY_ANALYSED`   | 409         | Use `/refresh` to bypass the 24h cache              |
| `INVALID_WEBHOOK_SIGNATURE` | 400         | Webhook signature verification failed               |
| `YOUTUBE_QUOTA_EXHAUSTED`   | 503         | Platform quota exceeded; try again after reset      |
| `INTERNAL_ERROR`            | 500         | Unexpected server error (never exposes stack trace) |

---

## 22. Pagination

All list endpoints use **cursor-based pagination** for consistent, efficient navigation of large datasets.

### Why Cursor-Based Pagination

- Offset pagination breaks when records are inserted or deleted during pagination
- Cursor pagination is stable — the same page always returns the same results
- More efficient at scale — no `COUNT(*)` queries needed

### Cursor Format

Cursors are base64-encoded JSON containing the sort field values of the last item:

```
eyJpZCI6IjAxSFhZWi4uLiIsInZpcmFsX3Njb3JlIjo4Ny40fQ==
```

Decodes to: `{"id":"01HXYZ...","viral_score":87.4}`

Clients treat cursors as opaque strings — they must not be constructed or decoded manually.

### Pagination Request

```
GET /api/v1/videos?limit=25&cursor=eyJ...&sort_by=viral_score&sort_dir=desc
```

### Pagination Response

```json
{
  "data": {
    "videos": [...],
    "pagination": {
      "cursor": "eyJ...",
      "hasMore": true,
      "total": 4821
    }
  }
}
```

- `cursor` — use as the `cursor` parameter for the next page
- `hasMore` — `false` when this is the last page
- `total` — total count of matching records (approximate for very large sets)

---

## 23. Filtering & Sorting

### Filter Parameter Format

All filter parameters use the `filter_<field>` prefix:

```
GET /api/v1/videos?filter_language=en&filter_category=finance&filter_viral_score_min=70
```

### Available Sort Fields

| Resource        | Sort fields                                                               |
| --------------- | ------------------------------------------------------------------------- |
| Videos          | `viral_score`, `published_at`, `view_count`, `views_per_day`              |
| Channels        | `growth_score`, `avg_views`, `upload_frequency`, `subscriber_estimate`    |
| Trends          | `velocity_score`, `opportunity_score`, `growth_rate`, `competition_score` |
| Recommendations | `created_at`                                                              |
| Alert Events    | `created_at`                                                              |

### Default Sort

| Resource        | Default sort             |
| --------------- | ------------------------ |
| Videos          | `viral_score DESC`       |
| Channels        | `growth_score DESC`      |
| Trends          | `opportunity_score DESC` |
| Recommendations | `created_at DESC`        |

---

## 24. Rate Limiting

### Rate Limit Strategy

Rate limits are enforced per API key (for API access) or per authenticated user (for JWT access) using a **sliding window** counter stored in Redis.

### Rate Limit Tiers

| Plan         | Requests/minute | Requests/day |
| ------------ | --------------- | ------------ |
| Free         | 10              | 500          |
| Starter      | 30              | 5,000        |
| Professional | 100             | 50,000       |
| Business     | 300             | 200,000      |
| Enterprise   | Custom          | Custom       |

### Auth Endpoint Limits (All Plans)

| Endpoint                            | Limit       | Window                 |
| ----------------------------------- | ----------- | ---------------------- |
| `POST /api/v1/auth/login`           | 10 requests | Per IP, per minute     |
| `POST /api/v1/auth/register`        | 5 requests  | Per IP, per minute     |
| `POST /api/v1/auth/forgot-password` | 5 requests  | Per IP, per 15 minutes |

### Rate Limit Headers

Every API response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1753006800
```

On `429` responses:

```
Retry-After: 42
```

---

## 25. Third-Party Integrations

### YouTube Data API v3

| Detail       | Value                                                |
| ------------ | ---------------------------------------------------- |
| **Base URL** | `https://www.googleapis.com/youtube/v3`              |
| **Auth**     | API key in query string (`?key=...`)                 |
| **Quota**    | 10,000 units/day (free tier)                         |
| **Used by**  | Video Discovery workflow, Metadata Pipeline workflow |
| **Fallback** | RapidAPI YouTube API or Apify when quota exhausted   |

**Endpoints used:**

- `GET /search` — discover videos (100 units each)
- `GET /videos` — fetch video metadata (1–3 units each)
- `GET /channels` — fetch channel data (1 unit each)
- `GET /captions` — check caption availability (50 units each)

---

### Anthropic Claude API

| Detail       | Value                                                                |
| ------------ | -------------------------------------------------------------------- |
| **Base URL** | `https://api.anthropic.com/v1`                                       |
| **Auth**     | `x-api-key` header                                                   |
| **Used by**  | AI Analysis Pipeline, Ethical Recommendation Engine, Trend Detection |
| **Model**    | `claude-sonnet-4-6`                                                  |

---

### OpenAI API

| Detail       | Value                                                |
| ------------ | ---------------------------------------------------- |
| **Base URL** | `https://api.openai.com/v1`                          |
| **Auth**     | `Authorization: Bearer sk-...`                       |
| **Used by**  | Thumbnail Analysis (vision), Title Formula Detection |
| **Models**   | `gpt-4o`, `gpt-4o-mini`                              |

---

### Stripe API

| Detail       | Value                                      |
| ------------ | ------------------------------------------ |
| **Base URL** | `https://api.stripe.com/v1`                |
| **Auth**     | `Authorization: Bearer sk_live_...`        |
| **Used by**  | Billing service, checkout, customer portal |
| **Webhook**  | `POST /api/v1/webhooks/stripe`             |

---

### SendGrid / Resend

| Detail                   | Value                           |
| ------------------------ | ------------------------------- |
| **Used by**              | Email service abstraction layer |
| **Transactional emails** | 7 template types                |
| **Auth**                 | API key in header               |

---

## 26. Webhook Outbound Design

When an alert rule fires, ViralScopes dispatches an outbound webhook to the user's configured URL.

### Outbound Webhook Payload

```json
{
  "event": "alert.fired",
  "timestamp": "2026-07-20T14:22:00Z",
  "viralscopes_version": "1.0",
  "data": {
    "alertRuleId": "01HXYZ...",
    "alertRuleName": "High Viral Score Alert",
    "triggerType": "viral_score_threshold",
    "thresholdValue": 80,
    "video": {
      "id": "01HABC...",
      "title": "How I Saved £10,000 in 6 Months on a Barista Salary",
      "url": "https://youtube.com/watch?v=...",
      "viralScore": 87.4,
      "channelName": "Finance With Freya",
      "publishedAt": "2026-07-20T12:00:00Z"
    },
    "deepLink": "https://app.viralscopes.io/videos/01HABC..."
  }
}
```

### Webhook Security

- Outbound webhooks include an `X-ViralScopes-Signature` header: `sha256=<HMAC-SHA256(payload, webhook_secret)>`
- Each alert rule with a custom webhook has a unique secret generated at rule creation
- Users can verify the signature in their endpoint to confirm the request is genuine

### Webhook Delivery

- First attempt: immediately on trigger
- Retry on failure: after 30s, 5min, 30min, 2h, 24h
- After 5 failures: mark as failed, log to `alert_events`, notify user via email
- Timeout: 10 seconds per attempt

---

## 27. API Security

| Control                  | Implementation                                                          |
| ------------------------ | ----------------------------------------------------------------------- |
| **Authentication**       | JWT (15-min access token) + API Key (sha256-hashed, scoped)             |
| **Transport**            | HTTPS only; HTTP → HTTPS redirect at Traefik; TLS 1.2 minimum           |
| **Input validation**     | Zod schema validation on every endpoint — `422` on failure              |
| **Rate limiting**        | Redis sliding window per key and per user; plan-tier limits             |
| **Webhook verification** | HMAC-SHA256 signature verified on every inbound webhook                 |
| **CORS**                 | Locked to `app.viralscopes.io` — no wildcard in production              |
| **Security headers**     | Helmet.js: CSP, HSTS, X-Frame-Options, Referrer-Policy                  |
| **API key storage**      | `sha256(key)` only — plaintext never stored or logged                   |
| **Error responses**      | Never expose stack traces or internal details in production             |
| **Audit logging**        | All authenticated API calls logged with `user_id`, `org_id`, action, IP |

See [Security_Architecture.md](./Security_Architecture.md) for the full security design.

---

## 28. Future API Roadmap

### v1.5 (Month 8)

- `GET /api/v1/chat` — SSE-streaming AI chat endpoint
- `POST /api/v1/reports/schedule` — Schedule a recurring PDF report
- `GET /api/v1/trends/predictions` — Topic growth probability predictions

### v2.0 (Month 18)

- `GET /api/v2/videos` — Expanded to include TikTok and Instagram
- `GET /api/v2/channels` — Multi-platform channel profiles
- `POST /api/v2/videos/analyze` — Multi-platform analysis trigger
- Semantic search (vector-based) replacing keyword search in `/search`
- GraphQL endpoint for Enterprise customers with complex data requirements

### v3.0 (Month 24+)

- WebSocket endpoint for real-time dashboard updates (replace polling)
- Event streaming endpoint (SSE) for live alert feeds
- Batch analysis endpoint (up to 100 videos per request)
- SDK-native endpoints with richer metadata for JavaScript and Python SDKs

---

_This document is updated whenever a new endpoint is added, removed, or significantly changed. All changes require a pull request with at least one approving review._

---

**Related Documents:**

- [Database_Schema.md](./Database_Schema.md) — Data models that back these endpoints
- [Security_Architecture.md](./Security_Architecture.md) — Authentication and authorisation details
- [README.md](./README.md) — Quick start guide including API key setup
- [Deployment_Guide.md](./Deployment_Guide.md) — How to run the API locally and in production
