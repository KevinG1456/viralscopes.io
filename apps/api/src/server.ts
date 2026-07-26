import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { healthPlugin } from './plugins/health.plugin.js';

export function buildServer(config: AppConfig): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.register(healthPlugin, { config });

  return app;
}
