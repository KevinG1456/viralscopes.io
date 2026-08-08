import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import { AppError } from '../lib/errors.js';

// Phase 10 Milestone 2, finding F-10: this was registered with global:false,
// meaning any route without its own explicit `config.rateLimit` (i.e. every
// protected business route -- watchlists, alerts, api-keys, etc.) had NO
// rate limiting ahead of `authenticate`. `businessRateLimit` only runs as a
// preHandler *after* `authenticate` succeeds, so an unauthenticated flood
// against a protected route still cost a full JWT-verification cycle (and,
// for routes like requireSuperAdmin, a DB round-trip) per request, with
// nothing throttling it first.
//
// global:true makes @fastify/rate-limit hook onRequest -- before any
// route's preHandler chain, including `authenticate` -- so this now runs
// ahead of authentication on every route by construction, not by each
// route remembering to opt in. The per-route `config.rateLimit` overrides
// already used by auth.routes.ts (5/min login, etc.) are unaffected: a
// route-level override still replaces this default for that route, it just
// no longer needs one to have *some* floor.
//
// The default itself (300/min/IP) is deliberately generous -- this is a
// backstop against floods, not the primary business throttle
// (businessRateLimit's plan-tier limits still apply, layered on top, once a
// request is authenticated).
//
// Backed by Redis (not in-memory) so limits are shared across every API
// instance, not reset per-process.
async function rateLimitPluginImpl(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  await fastify.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    redis: fastify.redis,
    keyGenerator: (request) => request.ip,
    // Phase 10 Milestone 2 (F-10 implementation): found while verifying this
    // change -- @fastify/rate-limit's own contract (index.js:
    // `throw params.errorResponseBuilder(req, respCtx)`) requires the return
    // value to be an Error-like object carrying `.statusCode`; Fastify's
    // error handling reads that property to set the HTTP status. This was
    // returning a plain `{ success, error }` object with no `.statusCode`,
    // so every rate-limit rejection fell through error-handler.plugin.ts's
    // generic branch as an unstyled 500 instead of 429. Pre-existing bug
    // (present since Phase 4, global:false just meant no route had ever
    // actually hit a limit in practice) -- fixed here since enabling global
    // mode is what finally exercised this path.
    errorResponseBuilder: (_request, context) =>
      new AppError(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please wait before trying again.',
        context.statusCode,
        { after: context.after },
      ),
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
