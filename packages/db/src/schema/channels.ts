import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';

// Global (shared across all tenants) -- no RLS.
export const channels = pgTable(
  'channels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platform: text('platform').notNull().default('youtube'),
    platformChannelId: text('platform_channel_id').notNull(),
    name: text('name').notNull(),
    handle: text('handle'),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    subscriberEstimate: bigint('subscriber_estimate', { mode: 'number' }),
    avgViews: bigint('avg_views', { mode: 'number' }),
    avgDurationSecs: integer('avg_duration_secs'),
    uploadFrequency: numeric('upload_frequency', { precision: 5, scale: 2 }),
    growthScore: numeric('growth_score', { precision: 5, scale: 2 }),
    topicFocus: text('topic_focus').array(),
    postingSchedule: jsonb('posting_schedule'),
    lastAnalysedAt: timestamp('last_analysed_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex('uq_channels_platform_id').on(table.platform, table.platformChannelId),
    index('idx_channels_platform').on(table.platform),
    index('idx_channels_growth_score').on(table.growthScore.desc()),
    check('channels_platform_check', sql`${table.platform} IN ('youtube', 'tiktok', 'instagram')`),
  ],
);
