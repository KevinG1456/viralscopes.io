import type { Database } from '@viralscopes/db';
import { Queue, Worker } from 'bullmq';
import type { FastifyBaseLogger } from 'fastify';

import type { AppConfig } from '../config.js';
import { createBullConnection } from './queue.js';
import { runAccountPurge } from '../jobs/account-purge.job.js';

const QUEUE_NAME = 'viralscopes-standard-privacy-maintenance';
const REPEATABLE_JOB_NAME = 'account-purge';
// Daily at 07:00 UTC -- one hour after the billing-maintenance job's
// 06:00 slot (lib/billing-maintenance-queue.ts), simply to avoid both
// scheduled maintenance tasks landing in the same minute.
const CRON_PATTERN = '0 7 * * *';

export interface PrivacyMaintenanceQueue {
  close: () => Promise<void>;
}

// Phase 10 Milestone 5: a separate queue from billing-maintenance-queue.ts
// (different concern -- account/PII retention, not billing) but the same
// in-process-BullMQ-worker pattern, not an n8n-dispatched workflow.
export function createPrivacyMaintenanceQueue(
  db: Database,
  config: AppConfig,
  logger: FastifyBaseLogger,
): PrivacyMaintenanceQueue {
  const queueConnection = createBullConnection(config.redisUrl);
  const workerConnection = createBullConnection(config.redisUrl);

  const queue = new Queue(QUEUE_NAME, { connection: queueConnection });

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      return runAccountPurge(db, logger);
    },
    { connection: workerConnection },
  );
  worker.on('error', (err) => {
    logger.error({ err, queue: QUEUE_NAME }, 'BullMQ worker error');
  });

  // Idempotent: upsertJobScheduler() replaces bullmq v5's queue.add({repeat})
  // pattern (removed in v6 -- repeat scheduling is no longer a JobsOptions
  // field). Calling this on every boot does not create duplicate scheduled
  // runs; an existing scheduler with the same id is updated in place, not
  // duplicated.
  void queue.upsertJobScheduler(
    REPEATABLE_JOB_NAME,
    { pattern: CRON_PATTERN },
    { name: REPEATABLE_JOB_NAME, data: {} },
  );

  return {
    close: async () => {
      await worker.close();
      await queue.close();
      queueConnection.disconnect();
      workerConnection.disconnect();
    },
  };
}
