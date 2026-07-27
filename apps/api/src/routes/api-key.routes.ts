import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { ApiKeyService } from '../services/api-key.service.js';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().nullable().optional(),
});

const idParamsSchema = z.object({ id: z.string().uuid() });

export async function apiKeyRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const apiKeyService = new ApiKeyService(fastify.db);
  const preHandler = [authenticate, requireOrgContext, businessRateLimit];

  fastify.get('/', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
    const { rows, meta } = await apiKeyService.list(tenant, { page, limit });
    // Never expose keyHash, even hashed -- only prefix + metadata.
    const sanitised = rows.map(({ keyHash: _keyHash, ...rest }) => rest);
    return reply.code(200).send(ok(sanitised, meta));
  });

  fastify.post('/', { preHandler }, async (request, reply) => {
    const body = createSchema.parse(request.body);
    const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
    const { row, plaintextKey } = await apiKeyService.create(tenant, request.user!.planTier, {
      name: body.name,
      scopes: body.scopes,
      expiresAt: body.expiresAt ?? null,
    });
    const { keyHash: _keyHash, ...rest } = row;
    return reply.code(201).send(ok({ ...rest, key: plaintextKey }));
  });

  fastify.delete('/:id', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const tenant = { orgId: request.user!.orgId!, userId: request.user!.userId };
    await apiKeyService.revoke(tenant, id);
    return reply.code(200).send(ok({ message: 'API key revoked.' }));
  });
}
