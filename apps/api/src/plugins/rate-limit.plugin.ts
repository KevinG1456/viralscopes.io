import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

// Registered with global:false -- Phase 4 only has auth routes, and each
// applies its own per-route limit matching the table in
// Security_Architecture.md §15 (auth.routes.ts). A plan-tier-aware global
// limiter is Phase 5 territory, once there's a general API surface and
// `request.user.planTier` is actually meaningful beyond auth. Takes no
// config of its own -- kept as a FastifyPluginOptions-typed no-op param
// for registration symmetry with the other plugins in server.ts.
//
// Backed by Redis (not in-memory) so limits are shared across every API
// instance, not reset per-process.
async function rateLimitPluginImpl(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  await fastify.register(rateLimit, {
    global: false,
    redis: fastify.redis,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait before trying again.',
      },
    }),
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });
}

export const rateLimitPlugin = fp(rateLimitPluginImpl, {
  name: 'rate-limit-plugin',
  dependencies: ['redis-plugin'],
});
