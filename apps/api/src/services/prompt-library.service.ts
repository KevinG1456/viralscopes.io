import type { Database } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import {
  activatePromptVersion,
  createPromptVersion,
  findPromptVersion,
  listPromptNames,
  listVersionsForName,
  type CreatePromptVersionInput,
  type PromptRow,
} from '../repositories/prompt-library.repository.js';

const DIFF_FIELDS = ['model', 'systemPrompt', 'userTemplate', 'outputSchema', 'notes'] as const;

export interface PromptVersionDiff {
  from: number;
  to: number;
  changes: Partial<Record<(typeof DIFF_FIELDS)[number], { from: unknown; to: unknown }>>;
}

export class PromptLibraryService {
  constructor(private readonly db: Database) {}

  async listPrompts(): Promise<
    Array<{ name: string; versionCount: number; activeVersion: number | null }>
  > {
    return listPromptNames(this.db);
  }

  async listVersions(name: string): Promise<PromptRow[]> {
    const rows = await listVersionsForName(this.db, name);
    if (rows.length === 0) {
      throw new AppError('PROMPT_NOT_FOUND', `No prompt named "${name}" exists.`, 404);
    }
    return rows;
  }

  async getVersion(name: string, version: number): Promise<PromptRow> {
    const row = await findPromptVersion(this.db, name, version);
    if (!row) {
      throw new AppError('PROMPT_VERSION_NOT_FOUND', `"${name}" has no version ${version}.`, 404);
    }
    return row;
  }

  async createVersion(input: CreatePromptVersionInput): Promise<PromptRow> {
    return createPromptVersion(this.db, input);
  }

  async activateVersion(name: string, version: number): Promise<PromptRow> {
    const updated = await activatePromptVersion(this.db, name, version);
    if (!updated) {
      throw new AppError('PROMPT_VERSION_NOT_FOUND', `"${name}" has no version ${version}.`, 404);
    }
    return updated;
  }

  async diffVersions(name: string, from: number, to: number): Promise<PromptVersionDiff> {
    const [fromRow, toRow] = await Promise.all([
      this.getVersion(name, from),
      this.getVersion(name, to),
    ]);

    const changes: PromptVersionDiff['changes'] = {};
    for (const field of DIFF_FIELDS) {
      const a = JSON.stringify(fromRow[field]);
      const b = JSON.stringify(toRow[field]);
      if (a !== b) {
        changes[field] = { from: fromRow[field], to: toRow[field] };
      }
    }

    return { from, to, changes };
  }
}
