import { type Database, schema } from '@viralscopes/db';
import { eq, sql } from 'drizzle-orm';

export type JobLogRow = typeof schema.jobLogs.$inferSelect;

// job_logs is partitioned by month on created_at (migration 0004) and has
// no RLS ("admin-only internal operations data" -- job-logs.ts). Looked up
// by execution_id (migration 0008 adds the index this needs) rather than
// the (id, created_at) composite primary key, since callers only have the
// BullMQ job id (stored as execution_id) at update time.

export async function createJobLog(
  db: Database,
  input: {
    workflowName: string;
    workflowId: string;
    executionId: string;
    triggerType: string;
    inputSummary: Record<string, unknown>;
  },
): Promise<JobLogRow> {
  const [row] = await db
    .insert(schema.jobLogs)
    .values({
      workflowName: input.workflowName,
      workflowId: input.workflowId,
      executionId: input.executionId,
      status: 'started',
      triggerType: input.triggerType,
      inputSummary: input.inputSummary,
    })
    .returning();
  return row;
}

export async function markJobLogRetrying(
  db: Database,
  executionId: string,
  retryCount: number,
): Promise<void> {
  await db
    .update(schema.jobLogs)
    .set({ status: 'retrying', retryCount })
    .where(eq(schema.jobLogs.executionId, executionId));
}

export async function markJobLogCompleted(
  db: Database,
  executionId: string,
  outputSummary: Record<string, unknown>,
): Promise<void> {
  await db
    .update(schema.jobLogs)
    .set({
      status: 'completed',
      outputSummary,
      completedAt: sql`now()`,
      durationMs: sql<number>`(extract(epoch from (now() - ${schema.jobLogs.startedAt})) * 1000)::int`,
    })
    .where(eq(schema.jobLogs.executionId, executionId));
}

export async function findJobLogByExecutionId(
  db: Database,
  executionId: string,
): Promise<JobLogRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.jobLogs)
    .where(eq(schema.jobLogs.executionId, executionId));
  return row;
}

export async function markJobLogFailed(
  db: Database,
  executionId: string,
  errorMessage: string,
): Promise<void> {
  await db
    .update(schema.jobLogs)
    .set({
      status: 'failed',
      errorMessage,
      completedAt: sql`now()`,
      durationMs: sql<number>`(extract(epoch from (now() - ${schema.jobLogs.startedAt})) * 1000)::int`,
    })
    .where(eq(schema.jobLogs.executionId, executionId));
}
