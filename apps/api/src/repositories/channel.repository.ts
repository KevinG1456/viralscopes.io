import { type Database, schema } from '@viralscopes/db';
import { and, desc, eq, gte, ilike, sql } from 'drizzle-orm';

export type ChannelRow = typeof schema.channels.$inferSelect;

export interface ChannelListFilters {
  platform?: string;
  search?: string;
  minSubscribers?: number;
  minGrowthScore?: number;
}

// Global content table (no RLS, no org scoping) -- see channels.ts's own
// comment.
export async function listChannels(
  db: Database,
  filters: ChannelListFilters,
  limit: number,
  offset: number,
): Promise<{ rows: ChannelRow[]; total: number }> {
  const conditions = [
    filters.platform ? eq(schema.channels.platform, filters.platform) : undefined,
    filters.search ? ilike(schema.channels.name, `%${filters.search}%`) : undefined,
    filters.minSubscribers !== undefined
      ? gte(schema.channels.subscriberEstimate, filters.minSubscribers)
      : undefined,
    filters.minGrowthScore !== undefined
      ? gte(schema.channels.growthScore, String(filters.minGrowthScore))
      : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.channels)
      .where(where)
      .orderBy(desc(schema.channels.growthScore))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.channels)
      .where(where),
  ]);

  return { rows, total: count };
}

export async function findChannelById(db: Database, id: string): Promise<ChannelRow | undefined> {
  const [row] = await db.select().from(schema.channels).where(eq(schema.channels.id, id));
  return row;
}
