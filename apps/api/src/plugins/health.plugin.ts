import type { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { Client as PgClient } from 'pg';

import type { AppConfig } from '../config';

const START_TIME = Date.now();

// GET /health and GET /ready per ROADMAP.md Phase 2. Full layered route
// architecture (routes -> controllers -> services) arrives with Phase 5;
// this is intentionally a direct plugin registration for the minimal
// Phase 2 bootstrap.
export async function registerHealthRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    version: process.env.npm_package_version ?? '0.1.0',
  }));

  app.get('/ready', async (_request, reply) => {
    const [dbOk, redisOk] = await Promise.all([checkDatabase(config), checkRedis(config)]);

    const ready = dbOk && redisOk;
    const body = {
      status: ready ? 'ready' : 'not_ready',
      db: dbOk ? 'ok' : 'unavailable',
      redis: redisOk ? 'ok' : 'unavailable',
      // Queue connectivity rides on the same Redis instance (BullMQ is
      // Redis-backed) -- no separate queue exists yet, wired up in Phase 6.
      queue: redisOk ? 'ok' : 'unavailable',
    };

    if (!ready) {
      reply.code(503);
    }
    return body;
  });
}

async function checkDatabase(config: AppConfig): Promise<boolean> {
  const client = new PgClient({
    connectionString: config.databaseUrl,
    connectionTimeoutMillis: 2000,
  });
  try {
    await client.connect();
    await client.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function checkRedis(config: AppConfig): Promise<boolean> {
  const client = new Redis(config.redisUrl, {
    lazyConnect: true,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
  });
  try {
    await client.connect();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
}
