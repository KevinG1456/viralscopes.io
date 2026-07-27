import { type Database, schema } from '@viralscopes/db';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

export type TrendRow = typeof schema.trends.$inferSelect;

export interface TrendListFilters {
  status?: string;
  platform?: string;
  language?: string;
  minVelocity?: number;
  latestSnapshotOnly?: boolean;
}

const LATEST_SNAPSHOT_DATE = sql`(select max(${schema.trends.snapshotDate}) from ${schema.trends})`;

export async function listTrends(
  db: Database,
  filters: TrendListFilters,
  limit: number,
  offset: number,
): Promise<{ rows: TrendRow[]; total: number }> {
  const conditions = [
    filters.status ? eq(schema.trends.status, filters.status) : undefined,
    filters.platform ? eq(schema.trends.platform, filters.platform) : undefined,
    filters.language ? eq(schema.trends.language, filters.language) : undefined,
    filters.minVelocity !== undefined
      ? gte(schema.trends.velocityScore, String(filters.minVelocity))
      : undefined,
    filters.latestSnapshotOnly ? eq(schema.trends.snapshotDate, LATEST_SNAPSHOT_DATE) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.trends)
      .where(where)
      .orderBy(desc(schema.trends.snapshotDate), desc(schema.trends.velocityScore))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.trends)
      .where(where),
  ]);

  return { rows, total: count };
}

// Opportunities: same table, ranked by opportunityScore, scoped to the
// most recent snapshot date so results aren't dominated by stale history.
export async function listOpportunities(
  db: Database,
  filters: Pick<TrendListFilters, 'platform' | 'language'>,
  limit: number,
  offset: number,
): Promise<{ rows: TrendRow[]; total: number }> {
  const conditions = [
    eq(schema.trends.snapshotDate, LATEST_SNAPSHOT_DATE),
    filters.platform ? eq(schema.trends.platform, filters.platform) : undefined,
    filters.language ? eq(schema.trends.language, filters.language) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = and(...conditions);

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.trends)
      .where(where)
      .orderBy(desc(schema.trends.opportunityScore))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.trends)
      .where(where),
  ]);

  return { rows, total: count };
}
