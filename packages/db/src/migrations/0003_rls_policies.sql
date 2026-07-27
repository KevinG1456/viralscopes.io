-- Migration: 0003_rls_policies
--
-- This project authenticates with its own JWT/OAuth system (own users/
-- sessions tables, bcrypt password hashes -- see Security_Architecture.md
-- section 5, PRD.md FR-43), not Supabase Auth. These policies therefore
-- read the caller's tenant/identity from session-local settings
-- (app.current_org_id / app.current_user_id), set per-transaction by
-- packages/db/src/client.ts's withTenant() -- not from auth.uid(), which
-- only exists when Supabase's GoTrue auth service issues the session.
--
-- current_setting(..., true) returns NULL (not an error) when unset, and a
-- NULL comparison is never true, so a connection that never calls
-- withTenant() sees zero rows in every RLS-protected table by default --
-- fail-closed, not fail-open. A service-role/admin connection intended to
-- bypass RLS entirely should use a Postgres role created with BYPASSRLS
-- (out of scope for Phase 3 -- no such role exists yet).
--
-- RLS scope is tenant isolation only (P4: "multi-tenancy enforced at DB
-- level"). Role-based write authorisation (e.g. "only admin/owner can
-- delete") is application-layer business logic and is deferred to the API
-- (Phase 5), consistent with this phase's schema-and-data-layer-only scope.
--
-- Tables NOT listed here intentionally have no RLS: users, organizations
-- (root identity/tenant tables, filtered by application/session logic);
-- channels, videos, transcripts, thumbnail_analyses, title_analyses,
-- video_analyses, trends (global content, shared across all tenants);
-- prompt_library, job_logs, dead_letter_jobs (admin-only platform data).

-- Up

ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY oauth_accounts_tenant_isolation ON oauth_accounts
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_tenant_isolation ON sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_members_tenant_isolation ON organization_members
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspaces_tenant_isolation ON workspaces
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

-- projects has no org_id column of its own; scope via workspaces.org_id.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_tenant_isolation ON projects
  FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE org_id = current_setting('app.current_org_id', true)::uuid
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE org_id = current_setting('app.current_org_id', true)::uuid
    )
  );

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_tenant_isolation ON invoices
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_events_tenant_isolation ON usage_events
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_keys_tenant_isolation ON api_keys
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY recommendations_tenant_isolation ON recommendations
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY watchlists_tenant_isolation ON watchlists
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY alert_rules_tenant_isolation ON alert_rules
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY alert_events_tenant_isolation ON alert_events
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

-- Down

DROP POLICY IF EXISTS alert_events_tenant_isolation ON alert_events;
ALTER TABLE alert_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS alert_rules_tenant_isolation ON alert_rules;
ALTER TABLE alert_rules DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS watchlists_tenant_isolation ON watchlists;
ALTER TABLE watchlists DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recommendations_tenant_isolation ON recommendations;
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS api_keys_tenant_isolation ON api_keys;
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usage_events_tenant_isolation ON usage_events;
ALTER TABLE usage_events DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoices_tenant_isolation ON invoices;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_tenant_isolation ON subscriptions;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS projects_tenant_isolation ON projects;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspaces_tenant_isolation ON workspaces;
ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organization_members_tenant_isolation ON organization_members;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_tenant_isolation ON sessions;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oauth_accounts_tenant_isolation ON oauth_accounts;
ALTER TABLE oauth_accounts DISABLE ROW LEVEL SECURITY;
