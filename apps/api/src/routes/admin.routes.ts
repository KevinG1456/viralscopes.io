import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { booleanQueryParam, paginationQuerySchema } from '../lib/pagination.js';
import { enqueueWorkflowJob, type WorkflowQueue } from '../lib/queue.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireSuperAdmin } from '../middleware/require-super-admin.js';
import { AdminService } from '../services/admin.service.js';

const jobsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['started', 'completed', 'failed', 'retrying']).optional(),
  workflowName: z.string().min(1).optional(),
});

const deadLetterQuerySchema = paginationQuerySchema.extend({
  resolved: booleanQueryParam,
});

const idParamsSchema = z.object({ id: z.string().uuid() });

const triggerParamsSchema = z.object({ workflow: z.string().min(1) });
const triggerBodySchema = z.record(z.string(), z.unknown()).default({});

export interface AdminRoutesOptions extends FastifyPluginOptions {
  // Phase 6: workflows this instance can actually enqueue jobs for,
  // keyed by workflow name. Only one exists so far (the foundation demo
  // workflow) -- see infra/n8n-workflows/. Triggering any other name is
  // correctly rejected (404), not silently accepted and dropped.
  workflowQueues: Map<string, WorkflowQueue>;
}

// Platform-wide, cross-org data (users/organizations/job_logs/dead_letter_jobs
// have no RLS -- "admin-only internal operations data", see their schema
// comments). Every route here is gated by requireSuperAdmin, not by org
// membership -- there is no tenant to scope these queries to.
export async function adminRoutes(
  fastify: FastifyInstance,
  opts: AdminRoutesOptions,
): Promise<void> {
  const adminService = new AdminService(fastify.db);
  const preHandler = [authenticate, requireSuperAdmin, businessRateLimit];

  fastify.get('/users', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const { rows, meta } = await adminService.listUsers({ page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/organizations', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const { rows, meta } = await adminService.listOrganizations({ page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/jobs', { preHandler }, async (request, reply) => {
    const query = jobsQuerySchema.parse(request.query);
    const { page, limit, ...filters } = query;
    const { rows, meta } = await adminService.listJobs(filters, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/dead-letter', { preHandler }, async (request, reply) => {
    const query = deadLetterQuerySchema.parse(request.query);
    const { page, limit, resolved } = query;
    const { rows, meta } = await adminService.listDeadLetterJobs(resolved, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.post('/dead-letter/:id/retry', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const { job, requeued } = await adminService.retryDeadLetterJob(id, opts.workflowQueues);
    return reply.code(200).send(
      ok({
        job,
        note: requeued
          ? 'Retry counter incremented and the job was re-enqueued for execution.'
          : `Retry counter incremented, but "${job.workflowName}" has no active queue to re-enqueue onto -- this does not re-execute the workflow.`,
      }),
    );
  });

  // ROADMAP.md Phase 6 Scheduler: "Manual trigger: POST /api/v1/jobs/:workflow/trigger".
  // Nested under /admin (Phase 5's existing admin-gated prefix) rather
  // than a bare top-level path, for consistency with every other
  // platform-wide operation in this file.
  fastify.post('/jobs/:workflow/trigger', { preHandler }, async (request, reply) => {
    const { workflow } = triggerParamsSchema.parse(request.params);
    const payload = triggerBodySchema.parse(request.body);

    const workflowQueue = opts.workflowQueues.get(workflow);
    if (!workflowQueue) {
      return reply.code(404).send({
        success: false,
        error: {
          code: 'UNKNOWN_WORKFLOW',
          message: `No workflow named "${workflow}" is registered.`,
        },
      });
    }

    const jobId = await enqueueWorkflowJob(workflowQueue, { workflowName: workflow, payload });
    return reply.code(202).send(ok({ jobId, workflow, status: 'queued' }));
  });

  fastify.get('/metrics', { preHandler }, async (_request, reply) => {
    const metrics = await adminService.metrics();
    return reply.code(200).send(ok(metrics));
  });
}
