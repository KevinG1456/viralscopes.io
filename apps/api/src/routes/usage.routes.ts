import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { UsageService } from '../services/usage.service.js';

export async function usageRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const usageService = new UsageService(fastify.db);

  fastify.get(
    '/',
    { preHandler: [authenticate, requireOrgContext, businessRateLimit] },
    async (request, reply) => {
      const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
      const summary = await usageService.currentPeriod(tenant, request.user!.planTier);
      return reply.code(200).send(ok(summary));
    },
  );
}
