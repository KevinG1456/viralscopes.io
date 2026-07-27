import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { desc, eq, sql } from 'drizzle-orm';

export type RecommendationRow = typeof schema.recommendations.$inferSelect;

// RLS-protected (org_id) -- every query here must run inside withTenant().
export async function listRecommendationsForOrg(
  db: Database,
  tenant: TenantContext,
  limit: number,
  offset: number,
): Promise<{ rows: RecommendationRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.recommendations)
        .orderBy(desc(schema.recommendations.createdAt))
        .limit(limit)
        .offset(offset),
      tx.select({ count: sql<number>`count(*)::int` }).from(schema.recommendations),
    ]);
    return { rows, total: count };
  });
}

export async function findRecommendationsForVideo(
  db: Database,
  tenant: TenantContext,
  videoId: string,
): Promise<RecommendationRow[]> {
  return withTenant(db, tenant, (tx) =>
    tx.select().from(schema.recommendations).where(eq(schema.recommendations.videoId, videoId)),
  );
}
