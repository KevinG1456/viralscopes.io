import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';

// No auditLog() helper existed anywhere in this codebase before this
// (TD-013: audit_logs has existed since Phase 3, nothing has ever written
// to it). Phase 9's webhook handler is the first real caller. RLS-protected
// (org_id, migration 0003) -- every write here runs inside withTenant(),
// which is safe because callers already resolve org_id from the billing
// provider's own event metadata before calling this (see DEC-027 in
// PROJECT_STATUS.md), never by looking a provider id up in the database
// first.
export interface AuditLogInput {
  userId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  /** Never include secrets, card numbers, or full webhook payloads here -- see billing_events.raw_payload for that. */
  metadata?: Record<string, unknown>;
}

export async function auditLog(
  db: Database,
  tenant: TenantContext,
  input: AuditLogInput,
): Promise<void> {
  await withTenant(db, tenant, async (tx) => {
    await tx.insert(schema.auditLogs).values({
      orgId: tenant.orgId,
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata ?? {},
    });
  });
}
