import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { RecommendationService } from '../services/recommendation.service.js';

const videoIdParamsSchema = z.object({ videoId: z.string().uuid() });

export async function recommendationRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const recommendationService = new RecommendationService(fastify.db);
  const preHandler = [authenticate, requireOrgContext, businessRateLimit];

  fastify.get('/', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
    const { rows, meta } = await recommendationService.list(tenant, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/:videoId', { preHandler }, async (request, reply) => {
    const { videoId } = videoIdParamsSchema.parse(request.params);
    const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
    const rows = await recommendationService.forVideo(tenant, videoId);
    return reply.code(200).send(ok(rows));
  });
}
