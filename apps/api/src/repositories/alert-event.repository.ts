import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

export type AlertEventRow = typeof schema.alertEvents.$inferSelect;

export interface AlertEventListFilters {
  alertRuleId?: string;
  status?: string;
}

// Immutable dispatch log (written by Phase 6's Alert Dispatch workflow --
// not created via this API). RLS-protected (org_id) -- every query here
// must run inside withTenant().
export async function listAlertEventsForOrg(
  db: Database,
  tenant: TenantContext,
  filters: AlertEventListFilters,
  limit: number,
  offset: number,
): Promise<{ rows: AlertEventRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const conditions = [
      filters.alertRuleId ? eq(schema.alertEvents.alertRuleId, filters.alertRuleId) : undefined,
      filters.status ? eq(schema.alertEvents.status, filters.status) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.alertEvents)
        .where(where)
        .orderBy(desc(schema.alertEvents.createdAt))
        .limit(limit)
        .offset(offset),
      tx
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.alertEvents)
        .where(where),
    ]);
    return { rows, total: count };
  });
}

export async function countAlertEventsByStatusSince(
  db: Database,
  tenant: TenantContext,
  since: Date,
): Promise<Record<string, number>> {
  const rows = await withTenant(db, tenant, (tx) =>
    tx
      .select({ status: schema.alertEvents.status, count: sql<number>`count(*)::int` })
      .from(schema.alertEvents)
      .where(gte(schema.alertEvents.createdAt, since))
      .groupBy(schema.alertEvents.status),
  );

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}
