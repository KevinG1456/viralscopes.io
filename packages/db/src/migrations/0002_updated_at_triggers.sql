-- Migration: 0002_updated_at_triggers
-- Reusable trigger function that keeps updated_at current on every table
-- that has one (Database_Schema.md section 3). Append-only tables
-- (usage_events, job_logs, audit_logs, alert_events) and a few
-- created-at-only tables (sessions, api_keys, trends, prompt_library,
-- dead_letter_jobs) are intentionally excluded -- they are never updated.

-- Up

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON oauth_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON thumbnail_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON title_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON video_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON alert_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Down

DROP TRIGGER IF EXISTS set_updated_at ON alert_rules;
DROP TRIGGER IF EXISTS set_updated_at ON watchlists;
DROP TRIGGER IF EXISTS set_updated_at ON recommendations;
DROP TRIGGER IF EXISTS set_updated_at ON video_analyses;
DROP TRIGGER IF EXISTS set_updated_at ON title_analyses;
DROP TRIGGER IF EXISTS set_updated_at ON thumbnail_analyses;
DROP TRIGGER IF EXISTS set_updated_at ON transcripts;
DROP TRIGGER IF EXISTS set_updated_at ON videos;
DROP TRIGGER IF EXISTS set_updated_at ON channels;
DROP TRIGGER IF EXISTS set_updated_at ON invoices;
DROP TRIGGER IF EXISTS set_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS set_updated_at ON projects;
DROP TRIGGER IF EXISTS set_updated_at ON workspaces;
DROP TRIGGER IF EXISTS set_updated_at ON organization_members;
DROP TRIGGER IF EXISTS set_updated_at ON organizations;
DROP TRIGGER IF EXISTS set_updated_at ON oauth_accounts;
DROP TRIGGER IF EXISTS set_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();
