import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

export type AlertRuleRow = typeof schema.alertRules.$inferSelect;

// RLS-protected (org_id) -- every query here must run inside withTenant().
export async function listAlertRulesForOrg(
  db: Database,
  tenant: TenantContext,
  limit: number,
  offset: number,
): Promise<{ rows: AlertRuleRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const where = isNull(schema.alertRules.deletedAt);
    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.alertRules)
        .where(where)
        .orderBy(desc(schema.alertRules.createdAt))
        .limit(limit)
        .offset(offset),
      tx
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.alertRules)
        .where(where),
    ]);
    return { rows, total: count };
  });
}

export async function countActiveAlertRulesForOrg(
  db: Database,
  tenant: TenantContext,
): Promise<number> {
  return withTenant(db, tenant, async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.alertRules)
      .where(isNull(schema.alertRules.deletedAt));
    return count;
  });
}

export async function findAlertRuleById(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<AlertRuleRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.alertRules)
      .where(and(eq(schema.alertRules.id, id), isNull(schema.alertRules.deletedAt)));
    return row;
  });
}

export async function createAlertRule(
  db: Database,
  tenant: TenantContext,
  input: {
    watchlistId: string | null;
    name: string;
    triggerType: string;
    thresholdValue: number | null;
    deliveryChannels: unknown[];
  },
): Promise<AlertRuleRow> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .insert(schema.alertRules)
      .values({
        orgId: tenant.orgId,
        watchlistId: input.watchlistId,
        createdBy: tenant.userId,
        name: input.name,
        triggerType: input.triggerType,
        thresholdValue: input.thresholdValue !== null ? String(input.thresholdValue) : null,
        deliveryChannels: input.deliveryChannels,
      })
      .returning();
    return row;
  });
}

export async function updateAlertRule(
  db: Database,
  tenant: TenantContext,
  id: string,
  input: Partial<{
    name: string;
    thresholdValue: number | null;
    deliveryChannels: unknown[];
    isActive: boolean;
  }>,
): Promise<AlertRuleRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const { thresholdValue, ...rest } = input;
    const [row] = await tx
      .update(schema.alertRules)
      .set({
        ...rest,
        ...(thresholdValue !== undefined
          ? { thresholdValue: thresholdValue !== null ? String(thresholdValue) : null }
          : {}),
      })
      .where(and(eq(schema.alertRules.id, id), isNull(schema.alertRules.deletedAt)))
      .returning();
    return row;
  });
}

export async function softDeleteAlertRule(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<boolean> {
  return withTenant(db, tenant, async (tx) => {
    const rows = await tx
      .update(schema.alertRules)
      .set({ deletedAt: new Date() })
      .where(and(eq(schema.alertRules.id, id), isNull(schema.alertRules.deletedAt)))
      .returning({ id: schema.alertRules.id });
    return rows.length > 0;
  });
}
