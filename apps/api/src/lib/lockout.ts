import type { Redis } from 'ioredis';

import { AppError } from './errors.js';

// Security_Architecture.md §2/§15: progressive account lockout, separate
// from IP-based rate limiting (rate-limit.plugin.ts). Tracks failures per
// account (not per IP), so a distributed attacker rotating IPs still gets
// locked out.
const LOCKOUT_STAGES = [
  { afterFailures: 5, lockSeconds: 15 * 60 },
  { afterFailures: 10, lockSeconds: 60 * 60 },
  { afterFailures: 15, lockSeconds: 24 * 60 * 60 },
] as const;

function failuresKey(userId: string): string {
  return `auth:failures:${userId}`;
}

function lockedUntilKey(userId: string): string {
  return `auth:locked_until:${userId}`;
}

export async function assertNotLockedOut(redis: Redis, userId: string): Promise<void> {
  const lockedUntil = await redis.get(lockedUntilKey(userId));
  if (lockedUntil && Date.now() < Number(lockedUntil)) {
    throw new AppError('ACCOUNT_LOCKED', 'Account temporarily locked.', 403);
  }
}

export async function recordFailedLogin(redis: Redis, userId: string): Promise<void> {
  const failures = await redis.incr(failuresKey(userId));
  // Failure counter itself never expires on its own (a stage further down
  // must apply a lockout for it to reset) -- but cap how long we remember
  // an old failure streak so it doesn't linger forever.
  await redis.expire(failuresKey(userId), 24 * 60 * 60);

  const stage = [...LOCKOUT_STAGES].reverse().find((s) => failures >= s.afterFailures);
  if (stage) {
    const lockedUntil = Date.now() + stage.lockSeconds * 1000;
    await redis.set(lockedUntilKey(userId), String(lockedUntil), 'EX', stage.lockSeconds);
  }
}

export async function resetFailedLogins(redis: Redis, userId: string): Promise<void> {
  await redis.del(failuresKey(userId), lockedUntilKey(userId));
}
