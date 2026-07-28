import type { Database } from '@viralscopes/db';
import type { Redis } from 'ioredis';

import { buildAiCacheKey, lookupAiCache } from '../lib/ai-cache.js';
import { AppError } from '../lib/errors.js';
import { renderPromptTemplate } from '../lib/prompt-template.js';
import { enqueueWorkflowJob, type WorkflowQueue } from '../lib/queue.js';
import { fixtureToTemplateVariables, loadFixture } from '../lib/test-fixtures.js';
import { findJobLogByExecutionId, type JobLogRow } from '../repositories/job-log.repository.js';
import { findPromptVersion } from '../repositories/prompt-library.repository.js';

// trend_clustering's input is a batch of topics (n8n_Workflow_Diagrams.md
// WF-10), not a single video -- it does not fit this harness's
// per-fixture-video model. Every other seeded prompt (DEC-020) is
// video-scoped, so this is the only exclusion needed.
const NON_VIDEO_SCOPED_PROMPTS = new Set(['trend_clustering']);

export interface PromptTestResult {
  cacheHit: boolean;
  output?: unknown;
  jobId?: string;
  status?: 'queued';
}

// TD-023: the AI-provider call this triggers (via infra/n8n-workflows/
// prompt-test.json) cannot be live-verified in this environment -- no
// ANTHROPIC_API_KEY/OPENAI_API_KEY configured. Everything up to that
// boundary (prompt lookup, template rendering, cache check, enqueue,
// dispatch to n8n, auth) is real and has been live-verified.
export class PromptTestService {
  constructor(
    private readonly db: Database,
    private readonly redis: Redis,
    private readonly promptTestQueue: WorkflowQueue,
  ) {}

  async runTest(name: string, version: number, fixtureId: string): Promise<PromptTestResult> {
    if (NON_VIDEO_SCOPED_PROMPTS.has(name)) {
      throw new AppError(
        'PROMPT_NOT_VIDEO_SCOPED',
        `"${name}" takes a batch of topics as input, not a single test video -- this harness only supports video-scoped prompts.`,
        422,
      );
    }

    const prompt = await findPromptVersion(this.db, name, version);
    if (!prompt) {
      throw new AppError('PROMPT_VERSION_NOT_FOUND', `"${name}" has no version ${version}.`, 404);
    }

    const fixture = loadFixture(fixtureId);
    const variables = {
      ...fixtureToTemplateVariables(fixture),
      output_schema: prompt.outputSchema,
    };
    const renderedSystemPrompt = renderPromptTemplate(prompt.systemPrompt, variables);
    const renderedUserMessage = renderPromptTemplate(prompt.userTemplate, variables);

    const cacheKey = buildAiCacheKey(name, version, renderedUserMessage);
    const cached = await lookupAiCache(this.redis, cacheKey);
    if (cached.hit) {
      return { cacheHit: true, output: cached.value };
    }

    const jobId = await enqueueWorkflowJob(this.promptTestQueue, {
      workflowName: 'prompt-test',
      payload: {
        promptName: name,
        promptVersion: version,
        model: prompt.model,
        systemPrompt: renderedSystemPrompt,
        userMessage: renderedUserMessage,
      },
    });
    return { cacheHit: false, jobId, status: 'queued' };
  }

  async getTestResult(jobId: string): Promise<JobLogRow> {
    const jobLog = await findJobLogByExecutionId(this.db, jobId);
    if (!jobLog) {
      throw new AppError('JOB_NOT_FOUND', `No test run found for job "${jobId}".`, 404);
    }
    return jobLog;
  }
}
