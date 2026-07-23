import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config';
import { registerCors } from './plugins/cors.plugin';
import { registerHealthRoutes } from './plugins/health.plugin';
import { registerMetrics } from './plugins/metrics.plugin';

export async function buildServer(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  await registerCors(app);
  registerMetrics(app);
  await registerHealthRoutes(app, config);

  return app;
}
