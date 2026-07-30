import { requestsPerMinuteFor } from '@viralscopes/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';

// Plan-tier-aware rate limiting for Phase 5's business endpoints (videos,
// channels, trends, watchlists, alerts, api-keys, usage, analytics) --
// distinct from Phase 4's rate-limit.plugin.ts, which only covers
// unauthenticated/pre-session auth routes (register/login/etc.) with a
// flat per-route limit. This is per-authenticated-user (keyed by JWT
// `sub`, not IP -- multiple users on one office IP shouldn't share a
// budget), with the ceiling looked up from PLAN_LIMITS by the caller's
// `planTier` claim. Reimplemented directly against Redis (INCR + EXPIRE,
// same pattern as lib/lockout.ts) rather than layering another
// @fastify/rate-limit registration, since that plugin's per-route `max`
// override does not support a request-dependent function the way its
// top-level registration does.
// Must run after `authenticate`.
const WINDOW_SECONDS = 60;

function bucketKey(userId: string): string {
  const bucket = Math.floor(Date.now() / (WINDOW_SECONDS * 1000));
  return `ratelimit:business:${userId}:${bucket}`;
}

export async function businessRateLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required.', 401);
  }

  const limit = requestsPerMinuteFor(request.user.planTier);
  const key = bucketKey(request.user.userId);

  const count = await request.server.redis.incr(key);
  if (count === 1) {
    await request.server.redis.expire(key, WINDOW_SECONDS);
  }

  const remaining = Math.max(0, limit - count);
  reply.header('x-ratelimit-limit', limit);
  reply.header('x-ratelimit-remaining', remaining);

  if (count > limit) {
    reply.header('retry-after', WINDOW_SECONDS);
    throw new AppError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please wait before trying again.',
      429,
    );
  }
}
