import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { booleanQueryParam, paginationQuerySchema } from '../lib/pagination.js';
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

// Platform-wide, cross-org data (users/organizations/job_logs/dead_letter_jobs
// have no RLS -- "admin-only internal operations data", see their schema
// comments). Every route here is gated by requireSuperAdmin, not by org
// membership -- there is no tenant to scope these queries to.
export async function adminRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
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
    const job = await adminService.retryDeadLetterJob(id);
    return reply.code(200).send(
      ok({
        job,
        note: 'Retry counter incremented. No job runner exists yet (n8n is Phase 6) -- this does not re-execute the workflow.',
      }),
    );
  });

  fastify.get('/metrics', { preHandler }, async (_request, reply) => {
    const metrics = await adminService.metrics();
    return reply.code(200).send(ok(metrics));
  });
}
