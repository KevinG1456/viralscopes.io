# Database_Schema.md
# ViralScopes.io — Complete Database Schema

> **Version:** 1.1 — corrected section 12 (RLS) and section 14 (migration tooling) to match the Phase 3 implementation; see the correction note in section 12.
> **Last Updated:** 2026-07-26
> **Database:** PostgreSQL 15+ (hosted on Supabase)
> **ORM:** Drizzle ORM
> **Cross-references:** [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) · [Security_Architecture.md](./Security_Architecture.md)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Naming Conventions](#2-naming-conventions)
3. [Audit Fields](#3-audit-fields)
4. [Entity Relationship Overview](#4-entity-relationship-overview)
5. [Schema: Users & Organisations](#5-schema-users--organisations)
6. [Schema: Billing & Usage](#6-schema-billing--usage)
7. [Schema: Content](#7-schema-content)
8. [Schema: AI Analysis](#8-schema-ai-analysis)
9. [Schema: Watchlists & Alerts](#9-schema-watchlists--alerts)
10. [Schema: Operations](#10-schema-operations)
11. [Indexes](#11-indexes)
12. [Row Level Security Policies](#12-row-level-security-policies)
13. [Partitioning Strategy](#13-partitioning-strategy)
14. [Migration Strategy](#14-migration-strategy)
15. [Soft Deletes](#15-soft-deletes)
16. [Multi-Tenant Considerations](#16-multi-tenant-considerations)
17. [Backup Strategy](#17-backup-strategy)
18. [Data Retention Policy](#18-data-retention-policy)
19. [Scaling Strategy](#19-scaling-strategy)
20. [Complete Table Reference](#20-complete-table-reference)

---

## 1. Design Principles

| # | Principle | Implementation |
|---|---|---|
| P1 | **UUID primary keys** | All tables use `gen_random_uuid()` — no serial integers in public-facing tables |
| P2 | **Row Level Security by default** | RLS enabled on every table from creation; the application never bypasses RLS in normal operation |
| P3 | **Immutable audit trail** | `created_at` is always set on insert and never updated; `updated_at` is managed by a trigger |
| P4 | **Multi-tenancy enforced at DB level** | Every tenant-scoped table has `org_id`; RLS policies use it to isolate tenant data |
| P5 | **Migrations only** | All schema changes go through reversible Drizzle migration files; no manual `ALTER TABLE` in any environment |
| P6 | **Parameterised queries only** | Drizzle ORM prevents raw string interpolation in SQL; no injection vectors |
| P7 | **Index at creation** | Indexes for foreign keys and frequent query columns are defined in the same migration as the table |
| P8 | **JSONB for flexible data** | AI output fields, settings, and metadata use `jsonb` with schema validation at the application layer |
| P9 | **Partition high-volume append tables** | `usage_events` and `job_logs` are partitioned by month from day one |
| P10 | **Soft deletes where appropriate** | User accounts, organisations, and watchlists use `deleted_at`; operational logs are hard-deleted per retention policy |

---

## 2. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Table names | `snake_case`, plural | `video_analyses`, `alert_rules` |
| Column names | `snake_case` | `viral_score`, `org_id`, `created_at` |
| Primary keys | `id` (UUID) | `id uuid DEFAULT gen_random_uuid()` |
| Foreign keys | `<table_singular>_id` | `video_id`, `org_id`, `user_id` |
| Boolean columns | `is_` or `has_` prefix | `is_active`, `has_transcript`, `is_verified` |
| Timestamp columns | `_at` suffix | `created_at`, `updated_at`, `deleted_at`, `sent_at` |
| Status columns | `_status` suffix | `analysis_status`, `transcript_status`, `export_status` |
| JSONB columns | `_meta` or descriptive noun | `settings`, `payload`, `raw_output`, `metadata` |
| Enum types | `snake_case` | `plan_tier`, `alert_channel`, `analysis_status` |
| Indexes | `idx_<table>_<column(s)>` | `idx_videos_org_id`, `idx_videos_viral_score` |
| Unique constraints | `uq_<table>_<column(s)>` | `uq_videos_video_id` |
| Foreign key constraints | `fk_<table>_<referenced_table>` | `fk_videos_channels` |
| Partitions | `<table>_<period>` | `usage_events_2026_07`, `job_logs_2026_07` |

---

## 3. Audit Fields

Every table includes the following audit fields unless explicitly noted:

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

The `updated_at` column is kept current by a reusable trigger function:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied per table:
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

Append-only tables (`usage_events`, `job_logs`, `audit_logs`, `alert_events`) have only `created_at` — they are never updated.

---

## 4. Entity Relationship Overview

```
┌─────────────┐         ┌──────────────────────┐
│    users    │────────▶│  organization_members │
└──────┬──────┘         └──────────┬───────────┘
       │                           │
       │ owns                      │ belongs to
       ▼                           ▼
┌──────────────┐         ┌─────────────────┐
│organizations │◀────────│   workspaces    │
└──────┬───────┘         └────────┬────────┘
       │                          │
       │ has many                 │ has many
       ▼                          ▼
┌─────────────────┐      ┌─────────────────┐
│  subscriptions  │      │    projects     │
└─────────────────┘      └─────────────────┘

┌─────────────────┐
│    channels     │
└────────┬────────┘
         │ has many
         ▼
┌─────────────────┐       ┌──────────────────┐
│     videos      │──────▶│   transcripts    │
└────────┬────────┘       └──────────────────┘
         │
         ├──────────────▶│ thumbnail_analyses │
         │
         ├──────────────▶│ title_analyses     │
         │
         ├──────────────▶│ video_analyses     │
         │
         └──────────────▶│ recommendations    │◀──── organizations
                          └───────────────────┘

┌─────────────────┐       ┌──────────────────┐
│  organizations  │──────▶│   watchlists     │
└─────────────────┘       └──────────────────┘

┌─────────────────┐       ┌──────────────────┐
│  organizations  │──────▶│   alert_rules    │──────▶│ alert_events │
└─────────────────┘       └──────────────────┘        └──────────────┘

┌─────────────────┐       ┌──────────────────┐
│  organizations  │──────▶│   usage_events   │
└─────────────────┘       └──────────────────┘

┌─────────────────┐       ┌──────────────────┐
│  organizations  │──────▶│    api_keys      │
└─────────────────┘       └──────────────────┘

┌──────────────────┐      ┌──────────────────┐
│   dead_letter_  │       │  prompt_library  │
│      jobs       │       └──────────────────┘
└──────────────────┘

┌──────────────────┐      ┌──────────────────┐
│    job_logs     │       │   audit_logs     │
└──────────────────┘      └──────────────────┘

┌──────────────────┐
│     trends      │
└──────────────────┘
```

---

## 5. Schema: Users & Organisations

### Table: `users`

Stores all platform user accounts. One user can belong to multiple organisations.

```sql
CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT        NOT NULL UNIQUE,
  name              TEXT,
  avatar_url        TEXT,
  password_hash     TEXT,                          -- NULL for OAuth-only accounts
  email_verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  role              TEXT        NOT NULL DEFAULT 'user'
                                CHECK (role IN ('super_admin', 'user')),
  onboarding_done   BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,                   -- soft delete
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX uq_users_email ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users (role);
```

**Notes:**
- `password_hash` is NULL for users who sign up via Google or GitHub OAuth only
- `role = 'super_admin'` grants platform-wide admin access (separate from org-level roles)
- Soft delete via `deleted_at` — GDPR hard deletion is performed by a separate purge job

---

### Table: `oauth_accounts`

Links a user account to one or more OAuth providers.

```sql
CREATE TABLE oauth_accounts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL CHECK (provider IN ('google', 'github')),
  provider_uid    TEXT        NOT NULL,
  access_token    TEXT,                            -- encrypted at rest
  refresh_token   TEXT,                            -- encrypted at rest
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_uid)
);

CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts (user_id);
```

---

### Table: `sessions`

Tracks active user sessions and refresh tokens.

```sql
CREATE TABLE sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT     NOT NULL UNIQUE,     -- sha256(refresh_token)
  ip_address      INET,
  user_agent      TEXT,
  last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);
```

**Notes:**
- Only `sha256(refresh_token)` is stored — plaintext tokens are never persisted
- Expired and revoked sessions are purged nightly by the data retention job

---

### Table: `organizations`

Top-level tenant container. All billable resources are scoped to an organisation.

```sql
CREATE TABLE organizations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,     -- URL-safe identifier
  owner_id        UUID        NOT NULL REFERENCES users(id),
  plan            TEXT        NOT NULL DEFAULT 'free'
                              CHECK (plan IN ('free','starter','professional','business','enterprise')),
  logo_url        TEXT,
  settings        JSONB       NOT NULL DEFAULT '{}',
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_organizations_slug ON organizations (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_owner_id ON organizations (owner_id);
CREATE INDEX idx_organizations_plan ON organizations (plan);
```

---

### Table: `organization_members`

Join table linking users to organisations with a role.

```sql
CREATE TABLE organization_members (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'member'
                              CHECK (role IN ('admin','owner','member','viewer')),
  invited_by      UUID        REFERENCES users(id),
  invited_at      TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members (org_id);
CREATE INDEX idx_org_members_user_id ON organization_members (user_id);
```

---

### Table: `workspaces`

Sub-containers within an organisation. Agencies use one workspace per client.

```sql
CREATE TABLE workspaces (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  settings        JSONB       NOT NULL DEFAULT '{}',
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_org_id ON workspaces (org_id);
-- Added in Phase 3 (not in the original design): makes the dev seed's
-- "Default Workspace" insert a true idempotent insert-if-missing. Names
-- aren't globally unique, only unique per organisation.
CREATE UNIQUE INDEX uq_workspaces_org_name ON workspaces (org_id, name) WHERE deleted_at IS NULL;
```

---

### Table: `projects`

Optional grouping within a workspace.

```sql
CREATE TABLE projects (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  description     TEXT,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_workspace_id ON projects (workspace_id);
```

---

### Table: `audit_logs`

Immutable record of all significant actions. Never updated or soft-deleted.

```sql
CREATE TABLE audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        REFERENCES organizations(id),
  user_id         UUID        REFERENCES users(id),
  action          TEXT        NOT NULL,             -- e.g. 'member.invited', 'plan.upgraded'
  resource_type   TEXT,                             -- e.g. 'organization', 'watchlist'
  resource_id     TEXT,                             -- UUID of the affected resource
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs (org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
```

**Retention:** 2 years per data retention policy.

---

## 6. Schema: Billing & Usage

### Table: `subscriptions`

One active subscription per organisation. Historical subscriptions are preserved.

```sql
CREATE TABLE subscriptions (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID        NOT NULL REFERENCES organizations(id),
  plan                    TEXT        NOT NULL
                                      CHECK (plan IN ('free','starter','professional','business','enterprise')),
  status                  TEXT        NOT NULL
                                      CHECK (status IN ('active','trialing','past_due','canceled','paused')),
  billing_provider        TEXT        NOT NULL DEFAULT 'stripe'
                                      CHECK (billing_provider IN ('stripe','paddle','crypto','manual')),
  provider_customer_id    TEXT,
  provider_subscription_id TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN     NOT NULL DEFAULT FALSE,
  trial_ends_at           TIMESTAMPTZ,
  grace_period_ends_at    TIMESTAMPTZ,
  canceled_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions (org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_provider_subscription_id
  ON subscriptions (provider_subscription_id);
```

---

### Table: `invoices`

Billing invoice records synced from Stripe/Paddle.

```sql
CREATE TABLE invoices (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID        NOT NULL REFERENCES organizations(id),
  subscription_id     UUID        REFERENCES subscriptions(id),
  provider            TEXT        NOT NULL,
  provider_invoice_id TEXT        NOT NULL UNIQUE,
  amount_cents        INTEGER     NOT NULL,
  currency            TEXT        NOT NULL DEFAULT 'gbp',
  status              TEXT        NOT NULL
                                  CHECK (status IN ('draft','open','paid','void','uncollectible')),
  paid_at             TIMESTAMPTZ,
  hosted_url          TEXT,
  pdf_url             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_org_id ON invoices (org_id);
CREATE INDEX idx_invoices_status ON invoices (status);
```

---

### Table: `usage_events`

Event-based usage tracking. Partitioned by month. Never updated.

```sql
CREATE TABLE usage_events (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL,
  user_id         UUID,
  event_type      TEXT        NOT NULL
                              CHECK (event_type IN (
                                'video_analyzed', 'api_request', 'export_created',
                                'alert_triggered', 'ai_chat_message', 'search_executed'
                              )),
  quantity        INTEGER     NOT NULL DEFAULT 1,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions created in advance:
CREATE TABLE usage_events_2026_07 PARTITION OF usage_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE usage_events_2026_08 PARTITION OF usage_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
-- ... (automated by partition management job)

CREATE INDEX idx_usage_events_org_id ON usage_events (org_id, created_at);
CREATE INDEX idx_usage_events_event_type ON usage_events (event_type, created_at);
```

**Retention:** 13 months per data retention policy.

---

### Table: `api_keys`

API keys for programmatic access. Only the sha256 hash is stored.

```sql
CREATE TABLE api_keys (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID        NOT NULL REFERENCES users(id),
  name            TEXT        NOT NULL,
  key_hash        TEXT        NOT NULL UNIQUE,     -- sha256(plaintext_key)
  key_prefix      TEXT        NOT NULL,            -- first 8 chars for display (e.g. "vs_live_")
  scopes          TEXT[]      NOT NULL DEFAULT '{}',
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON api_keys (org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys (key_hash);
```

---

## 7. Schema: Content

### Table: `channels`

YouTube channel profiles, updated periodically by the Channel Intelligence workflow.

```sql
CREATE TABLE channels (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform            TEXT        NOT NULL DEFAULT 'youtube'
                                  CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
  platform_channel_id TEXT        NOT NULL,
  name                TEXT        NOT NULL,
  handle              TEXT,
  description         TEXT,
  thumbnail_url       TEXT,
  subscriber_estimate BIGINT,
  avg_views           BIGINT,
  avg_duration_secs   INTEGER,
  upload_frequency    NUMERIC(5,2),               -- uploads per week (avg)
  growth_score        NUMERIC(5,2),
  topic_focus         TEXT[],
  posting_schedule    JSONB,                       -- { "monday": true, "hour": 14, ... }
  last_analysed_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, platform_channel_id)
);

CREATE UNIQUE INDEX uq_channels_platform_id ON channels (platform, platform_channel_id);
CREATE INDEX idx_channels_platform ON channels (platform);
CREATE INDEX idx_channels_growth_score ON channels (growth_score DESC);
```

---

### Table: `videos`

Core video records. The central entity in the content schema.

```sql
CREATE TABLE videos (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  platform                TEXT        NOT NULL DEFAULT 'youtube'
                                      CHECK (platform IN ('youtube', 'tiktok', 'instagram')),
  platform_video_id       TEXT        NOT NULL,
  channel_id              UUID        REFERENCES channels(id),
  url                     TEXT        NOT NULL,
  title                   TEXT        NOT NULL,
  description             TEXT,
  tags                    TEXT[],
  thumbnail_url           TEXT,
  duration_secs           INTEGER,
  language                TEXT,
  category                TEXT,
  published_at            TIMESTAMPTZ,

  -- Engagement metrics (snapshot at time of analysis)
  view_count              BIGINT      DEFAULT 0,
  like_count              BIGINT      DEFAULT 0,
  comment_count           BIGINT      DEFAULT 0,
  views_per_day           NUMERIC(12,2),
  likes_ratio             NUMERIC(5,4),           -- likes / views
  comments_ratio          NUMERIC(5,4),           -- comments / views

  -- Analysis state
  analysis_status         TEXT        NOT NULL DEFAULT 'pending'
                                      CHECK (analysis_status IN (
                                        'pending','queued','processing',
                                        'complete','failed','stale'
                                      )),
  transcript_status       TEXT        NOT NULL DEFAULT 'pending'
                                      CHECK (transcript_status IN (
                                        'pending','available','unavailable','failed'
                                      )),
  last_analysed_at        TIMESTAMPTZ,

  -- Scoring
  viral_score             NUMERIC(5,2),            -- 0.00 – 100.00
  viral_score_confidence  NUMERIC(3,2),            -- 0.00 – 1.00
  viral_score_computed_at TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (platform, platform_video_id)
);

CREATE UNIQUE INDEX uq_videos_platform_id ON videos (platform, platform_video_id);
CREATE INDEX idx_videos_channel_id ON videos (channel_id);
CREATE INDEX idx_videos_viral_score ON videos (viral_score DESC NULLS LAST);
CREATE INDEX idx_videos_published_at ON videos (published_at DESC);
CREATE INDEX idx_videos_analysis_status ON videos (analysis_status);
CREATE INDEX idx_videos_language ON videos (language);
CREATE INDEX idx_videos_category ON videos (category);
```

---

### Table: `transcripts`

Full transcript data and structured summaries per video.

```sql
CREATE TABLE transcripts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id        UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  raw_text        TEXT,                            -- full raw transcript
  language        TEXT,
  is_auto_generated BOOLEAN   NOT NULL DEFAULT TRUE,
  summary         TEXT,                            -- AI-generated summary
  hook_text       TEXT,                            -- first 60 seconds text
  hook_end_secs   INTEGER,
  cta_text        TEXT,
  ending_text     TEXT,
  sections        JSONB,                           -- [{ title, start_secs, end_secs, summary }]
  word_count      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transcripts_video_id ON transcripts (video_id);
```

---

## 8. Schema: AI Analysis

### Table: `thumbnail_analyses`

Results of AI vision analysis on video thumbnails.

```sql
CREATE TABLE thumbnail_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  emotion             TEXT,                        -- dominant emotion detected
  faces_count         INTEGER,
  has_text            BOOLEAN,
  text_content        TEXT,
  text_density        NUMERIC(3,2),                -- 0.00 – 1.00
  dominant_colors     TEXT[],                      -- hex codes
  contrast_score      NUMERIC(3,2),                -- 0.00 – 1.00
  composition_type    TEXT,                        -- 'rule_of_thirds', 'central', 'split', etc.
  objects_detected    TEXT[],
  background_type     TEXT,
  ctr_prediction      NUMERIC(5,2),                -- 0.00 – 100.00
  ctr_confidence      NUMERIC(3,2),
  raw_output          JSONB,                       -- full AI response preserved
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_thumbnail_analyses_video_id ON thumbnail_analyses (video_id);
CREATE INDEX idx_thumbnail_analyses_ctr_prediction ON thumbnail_analyses (ctr_prediction DESC);
```

---

### Table: `title_analyses`

Structural analysis of video titles.

```sql
CREATE TABLE title_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  formula_type        TEXT,                        -- 'how_to', 'listicle', 'why', 'truth_about', etc.
  formula_template    TEXT,                        -- e.g. "How I [Action] in [Timeframe]"
  keywords            TEXT[],
  power_words         TEXT[],
  character_count     INTEGER,
  word_count          INTEGER,
  has_number          BOOLEAN,
  number_value        INTEGER,
  sentiment           TEXT        CHECK (sentiment IN ('positive','negative','neutral','curiosity')),
  title_score         NUMERIC(5,2),
  raw_output          JSONB,
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_title_analyses_video_id ON title_analyses (video_id);
CREATE INDEX idx_title_analyses_formula_type ON title_analyses (formula_type);
```

---

### Table: `video_analyses`

Full AI content analysis for each video.

```sql
CREATE TABLE video_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,

  -- Hook analysis
  hook_type           TEXT        CHECK (hook_type IN (
                                    'question','shock','statistic','fear','story',
                                    'mystery','promise','curiosity','humour'
                                  )),
  hook_confidence     NUMERIC(3,2),               -- 0.00 – 1.00
  hook_summary        TEXT,

  -- Content structure
  story_structure     TEXT,                        -- 'problem_solution', 'journey', 'list', etc.
  narrative_arc       TEXT,
  content_summary     TEXT,

  -- Audience
  target_audience     TEXT,
  audience_level      TEXT        CHECK (audience_level IN ('beginner','intermediate','advanced','all')),
  primary_emotion     TEXT,

  -- Performance drivers
  retention_tactics   TEXT[],                      -- ['pattern_interrupt', 'open_loop', 'b_roll', ...]
  key_themes          TEXT[],
  virality_drivers    TEXT[],
  content_weaknesses  TEXT[],

  -- CTA
  cta_type            TEXT,
  cta_text            TEXT,

  raw_output          JSONB,                       -- full AI response preserved
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_analyses_video_id ON video_analyses (video_id);
CREATE INDEX idx_video_analyses_hook_type ON video_analyses (hook_type);
CREATE INDEX idx_video_analyses_story_structure ON video_analyses (story_structure);
```

---

### Table: `recommendations`

AI-generated original content recommendations per video, scoped per organisation.

```sql
CREATE TABLE recommendations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  org_id              UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title_concept       TEXT,                        -- original title idea
  hook_concept        TEXT,                        -- original hook idea
  content_outline     JSONB,                       -- [{ section, description }]
  thumbnail_concept   TEXT,                        -- visual composition description
  keywords            TEXT[],
  cta_suggestion      TEXT,
  tone_notes          TEXT,
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_video_id ON recommendations (video_id);
CREATE INDEX idx_recommendations_org_id ON recommendations (org_id);
CREATE UNIQUE INDEX uq_recommendations_video_org ON recommendations (video_id, org_id);
```

---

### Table: `trends`

Daily topic trend snapshots computed by the Trend Detection workflow.

```sql
CREATE TABLE trends (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic               TEXT        NOT NULL,
  platform            TEXT        NOT NULL DEFAULT 'youtube',
  language            TEXT        NOT NULL DEFAULT 'en',
  status              TEXT        NOT NULL
                                  CHECK (status IN ('emerging','evergreen','declining','unknown')),
  velocity_score      NUMERIC(5,2),               -- how fast is growth accelerating
  growth_rate         NUMERIC(7,4),               -- % growth rate
  competition_score   NUMERIC(5,2),               -- how saturated is this topic
  opportunity_score   NUMERIC(5,2),               -- demand × growth ÷ competition
  video_count         INTEGER,
  avg_viral_score     NUMERIC(5,2),
  top_video_ids       UUID[],                      -- top 5 video UUIDs for this topic
  snapshot_date       DATE        NOT NULL,        -- date this trend snapshot was computed
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trends_topic ON trends (topic);
CREATE INDEX idx_trends_status ON trends (status, snapshot_date DESC);
CREATE INDEX idx_trends_opportunity_score ON trends (opportunity_score DESC);
CREATE INDEX idx_trends_snapshot_date ON trends (snapshot_date DESC);
CREATE UNIQUE INDEX uq_trends_topic_platform_date ON trends (topic, platform, language, snapshot_date);
```

---

### Table: `prompt_library`

Versioned AI prompt definitions. All AI calls reference a prompt version from this table.

```sql
CREATE TABLE prompt_library (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,            -- e.g. 'transcript_analysis'
  version         INTEGER     NOT NULL,
  model           TEXT        NOT NULL,            -- e.g. 'claude-sonnet-4-6', 'gpt-4o'
  system_prompt   TEXT        NOT NULL,
  user_template   TEXT        NOT NULL,            -- handlebars-style template with {{variables}}
  output_schema   JSONB       NOT NULL,            -- Zod schema in JSON format for validation
  is_active       BOOLEAN     NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_by      UUID        REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, version)
);

CREATE INDEX idx_prompt_library_name ON prompt_library (name);
CREATE INDEX idx_prompt_library_is_active ON prompt_library (name, is_active) WHERE is_active = TRUE;
```

**Constraint:** Only one active version per prompt name is enforced at the application layer (service validates before setting `is_active = TRUE`).

---

## 9. Schema: Watchlists & Alerts

### Table: `watchlists`

User-defined monitoring targets.

```sql
CREATE TABLE watchlists (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id    UUID        REFERENCES workspaces(id) ON DELETE SET NULL,
  created_by      UUID        NOT NULL REFERENCES users(id),
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL
                              CHECK (type IN ('channel','keyword','niche','competitor')),
  target          TEXT        NOT NULL,             -- channel ID, keyword string, niche name, etc.
  target_metadata JSONB       NOT NULL DEFAULT '{}',-- channel name, URL, etc.
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_watchlists_org_id ON watchlists (org_id);
CREATE INDEX idx_watchlists_type ON watchlists (type);
CREATE INDEX idx_watchlists_is_active ON watchlists (org_id, is_active) WHERE deleted_at IS NULL;
```

---

### Table: `alert_rules`

Configuration for when and how to trigger alerts.

```sql
CREATE TABLE alert_rules (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  watchlist_id        UUID        REFERENCES watchlists(id) ON DELETE CASCADE,
  created_by          UUID        NOT NULL REFERENCES users(id),
  name                TEXT        NOT NULL,
  trigger_type        TEXT        NOT NULL
                                  CHECK (trigger_type IN (
                                    'viral_score_threshold','trend_spike',
                                    'channel_upload','breakout_prediction'
                                  )),
  threshold_value     NUMERIC(5,2),               -- e.g. 75.00 for viral score
  delivery_channels   JSONB       NOT NULL DEFAULT '[]',
                                  -- [{ type: 'email', address: '...' }, { type: 'discord', webhook_url: '...' }]
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  last_triggered_at   TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_org_id ON alert_rules (org_id);
CREATE INDEX idx_alert_rules_watchlist_id ON alert_rules (watchlist_id);
CREATE INDEX idx_alert_rules_is_active ON alert_rules (is_active) WHERE deleted_at IS NULL;
```

---

### Table: `alert_events`

Immutable log of all dispatched alert notifications.

```sql
CREATE TABLE alert_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id),
  alert_rule_id   UUID        NOT NULL REFERENCES alert_rules(id),
  trigger_type    TEXT        NOT NULL,
  payload         JSONB       NOT NULL DEFAULT '{}',-- what triggered it
  delivery_channel TEXT       NOT NULL,
  delivery_target TEXT        NOT NULL,             -- email address, webhook URL, etc.
  status          TEXT        NOT NULL
                              CHECK (status IN ('sent','failed','throttled')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_events_org_id ON alert_events (org_id, created_at DESC);
CREATE INDEX idx_alert_events_alert_rule_id ON alert_events (alert_rule_id);
```

---

## 10. Schema: Operations

### Table: `job_logs`

Execution log for all n8n workflow runs. Partitioned by month.

```sql
CREATE TABLE job_logs (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  workflow_name   TEXT        NOT NULL,
  workflow_id     TEXT,                            -- n8n internal workflow ID
  execution_id    TEXT,                            -- n8n execution ID
  status          TEXT        NOT NULL
                              CHECK (status IN ('started','completed','failed','retrying')),
  trigger_type    TEXT        NOT NULL
                              CHECK (trigger_type IN ('cron','manual','webhook','queue')),
  input_summary   JSONB       NOT NULL DEFAULT '{}',
  output_summary  JSONB       NOT NULL DEFAULT '{}',
  error_message   TEXT,
  retry_count     INTEGER     NOT NULL DEFAULT 0,
  duration_ms     INTEGER,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE TABLE job_logs_2026_07 PARTITION OF job_logs
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- ... (automated by partition management job)

CREATE INDEX idx_job_logs_workflow_name ON job_logs (workflow_name, created_at DESC);
CREATE INDEX idx_job_logs_status ON job_logs (status, created_at DESC);
```

**Retention:** 60 days per data retention policy.

---

### Table: `dead_letter_jobs`

Jobs that failed all retry attempts and require manual review.

```sql
CREATE TABLE dead_letter_jobs (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name       TEXT        NOT NULL,
  original_payload    JSONB       NOT NULL,
  error_message       TEXT        NOT NULL,
  error_stack         TEXT,
  retry_attempts      INTEGER     NOT NULL DEFAULT 0,
  last_attempt_at     TIMESTAMPTZ,
  resolved            BOOLEAN     NOT NULL DEFAULT FALSE,
  resolved_by         UUID        REFERENCES users(id),
  resolved_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dead_letter_jobs_workflow_name ON dead_letter_jobs (workflow_name);
CREATE INDEX idx_dead_letter_jobs_resolved ON dead_letter_jobs (resolved, created_at DESC);
```

**Retention:** 30 days after resolution per data retention policy.

---

## 11. Indexes

### Index Strategy

Indexes are defined at table creation in the same migration file. The following categories of indexes are always created:

| Category | Rule | Example |
|---|---|---|
| **Primary key** | Always — auto-created on `id` | `PRIMARY KEY` constraint |
| **Foreign keys** | Always — every FK column gets an index | `idx_videos_channel_id` |
| **Tenant isolation** | Always on `org_id` columns | `idx_watchlists_org_id` |
| **Status columns** | On columns used in `WHERE` filters | `idx_videos_analysis_status` |
| **Sort columns** | Descending on `created_at`, `viral_score`, `opportunity_score` | `idx_videos_viral_score DESC` |
| **Unique constraints** | Via unique index, not unique constraint, to support `WHERE deleted_at IS NULL` | `uq_videos_platform_id` |
| **Partial indexes** | For soft-deleted tables — filter on `WHERE deleted_at IS NULL` | `uq_organizations_slug WHERE deleted_at IS NULL` |
| **JSONB** | GIN indexes only when full-text search on JSONB is needed | Not in MVP |

### Index Review Policy

- Unused indexes are identified quarterly using `pg_stat_user_indexes`
- Indexes where `idx_scan = 0` after 90 days of production traffic are candidates for removal
- All index removals require a migration file and PR review

---

## 12. Row Level Security Policies

> **Correction (Phase 3, 2026-07-26):** this section previously showed Supabase Auth's `auth.uid()` pattern, inherited from a generic Supabase starting point. It was never consistent with the rest of this document — section 5 defines this project's own `users`/`oauth_accounts`/`sessions` tables with bcrypt `password_hash`, and Security_Architecture.md §5 and PRD.md FR-43 both specify a custom JWT + OAuth auth system, not Supabase Auth. `auth.uid()` only exists when Supabase's GoTrue auth service issues the session — it does not apply here. The pattern below (session-local settings read via `current_setting()`) is what's actually implemented in `packages/db/src/migrations/0003_rls_policies.sql`.

RLS is enabled on every tenant-scoped table (see the RLS column in section 20). The application connects as a dedicated, unprivileged Postgres role (`app_user`, created by `packages/db/src/setup-roles.ts`) — Postgres superusers and table owners bypass RLS unconditionally, so the role that runs migrations (which owns the tables) must never be the role the running application uses.

`packages/db/src/client.ts`'s `withTenant()` sets `app.current_org_id` and `app.current_user_id` as transaction-local settings at the start of every request. RLS policies read them back via `current_setting(..., true)`, which returns `NULL` (not an error) when unset — and a `NULL` comparison is never true, so a connection that never calls `withTenant()` sees zero rows by default (fail-closed, not fail-open).

### Common RLS Pattern

```sql
-- Enable RLS
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Tenant isolation (SELECT/INSERT/UPDATE/DELETE): scoped to the caller's
-- organisation, read from the session-local setting set by withTenant().
CREATE POLICY watchlists_tenant_isolation ON watchlists
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
```

A few tables have no `org_id` column and are scoped differently:
- `oauth_accounts`, `sessions` — scoped by `user_id = current_setting('app.current_user_id', true)::uuid` (they belong to a user, not an org).
- `projects` — scoped indirectly via `workspace_id IN (SELECT id FROM workspaces WHERE org_id = current_setting('app.current_org_id', true)::uuid)`, since `projects` only has `workspace_id`.

RLS scope here is tenant isolation only (principle P4). Role-based write authorisation (e.g. "only admin/owner can delete a watchlist") is application-layer business logic, deferred to the API (Phase 5) — Phase 3 is schema and data layer only.

### Tables Without RLS (Global Data)

These tables contain platform-wide data not scoped to a tenant:

| Table | Reason |
|---|---|
| `videos` | Shared across all tenants (video analysis is global) |
| `channels` | Shared across all tenants |
| `transcripts` | Shared across all tenants |
| `thumbnail_analyses` | Shared across all tenants |
| `title_analyses` | Shared across all tenants |
| `video_analyses` | Shared across all tenants |
| `trends` | Platform-wide trend data |
| `prompt_library` | Platform configuration, admin-managed |

**Important:** `recommendations` IS tenant-scoped (each org gets its own recommendations per video).

---

## 13. Partitioning Strategy

### Why Partition

`usage_events` and `job_logs` are high-volume append-only tables that grow indefinitely. Without partitioning:
- Queries slow down as table size grows
- Retention purges require full table scans or expensive deletes
- Vacuuming becomes slow and impacts query performance

### Partition Type: Range by `created_at` (Monthly)

```sql
-- Parent table
CREATE TABLE usage_events (
  ...
) PARTITION BY RANGE (created_at);

-- One partition per month, created 1 month in advance
CREATE TABLE usage_events_2026_07
  PARTITION OF usage_events
  FOR VALUES FROM ('2026-07-01 00:00:00 UTC')
             TO   ('2026-08-01 00:00:00 UTC');
```

### Partition Management

A monthly maintenance job (CRON, first day of each month):
1. Creates the next month's partition
2. Identifies partitions older than the retention period
3. Drops old partitions (`DROP TABLE usage_events_2024_06`) — instant, no vacuum needed
4. Logs the maintenance run to `job_logs`

### Tables That Are Partitioned

| Table | Partition key | Partition period | Retention |
|---|---|---|---|
| `usage_events` | `created_at` | Monthly | 13 months |
| `job_logs` | `created_at` | Monthly | 60 days |

---

## 14. Migration Strategy

### Tool

**Drizzle ORM** is the query builder/schema-type source (`packages/db/src/schema/*.ts`). Migrations themselves are hand-written SQL, applied by a small custom runner (`packages/db/src/migrate.ts`) rather than `drizzle-kit generate`/`migrate` — drizzle-kit's own migration journal is forward-only with no `down` command, which doesn't satisfy the "every migration must be reversible" rule below, and several of Phase 3's migrations (triggers, RLS policies with the `current_setting()` pattern, `PARTITION BY RANGE`) aren't expressible through drizzle-kit's schema-diffing DSL at the installed version anyway. The runner tracks applied migrations in a `_migrations` table and supports `up`, `down [n]`, and `status`.

### Migration File Convention

```
packages/db/src/migrations/
├── 0001_initial_schema.sql
├── 0002_updated_at_triggers.sql
├── 0003_rls_policies.sql
└── 0004_partitioning.sql
```

Files are zero-padded 4-digit sequential numbers. Each file is a complete SQL script with both `-- Up` and `-- Down` sections, split and applied by `migrate.ts`.

### Migration File Template

```sql
-- Migration: 0005_add_trend_velocity
-- Up

ALTER TABLE trends ADD COLUMN velocity_score NUMERIC(5,2);
CREATE INDEX idx_trends_velocity_score ON trends (velocity_score DESC);

-- Down

DROP INDEX idx_trends_velocity_score;
ALTER TABLE trends DROP COLUMN velocity_score;
```

### Migration Rules

- [ ] Every schema change is a migration file — no manual ALTER TABLE in any environment
- [ ] Every migration must be reversible (up + down)
- [ ] Migrations run before the new application version starts serving traffic
- [ ] Large table alterations (adding columns to tables > 10M rows) use `pg_repack` or online schema change approach
- [ ] Foreign keys on high-write tables are added `NOT VALID` initially, then validated in a separate migration during low-traffic window
- [ ] No migration drops data without a retention policy justification and separate approval

### Zero-Downtime Migration Principles

| Operation | Safe approach |
|---|---|
| Add nullable column | Safe — add directly |
| Add non-nullable column | Add as nullable → backfill → add NOT NULL constraint |
| Rename column | Add new column → dual-write → migrate reads → drop old |
| Drop column | Stop reading column in code first → deploy → then drop in next migration |
| Add index | `CREATE INDEX CONCURRENTLY` — does not lock the table |
| Add constraint | `ALTER TABLE ... ADD CONSTRAINT ... NOT VALID` → `VALIDATE CONSTRAINT` separately |

---

## 15. Soft Deletes

### Policy

Not all tables use soft deletes. The choice is made per table based on recovery needs and compliance requirements.

| Table | Soft delete? | Column | Reason |
|---|---|---|---|
| `users` | Yes | `deleted_at` | GDPR — account deletion is a two-step process (soft delete → scheduled PII purge) |
| `organizations` | Yes | `deleted_at` | Org deletion needs a grace period; billing must reconcile first |
| `workspaces` | Yes | `deleted_at` | Workspace recovery is a common support request |
| `watchlists` | Yes | `deleted_at` | Users often accidentally delete watchlists |
| `alert_rules` | Yes | `deleted_at` | Rule deletion should be recoverable |
| `projects` | Yes | `deleted_at` | Same as workspaces |
| `videos` | No | — | Global content data is never deleted by a user action |
| `channels` | No | — | Global content data |
| `job_logs` | No | — | Hard-deleted by retention job; recovery not required |
| `usage_events` | No | — | Compliance records; not user-deletable |
| `audit_logs` | No | — | Immutable by design |
| `alert_events` | No | — | Immutable notification log |

### Soft Delete Query Pattern

All queries on soft-deleted tables must include the `WHERE deleted_at IS NULL` filter:

```sql
-- Correct
SELECT * FROM watchlists WHERE org_id = $1 AND deleted_at IS NULL;

-- Wrong (returns deleted records)
SELECT * FROM watchlists WHERE org_id = $1;
```

This is enforced by partial unique indexes and verified in code review.

---

## 16. Multi-Tenant Considerations

### Tenant Isolation Architecture

```
Tenant A (Org A)          Tenant B (Org B)
     │                          │
     ▼                          ▼
org_id = 'uuid-a'          org_id = 'uuid-b'
     │                          │
     ▼                          ▼
RLS Policy: only sees        RLS Policy: only sees
org_id = 'uuid-a' rows       org_id = 'uuid-b' rows
```

### Shared vs Tenant-Scoped Data

| Data | Scope | Reason |
|---|---|---|
| `videos`, `channels`, `transcripts`, `video_analyses`, `trends` | **Shared (global)** | Video data is analysed once and shared across all tenants who discover it; this is the core efficiency of the platform |
| `recommendations` | **Tenant-scoped** | Each org gets its own AI recommendations per video (can be customised per niche) |
| `watchlists`, `alert_rules`, `alert_events` | **Tenant-scoped** | Org-specific monitoring configuration |
| `subscriptions`, `usage_events`, `api_keys`, `invoices` | **Tenant-scoped** | Billing data is strictly per-org |
| `audit_logs` | **Tenant-scoped** | Each org sees only its own audit trail |
| `prompt_library`, `job_logs`, `dead_letter_jobs` | **Platform (admin only)** | Internal operations data |

### Cross-Tenant Data Leak Prevention

1. **RLS at the database layer** — tenant-scoped tables have RLS policies that filter by `org_id`
2. **Service layer filter** — all repository queries for tenant data include `WHERE org_id = ?` explicitly
3. **Integration tests** — CI includes tests that assert a JWT from Organisation A cannot read Organisation B's data

---

## 17. Backup Strategy

| Stage | Frequency | Retention | Storage | Method |
|---|---|---|---|---|
| Stage 1 (MVP) | Daily at 02:00 UTC | 30 days | Cloudflare R2 | Supabase automated backup + pg_dump export |
| Stage 2 | Every 6 hours | 60 days | R2 + secondary region | Supabase automated + WAL archiving |
| Stage 3 | Continuous WAL archiving + daily snapshot | 90 days | Cross-region S3 | pgBackRest or Barman |
| Stage 4 | Continuous PITR + cross-region replication | 365 days | Multi-region | CockroachDB / Aurora Global native |

### Backup Verification

- Monthly automated test restore from backup to a staging database
- Restore time is measured and compared against the RTO target (< 1 hour at Stage 1)
- Any restore failure is treated as a P1 incident
- Results logged to `job_logs` with `workflow_name = 'backup_verification'`

---

## 18. Data Retention Policy

| Data type | Retention period | Storage location | Purge method |
|---|---|---|---|
| Raw transcripts | 90 days | PostgreSQL | Nightly purge job (soft delete → hard delete) |
| AI analysis outputs | 12 months | PostgreSQL | Nightly purge job |
| Recommendations | 12 months | PostgreSQL | Nightly purge job |
| Job logs | 60 days | PostgreSQL (partitioned) | Drop monthly partition |
| Usage events | 13 months | PostgreSQL (partitioned) | Drop monthly partition |
| Audit logs | 2 years | PostgreSQL | Nightly purge job |
| Dead-letter jobs | 30 days post-resolution | PostgreSQL | Nightly purge job |
| Session tokens | On expiry or revocation | PostgreSQL | Nightly purge job |
| Object storage (thumbnails) | 7 days | Cloudflare R2 | R2 lifecycle policy |
| Object storage (exports) | 7 days | Cloudflare R2 | R2 lifecycle policy |
| GDPR deletion requests | PII purged within 30 days | All stores | Manual + automated purge |

### GDPR Hard Deletion

When a user requests account deletion:
1. `users.deleted_at` is set immediately (soft delete)
2. A GDPR purge job runs within 24 hours:
   - Nullifies `users.email`, `users.name`, `users.avatar_url`, `users.password_hash`
   - Removes `oauth_accounts` records
   - Anonymises `audit_logs` entries (replaces `user_id` with a `deleted_user` placeholder)
   - Removes `sessions`
3. A `gdpr_deletion_log` entry is created with timestamp and confirmation
4. The user is notified by email that deletion is complete

---

## 19. Scaling Strategy

### Stage 1 — Single Instance

- All tables on one Supabase PostgreSQL instance
- PgBouncer connection pooling enabled from day one
- Partitioned tables (`usage_events`, `job_logs`) ensure purge operations stay fast

### Stage 2 — Read Replica

- One Supabase read replica
- All analytics queries, reporting queries, and search queries route to the replica
- Writes and auth-sensitive reads remain on the primary
- Connection string routing in `packages/db/src/client.ts` via `readPreference` flag

### Stage 3 — Vertical Sharding

- High-volume tables (`usage_events`, `job_logs`, `audit_logs`) moved to a dedicated PostgreSQL instance
- Content tables (`videos`, `channels`, `video_analyses`) moved to a read-optimised instance
- Query router service directs queries to the correct shard

### Stage 3 — ClickHouse for Analytics

- Aggregate analytics queries (viral score distributions, trend velocity, usage reporting) migrated to ClickHouse
- ETL pipeline syncs from PostgreSQL to ClickHouse every 15 minutes (Stage 2) or real-time via Kafka (Stage 3)
- PostgreSQL remains the source of truth; ClickHouse is read-only

---

## 20. Complete Table Reference

| Table | Schema | Row estimate (MVP) | Partitioned | RLS | Soft delete |
|---|---|---|---|---|---|
| `users` | Users & Orgs | 10,000 | No | No (global, filtered by session) | Yes |
| `oauth_accounts` | Users & Orgs | 8,000 | No | Yes | No |
| `sessions` | Users & Orgs | 50,000 | No | Yes | No |
| `organizations` | Users & Orgs | 3,000 | No | No (filtered by membership) | Yes |
| `organization_members` | Users & Orgs | 15,000 | No | Yes | No |
| `workspaces` | Users & Orgs | 5,000 | No | Yes | Yes |
| `projects` | Users & Orgs | 10,000 | No | Yes | Yes |
| `audit_logs` | Users & Orgs | 500,000 | No | Yes | No |
| `subscriptions` | Billing | 3,000 | No | Yes | No |
| `invoices` | Billing | 20,000 | No | Yes | No |
| `usage_events` | Billing | 5,000,000 | Yes (monthly) | Yes | No |
| `api_keys` | Billing | 5,000 | No | Yes | No |
| `channels` | Content | 50,000 | No | No (global) | No |
| `videos` | Content | 2,000,000 | No | No (global) | No |
| `transcripts` | Content | 1,500,000 | No | No (global) | No |
| `thumbnail_analyses` | AI Analysis | 1,500,000 | No | No (global) | No |
| `title_analyses` | AI Analysis | 1,500,000 | No | No (global) | No |
| `video_analyses` | AI Analysis | 1,500,000 | No | No (global) | No |
| `recommendations` | AI Analysis | 300,000 | No | Yes | No |
| `trends` | AI Analysis | 50,000 | No | No (global) | No |
| `prompt_library` | AI Analysis | 50 | No | No (admin only) | No |
| `watchlists` | Watchlists | 30,000 | No | Yes | Yes |
| `alert_rules` | Watchlists | 50,000 | No | Yes | Yes |
| `alert_events` | Watchlists | 200,000 | No | Yes | No |
| `job_logs` | Operations | 10,000,000 | Yes (monthly) | No (admin only) | No |
| `dead_letter_jobs` | Operations | 500 | No | No (admin only) | No |

**Total tables: 26**

---

*This document is updated whenever a migration is applied that adds, removes, or alters a table or significant column. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — Where schema files live in the codebase
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Database scaling strategy per stage
- [Security_Architecture.md](./Security_Architecture.md) — RLS policy design and data security
- [Deployment_Guide.md](./Deployment_Guide.md) — How migrations are applied in each environment
