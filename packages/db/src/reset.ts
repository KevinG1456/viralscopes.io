import 'dotenv/config';
import postgres from 'postgres';

// Local-dev convenience only: drops every object migrate.ts's up path
// creates, so `npm run db:reset && npm run db:migrate && npm run db:seed`
// gives a known-clean slate. Refuses to run unless DATABASE_URL points at
// localhost, to make it hard to point this at a shared/hosted database by
// mistake.

function loadDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and set it, or export it directly.',
    );
  }
  const { hostname } = new URL(url);
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    throw new Error(
      `Refusing to run db:reset against non-local host "${hostname}". This script is for local development only.`,
    );
  }
  return url;
}

async function main(): Promise<void> {
  const sql = postgres(loadDatabaseUrl(), { prepare: false });
  try {
    console.log('Dropping public schema...');
    await sql.unsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('Done. Run `npm run db:migrate` next.');
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
