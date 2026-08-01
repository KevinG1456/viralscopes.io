import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { WatchlistService, type WatchlistActor } from '../services/watchlist.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['channel', 'keyword', 'niche', 'competitor']),
  target: z.string().min(1),
  targetMetadata: z.record(z.string(), z.unknown()).optional(),
  workspaceId: z.string().uuid().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  target: z.string().min(1).optional(),
  targetMetadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const idParamsSchema = z.object({ id: z.string().uuid() });

function actorFrom(request: FastifyRequest): WatchlistActor {
  return {
    tenant: { orgId: request.user!.orgId!, userId: request.user!.userId },
    orgRole: request.user!.orgRole,
  };
}

export async function watchlistRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const watchlistService = new WatchlistService(fastify.db);
  const preHandler = [authenticate, requireOrgContext, businessRateLimit];

  fastify.get('/', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const { rows, meta } = await watchlistService.list(actorFrom(request).tenant, { page, limit });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.post('/', { preHandler }, async (request, reply) => {
    const body = createSchema.parse(request.body);
    const watchlist = await watchlistService.create(actorFrom(request), {
      workspaceId: body.workspaceId ?? null,
      name: body.name,
      type: body.type,
      target: body.target,
      targetMetadata: body.targetMetadata ?? {},
    });
    return reply.code(201).send(ok(watchlist));
  });

  fastify.put('/:id', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const body = updateSchema.parse(request.body);
    const watchlist = await watchlistService.update(actorFrom(request), id, body);
    return reply.code(200).send(ok(watchlist));
  });

  fastify.delete('/:id', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    await watchlistService.remove(actorFrom(request), id);
    return reply.code(200).send(ok({ message: 'Watchlist deleted.' }));
  });
}
