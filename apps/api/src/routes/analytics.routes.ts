import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { AnalyticsService } from '../services/analytics.service.js';

export async function analyticsRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const analyticsService = new AnalyticsService(fastify.db);

  fastify.get(
    '/overview',
    { preHandler: [authenticate, requireOrgContext, businessRateLimit] },
    async (request, reply) => {
      const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
      const overview = await analyticsService.overview(tenant, request.user!.planTier);
      return reply.code(200).send(ok(overview));
    },
  );
}
