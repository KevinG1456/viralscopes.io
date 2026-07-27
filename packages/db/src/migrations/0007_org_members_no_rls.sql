-- Migration: 0007_org_members_no_rls
--
-- Same chicken-and-egg problem 0006 already fixed for `sessions` and
-- `oauth_accounts`, missed for `organization_members` at the time: its RLS
-- policy (0003_rls_policies.sql) requires `app.current_org_id` to already
-- be set --
--   USING (org_id = current_setting('app.current_org_id', true)::uuid)
-- -- but `findActiveOrgContext(userId)` (apps/api/src/repositories/
-- org-membership.repository.ts) is called at login/OAuth-login time
-- precisely to DISCOVER which org_id belongs to this user, before any
-- tenant context can be set. Confirmed live, not theoretical: after a full
-- migrate+seed cycle, logging in as the seeded admin (who has a real
-- `owner` row in organization_members) produced `orgId: null` in the
-- issued JWT; querying `organization_members` as `app_user` filtered by
-- user_id alone (no org_id) returned 0 rows even though the row exists,
-- confirmed via psql -- RLS was silently discarding it.
--
-- Reclassified into the same "root identity table, filtered by
-- application/session logic" category as users/organizations/sessions/
-- oauth_accounts. `findActiveOrgContext` already filters explicitly by
-- user_id in its WHERE clause; every other org-scoped table (workspaces,
-- projects, ...) keeps its RLS policy unchanged since those are only ever
-- queried once org_id is already known from an authenticated request.

-- Up

DROP POLICY IF EXISTS organization_members_tenant_isolation ON organization_members;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Down

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY organization_members_tenant_isolation ON organization_members
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
