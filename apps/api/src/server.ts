import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { cookiePlugin } from './plugins/cookie.plugin.js';
import { dbPlugin } from './plugins/db.plugin.js';
import { errorHandlerPlugin } from './plugins/error-handler.plugin.js';
import { healthPlugin } from './plugins/health.plugin.js';
import { buildLoggerOptions } from './plugins/logger.plugin.js';
import { rateLimitPlugin } from './plugins/rate-limit.plugin.js';
import { redisPlugin } from './plugins/redis.plugin.js';
import { authRoutes } from './routes/auth.routes.js';

declare module 'fastify' {
  interface FastifyInstance {
    appConfig: AppConfig;
  }
}

export async function buildServer(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: buildLoggerOptions(config),
  });

  app.decorate('appConfig', config);

  await app.register(errorHandlerPlugin);
  await app.register(dbPlugin, { config });
  await app.register(redisPlugin, { config });
  await app.register(cookiePlugin);
  await app.register(rateLimitPlugin);
  await app.register(healthPlugin, { config });
  await app.register(authRoutes, { config, prefix: '/api/v1/auth' });

  // A real WARN, not per-request noise: logged once at boot so an operator
  // reading logs immediately knows this instance is running with
  // dependencies not yet wired up, rather than discovering it only via
  // GET /ready.
  app.log.warn(
    { dependencies: ['queue'] },
    'Starting with unimplemented dependencies — see GET /ready for detail',
  );

  return app;
}
