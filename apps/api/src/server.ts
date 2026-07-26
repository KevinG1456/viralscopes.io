import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { healthPlugin } from './plugins/health.plugin.js';
import { buildLoggerOptions } from './plugins/logger.plugin.js';

export function buildServer(config: AppConfig): FastifyInstance {
  const app = Fastify({
    logger: buildLoggerOptions(config),
  });

  app.register(healthPlugin, { config });

  // A real WARN, not per-request noise: logged once at boot so an operator
  // reading logs immediately knows this instance is running with
  // dependencies not yet wired up, rather than discovering it only via
  // GET /ready.
  app.log.warn(
    { dependencies: ['database', 'redis', 'queue'] },
    'Starting with unimplemented dependencies — see GET /ready for detail',
  );

  return app;
}
