import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { WorkflowQueue } from '../lib/queue.js';
import { ok } from '../lib/response.js';
import { listFixtureIds } from '../lib/test-fixtures.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireSuperAdmin } from '../middleware/require-super-admin.js';
import { PromptLibraryService } from '../services/prompt-library.service.js';
import { PromptTestService } from '../services/prompt-test.service.js';

const nameParamsSchema = z.object({ name: z.string().min(1) });
const versionParamsSchema = nameParamsSchema.extend({ version: z.coerce.number().int().min(1) });

const createVersionBodySchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().min(1),
  userTemplate: z.string().min(1),
  outputSchema: z.record(z.string(), z.unknown()),
  notes: z.string().optional(),
});

const activateBodySchema = z.object({ version: z.number().int().min(1) });

const diffQuerySchema = z.object({
  from: z.coerce.number().int().min(1),
  to: z.coerce.number().int().min(1),
});

const runTestBodySchema = z.object({
  version: z.number().int().min(1),
  fixtureId: z.string().min(1),
});

const jobIdParamsSchema = nameParamsSchema.extend({ jobId: z.string().min(1) });

function actorId(request: FastifyRequest): string {
  return request.user!.userId;
}

export interface PromptLibraryRoutesOptions extends FastifyPluginOptions {
  // Phase 7: the one workflow the prompt test harness dispatches to --
  // see infra/n8n-workflows/prompt-test.json and PromptTestService.
  promptTestQueue: WorkflowQueue;
}

// prompt_library is platform configuration (no RLS, admin-managed -- see
// prompt-library.repository.ts) -- every route here is requireSuperAdmin,
// same pattern as admin.routes.ts. Registered at /api/v1/admin/prompts.
export async function promptLibraryRoutes(
  fastify: FastifyInstance,
  opts: PromptLibraryRoutesOptions,
): Promise<void> {
  const promptService = new PromptLibraryService(fastify.db);
  const promptTestService = new PromptTestService(fastify.db, fastify.redis, opts.promptTestQueue);
  const preHandler = [authenticate, requireSuperAdmin, businessRateLimit];

  fastify.get('/', { preHandler }, async (_request, reply) => {
    const prompts = await promptService.listPrompts();
    return reply.code(200).send(ok(prompts));
  });

  fastify.get('/test-fixtures', { preHandler }, async (_request, reply) => {
    return reply.code(200).send(ok(listFixtureIds()));
  });

  fastify.get('/:name', { preHandler }, async (request, reply) => {
    const { name } = nameParamsSchema.parse(request.params);
    const versions = await promptService.listVersions(name);
    return reply.code(200).send(ok(versions));
  });

  fastify.get('/:name/diff', { preHandler }, async (request, reply) => {
    const { name } = nameParamsSchema.parse(request.params);
    const { from, to } = diffQuerySchema.parse(request.query);
    const diff = await promptService.diffVersions(name, from, to);
    return reply.code(200).send(ok(diff));
  });

  fastify.get('/:name/:version', { preHandler }, async (request, reply) => {
    const { name, version } = versionParamsSchema.parse(request.params);
    const row = await promptService.getVersion(name, version);
    return reply.code(200).send(ok(row));
  });

  fastify.post('/:name', { preHandler }, async (request, reply) => {
    const { name } = nameParamsSchema.parse(request.params);
    const body = createVersionBodySchema.parse(request.body);
    const row = await promptService.createVersion({ name, ...body, createdBy: actorId(request) });
    return reply.code(201).send(ok(row));
  });

  fastify.post('/:name/activate', { preHandler }, async (request, reply) => {
    const { name } = nameParamsSchema.parse(request.params);
    const { version } = activateBodySchema.parse(request.body);
    const row = await promptService.activateVersion(name, version);
    return reply.code(200).send(ok(row));
  });

  // TD-023: the AI-provider call this ultimately triggers cannot be
  // live-verified in this environment (no ANTHROPIC_API_KEY/OPENAI_API_KEY).
  // Everything up to that boundary is real: prompt lookup, fixture loading,
  // template rendering, cache check, and dispatch through the same
  // queue->n8n pattern as every other Phase 6 workflow.
  fastify.post('/:name/test', { preHandler }, async (request, reply) => {
    const { name } = nameParamsSchema.parse(request.params);
    const { version, fixtureId } = runTestBodySchema.parse(request.body);
    const result = await promptTestService.runTest(name, version, fixtureId);
    return reply.code(result.cacheHit ? 200 : 202).send(ok(result));
  });

  fastify.get('/:name/test/:jobId', { preHandler }, async (request, reply) => {
    const { jobId } = jobIdParamsSchema.parse(request.params);
    const jobLog = await promptTestService.getTestResult(jobId);
    return reply.code(200).send(ok(jobLog));
  });
}
