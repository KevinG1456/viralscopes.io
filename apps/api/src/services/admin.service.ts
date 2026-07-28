import type { Database } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import { enqueueWorkflowJob, type WorkflowQueue } from '../lib/queue.js';
import {
  findDeadLetterJobById,
  getPlatformMetrics,
  listDeadLetterJobs,
  listJobLogs,
  listOrganizations,
  listUsers,
  markDeadLetterJobForRetry,
  type AdminUserRow,
  type DeadLetterJobRow,
  type JobLogFilters,
  type JobLogRow,
  type OrganizationRow,
  type PlatformMetrics,
} from '../repositories/admin.repository.js';

export class AdminService {
  constructor(private readonly db: Database) {}

  async listUsers(
    pagination: PaginationQuery,
  ): Promise<{ rows: AdminUserRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listUsers(this.db, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async listOrganizations(
    pagination: PaginationQuery,
  ): Promise<{ rows: OrganizationRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listOrganizations(this.db, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async listJobs(
    filters: JobLogFilters,
    pagination: PaginationQuery,
  ): Promise<{ rows: JobLogRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listJobLogs(this.db, filters, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async listDeadLetterJobs(
    resolved: boolean | undefined,
    pagination: PaginationQuery,
  ): Promise<{ rows: DeadLetterJobRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listDeadLetterJobs(this.db, resolved, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  /**
   * Increments the retry counter and clears the last-attempt timestamp on
   * a dead-letter row. As of Phase 6, if `workflowName` matches a
   * currently-registered queue, the original payload is genuinely
   * re-enqueued (a real replay, run through the same retry/dead-letter
   * path as any other job); otherwise this is honest bookkeeping only --
   * there is no queue to dispatch that workflow name onto.
   */
  async retryDeadLetterJob(
    id: string,
    workflowQueues: Map<string, WorkflowQueue>,
  ): Promise<{ job: DeadLetterJobRow; requeued: boolean }> {
    const existing = await findDeadLetterJobById(this.db, id);
    if (!existing) {
      throw new AppError('DEAD_LETTER_JOB_NOT_FOUND', 'Dead-letter job not found.', 404);
    }
    const updated = await markDeadLetterJobForRetry(this.db, id);
    if (!updated) {
      throw new AppError('DEAD_LETTER_JOB_NOT_FOUND', 'Dead-letter job not found.', 404);
    }

    const workflowQueue = workflowQueues.get(updated.workflowName);
    if (!workflowQueue) {
      return { job: updated, requeued: false };
    }

    await enqueueWorkflowJob(workflowQueue, {
      workflowName: updated.workflowName,
      payload: updated.originalPayload as Record<string, unknown>,
    });
    return { job: updated, requeued: true };
  }

  async metrics(): Promise<PlatformMetrics> {
    return getPlatformMetrics(this.db);
  }
}
