import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { ChannelService } from '../services/channel.service.js';

const listQuerySchema = paginationQuerySchema.extend({
  platform: z.enum(['youtube', 'tiktok', 'instagram']).optional(),
  search: z.string().min(1).optional(),
  minSubscribers: z.coerce.number().int().min(0).optional(),
  minGrowthScore: z.coerce.number().min(0).max(100).optional(),
});

const idParamsSchema = z.object({ id: z.string().uuid() });

// "Growth history" per ROADMAP.md's Phase 5 checklist is not implementable
// from Phase 3's schema -- channels.ts stores only a current snapshot
// (growthScore, subscriberEstimate, avgViews), not a time-series table.
// Adding one would be a schema change outside Phase 5's "reuse existing
// schema" constraint; this returns the current profile snapshot only.
export async function channelRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const channelService = new ChannelService(fastify.db);

  fastify.get('/', { preHandler: [authenticate, businessRateLimit] }, async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const { page, limit, ...filters } = query;
    const { rows, meta } = await channelService.list(filters, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.get('/:id', { preHandler: [authenticate, businessRateLimit] }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const channel = await channelService.getById(id);
    return reply.code(200).send(ok(channel));
  });
}
