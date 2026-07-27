-- Migration: 0001_initial_schema
-- All 26 tables from Database_Schema.md. gen_random_uuid() is a PostgreSQL
-- 13+ core builtin -- no extension required on Postgres 15+.
--
-- usage_events and job_logs are declared PARTITION BY RANGE here (Postgres
-- cannot convert an existing plain table into a partitioned one via ALTER
-- TABLE, so the partitioned declaration must be present at creation time).
-- The actual monthly partitions are created in 0004_partitioning.sql.

-- Up

CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT        NOT NULL,
  name              TEXT,
  avatar_url        TEXT,
  password_hash     TEXT,
  email_verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  role              TEXT        NOT NULL DEFAULT 'user'
                                CHECK (role IN ('super_admin', 'user')),
  onboarding_done   BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX uq_users_email ON users (email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users (role);

CREATE TABLE oauth_accounts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        TEXT        NOT NULL CHECK (provider IN ('google', 'github')),
  provider_uid    TEXT        NOT NULL,
  access_token    TEXT,
  refresh_token   TEXT,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_oauth_accounts_provider_uid UNIQUE (provider, provider_uid)
);
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts (user_id);

CREATE TABLE sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash  TEXT        NOT NULL UNIQUE,
  ip_address          INET,
  user_agent          TEXT,
  last_used_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL,
  revoked             BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE organizations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL,
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
  CONSTRAINT uq_organization_members_org_user UNIQUE (org_id, user_id)
);
CREATE INDEX idx_org_members_org_id ON organization_members (org_id);
CREATE INDEX idx_org_members_user_id ON organization_members (user_id);

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
-- Not in Database_Schema.md's original listing -- added so the dev seed's
-- "Default Workspace" insert can be a true idempotent insert-if-missing.
CREATE UNIQUE INDEX uq_workspaces_org_name ON workspaces (org_id, name) WHERE deleted_at IS NULL;

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

CREATE TABLE audit_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        REFERENCES organizations(id),
  user_id         UUID        REFERENCES users(id),
  action          TEXT        NOT NULL,
  resource_type   TEXT,
  resource_id     TEXT,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_org_id ON audit_logs (org_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);

CREATE TABLE subscriptions (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                    UUID        NOT NULL REFERENCES organizations(id),
  plan                      TEXT        NOT NULL
                                        CHECK (plan IN ('free','starter','professional','business','enterprise')),
  status                    TEXT        NOT NULL
                                        CHECK (status IN ('active','trialing','past_due','canceled','paused')),
  billing_provider          TEXT        NOT NULL DEFAULT 'stripe'
                                        CHECK (billing_provider IN ('stripe','paddle','crypto','manual')),
  provider_customer_id      TEXT,
  provider_subscription_id  TEXT,
  current_period_start      TIMESTAMPTZ,
  current_period_end        TIMESTAMPTZ,
  cancel_at_period_end      BOOLEAN     NOT NULL DEFAULT FALSE,
  trial_ends_at             TIMESTAMPTZ,
  grace_period_ends_at      TIMESTAMPTZ,
  canceled_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_org_id ON subscriptions (org_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_provider_subscription_id ON subscriptions (provider_subscription_id);

CREATE TABLE invoices (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                UUID        NOT NULL REFERENCES organizations(id),
  subscription_id       UUID        REFERENCES subscriptions(id),
  provider              TEXT        NOT NULL,
  provider_invoice_id   TEXT        NOT NULL UNIQUE,
  amount_cents          INTEGER     NOT NULL,
  currency              TEXT        NOT NULL DEFAULT 'gbp',
  status                TEXT        NOT NULL
                                    CHECK (status IN ('draft','open','paid','void','uncollectible')),
  paid_at               TIMESTAMPTZ,
  hosted_url            TEXT,
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_org_id ON invoices (org_id);
CREATE INDEX idx_invoices_status ON invoices (status);

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
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_usage_events_org_id ON usage_events (org_id, created_at);
CREATE INDEX idx_usage_events_event_type ON usage_events (event_type, created_at);

CREATE TABLE api_keys (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID        NOT NULL REFERENCES users(id),
  name            TEXT        NOT NULL,
  key_hash        TEXT        NOT NULL UNIQUE,
  key_prefix      TEXT        NOT NULL,
  scopes          TEXT[]      NOT NULL DEFAULT '{}',
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_api_keys_org_id ON api_keys (org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys (key_hash);

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
  upload_frequency    NUMERIC(5,2),
  growth_score        NUMERIC(5,2),
  topic_focus         TEXT[],
  posting_schedule    JSONB,
  last_analysed_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_channels_platform_id UNIQUE (platform, platform_channel_id)
);
CREATE INDEX idx_channels_platform ON channels (platform);
CREATE INDEX idx_channels_growth_score ON channels (growth_score DESC);

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

  view_count              BIGINT      DEFAULT 0,
  like_count              BIGINT      DEFAULT 0,
  comment_count           BIGINT      DEFAULT 0,
  views_per_day           NUMERIC(12,2),
  likes_ratio             NUMERIC(5,4),
  comments_ratio          NUMERIC(5,4),

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

  viral_score             NUMERIC(5,2),
  viral_score_confidence  NUMERIC(3,2),
  viral_score_computed_at TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_videos_platform_id UNIQUE (platform, platform_video_id)
);
CREATE INDEX idx_videos_channel_id ON videos (channel_id);
CREATE INDEX idx_videos_viral_score ON videos (viral_score DESC NULLS LAST);
CREATE INDEX idx_videos_published_at ON videos (published_at DESC);
CREATE INDEX idx_videos_analysis_status ON videos (analysis_status);
CREATE INDEX idx_videos_language ON videos (language);
CREATE INDEX idx_videos_category ON videos (category);

CREATE TABLE transcripts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id          UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  raw_text          TEXT,
  language          TEXT,
  is_auto_generated BOOLEAN     NOT NULL DEFAULT TRUE,
  summary           TEXT,
  hook_text         TEXT,
  hook_end_secs     INTEGER,
  cta_text          TEXT,
  ending_text       TEXT,
  sections          JSONB,
  word_count        INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transcripts_video_id ON transcripts (video_id);

CREATE TABLE thumbnail_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  emotion             TEXT,
  faces_count         INTEGER,
  has_text            BOOLEAN,
  text_content        TEXT,
  text_density        NUMERIC(3,2),
  dominant_colors     TEXT[],
  contrast_score      NUMERIC(3,2),
  composition_type    TEXT,
  objects_detected    TEXT[],
  background_type     TEXT,
  ctr_prediction      NUMERIC(5,2),
  ctr_confidence      NUMERIC(3,2),
  raw_output          JSONB,
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_thumbnail_analyses_video_id ON thumbnail_analyses (video_id);
CREATE INDEX idx_thumbnail_analyses_ctr_prediction ON thumbnail_analyses (ctr_prediction DESC);

CREATE TABLE title_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,
  formula_type        TEXT,
  formula_template    TEXT,
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

CREATE TABLE video_analyses (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL UNIQUE REFERENCES videos(id) ON DELETE CASCADE,

  hook_type           TEXT        CHECK (hook_type IN (
                                    'question','shock','statistic','fear','story',
                                    'mystery','promise','curiosity','humour'
                                  )),
  hook_confidence     NUMERIC(3,2),
  hook_summary        TEXT,

  story_structure     TEXT,
  narrative_arc       TEXT,
  content_summary     TEXT,

  target_audience     TEXT,
  audience_level      TEXT        CHECK (audience_level IN ('beginner','intermediate','advanced','all')),
  primary_emotion     TEXT,

  retention_tactics   TEXT[],
  key_themes          TEXT[],
  virality_drivers    TEXT[],
  content_weaknesses  TEXT[],

  cta_type            TEXT,
  cta_text            TEXT,

  raw_output          JSONB,
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_video_analyses_video_id ON video_analyses (video_id);
CREATE INDEX idx_video_analyses_hook_type ON video_analyses (hook_type);
CREATE INDEX idx_video_analyses_story_structure ON video_analyses (story_structure);

CREATE TABLE recommendations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id            UUID        NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  org_id              UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title_concept       TEXT,
  hook_concept        TEXT,
  content_outline     JSONB,
  thumbnail_concept   TEXT,
  keywords            TEXT[],
  cta_suggestion      TEXT,
  tone_notes          TEXT,
  prompt_version      TEXT        NOT NULL,
  model_used          TEXT        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_recommendations_video_org UNIQUE (video_id, org_id)
);
CREATE INDEX idx_recommendations_video_id ON recommendations (video_id);
CREATE INDEX idx_recommendations_org_id ON recommendations (org_id);

CREATE TABLE trends (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic               TEXT        NOT NULL,
  platform            TEXT        NOT NULL DEFAULT 'youtube',
  language            TEXT        NOT NULL DEFAULT 'en',
  status              TEXT        NOT NULL
                                  CHECK (status IN ('emerging','evergreen','declining','unknown')),
  velocity_score      NUMERIC(5,2),
  growth_rate         NUMERIC(7,4),
  competition_score   NUMERIC(5,2),
  opportunity_score   NUMERIC(5,2),
  video_count         INTEGER,
  avg_viral_score     NUMERIC(5,2),
  top_video_ids       UUID[],
  snapshot_date       DATE        NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_trends_topic_platform_date UNIQUE (topic, platform, language, snapshot_date)
);
CREATE INDEX idx_trends_topic ON trends (topic);
CREATE INDEX idx_trends_status ON trends (status, snapshot_date DESC);
CREATE INDEX idx_trends_opportunity_score ON trends (opportunity_score DESC);
CREATE INDEX idx_trends_snapshot_date ON trends (snapshot_date DESC);

CREATE TABLE prompt_library (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  version         INTEGER     NOT NULL,
  model           TEXT        NOT NULL,
  system_prompt   TEXT        NOT NULL,
  user_template   TEXT        NOT NULL,
  output_schema   JSONB       NOT NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_by      UUID        REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_prompt_library_name_version UNIQUE (name, version)
);
CREATE INDEX idx_prompt_library_name ON prompt_library (name);
CREATE INDEX idx_prompt_library_is_active ON prompt_library (name, is_active) WHERE is_active = TRUE;

CREATE TABLE watchlists (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id    UUID        REFERENCES workspaces(id) ON DELETE SET NULL,
  created_by      UUID        NOT NULL REFERENCES users(id),
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL
                              CHECK (type IN ('channel','keyword','niche','competitor')),
  target          TEXT        NOT NULL,
  target_metadata JSONB       NOT NULL DEFAULT '{}',
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_watchlists_org_id ON watchlists (org_id);
CREATE INDEX idx_watchlists_type ON watchlists (type);
CREATE INDEX idx_watchlists_is_active ON watchlists (org_id, is_active) WHERE deleted_at IS NULL;

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
  threshold_value     NUMERIC(5,2),
  delivery_channels   JSONB       NOT NULL DEFAULT '[]',
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  last_triggered_at   TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alert_rules_org_id ON alert_rules (org_id);
CREATE INDEX idx_alert_rules_watchlist_id ON alert_rules (watchlist_id);
CREATE INDEX idx_alert_rules_is_active ON alert_rules (is_active) WHERE deleted_at IS NULL;

CREATE TABLE alert_events (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID        NOT NULL REFERENCES organizations(id),
  alert_rule_id     UUID        NOT NULL REFERENCES alert_rules(id),
  trigger_type      TEXT        NOT NULL,
  payload           JSONB       NOT NULL DEFAULT '{}',
  delivery_channel  TEXT        NOT NULL,
  delivery_target   TEXT        NOT NULL,
  status            TEXT        NOT NULL
                                CHECK (status IN ('sent','failed','throttled')),
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_alert_events_org_id ON alert_events (org_id, created_at DESC);
CREATE INDEX idx_alert_events_alert_rule_id ON alert_events (alert_rule_id);

CREATE TABLE job_logs (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  workflow_name   TEXT        NOT NULL,
  workflow_id     TEXT,
  execution_id    TEXT,
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
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
CREATE INDEX idx_job_logs_workflow_name ON job_logs (workflow_name, created_at DESC);
CREATE INDEX idx_job_logs_status ON job_logs (status, created_at DESC);

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
CREATE INDEX idx_dead_letter_jobs_resolved ON dead_letter_jobs (resolved, created_at);

-- Down

DROP TABLE IF EXISTS dead_letter_jobs;
DROP TABLE IF EXISTS job_logs;
DROP TABLE IF EXISTS alert_events;
DROP TABLE IF EXISTS alert_rules;
DROP TABLE IF EXISTS watchlists;
DROP TABLE IF EXISTS prompt_library;
DROP TABLE IF EXISTS trends;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS video_analyses;
DROP TABLE IF EXISTS title_analyses;
DROP TABLE IF EXISTS thumbnail_analyses;
DROP TABLE IF EXISTS transcripts;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS usage_events;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS oauth_accounts;
DROP TABLE IF EXISTS users;
