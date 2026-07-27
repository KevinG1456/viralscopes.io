import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { cookiePlugin } from './plugins/cookie.plugin.js';
import { dbPlugin } from './plugins/db.plugin.js';
import { errorHandlerPlugin } from './plugins/error-handler.plugin.js';
import { healthPlugin } from './plugins/health.plugin.js';
import { buildLoggerOptions } from './plugins/logger.plugin.js';
import { rateLimitPlugin } from './plugins/rate-limit.plugin.js';
import { redisPlugin } from './plugins/redis.plugin.js';
import { adminRoutes } from './routes/admin.routes.js';
import { alertRoutes } from './routes/alert.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { apiKeyRoutes } from './routes/api-key.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { channelRoutes } from './routes/channel.routes.js';
import { recommendationRoutes } from './routes/recommendation.routes.js';
import { trendRoutes } from './routes/trend.routes.js';
import { usageRoutes } from './routes/usage.routes.js';
import { videoRoutes } from './routes/video.routes.js';
import { watchlistRoutes } from './routes/watchlist.routes.js';

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

  // Phase 5 — Core Backend API. Read-only content (global, no RLS):
  await app.register(videoRoutes, { prefix: '/api/v1/videos' });
  await app.register(channelRoutes, { prefix: '/api/v1/channels' });
  await app.register(trendRoutes, { prefix: '/api/v1/trends' });

  // Org-scoped (RLS via withTenant()):
  await app.register(recommendationRoutes, { prefix: '/api/v1/recommendations' });
  await app.register(watchlistRoutes, { prefix: '/api/v1/watchlists' });
  await app.register(alertRoutes, { prefix: '/api/v1/alerts' });
  await app.register(apiKeyRoutes, { prefix: '/api/v1/api-keys' });
  await app.register(usageRoutes, { prefix: '/api/v1/usage' });
  await app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });

  // Platform-wide, super_admin-gated (no RLS, no org scoping):
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });

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
