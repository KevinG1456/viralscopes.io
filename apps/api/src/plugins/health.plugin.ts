import { sql } from 'drizzle-orm';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import type { AppConfig } from '../config.js';
import type { WorkflowQueue } from '../lib/queue.js';

interface HealthPluginOptions extends FastifyPluginOptions {
  config: AppConfig;
  workflowQueues: Map<string, WorkflowQueue>;
}

interface DependencyCheck {
  status: 'ok' | 'not_implemented' | 'error';
  detail: string;
}

// Readiness dependencies land here as each is actually wired into the API.
// Never mark a check "ok" without a real connectivity test behind it —
// an unimplemented dependency is reported honestly as not_ready, not faked.
async function checkDatabase(fastify: FastifyInstance): Promise<DependencyCheck> {
  try {
    await fastify.db.execute(sql`SELECT 1`);
    return { status: 'ok', detail: 'Connected via DATABASE_APP_URL.' };
  } catch (err) {
    return { status: 'error', detail: err instanceof Error ? err.message : String(err) };
  }
}

async function checkRedis(fastify: FastifyInstance): Promise<DependencyCheck> {
  try {
    await fastify.redis.ping();
    return { status: 'ok', detail: 'Connected.' };
  } catch (err) {
    return { status: 'error', detail: err instanceof Error ? err.message : String(err) };
  }
}

// Phase 6: genuinely exercises each registered BullMQ queue's own Redis
// path (getJobCounts), not just a generic Redis ping -- proves the queue
// system itself is reachable, not merely that *a* Redis client works.
async function checkQueue(workflowQueues: Map<string, WorkflowQueue>): Promise<DependencyCheck> {
  if (workflowQueues.size === 0) {
    return { status: 'not_implemented', detail: 'No workflow queues are registered.' };
  }
  try {
    const counts = await Promise.all(
      [...workflowQueues.entries()].map(async ([name, wq]) => {
        const c = await wq.queue.getJobCounts();
        return `${name}: ${JSON.stringify(c)}`;
      }),
    );
    return { status: 'ok', detail: counts.join('; ') };
  } catch (err) {
    return { status: 'error', detail: err instanceof Error ? err.message : String(err) };
  }
}

export async function healthPlugin(
  fastify: FastifyInstance,
  opts: HealthPluginOptions,
): Promise<void> {
  // Liveness: only confirms the process is up and handling requests.
  // Never checks dependencies — that is /ready's job.
  fastify.get('/health', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      version: opts.config.version,
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness: reports the true state of every dependency the API relies
  // on. A dependency that has no client wired up yet is reported as
  // "not_implemented", not silently skipped or faked as "ok".
  fastify.get('/ready', async (_request, reply) => {
    const checks: Record<string, DependencyCheck> = {
      database: await checkDatabase(fastify),
      redis: await checkRedis(fastify),
      queue: await checkQueue(opts.workflowQueues),
    };

    const allOk = Object.values(checks).every((check) => check.status === 'ok');
    const statusCode = allOk ? 200 : 503;

    return reply.code(statusCode).send({
      status: allOk ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
