import { sql } from 'drizzle-orm';
import { check, index, jsonb, numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { videos } from './videos.js';

// Global (shared across all tenants) -- no RLS.
export const videoAnalyses = pgTable(
  'video_analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id')
      .notNull()
      .unique()
      .references(() => videos.id, { onDelete: 'cascade' }),

    // Hook analysis
    hookType: text('hook_type'),
    hookConfidence: numeric('hook_confidence', { precision: 3, scale: 2 }),
    hookSummary: text('hook_summary'),

    // Content structure
    storyStructure: text('story_structure'),
    narrativeArc: text('narrative_arc'),
    contentSummary: text('content_summary'),

    // Audience
    targetAudience: text('target_audience'),
    audienceLevel: text('audience_level'),
    primaryEmotion: text('primary_emotion'),

    // Performance drivers
    retentionTactics: text('retention_tactics').array(),
    keyThemes: text('key_themes').array(),
    viralityDrivers: text('virality_drivers').array(),
    contentWeaknesses: text('content_weaknesses').array(),

    // CTA
    ctaType: text('cta_type'),
    ctaText: text('cta_text'),

    rawOutput: jsonb('raw_output'),
    promptVersion: text('prompt_version').notNull(),
    modelUsed: text('model_used').notNull(),
    ...auditColumns(),
  },
  (table) => [
    index('idx_video_analyses_video_id').on(table.videoId),
    index('idx_video_analyses_hook_type').on(table.hookType),
    index('idx_video_analyses_story_structure').on(table.storyStructure),
    check(
      'video_analyses_hook_type_check',
      sql`${table.hookType} IN ('question', 'shock', 'statistic', 'fear', 'story', 'mystery', 'promise', 'curiosity', 'humour')`,
    ),
    check(
      'video_analyses_audience_level_check',
      sql`${table.audienceLevel} IN ('beginner', 'intermediate', 'advanced', 'all')`,
    ),
  ],
);
