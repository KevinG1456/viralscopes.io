import type { Database } from '@viralscopes/db';
import { Queue, QueueEvents, Worker, type Job } from 'bullmq';
import type { FastifyBaseLogger } from 'fastify';
import { Redis } from 'ioredis';

import type { AppConfig } from '../config.js';
import { createDeadLetterJob } from '../repositories/dead-letter.repository.js';
import {
  createJobLog,
  markJobLogCompleted,
  markJobLogFailed,
  markJobLogRetrying,
} from '../repositories/job-log.repository.js';

// INFRASTRUCTURE_GROWTH_PLAN.md §10.5 "Dead-Letter Queue Strategy": 1st
// retry immediate, 2nd after 30s, 3rd after 5min, then dead-letter. BullMQ
// counts the original attempt as attemptsMade=1 on its first failure, so
// this array is indexed by (attemptsMade - 1) for attemptsMade 1..3 -- the
// 4th failure (attemptsMade === MAX_ATTEMPTS) exhausts retries.
const RETRY_DELAYS_MS = [0, 30_000, 5 * 60_000] as const;
export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

function backoffStrategy(attemptsMade: number): number {
  return RETRY_DELAYS_MS[attemptsMade - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
}

// BullMQ requires a dedicated connection per Queue/Worker/QueueEvents (not
// shared with the app's other ioredis usage -- rate limiting, lockout) and
// `maxRetriesPerRequest: null` specifically for the blocking connections
// Worker/QueueEvents hold open.
function createBullConnection(redisUrl: string): Redis {
  return new Redis(redisUrl, { maxRetriesPerRequest: null });
}

export function queueName(priority: 'high' | 'standard' | 'low', workflow: string): string {
  // Naming convention: INFRASTRUCTURE_GROWTH_PLAN.md §10.4 documents
  // "viralscopes:<priority>:<workflow-name>" -- BullMQ rejects colons in
  // queue names outright (confirmed live: "Queue name cannot contain :"),
  // since it uses colons internally for Redis key namespacing. Same
  // priority:workflow structure, dash-separated instead.
  return `viralscopes-${priority}-${workflow}`;
}

export interface WorkflowJobData {
  workflowName: string;
  payload: Record<string, unknown>;
}

export interface WorkflowJobResult {
  success: boolean;
  message?: string;
}

/**
 * Dispatches one job's payload to n8n's webhook for that workflow and
 * awaits the result. This is the ONLY thing n8n is asked to do -- react to
 * a webhook call and report success/failure. Everything else (retry
 * scheduling, attempt counting, dead-letter transition, job_logs writes)
 * happens here, in the backend, per the Phase 6 architecture constraint
 * that business rules/persistence never live in n8n.
 */
async function dispatchToN8n(
  config: AppConfig,
  webhookPath: string,
  data: WorkflowJobData,
  attempt: number,
): Promise<WorkflowJobResult> {
  const url = `${config.n8n.internalUrl}/webhook/${webhookPath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': config.n8n.serviceToken,
      },
      body: JSON.stringify({ ...data, attempt }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { success: false, message: `n8n webhook responded ${res.status}` };
    }
    const body = (await res.json()) as Partial<WorkflowJobResult>;
    return { success: body.success === true, message: body.message };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timeout);
  }
}

export interface WorkflowQueue {
  queue: Queue<WorkflowJobData>;
  close: () => Promise<void>;
}

/**
 * Creates a BullMQ queue + an in-process worker that hands each job to
 * n8n's webhook for `webhookPath`, plus a QueueEvents listener that writes
 * every attempt to `job_logs` and, on final exhaustion, to
 * `dead_letter_jobs` -- ROADMAP.md Phase 6 Setup: "Dead-letter handling:
 * on max retries -> write to dead_letter_jobs -> admin notification" (the
 * notification itself is a log line for now -- real alerting needs a real
 * email/notification provider, see TD-010 in PROJECT_STATUS.md).
 */
export function createWorkflowQueue(
  db: Database,
  config: AppConfig,
  logger: FastifyBaseLogger,
  name: string,
  webhookPath: string,
): WorkflowQueue {
  const queueConnection = createBullConnection(config.redisUrl);
  const workerConnection = createBullConnection(config.redisUrl);
  const eventsConnection = createBullConnection(config.redisUrl);

  const queue = new Queue<WorkflowJobData>(name, { connection: queueConnection });

  const worker = new Worker<WorkflowJobData, WorkflowJobResult>(
    name,
    async (job: Job<WorkflowJobData>) => {
      const result = await dispatchToN8n(config, webhookPath, job.data, job.attemptsMade + 1);
      if (!result.success) {
        throw new Error(result.message ?? 'n8n reported failure');
      }
      return result;
    },
    {
      connection: workerConnection,
      settings: { backoffStrategy },
    },
  );
  // Surface worker-level errors (e.g. a lost Redis connection) instead of
  // an unhandled 'error' event crashing the process.
  worker.on('error', (err) => {
    logger.error({ err, queue: name }, 'BullMQ worker error');
  });

  const events = new QueueEvents(name, { connection: eventsConnection });

  events.on('active', ({ jobId }) => {
    void (async () => {
      const job = await queue.getJob(jobId);
      if (!job) return;
      if (job.attemptsMade === 0) {
        await createJobLog(db, {
          workflowName: job.data.workflowName,
          workflowId: name,
          executionId: jobId,
          triggerType: 'queue',
          inputSummary: job.data.payload,
        });
      } else {
        await markJobLogRetrying(db, jobId, job.attemptsMade);
      }
    })();
  });

  events.on('completed', ({ jobId, returnvalue }) => {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(returnvalue) as Record<string, unknown>;
    } catch {
      // returnvalue not JSON-parseable -- store nothing rather than guess.
    }
    void markJobLogCompleted(db, jobId, parsed);
  });

  events.on('retries-exhausted', ({ jobId, attemptsMade }) => {
    void (async () => {
      const job = await queue.getJob(jobId);
      const reason = job?.failedReason ?? 'Retries exhausted';
      await markJobLogFailed(db, jobId, reason);
      await createDeadLetterJob(db, {
        workflowName: job?.data.workflowName ?? name,
        originalPayload: job?.data.payload ?? {},
        errorMessage: reason,
        retryAttempts: Number(attemptsMade),
      });
      // Admin notification stub: a real notification channel (email/Slack)
      // needs TD-010's real transactional email service, not built yet.
      // This structured error-level log is the honest interim signal.
      logger.error(
        { queue: name, jobId, attemptsMade, reason },
        'Job exhausted all retries and was moved to dead_letter_jobs',
      );
    })();
  });

  return {
    queue,
    close: async () => {
      await worker.close();
      await events.close();
      await queue.close();
      queueConnection.disconnect();
      workerConnection.disconnect();
      eventsConnection.disconnect();
    },
  };
}

export async function enqueueWorkflowJob(
  workflowQueue: WorkflowQueue,
  data: WorkflowJobData,
): Promise<string> {
  const job = await workflowQueue.queue.add(data.workflowName, data, {
    attempts: MAX_ATTEMPTS,
    backoff: { type: 'custom' },
    removeOnComplete: { age: 24 * 60 * 60 },
    removeOnFail: false,
  });
  if (!job.id) {
    throw new Error('BullMQ did not assign a job id');
  }
  return job.id;
}
