import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Execution log for n8n workflow runs. Partitioned by month on created_at
// (migration 0004). Retention: 60 days. See usage-events.ts for why the
// primary key includes created_at. No RLS -- admin-only internal operations data.
export const jobLogs = pgTable(
  'job_logs',
  {
    id: uuid('id').notNull().defaultRandom(),
    workflowName: text('workflow_name').notNull(),
    workflowId: text('workflow_id'),
    executionId: text('execution_id'),
    status: text('status').notNull(),
    triggerType: text('trigger_type').notNull(),
    inputSummary: jsonb('input_summary').notNull().default({}),
    outputSummary: jsonb('output_summary').notNull().default({}),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    durationMs: integer('duration_ms'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    index('idx_job_logs_workflow_name').on(table.workflowName, table.createdAt.desc()),
    index('idx_job_logs_status').on(table.status, table.createdAt.desc()),
    // Migration 0008: looked up by execution_id (the BullMQ job id) as a
    // job progresses through started -> retrying -> completed/failed.
    index('idx_job_logs_execution_id').on(table.executionId),
    check(
      'job_logs_status_check',
      sql`${table.status} IN ('started', 'completed', 'failed', 'retrying')`,
    ),
    check(
      'job_logs_trigger_type_check',
      sql`${table.triggerType} IN ('cron', 'manual', 'webhook', 'queue')`,
    ),
  ],
);
