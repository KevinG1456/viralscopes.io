import type { Database } from '@viralscopes/db';
import { Queue, Worker } from 'bullmq';
import type { FastifyBaseLogger } from 'fastify';

import type { AppConfig } from '../config.js';
import { createBullConnection } from './queue.js';
import { runGracePeriodExpiry } from '../jobs/grace-period-expiry.job.js';

const QUEUE_NAME = 'viralscopes-standard-billing-maintenance';
const REPEATABLE_JOB_NAME = 'grace-period-expiry';
// Daily at 06:00 UTC -- docs/architecture/billing/07-subscription-lifecycle.md's
// resolved decision.
const CRON_PATTERN = '0 6 * * *';

export interface BillingMaintenanceQueue {
  close: () => Promise<void>;
}

// A dedicated BullMQ queue for an in-process billing maintenance task, not
// n8n-dispatch like createWorkflowQueue() in lib/queue.ts -- the worker
// runs runGracePeriodExpiry() directly, no n8n webhook involved (the
// architecture decision explicitly rejected an n8n scheduled workflow for
// this exact reason: "requiring a new n8n workflow to be built just for an
// internal billing maintenance task"). Still reuses BullMQ and the same
// connection semantics (createBullConnection) as the rest of the app.
export function createBillingMaintenanceQueue(
  db: Database,
  config: AppConfig,
  logger: FastifyBaseLogger,
): BillingMaintenanceQueue {
  const queueConnection = createBullConnection(config.redisUrl);
  const workerConnection = createBullConnection(config.redisUrl);

  const queue = new Queue(QUEUE_NAME, { connection: queueConnection });

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      const result = await runGracePeriodExpiry(db, logger);
      logger.info(result, 'Billing maintenance job completed');
      return result;
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
