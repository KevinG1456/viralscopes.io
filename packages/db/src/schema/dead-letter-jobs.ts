import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users.js';

// Admin-only, no RLS. Retention: 30 days post-resolution.
export const deadLetterJobs = pgTable(
  'dead_letter_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workflowName: text('workflow_name').notNull(),
    originalPayload: jsonb('original_payload').notNull(),
    errorMessage: text('error_message').notNull(),
    errorStack: text('error_stack'),
    retryAttempts: integer('retry_attempts').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    resolved: boolean('resolved').notNull().default(false),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolutionNotes: text('resolution_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_dead_letter_jobs_workflow_name').on(table.workflowName),
    index('idx_dead_letter_jobs_resolved').on(table.resolved, table.createdAt),
  ],
);
