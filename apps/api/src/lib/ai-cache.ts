import { createHash } from 'node:crypto';

import type { Redis } from 'ioredis';

// PROJECT_RULES.md section 3.5: "Cache all AI responses in Redis keyed by
// (prompt_version, sha256(normalized_input))." AI_Strategy.md section 3.3
// Strategy 2 sets the TTL at 24h. n8n_Workflow_Diagrams.md's per-workflow
// examples use a slightly different literal key per task (vs:ai:thumbnail:,
// vs:ai:title:, vs:ai:hook:, vs:ai:analysis:, vs:ai:recommendation:) and one
// of them (thumbnail) omits the version segment entirely -- this module
// uses one consistent `vs:ai:{promptName}:{promptVersion}:{hash}` shape for
// every prompt instead (promptName is prompt_library's own primary key
// field, so this is equivalent, just uniform), always including the
// version so a prompt bump can never serve a stale cached response.
const CACHE_TTL_SECONDS = 24 * 60 * 60;

const HITS_COUNTER_KEY = 'vs:metrics:ai_cache_hits_total';
const MISSES_COUNTER_KEY = 'vs:metrics:ai_cache_misses_total';

function normalizeAiCacheInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function buildAiCacheKey(promptName: string, promptVersion: number, input: string): string {
  const hash = createHash('sha256').update(normalizeAiCacheInput(input)).digest('hex');
  return `vs:ai:${promptName}:${promptVersion}:${hash}`;
}

export interface AiCacheLookupResult {
  hit: boolean;
  value: unknown;
}

export async function lookupAiCache(redis: Redis, key: string): Promise<AiCacheLookupResult> {
  const raw = await redis.get(key);
  if (raw === null) {
    await redis.incr(MISSES_COUNTER_KEY);
    return { hit: false, value: null };
  }
  await redis.incr(HITS_COUNTER_KEY);
  return { hit: true, value: JSON.parse(raw) as unknown };
}

export async function storeAiCache(redis: Redis, key: string, value: unknown): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', CACHE_TTL_SECONDS);
}

export interface AiCacheStats {
  hits: number;
  misses: number;
  hitRate: number | null;
}

export async function getAiCacheStats(redis: Redis): Promise<AiCacheStats> {
  const [hitsRaw, missesRaw] = await Promise.all([
    redis.get(HITS_COUNTER_KEY),
    redis.get(MISSES_COUNTER_KEY),
  ]);
  const hits = hitsRaw ? Number(hitsRaw) : 0;
  const misses = missesRaw ? Number(missesRaw) : 0;
  const total = hits + misses;
  return { hits, misses, hitRate: total > 0 ? hits / total : null };
}
