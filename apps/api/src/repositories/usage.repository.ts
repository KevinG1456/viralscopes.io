import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { gte, sql } from 'drizzle-orm';

export interface UsageByEventType {
  eventType: string;
  quantity: number;
}

// RLS-protected (org_id) -- every query here must run inside withTenant().
// usage_events is partitioned monthly (migration 0004); `periodStart` should
// always be the first of a calendar month for the query to land on a
// single partition.
export async function sumUsageSince(
  db: Database,
  tenant: TenantContext,
  periodStart: Date,
): Promise<UsageByEventType[]> {
  return withTenant(db, tenant, (tx) =>
    tx
      .select({
        eventType: schema.usageEvents.eventType,
        quantity: sql<number>`sum(${schema.usageEvents.quantity})::int`,
      })
      .from(schema.usageEvents)
      .where(gte(schema.usageEvents.createdAt, periodStart))
      .groupBy(schema.usageEvents.eventType),
  );
}
