import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import 'dotenv/config';
import postgres from 'postgres';

// Custom migration runner (not drizzle-kit's own migrate()) because
// drizzle-kit's forward-only journal has no `down` command, and
// Database_Schema.md section 14 requires every migration to be reversible.
// Each file in src/migrations/*.sql carries both an "-- Up" and a
// "-- Down" section; this runner tracks which have been applied in a
// `_migrations` table and can apply (up) or revert (down) them in order.

type DbSql = ReturnType<typeof postgres>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

function loadDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and set it, or export it directly.',
    );
  }
  return url;
}

function listMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

function splitUpDown(fileContents: string): { up: string; down: string } {
  const upMarker = '-- Up';
  const downMarker = '-- Down';
  const upIndex = fileContents.indexOf(upMarker);
  const downIndex = fileContents.indexOf(downMarker);
  if (upIndex === -1 || downIndex === -1 || downIndex < upIndex) {
    throw new Error('Migration file is missing "-- Up" / "-- Down" section markers.');
  }
  return {
    up: fileContents.slice(upIndex + upMarker.length, downIndex).trim(),
    down: fileContents.slice(downIndex + downMarker.length).trim(),
  };
}

async function ensureMigrationsTable(sql: DbSql): Promise<void> {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(sql: DbSql): Promise<Set<string>> {
  const rows = await sql<{ name: string }[]>`SELECT name FROM _migrations ORDER BY id`;
  return new Set(rows.map((r) => r.name));
}

async function up(sql: DbSql): Promise<void> {
  await ensureMigrationsTable(sql);
  const applied = await getAppliedMigrations(sql);
  const files = listMigrationFiles();
  let appliedCount = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const contents = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    const { up: upSql } = splitUpDown(contents);
    console.log(`Applying ${file}...`);
    await sql.begin(async (tx) => {
      await tx.unsafe(upSql);
      await tx`INSERT INTO _migrations (name) VALUES (${file})`;
    });
    appliedCount++;
  }
  console.log(appliedCount === 0 ? 'Already up to date.' : `Applied ${appliedCount} migration(s).`);
}

async function down(sql: DbSql, steps: number): Promise<void> {
  await ensureMigrationsTable(sql);
  const rows = await sql<
    { name: string }[]
  >`SELECT name FROM _migrations ORDER BY id DESC LIMIT ${steps}`;
  if (rows.length === 0) {
    console.log('Nothing to roll back.');
    return;
  }
  for (const { name } of rows) {
    const contents = readFileSync(join(MIGRATIONS_DIR, name), 'utf8');
    const { down: downSql } = splitUpDown(contents);
    console.log(`Reverting ${name}...`);
    await sql.begin(async (tx) => {
      await tx.unsafe(downSql);
      await tx`DELETE FROM _migrations WHERE name = ${name}`;
    });
  }
  console.log(`Reverted ${rows.length} migration(s).`);
}

async function status(sql: DbSql): Promise<void> {
  await ensureMigrationsTable(sql);
  const applied = await getAppliedMigrations(sql);
  const files = listMigrationFiles();
  for (const file of files) {
    console.log(`${applied.has(file) ? '[applied]' : '[pending]'} ${file}`);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const sql = postgres(loadDatabaseUrl(), { prepare: false });
  try {
    if (command === 'up') {
      await up(sql);
    } else if (command === 'down') {
      const steps = process.argv[3] ? Number(process.argv[3]) : 1;
      await down(sql, steps);
    } else if (command === 'status') {
      await status(sql);
    } else {
      console.error('Usage: tsx src/migrate.ts <up|down|status> [steps]');
      process.exitCode = 1;
    }
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
