import { type Database, schema } from '@viralscopes/db';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

export type VideoRow = typeof schema.videos.$inferSelect;

export interface VideoListFilters {
  platform?: string;
  category?: string;
  language?: string;
  minViralScore?: number;
  publishedAfter?: Date;
  publishedBefore?: Date;
}

// Global content table (no RLS, no org scoping) -- see videos.ts's own
// comment. Every filter here is optional; an empty filter set just lists
// the most recent videos by viral score.
export async function listVideos(
  db: Database,
  filters: VideoListFilters,
  limit: number,
  offset: number,
): Promise<{ rows: VideoRow[]; total: number }> {
  const conditions = [
    filters.platform ? eq(schema.videos.platform, filters.platform) : undefined,
    filters.category ? eq(schema.videos.category, filters.category) : undefined,
    filters.language ? eq(schema.videos.language, filters.language) : undefined,
    filters.minViralScore !== undefined
      ? gte(schema.videos.viralScore, String(filters.minViralScore))
      : undefined,
    filters.publishedAfter ? gte(schema.videos.publishedAt, filters.publishedAfter) : undefined,
    filters.publishedBefore ? lte(schema.videos.publishedAt, filters.publishedBefore) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.videos)
      .where(where)
      .orderBy(desc(schema.videos.viralScore))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.videos)
      .where(where),
  ]);

  return { rows, total: count };
}

export interface VideoDetail {
  video: VideoRow;
  analysis: typeof schema.videoAnalyses.$inferSelect | null;
  thumbnailAnalysis: typeof schema.thumbnailAnalyses.$inferSelect | null;
  titleAnalysis: typeof schema.titleAnalyses.$inferSelect | null;
  transcript: typeof schema.transcripts.$inferSelect | null;
}

export async function findVideoById(db: Database, id: string): Promise<VideoDetail | undefined> {
  const [row] = await db
    .select({
      video: schema.videos,
      analysis: schema.videoAnalyses,
      thumbnailAnalysis: schema.thumbnailAnalyses,
      titleAnalysis: schema.titleAnalyses,
      transcript: schema.transcripts,
    })
    .from(schema.videos)
    .where(eq(schema.videos.id, id))
    .leftJoin(schema.videoAnalyses, eq(schema.videoAnalyses.videoId, schema.videos.id))
    .leftJoin(schema.thumbnailAnalyses, eq(schema.thumbnailAnalyses.videoId, schema.videos.id))
    .leftJoin(schema.titleAnalyses, eq(schema.titleAnalyses.videoId, schema.videos.id))
    .leftJoin(schema.transcripts, eq(schema.transcripts.videoId, schema.videos.id));

  return row;
}
