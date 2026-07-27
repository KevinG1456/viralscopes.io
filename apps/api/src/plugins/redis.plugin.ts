import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

import type { AppConfig } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

interface RedisPluginOptions extends FastifyPluginOptions {
  config: AppConfig;
}

// Backs rate limiting (@fastify/rate-limit) and account-lockout counters
// (Security_Architecture.md §2/§15) -- both need shared, TTL-expiring
// state that plain in-process memory can't provide across multiple API
// instances.
async function redisPluginImpl(fastify: FastifyInstance, opts: RedisPluginOptions): Promise<void> {
  const redis = new Redis(opts.config.redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  await redis.connect();
  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    redis.disconnect();
  });
}

export const redisPlugin = fp(redisPluginImpl, { name: 'redis-plugin' });
