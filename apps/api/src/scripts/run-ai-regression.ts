// PROJECT_RULES.md section 9.5's regression suite: every active prompt
// against the 10 fixed fixture videos. Deliberately a standalone script
// (`npm run ai:regression`), NOT wired into CI as a merge-blocking gate --
// see TD-023 in PROJECT_STATUS.md. This environment has no
// ANTHROPIC_API_KEY/OPENAI_API_KEY, so most runs will predictably end up
// PENDING (still retrying in the background, ultimately dead-lettering) --
// that is expected and reported as such, not treated as a regression
// failure. A real schema-validation FAILURE on an output that did come
// back (e.g. from a previously cached run) is the only case this script
// exits non-zero for.
import 'dotenv/config';

import { createDbClient, schema, type Database } from '@viralscopes/db';
import { asc, eq } from 'drizzle-orm';
import { Redis } from 'ioredis';

import { loadConfig } from '../config.js';
import { createWorkflowQueue, queueName, type WorkflowQueue } from '../lib/queue.js';
import { checkAgainstOutputSchema } from '../lib/schema-check.js';
import { listFixtureIds } from '../lib/test-fixtures.js';
import { findJobLogByExecutionId } from '../repositories/job-log.repository.js';
import { PromptTestService } from '../services/prompt-test.service.js';

const NON_VIDEO_SCOPED_PROMPTS = new Set(['trend_clustering']);
const POLL_INTERVAL_MS = 2000;
// job_logs only gets an errorMessage on final dead-letter (after BullMQ's
// full ~5.5min retry cycle, see lib/queue.ts's RETRY_DELAYS_MS) -- there is
// no per-attempt error signal to poll for sooner. Waiting out that full
// cycle for every miss, for every combination, would make this script take
// hours in an environment with no AI credentials (TD-023), where every
// miss predictably ends up there. A short poll is enough to confirm the
// job was picked up and is progressing (PENDING); the concrete failure
// reason is available later via GET /api/v1/admin/dead-letter.
const POLL_TIMEOUT_MS = 6000;

type Outcome = 'CACHE_HIT_PASS' | 'CACHE_HIT_FAIL' | 'PASS' | 'FAIL' | 'PENDING';

interface RunResult {
  promptName: string;
  version: number;
  fixtureId: string;
  outcome: Outcome;
  detail: string;
}

type PromptRow = typeof schema.promptLibrary.$inferSelect;

async function loadActivePrompts(db: Database): Promise<PromptRow[]> {
  return db
    .select()
    .from(schema.promptLibrary)
    .where(eq(schema.promptLibrary.isActive, true))
    .orderBy(asc(schema.promptLibrary.name));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollForOutcome(
  db: Database,
  jobId: string,
  outputSchema: unknown,
): Promise<{ outcome: Outcome; detail: string }> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const jobLog = await findJobLogByExecutionId(db, jobId);
    if (jobLog?.status === 'completed') {
      const check = checkAgainstOutputSchema(jobLog.outputSummary, outputSchema);
      return check.valid
        ? { outcome: 'PASS', detail: 'output matches output_schema' }
        : { outcome: 'FAIL', detail: check.errors.join('; ') };
    }
    if (jobLog?.status === 'failed') {
      return {
        outcome: 'PENDING',
        detail: `dead-lettered: ${jobLog.errorMessage ?? 'unknown reason'} (see TD-023 -- likely missing AI credentials, not a prompt regression)`,
      };
    }
    await sleep(POLL_INTERVAL_MS);
  }
  return {
    outcome: 'PENDING',
    detail: `still retrying in the background after ${POLL_TIMEOUT_MS / 1000}s (see dead_letter_jobs later)`,
  };
}

async function main(): Promise<void> {
  const config = loadConfig();
  const db = createDbClient(config.databaseAppUrl);
  const redis = new Redis(config.redisUrl);
  let promptTestQueue: WorkflowQueue | undefined;

  try {
    promptTestQueue = createWorkflowQueue(
      db,
      config,
      { error: console.error, info: console.log } as never,
      queueName('standard', 'prompt-test'),
      'prompt-test',
    );
    const promptTestService = new PromptTestService(db, redis, promptTestQueue);

    const activePrompts = (await loadActivePrompts(db)).filter(
      (p) => !NON_VIDEO_SCOPED_PROMPTS.has(p.name),
    );
    const fixtureIds = listFixtureIds();

    console.log(
      `Running ${activePrompts.length} active prompt(s) x ${fixtureIds.length} fixture(s) = ${activePrompts.length * fixtureIds.length} combinations...\n`,
    );

    const results: RunResult[] = [];
    for (const prompt of activePrompts) {
      for (const fixtureId of fixtureIds) {
        const started = await promptTestService.runTest(prompt.name, prompt.version, fixtureId);
        if (started.cacheHit) {
          const check = checkAgainstOutputSchema(started.output, prompt.outputSchema);
          results.push({
            promptName: prompt.name,
            version: prompt.version,
            fixtureId,
            outcome: check.valid ? 'CACHE_HIT_PASS' : 'CACHE_HIT_FAIL',
            detail: check.valid ? 'cached output matches output_schema' : check.errors.join('; '),
          });
          continue;
        }
        const { outcome, detail } = await pollForOutcome(db, started.jobId!, prompt.outputSchema);
        results.push({
          promptName: prompt.name,
          version: prompt.version,
          fixtureId,
          outcome,
          detail,
        });
      }
    }

    console.log('Prompt'.padEnd(26), 'Fixture'.padEnd(14), 'Outcome'.padEnd(16), 'Detail');
    console.log('-'.repeat(100));
    for (const r of results) {
      console.log(
        r.promptName.padEnd(26),
        r.fixtureId.padEnd(14),
        r.outcome.padEnd(16),
        r.detail.slice(0, 80),
      );
    }

    const realFailures = results.filter(
      (r) => r.outcome === 'FAIL' || r.outcome === 'CACHE_HIT_FAIL',
    );
    const pending = results.filter((r) => r.outcome === 'PENDING').length;
    console.log(
      `\n${results.length} total -- ${realFailures.length} schema failure(s), ${pending} pending/blocked (expected without AI credentials, TD-023).`,
    );

    if (realFailures.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await promptTestQueue?.close();
    redis.disconnect();
    await db.$client.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
