import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { AppError } from './errors.js';

// PROJECT_RULES.md section 9.5: "a fixed set of 10 test videos (stored as
// JSON fixtures)... committed to the repository and never modified once
// established." Synthetic content (not scraped from real creators) --
// this project's own ethical constraint (AI_Strategy.md AI-1) applies to
// its own test data, not just AI output.
//
// Path is relative from dist/lib/ (built) or src/lib/ (tsx dev) -- both
// sit exactly two directories under apps/api, so `../../test-fixtures`
// resolves correctly either way (see tsconfig.json's rootDir/outDir).
const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../test-fixtures/videos');

export interface VideoFixture {
  id: string;
  title: string;
  description: string;
  transcript: string;
  hook_text: string;
  duration_secs: number;
  view_count: number;
  thumbnail_url: string;
  precomputed_analysis: Record<string, unknown>;
}

export function listFixtureIds(): string[] {
  return readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadFixture(id: string): VideoFixture {
  try {
    const raw = readFileSync(join(FIXTURES_DIR, `${id}.json`), 'utf-8');
    return JSON.parse(raw) as VideoFixture;
  } catch {
    throw new AppError('FIXTURE_NOT_FOUND', `No test fixture named "${id}" exists.`, 404);
  }
}

/** Flattens a fixture into the flat key/value shape renderPromptTemplate expects. */
export function fixtureToTemplateVariables(fixture: VideoFixture): Record<string, unknown> {
  const { precomputed_analysis: precomputedAnalysis, ...rest } = fixture;
  return { ...rest, ...precomputedAnalysis };
}
