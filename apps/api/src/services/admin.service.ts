import type { Database } from '@viralscopes/db';
import type { Redis } from 'ioredis';

import { getAiCacheStats, type AiCacheStats } from '../lib/ai-cache.js';
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
  constructor(
    private readonly db: Database,
    private readonly redis: Redis,
  ) {}

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

  /**
   * `aiCache` is a real, measurable metric (Redis hit/miss counters) even
   * with zero AI traffic so far. A GBP cost estimate (`ai_cost_estimate_gbp_today`
   * in AI_Strategy.md section 5.2) is deliberately not included -- it would
   * require actual AI call volume and token counts to derive from, neither
   * of which exist without live provider credentials (see TD-023 in
   * PROJECT_STATUS.md). Fabricating a placeholder number here would be
   * worse than omitting the field.
   */
  async metrics(): Promise<PlatformMetrics & { aiCache: AiCacheStats }> {
    const [dbMetrics, aiCache] = await Promise.all([
      getPlatformMetrics(this.db),
      getAiCacheStats(this.redis),
    ]);
    return { ...dbMetrics, aiCache };
  }
}
