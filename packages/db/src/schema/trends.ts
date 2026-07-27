import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Global (platform-wide trend data) -- no RLS.
export const trends = pgTable(
  'trends',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topic: text('topic').notNull(),
    platform: text('platform').notNull().default('youtube'),
    language: text('language').notNull().default('en'),
    status: text('status').notNull(),
    velocityScore: numeric('velocity_score', { precision: 5, scale: 2 }),
    growthRate: numeric('growth_rate', { precision: 7, scale: 4 }),
    competitionScore: numeric('competition_score', { precision: 5, scale: 2 }),
    opportunityScore: numeric('opportunity_score', { precision: 5, scale: 2 }),
    videoCount: integer('video_count'),
    avgViralScore: numeric('avg_viral_score', { precision: 5, scale: 2 }),
    topVideoIds: uuid('top_video_ids').array(),
    snapshotDate: date('snapshot_date').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_trends_topic').on(table.topic),
    index('idx_trends_status').on(table.status, table.snapshotDate),
    index('idx_trends_opportunity_score').on(table.opportunityScore.desc()),
    index('idx_trends_snapshot_date').on(table.snapshotDate.desc()),
    uniqueIndex('uq_trends_topic_platform_date').on(
      table.topic,
      table.platform,
      table.language,
      table.snapshotDate,
    ),
    check(
      'trends_status_check',
      sql`${table.status} IN ('emerging', 'evergreen', 'declining', 'unknown')`,
    ),
  ],
);
