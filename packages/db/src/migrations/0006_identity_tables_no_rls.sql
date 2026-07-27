-- Migration: 0006_identity_tables_no_rls
--
-- Corrects a Phase 3 design gap discovered while building and live-testing
-- Phase 4's auth flows: `sessions` and `oauth_accounts` were given the same
-- `user_id = current_setting('app.current_user_id', true)::uuid`
-- tenant-isolation policy as org-scoped tables (0003_rls_policies.sql).
-- That policy assumes the caller's identity is already known and set as a
-- session variable before the query runs -- true for org-scoped tables
-- (Phase 5+ requests run inside an authenticated request, so `withTenant()`
-- sets both variables from the verified access token). It is NOT true for
-- these two tables' actual access patterns, which happen precisely when the
-- identity is not yet known from a session variable:
--   - refresh-token rotation and logout look a session up BY ITS HASH
--     (`findSessionByHash`) -- the user_id is the thing being discovered,
--     not something available to set app.current_user_id to beforehand.
--   - OAuth callback resolution looks an account up BY (provider,
--     provider_uid) for the same reason.
-- Live-testing login against this policy produced "new row violates row
-- level security policy for table sessions" on every session-issuing call
-- (register has no session yet either), confirming this isn't a
-- theoretical concern.
--
-- These two tables are therefore reclassified into the same category
-- Database_Schema.md and 0003_rls_policies.sql already carve out for
-- `users`/`organizations`: root identity tables "filtered by application/
-- session logic" rather than DB-level RLS. Every repository function
-- against these tables already filters explicitly by user_id in its WHERE
-- clause (see apps/api/src/repositories/session.repository.ts,
-- oauth.repository.ts), and the sensitive value that actually gates access
-- to a session row -- the refresh token itself -- is an unguessable,
-- HMAC-hashed 32-byte random value; knowing it is the real authorization
-- boundary, not which Postgres role is asking.

-- Up

DROP POLICY IF EXISTS sessions_tenant_isolation ON sessions;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oauth_accounts_tenant_isolation ON oauth_accounts;
ALTER TABLE oauth_accounts DISABLE ROW LEVEL SECURITY;

-- Down

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
