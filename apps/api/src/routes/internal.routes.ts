import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { ok } from '../lib/response.js';
import { requireServiceToken } from '../middleware/require-service-token.js';
import { createJobLog, markJobLogCompleted } from '../repositories/job-log.repository.js';

const heartbeatSchema = z.object({
  source: z.string().min(1).max(200).default('n8n-scheduler'),
});

// Phase 6 "webhook processing": a genuine incoming call FROM n8n, distinct
// from the outgoing direction (apps/api's queue worker calling n8n's
// webhooks, see lib/queue.ts, and the admin manual-trigger route calling
// out to n8n). n8n's exported "Heartbeat" workflow (infra/n8n-workflows/)
// is Cron-triggered every 5 minutes and calls this to prove: (a) n8n's own
// scheduler is alive, (b) n8n can reach and authenticate to the backend.
// Every call is logged to job_logs (triggerType: 'cron') for observability
// -- a missing heartbeat in job_logs over time is itself a monitoring signal.
export async function internalRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  fastify.post('/heartbeat', { preHandler: [requireServiceToken] }, async (request, reply) => {
    const body = heartbeatSchema.parse(request.body ?? {});
    const executionId = `heartbeat-${Date.now()}`;

    await createJobLog(fastify.db, {
      workflowName: 'n8n-heartbeat',
      workflowId: 'n8n-heartbeat',
      executionId,
      triggerType: 'cron',
      inputSummary: { source: body.source },
    });
    await markJobLogCompleted(fastify.db, executionId, { receivedAt: new Date().toISOString() });

    return reply.code(200).send(ok({ message: 'Heartbeat recorded.' }));
  });
}
