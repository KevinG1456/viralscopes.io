import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { paginationQuerySchema } from '../lib/pagination.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { AlertService, type AlertActor } from '../services/alert.service.js';

const createRuleSchema = z.object({
  name: z.string().min(1).max(200),
  triggerType: z.enum([
    'viral_score_threshold',
    'trend_spike',
    'channel_upload',
    'breakout_prediction',
  ]),
  thresholdValue: z.number().min(0).max(100).nullable().optional(),
  deliveryChannels: z.array(z.unknown()).default([]),
  watchlistId: z.string().uuid().nullable().optional(),
});

const updateRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  thresholdValue: z.number().min(0).max(100).nullable().optional(),
  deliveryChannels: z.array(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const idParamsSchema = z.object({ id: z.string().uuid() });

const eventsQuerySchema = paginationQuerySchema.extend({
  alertRuleId: z.string().uuid().optional(),
  status: z.enum(['sent', 'failed', 'throttled']).optional(),
});

function actorFrom(request: FastifyRequest): AlertActor {
  return {
    tenant: { orgId: request.user!.orgId!, userId: request.user!.userId },
    orgRole: request.user!.orgRole,
    planTier: request.user!.planTier,
  };
}

export async function alertRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const alertService = new AlertService(fastify.db);
  const preHandler = [authenticate, requireOrgContext, businessRateLimit];

  fastify.get('/rules', { preHandler }, async (request, reply) => {
    const { page, limit } = paginationQuerySchema.parse(request.query);
    const { rows, meta } = await alertService.listRules(actorFrom(request).tenant, {
      page,
      limit,
    });
    return reply.code(200).send(ok(rows, meta));
  });

  fastify.post('/rules', { preHandler }, async (request, reply) => {
    const body = createRuleSchema.parse(request.body);
    const rule = await alertService.createRule(actorFrom(request), {
      watchlistId: body.watchlistId ?? null,
      name: body.name,
      triggerType: body.triggerType,
      thresholdValue: body.thresholdValue ?? null,
      deliveryChannels: body.deliveryChannels,
    });
    return reply.code(201).send(ok(rule));
  });

  fastify.put('/rules/:id', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const body = updateRuleSchema.parse(request.body);
    const rule = await alertService.updateRule(actorFrom(request), id, body);
    return reply.code(200).send(ok(rule));
  });

  fastify.delete('/rules/:id', { preHandler }, async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    await alertService.removeRule(actorFrom(request), id);
    return reply.code(200).send(ok({ message: 'Alert rule deleted.' }));
  });

  fastify.get('/events', { preHandler }, async (request, reply) => {
    const query = eventsQuerySchema.parse(request.query);
    const { page, limit, ...filters } = query;
    const { rows, meta } = await alertService.listEvents(actorFrom(request).tenant, filters, {
      page,
      limit,
    });
    return reply.code(200).send(ok(rows, meta));
  });
}
