import { boolean, index, integer, jsonb, numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { videos } from './videos.js';

// Global (shared across all tenants) -- no RLS.
export const thumbnailAnalyses = pgTable(
  'thumbnail_analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id')
      .notNull()
      .unique()
      .references(() => videos.id, { onDelete: 'cascade' }),
    emotion: text('emotion'),
    facesCount: integer('faces_count'),
    hasText: boolean('has_text'),
    textContent: text('text_content'),
    textDensity: numeric('text_density', { precision: 3, scale: 2 }),
    dominantColors: text('dominant_colors').array(),
    contrastScore: numeric('contrast_score', { precision: 3, scale: 2 }),
    compositionType: text('composition_type'),
    objectsDetected: text('objects_detected').array(),
    backgroundType: text('background_type'),
    ctrPrediction: numeric('ctr_prediction', { precision: 5, scale: 2 }),
    ctrConfidence: numeric('ctr_confidence', { precision: 3, scale: 2 }),
    rawOutput: jsonb('raw_output'),
    promptVersion: text('prompt_version').notNull(),
    modelUsed: text('model_used').notNull(),
    ...auditColumns(),
  },
  (table) => [
    index('idx_thumbnail_analyses_video_id').on(table.videoId),
    index('idx_thumbnail_analyses_ctr_prediction').on(table.ctrPrediction.desc()),
  ],
);
