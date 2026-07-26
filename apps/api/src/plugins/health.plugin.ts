import type { FastifyInstance } from 'fastify';

interface DependencyCheck {
  status: 'ok' | 'not_implemented';
  detail: string;
}

// Readiness dependencies land here as each is actually wired into the API.
// Never mark a check "ok" without a real connectivity test behind it —
// an unimplemented dependency is reported honestly as not_ready, not faked.
function checkDatabase(): DependencyCheck {
  return {
    status: 'not_implemented',
    detail:
      'No database client is wired into the API yet (packages/db is an empty stub — see Phase 3: Database & Core Schema).',
  };
}

function checkRedis(): DependencyCheck {
  return {
    status: 'not_implemented',
    detail:
      'The Redis container is running in docker-compose.dev.yml, but no Redis client exists in the API yet (see Phase 5: Core Backend API, cache.service.ts).',
  };
}

function checkQueue(): DependencyCheck {
  return {
    status: 'not_implemented',
    detail: 'No job queue client exists in the API yet (see Phase 6: n8n Workflow Engine).',
  };
}

export async function healthPlugin(fastify: FastifyInstance): Promise<void> {
  // Liveness: only confirms the process is up and handling requests.
  // Never checks dependencies — that is /ready's job.
  fastify.get('/health', async (_request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      version: process.env.APP_VERSION ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness: reports the true state of every dependency the API relies
  // on. A dependency that has no client wired up yet is reported as
  // "not_implemented", not silently skipped or faked as "ok".
  fastify.get('/ready', async (_request, reply) => {
    const checks: Record<string, DependencyCheck> = {
      database: checkDatabase(),
      redis: checkRedis(),
      queue: checkQueue(),
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
