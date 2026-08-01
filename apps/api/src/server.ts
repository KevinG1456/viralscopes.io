import Fastify, { type FastifyInstance } from 'fastify';

import type { AppConfig } from './config.js';
import { createBillingMaintenanceQueue } from './lib/billing-maintenance-queue.js';
import { createWorkflowQueue, queueName, type WorkflowQueue } from './lib/queue.js';
import { cookiePlugin } from './plugins/cookie.plugin.js';
import { corsPlugin } from './plugins/cors.plugin.js';
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
import { billingRoutes } from './routes/billing.routes.js';
import { channelRoutes } from './routes/channel.routes.js';
import { internalRoutes } from './routes/internal.routes.js';
import { promptLibraryRoutes } from './routes/prompt-library.routes.js';
import { recommendationRoutes } from './routes/recommendation.routes.js';
import { trendRoutes } from './routes/trend.routes.js';
import { usageRoutes } from './routes/usage.routes.js';
import { videoRoutes } from './routes/video.routes.js';
import { watchlistRoutes } from './routes/watchlist.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';

// Phase 6: the one foundation/demo workflow this instance can actually
// enqueue jobs for -- see infra/n8n-workflows/foundation-demo.json. Real
// business workflows (Video Discovery, AI Analysis, ...) are deferred
// (TD-020 in PROJECT_STATUS.md); this is the reusable plumbing they'll
// each register onto following the same createWorkflowQueue() pattern.
const FOUNDATION_DEMO_WORKFLOW = 'foundation-demo';

// Phase 7: the prompt test harness's own workflow -- see
// infra/n8n-workflows/prompt-test.json and services/prompt-test.service.ts.
const PROMPT_TEST_WORKFLOW = 'prompt-test';

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
  await app.register(corsPlugin, { config });
  await app.register(dbPlugin, { config });
  await app.register(redisPlugin, { config });
  await app.register(cookiePlugin);
  await app.register(rateLimitPlugin);

  // Phase 6: one BullMQ queue + in-process worker per registered workflow,
  // each dispatching to n8n's webhook for that workflow (lib/queue.ts).
  const workflowQueues = new Map<string, WorkflowQueue>();
  workflowQueues.set(
    FOUNDATION_DEMO_WORKFLOW,
    createWorkflowQueue(
      app.db,
      config,
      app.log,
      queueName('standard', FOUNDATION_DEMO_WORKFLOW),
      FOUNDATION_DEMO_WORKFLOW,
    ),
  );
  workflowQueues.set(
    PROMPT_TEST_WORKFLOW,
    createWorkflowQueue(
      app.db,
      config,
      app.log,
      queueName('standard', PROMPT_TEST_WORKFLOW),
      PROMPT_TEST_WORKFLOW,
    ),
  );
  app.addHook('onClose', async () => {
    await Promise.all([...workflowQueues.values()].map((wq) => wq.close()));
  });

  // Phase 9 — Billing (Milestone 5): daily grace-period-expiry sweep +
  // billing_events retention purge (docs/architecture/billing/
  // 07-subscription-lifecycle.md's resolved decision) — an in-process
  // maintenance task, not an n8n-dispatched workflow.
  const billingMaintenanceQueue = createBillingMaintenanceQueue(app.db, config, app.log);
  app.addHook('onClose', async () => {
    await billingMaintenanceQueue.close();
  });

  await app.register(healthPlugin, { config, workflowQueues });
  await app.register(authRoutes, { config, prefix: '/api/v1/auth' });
  await app.register(internalRoutes, { prefix: '/api/v1/internal' });

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
  // Phase 9 — Billing (Milestone 2): checkout/portal/subscription/plan.
  await app.register(billingRoutes, { prefix: '/api/v1/billing' });
  // Phase 9 — Billing (Milestone 3): unauthenticated, Stripe-signature-verified.
  await app.register(webhookRoutes, { prefix: '/api/v1/webhooks' });

  // Platform-wide, super_admin-gated (no RLS, no org scoping):
  await app.register(adminRoutes, { prefix: '/api/v1/admin', workflowQueues });
  await app.register(promptLibraryRoutes, {
    prefix: '/api/v1/admin/prompts',
    promptTestQueue: workflowQueues.get(PROMPT_TEST_WORKFLOW)!,
  });

  // Phase 6 closed the last of the three dependencies GET /ready checks
  // (database, redis, queue) -- no more "unimplemented dependencies" boot
  // warning needed; /ready's own per-dependency detail is sufficient now.

  return app;
}
