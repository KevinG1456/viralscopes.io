import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { VideoService } from '../services/video.service.js';

const listQuerySchema = paginationQuerySchema.extend({
  platform: z.enum(['youtube', 'tiktok', 'instagram']).optional(),
  category: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  minViralScore: z.coerce.number().min(0).max(100).optional(),
  publishedAfter: z.coerce.date().optional(),
  publishedBefore: z.coerce.date().optional(),
});

const idParamsSchema = z.object({ id: z.string().uuid() });

export async function videoRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const videoService = new VideoService(fastify.db);

  fastify.get('/', { preHandler: [authenticate, businessRateLimit] }, async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const { page, limit, ...filters } = query;
    const { rows, meta } = await videoService.list(filters, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/:id', { preHandler: [authenticate, businessRateLimit] }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const detail = await videoService.getById(id);
    return reply.code(200).send(ok(detail));
  });
}
