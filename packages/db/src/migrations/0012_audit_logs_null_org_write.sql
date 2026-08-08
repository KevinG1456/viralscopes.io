-- Migration: 0012_audit_logs_null_org_write
--
-- Phase 10 Milestone 1 finding F-04: audit_logs_tenant_isolation (see
-- 0003_rls_policies.sql) checks `org_id = current_setting('app.current_org_id',
-- true)::uuid` in both USING and WITH CHECK. When org_id IS NULL, that
-- comparison evaluates to NULL (neither true nor false), so both clauses
-- reject the row -- there is no org_id IS NULL exception anywhere in the
-- policy today.
--
-- TD-013's planned auth-event logging needs to insert audit_logs rows that
-- have no org_id at write time (e.g. a failed login for an email that
-- doesn't exist, or a registration event before any organization exists).
-- Those inserts would fail immediately against the current policy.
--
-- Fix scope, deliberately narrow: only WITH CHECK gets the org_id IS NULL
-- exception. USING is left exactly as it was -- a tenant-scoped read still
-- can never see a null-org row, so today's read-isolation guarantee is
-- unchanged. This intentionally does not create a way to *read* org-less
-- audit rows through the tenant-scoped policy; a separate, explicit
-- super_admin-only read path is a decision for whoever implements the
-- audit-log viewing feature, not this migration.
--
-- Implementation note (found during verification, not obvious from the
-- policy text): Postgres also enforces the unchanged USING clause when
-- computing RETURNING output for an INSERT under RLS. A null-org insert
-- now succeeds, but `INSERT ... RETURNING` on that same row still raises
-- "new row violates row-level security policy" if run under any tenant
-- context, because the just-written row is correctly invisible to that
-- context's SELECT-side (USING) policy. Whoever wires TD-013's audit-log
-- writes must not rely on `.returning()` for org-less events -- insert
-- without RETURNING, or generate the id application-side.

-- Up

DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (
    org_id IS NULL
    OR org_id = current_setting('app.current_org_id', true)::uuid
  );

-- Down

DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
