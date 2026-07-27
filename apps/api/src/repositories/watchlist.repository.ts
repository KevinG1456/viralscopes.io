import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

export type WatchlistRow = typeof schema.watchlists.$inferSelect;

// RLS-protected (org_id) -- every query here must run inside withTenant().
export async function listWatchlistsForOrg(
  db: Database,
  tenant: TenantContext,
  limit: number,
  offset: number,
): Promise<{ rows: WatchlistRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const where = isNull(schema.watchlists.deletedAt);
    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.watchlists)
        .where(where)
        .orderBy(desc(schema.watchlists.createdAt))
        .limit(limit)
        .offset(offset),
      tx
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.watchlists)
        .where(where),
    ]);
    return { rows, total: count };
  });
}

export async function countActiveWatchlistsForOrg(
  db: Database,
  tenant: TenantContext,
): Promise<number> {
  return withTenant(db, tenant, async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.watchlists)
      .where(isNull(schema.watchlists.deletedAt));
    return count;
  });
}

export async function findWatchlistById(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<WatchlistRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.watchlists)
      .where(and(eq(schema.watchlists.id, id), isNull(schema.watchlists.deletedAt)));
    return row;
  });
}

export async function createWatchlist(
  db: Database,
  tenant: TenantContext,
  input: {
    workspaceId: string | null;
    name: string;
    type: string;
    target: string;
    targetMetadata: Record<string, unknown>;
  },
): Promise<WatchlistRow> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .insert(schema.watchlists)
      .values({
        orgId: tenant.orgId,
        workspaceId: input.workspaceId,
        createdBy: tenant.userId,
        name: input.name,
        type: input.type,
        target: input.target,
        targetMetadata: input.targetMetadata,
      })
      .returning();
    return row;
  });
}

export async function updateWatchlist(
  db: Database,
  tenant: TenantContext,
  id: string,
  input: Partial<{
    name: string;
    target: string;
    targetMetadata: Record<string, unknown>;
    isActive: boolean;
  }>,
): Promise<WatchlistRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .update(schema.watchlists)
      .set(input)
      .where(and(eq(schema.watchlists.id, id), isNull(schema.watchlists.deletedAt)))
      .returning();
    return row;
  });
}

export async function softDeleteWatchlist(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<boolean> {
  return withTenant(db, tenant, async (tx) => {
    const rows = await tx
      .update(schema.watchlists)
      .set({ deletedAt: new Date() })
      .where(and(eq(schema.watchlists.id, id), isNull(schema.watchlists.deletedAt)))
      .returning({ id: schema.watchlists.id });
    return rows.length > 0;
  });
}
