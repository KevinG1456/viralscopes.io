import { index, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';
import { videos } from './videos.js';

// Tenant-scoped (each org gets its own recommendations per video) -- RLS
// enabled via org_id, see migration 0003.
export const recommendations = pgTable(
  'recommendations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    videoId: uuid('video_id')
      .notNull()
      .references(() => videos.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    titleConcept: text('title_concept'),
    hookConcept: text('hook_concept'),
    contentOutline: jsonb('content_outline'),
    thumbnailConcept: text('thumbnail_concept'),
    keywords: text('keywords').array(),
    ctaSuggestion: text('cta_suggestion'),
    toneNotes: text('tone_notes'),
    promptVersion: text('prompt_version').notNull(),
    modelUsed: text('model_used').notNull(),
    ...auditColumns(),
  },
  (table) => [
    index('idx_recommendations_video_id').on(table.videoId),
    index('idx_recommendations_org_id').on(table.orgId),
    uniqueIndex('uq_recommendations_video_org').on(table.videoId, table.orgId),
  ],
);
