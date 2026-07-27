import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { videos } from './videos.js';

// Global (shared across all tenants) -- no RLS.
export const titleAnalyses = pgTable(
  'title_analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id')
      .notNull()
      .unique()
      .references(() => videos.id, { onDelete: 'cascade' }),
    formulaType: text('formula_type'),
    formulaTemplate: text('formula_template'),
    keywords: text('keywords').array(),
    powerWords: text('power_words').array(),
    characterCount: integer('character_count'),
    wordCount: integer('word_count'),
    hasNumber: boolean('has_number'),
    numberValue: integer('number_value'),
    sentiment: text('sentiment'),
    titleScore: numeric('title_score', { precision: 5, scale: 2 }),
    rawOutput: jsonb('raw_output'),
    promptVersion: text('prompt_version').notNull(),
    modelUsed: text('model_used').notNull(),
    ...auditColumns(),
  },
  (table) => [
    index('idx_title_analyses_video_id').on(table.videoId),
    index('idx_title_analyses_formula_type').on(table.formulaType),
    check(
      'title_analyses_sentiment_check',
      sql`${table.sentiment} IN ('positive', 'negative', 'neutral', 'curiosity')`,
    ),
  ],
);
