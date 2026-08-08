import type { Database } from '@viralscopes/db';
import type { FastifyBaseLogger } from 'fastify';

import { purgeSoftDeletedUsers } from '../repositories/account.repository.js';

const ACCOUNT_PURGE_RETENTION_DAYS = 30;

// Phase 10 Milestone 5 -- Security_Architecture.md §19: "Right to
// deletion -- DELETE /api/v1/account -- hard deletes PII within 30 days".
// PII is already scrubbed the moment the deletion request is made
// (account.service.ts's deleteAccount()); this job is the best-effort
// physical row removal that follows 30 days later, matching the same
// daily-repeatable-BullMQ-job pattern Phase 9 Milestone 5 established for
// billing maintenance (see lib/billing-maintenance-queue.ts) rather than
// inventing a second scheduling mechanism.
export async function runAccountPurge(
  db: Database,
  logger: FastifyBaseLogger,
): Promise<{ purged: number; retained: number }> {
  const cutoff = new Date(Date.now() - ACCOUNT_PURGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await purgeSoftDeletedUsers(db, cutoff);
  logger.info(result, 'Account purge job completed');
  return result;
}
