import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { channels } from './channels.js';

// Global (shared across all tenants) -- no RLS. See PROJECT_STATUS.md DEC-015.
export const videos = pgTable(
  'videos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: text('platform').notNull().default('youtube'),
    platformVideoId: text('platform_video_id').notNull(),
    channelId: uuid('channel_id').references(() => channels.id),
    url: text('url').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    tags: text('tags').array(),
    thumbnailUrl: text('thumbnail_url'),
    durationSecs: integer('duration_secs'),
    language: text('language'),
    category: text('category'),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    viewCount: bigint('view_count', { mode: 'number' }).default(0),
    likeCount: bigint('like_count', { mode: 'number' }).default(0),
    commentCount: bigint('comment_count', { mode: 'number' }).default(0),
    viewsPerDay: numeric('views_per_day', { precision: 12, scale: 2 }),
    likesRatio: numeric('likes_ratio', { precision: 5, scale: 4 }),
    commentsRatio: numeric('comments_ratio', { precision: 5, scale: 4 }),

    analysisStatus: text('analysis_status').notNull().default('pending'),
    transcriptStatus: text('transcript_status').notNull().default('pending'),
    lastAnalysedAt: timestamp('last_analysed_at', { withTimezone: true }),

    viralScore: numeric('viral_score', { precision: 5, scale: 2 }),
    viralScoreConfidence: numeric('viral_score_confidence', { precision: 3, scale: 2 }),
    viralScoreComputedAt: timestamp('viral_score_computed_at', { withTimezone: true }),

    ...auditColumns(),
  },
  (table) => [
    uniqueIndex('uq_videos_platform_id').on(table.platform, table.platformVideoId),
    index('idx_videos_channel_id').on(table.channelId),
    index('idx_videos_viral_score').on(table.viralScore.desc().nullsLast()),
    index('idx_videos_published_at').on(table.publishedAt.desc()),
    index('idx_videos_analysis_status').on(table.analysisStatus),
    index('idx_videos_language').on(table.language),
    index('idx_videos_category').on(table.category),
    check('videos_platform_check', sql`${table.platform} IN ('youtube', 'tiktok', 'instagram')`),
    check(
      'videos_analysis_status_check',
      sql`${table.analysisStatus} IN ('pending', 'queued', 'processing', 'complete', 'failed', 'stale')`,
    ),
    check(
      'videos_transcript_status_check',
      sql`${table.transcriptStatus} IN ('pending', 'available', 'unavailable', 'failed')`,
    ),
  ],
);
