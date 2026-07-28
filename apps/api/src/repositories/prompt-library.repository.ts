import { type Database, schema } from '@viralscopes/db';
import { and, desc, eq, sql } from 'drizzle-orm';

// Platform configuration, admin-managed -- no RLS (see prompt-library.ts's
// schema comment and Database_Schema.md section 8). Plain db.* queries and a
// bare db.transaction(), same pattern as admin.repository.ts -- there is no
// tenant to scope these to.

export type PromptRow = typeof schema.promptLibrary.$inferSelect;

export interface CreatePromptVersionInput {
  name: string;
  model: string;
  systemPrompt: string;
  userTemplate: string;
  outputSchema: unknown;
  notes?: string;
  createdBy?: string;
}

export async function listPromptNames(
  db: Database,
): Promise<Array<{ name: string; versionCount: number; activeVersion: number | null }>> {
  const rows = await db
    .select({
      name: schema.promptLibrary.name,
      versionCount: sql<number>`count(*)::int`,
      activeVersion: sql<
        number | null
      >`max(case when ${schema.promptLibrary.isActive} then ${schema.promptLibrary.version} else null end)::int`,
    })
    .from(schema.promptLibrary)
    .groupBy(schema.promptLibrary.name)
    .orderBy(schema.promptLibrary.name);
  return rows;
}

export async function listVersionsForName(db: Database, name: string): Promise<PromptRow[]> {
  return db
    .select()
    .from(schema.promptLibrary)
    .where(eq(schema.promptLibrary.name, name))
    .orderBy(desc(schema.promptLibrary.version));
}

export async function findPromptVersion(
  db: Database,
  name: string,
  version: number,
): Promise<PromptRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.promptLibrary)
    .where(and(eq(schema.promptLibrary.name, name), eq(schema.promptLibrary.version, version)));
  return row;
}

export async function findActivePrompt(db: Database, name: string): Promise<PromptRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.promptLibrary)
    .where(and(eq(schema.promptLibrary.name, name), eq(schema.promptLibrary.isActive, true)));
  return row;
}

export async function createPromptVersion(
  db: Database,
  input: CreatePromptVersionInput,
): Promise<PromptRow> {
  return db.transaction(async (tx) => {
    const [{ nextVersion }] = await tx
      .select({
        nextVersion: sql<number>`coalesce(max(${schema.promptLibrary.version}), 0)::int + 1`,
      })
      .from(schema.promptLibrary)
      .where(eq(schema.promptLibrary.name, input.name));

    const [row] = await tx
      .insert(schema.promptLibrary)
      .values({
        name: input.name,
        version: nextVersion,
        model: input.model,
        systemPrompt: input.systemPrompt,
        userTemplate: input.userTemplate,
        outputSchema: input.outputSchema,
        isActive: false,
        notes: input.notes,
        createdBy: input.createdBy,
      })
      .returning();
    return row;
  });
}

/**
 * Deactivates every other version of `name` and activates `version`, in one
 * transaction -- enforces the "only one active version per prompt name"
 * constraint from Database_Schema.md section 8 (deliberately not a DB
 * constraint; see that section's note that it's an application-layer rule).
 */
export async function activatePromptVersion(
  db: Database,
  name: string,
  version: number,
): Promise<PromptRow | undefined> {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select()
      .from(schema.promptLibrary)
      .where(and(eq(schema.promptLibrary.name, name), eq(schema.promptLibrary.version, version)));
    if (!target) {
      return undefined;
    }

    await tx
      .update(schema.promptLibrary)
      .set({ isActive: false })
      .where(and(eq(schema.promptLibrary.name, name), eq(schema.promptLibrary.isActive, true)));

    const [updated] = await tx
      .update(schema.promptLibrary)
      .set({ isActive: true })
      .where(and(eq(schema.promptLibrary.name, name), eq(schema.promptLibrary.version, version)))
      .returning();
    return updated;
  });
}
