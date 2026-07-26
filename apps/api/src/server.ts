import Fastify, { type FastifyInstance } from 'fastify';

import { healthPlugin } from './plugins/health.plugin.js';

export function buildServer(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.register(healthPlugin);

  return app;
}
