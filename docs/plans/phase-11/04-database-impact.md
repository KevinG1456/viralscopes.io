# Phase 11 — Database / Schema / Migration Impact

**Status: proposal only. No migration has been written or run. No schema file has been touched.**

All current-state facts below were verified by directly reading the Drizzle schema files in `packages/db/src/schema/`, not assumed from documentation.

---

## 1. New migration: `users` suspension columns (Milestone 2)

Current `users` schema (`packages/db/src/schema/users.ts`), verified:
```
id, email, name, avatarUrl, passwordHash, emailVerified, role, onboardingDone, deletedAt, + auditColumns()
```
No `suspendedAt`/`status` column exists. `deletedAt` exists but is explicitly a different concept — the GDPR "right to deletion" soft-delete tombstone (Phase 10 Milestone 5), which scrubs PII and is followed by a hard-delete purge job 30 days later. **Reusing `deletedAt` for admin suspend would be wrong**: a suspended user is not being deleted, their data is not being scrubbed, and the action must be reversible indefinitely, not just for a 30-day window.

**Proposed migration:**
```sql
ALTER TABLE users
  ADD COLUMN suspended_at timestamptz,
  ADD COLUMN suspended_by uuid REFERENCES users(id),
  ADD COLUMN suspended_reason text;

CREATE INDEX idx_users_suspended_at ON users (suspended_at) WHERE suspended_at IS NOT NULL;
```
All three columns nullable, purely additive, zero risk to existing rows or queries. `suspended_by` self-references `users.id` (no new FK target needed — same pattern as `resolved_by` on `dead_letter_jobs`).

**Open question for Milestone 2 kickoff:** should `authenticate.ts` check `suspendedAt IS NOT NULL` on every request (an extra column read on the hot path, already doing a user lookup in some code paths) or should suspension instead force a Redis-based session-revocation entry, checked the same way the existing lockout mechanism (`lib/lockout.ts`) is checked? The former is simpler and reuses no new infra; the latter matches an existing pattern more closely. Recommendation: check the column directly in `authenticate.ts`'s existing user-lookup path if one already exists there, or add a lightweight one if not — deferred to Milestone 2's own IDENTIFY step, since it depends on exactly how `authenticate.ts` currently resolves the request-scoped user, which needs to be read fresh at implementation time rather than assumed here.

---

## 2. Audit-log null-org write path (Milestone 1) — application layer only, no new migration

Migration `0012_audit_logs_null_org_write.sql` (Phase 10 Milestone 2) already relaxed `audit_logs_tenant_isolation`'s `WITH CHECK` clause to permit `org_id IS NULL` on `INSERT`. **This schema-level work is done.** What's missing is purely in `apps/api/src/lib/audit-log.ts` (see `02-architecture.md` §2.3) — `TenantContext.orgId: string` blocks calling the existing `auditLog()` for org-less writes at the TypeScript level, and no alternative entry point exists. Milestone 1 adds `auditLogPlatform()` as new application code. **No migration required for this item.**

Reminder, carried forward from Phase 10 Milestone 2's own hard-won finding: Postgres enforces the (unchanged) `USING` clause even when computing `RETURNING` output, so any null-org `INSERT` — including every call `auditLogPlatform()` makes — must omit `.returning()`.

---

## 3. `organizations` — suspension columns (Milestone 3) and the plan-override open question

Current `organizations` schema, verified:
```
id, name, slug, ownerId, plan (text, CHECK IN free/starter/professional/business/enterprise),
logoUrl, settings (jsonb), deletedAt, + auditColumns()
```

**Proposed migration (suspend, parallel to users):**
```sql
ALTER TABLE organizations
  ADD COLUMN suspended_at timestamptz,
  ADD COLUMN suspended_by uuid REFERENCES users(id),
  ADD COLUMN suspended_reason text;

CREATE INDEX idx_organizations_suspended_at ON organizations (suspended_at) WHERE suspended_at IS NOT NULL;
```

**Plan override — genuinely open design question, not resolved by this document:**

`organizations.plan` is a plain, directly-writable text column. But Phase 9 established `subscriptions` (Stripe-backed) as the actual source of truth for what a customer is paying for, with `organizations.plan` presumably kept in sync by webhook handlers reacting to real Stripe events (this sync mechanism needs to be re-confirmed by reading `webhook.service.ts`/`billing.repository.ts` at Milestone 3 kickoff — not assumed here from memory of Phase 9's summary alone).

Two real options:
1. **Direct write to `organizations.plan`.** Fast, simple, no new schema. Risk: desyncs from what `subscriptions`/Stripe actually reports, and the next real Stripe webhook event could silently overwrite the admin's override back to whatever Stripe thinks is true — meaning an override might not actually stick, which would be a broken feature reported as working.
2. **Provider-driven override**, going through `billing-provider.ts`'s existing abstraction to actually change the Stripe subscription (or, if no real subscription exists for a manually-comped org, creating a synthetic internal-only subscription record) so `subscriptions` stays authoritative and the existing webhook sync logic doesn't fight the override.

**No migration is proposed until this is decided** — option 2 might need a new `subscriptions.source` or `is_admin_override` column to distinguish an admin-granted plan from a real Stripe subscription; option 1 needs none. This is exactly the kind of decision this planning package is supposed to surface explicitly rather than silently pick.

---

## 4. Usage reset — no migration proposed without your sign-off

`usage_events` (Phase 5) is confirmed, by reading its own schema-file comment, to be an append-only, monthly-partitioned event log intended to never be updated. A literal "reset" (`DELETE`/`UPDATE`) would corrupt historical data that Phase 9's `plan-limits.ts` and any future analytics depend on.

**Proposed (not decided) approach:** a new, small `usage_overrides` table:
```sql
CREATE TABLE usage_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  period text NOT NULL,           -- e.g. '2026-08', matching usage_events' monthly partitioning
  override_type text NOT NULL,    -- e.g. 'reset' | 'credit'
  applied_by uuid NOT NULL REFERENCES users(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
`plan-limits.ts`'s usage-check logic would need to consult this table alongside the raw `usage_events` count for the current period (subtracting/zeroing as appropriate) rather than the event log being mutated. **This is a proposal for Milestone 5 kickoff discussion, not a commitment** — the exact shape depends on re-reading `plan-limits.ts`'s current usage-aggregation query at that time, which was not exhaustively re-verified during this planning pass.

---

## 5. Apply credits — no migration proposed without your sign-off

Confirmed: no "credit" concept exists anywhere in the current schema or `billing-provider.ts`. Two options laid out in `03-milestones.md` Milestone 5 (drive Stripe's real balance/coupon API vs. a new internal ledger table). If the ledger option is chosen:
```sql
CREATE TABLE billing_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  amount_cents integer NOT NULL,
  reason text,
  applied_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
```
Deferred to Milestone 5 kickoff, same as §4.

---

## 6. Impersonation — schema needed, if the "trackable sessions" design is chosen

`03-milestones.md` Milestone 4 recommends a dedicated tracking table (over a pure stateless-JWT-claim approach) so active impersonation sessions can be listed and force-ended by another admin. If approved at Milestone 4's design-review checkpoint:
```sql
CREATE TABLE impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES users(id),
  target_org_id uuid NOT NULL REFERENCES organizations(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  ended_reason text  -- 'expired' | 'manual_end' | 'force_ended_by_other_admin'
);
```
No RLS (admin-only internal-operations data, same pattern as `dead_letter_jobs`/`job_logs`). This is a proposal contingent on Milestone 4's own design-approval checkpoint — not committed here.

---

## 7. Pre-existing, unrelated schema finding worth flagging (not Phase 11's job to fix, but relevant to its User Management UI)

`organization_members`'s `role` CHECK constraint (`packages/db/src/schema/organization-members.ts:31`) still permits `'viewer'`:
```sql
CHECK (role IN ('admin', 'owner', 'member', 'viewer'))
```
Phase 10 Milestone 6 retracted `viewer` as a real role (it was a documentation error, not a real feature) and confirmed no application code anywhere creates or checks for it. This is dead-but-harmless at the constraint level. **Relevant to Phase 11 only in this narrow sense:** the new User Management admin UI (Milestone 2) must not present `viewer` as a selectable/displayable org role anywhere, since doing so would resurrect a fictitious role in a user-facing surface. Tightening the CHECK constraint itself is a separate, optional cleanup — not proposed as Phase 11 scope, just flagged so it isn't accidentally reintroduced.

---

## 8. Summary table

| Table | Change | Milestone | Risk |
|---|---|---|---|
| `users` | +3 nullable columns, +1 partial index | 2 | Low — additive, no data migration |
| `organizations` | +3 nullable columns, +1 partial index | 3 | Low — additive, no data migration |
| `organizations` / `subscriptions` | Plan-override write path — **decision pending** | 3 | Depends on decision |
| `usage_overrides` (new table) | **Proposal pending** | 5 | Low if built as proposed (purely additive, new table) |
| `billing_credits` (new table) | **Proposal pending, contingent on Stripe-vs-ledger decision** | 5 | Low if built; medium if it becomes a second source of truth vs. Stripe |
| `impersonation_sessions` (new table) | **Proposal pending Milestone 4 design approval** | 4 | Low as schema; the *behavior* it supports is the real risk (see `07-security-impact.md`) |
| `audit_logs` | No new migration — 0012 already sufficient | 1 | None (schema already correct) |

No destructive schema changes are proposed anywhere in Phase 11. Every migration above is additive (new nullable columns or entirely new tables) and independently rollback-safe.
