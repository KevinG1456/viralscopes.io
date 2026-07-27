import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { booleanQueryParam, paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { TrendService } from '../services/trend.service.js';

const listQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['emerging', 'evergreen', 'declining', 'unknown']).optional(),
  platform: z.enum(['youtube', 'tiktok', 'instagram']).optional(),
  language: z.string().min(1).optional(),
  minVelocity: z.coerce.number().min(0).optional(),
  latestSnapshotOnly: booleanQueryParam,
});

const opportunitiesQuerySchema = paginationQuerySchema.extend({
  platform: z.enum(['youtube', 'tiktok', 'instagram']).optional(),
  language: z.string().min(1).optional(),
});

export async function trendRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const trendService = new TrendService(fastify.db);

  fastify.get('/', { preHandler: [authenticate, businessRateLimit] }, async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const { page, limit, ...filters } = query;
    const { rows, meta } = await trendService.list(filters, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get(
    '/opportunities',
    { preHandler: [authenticate, businessRateLimit] },
    async (request, reply) => {
      const query = opportunitiesQuerySchema.parse(request.query);
      const { page, limit, ...filters } = query;
      const { rows, meta } = await trendService.opportunities(filters, { page, limit });
      return reply.code(200).send(ok(rows, meta));
    },
  );
}
