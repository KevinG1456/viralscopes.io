import { type Database, schema } from '@viralscopes/db';

export type DeadLetterJobRow = typeof schema.deadLetterJobs.$inferSelect;

// No RLS ("admin-only internal operations data" -- dead-letter-jobs.ts).
export async function createDeadLetterJob(
  db: Database,
  input: {
    workflowName: string;
    originalPayload: Record<string, unknown>;
    errorMessage: string;
    retryAttempts: number;
  },
): Promise<DeadLetterJobRow> {
  const [row] = await db
    .insert(schema.deadLetterJobs)
    .values({
      workflowName: input.workflowName,
      originalPayload: input.originalPayload,
      errorMessage: input.errorMessage,
      retryAttempts: input.retryAttempts,
      lastAttemptAt: new Date(),
    })
    .returning();
  return row;
}
