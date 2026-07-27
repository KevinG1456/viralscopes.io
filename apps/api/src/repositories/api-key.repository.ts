import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

export type ApiKeyRow = typeof schema.apiKeys.$inferSelect;

// RLS-protected (org_id) -- every query here must run inside withTenant().
export async function listApiKeysForOrg(
  db: Database,
  tenant: TenantContext,
  limit: number,
  offset: number,
): Promise<{ rows: ApiKeyRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const where = isNull(schema.apiKeys.revokedAt);
    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.apiKeys)
        .where(where)
        .orderBy(desc(schema.apiKeys.createdAt))
        .limit(limit)
        .offset(offset),
      tx
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.apiKeys)
        .where(where),
    ]);
    return { rows, total: count };
  });
}

export async function findApiKeyById(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<ApiKeyRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, id));
    return row;
  });
}

export async function createApiKey(
  db: Database,
  tenant: TenantContext,
  input: {
    name: string;
    keyHash: string;
    keyPrefix: string;
    scopes: string[];
    expiresAt: Date | null;
  },
): Promise<ApiKeyRow> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .insert(schema.apiKeys)
      .values({
        orgId: tenant.orgId,
        createdBy: tenant.userId,
        name: input.name,
        keyHash: input.keyHash,
        keyPrefix: input.keyPrefix,
        scopes: input.scopes,
        expiresAt: input.expiresAt,
      })
      .returning();
    return row;
  });
}

export async function revokeApiKey(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<boolean> {
  return withTenant(db, tenant, async (tx) => {
    const rows = await tx
      .update(schema.apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(schema.apiKeys.id, id), isNull(schema.apiKeys.revokedAt)))
      .returning({ id: schema.apiKeys.id });
    return rows.length > 0;
  });
}
