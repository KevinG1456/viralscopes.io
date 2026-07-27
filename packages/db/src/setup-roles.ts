import 'dotenv/config';
import postgres from 'postgres';

// Postgres superusers and table owners bypass Row Level Security
// unconditionally, regardless of policies (this is a real Postgres
// behaviour, not a bug -- confirmed while verifying Phase 3's RLS
// policies: querying as the migration role returned all tenants' rows
// even with policies active). Migrations run as the superuser (DDL needs
// those privileges), but the application must connect as a separate,
// unprivileged, non-owning role for RLS to actually apply. This mirrors
// how Supabase's own `authenticated` role works, adapted for this
// project's custom-JWT auth instead of Supabase Auth.
//
// Safe to run repeatedly: creates the role only if missing, and always
// re-applies grants (so re-running after a new table/migration keeps
// privileges current).

function loadUrl(name: string): string {
  const url = process.env[name];
  if (!url) {
    throw new Error(`${name} is not set. Copy .env.example to .env and set it.`);
  }
  return url;
}

// Postgres identifiers (role names) can't be passed as bind parameters --
// CREATE ROLE/GRANT take them as raw SQL -- so this is validated against an
// allowlist pattern before being interpolated, rather than accepted as-is.
const VALID_IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

async function main(): Promise<void> {
  const appUser = process.env.APP_DB_USER ?? 'app_user';
  const appPassword = process.env.APP_DB_PASSWORD;
  if (!appPassword) {
    throw new Error('APP_DB_PASSWORD is not set. Copy .env.example to .env and set it.');
  }
  if (!VALID_IDENTIFIER.test(appUser)) {
    throw new Error(
      `APP_DB_USER "${appUser}" is not a valid Postgres identifier (lowercase letters, digits, underscore; must not start with a digit).`,
    );
  }

  const sql = postgres(loadUrl('DATABASE_URL'), { prepare: false });
  try {
    const [{ exists }] = await sql<
      { exists: boolean }[]
    >`SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${appUser}) AS exists`;

    // CREATE ROLE / ALTER ROLE are DDL -- Postgres does not accept bind
    // parameters ($1) in that position, so the password must be a literal.
    // Standard-conforming string escaping (doubling embedded single quotes)
    // is safe here: the value comes from a local .env file, not untrusted
    // request input.
    const escapedPassword = appPassword.replace(/'/g, "''");
    if (exists) {
      await sql.unsafe(`ALTER ROLE ${appUser} WITH LOGIN PASSWORD '${escapedPassword}'`);
      console.log(`Role "${appUser}" already existed; password updated.`);
    } else {
      await sql.unsafe(
        `CREATE ROLE ${appUser} WITH LOGIN PASSWORD '${escapedPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS`,
      );
      console.log(`Created role "${appUser}".`);
    }

    await sql.unsafe(`GRANT USAGE ON SCHEMA public TO ${appUser}`);
    await sql.unsafe(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${appUser}`,
    );
    await sql.unsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${appUser}`,
    );
    console.log(`Granted table privileges on schema "public" to "${appUser}".`);
  } finally {
    await sql.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
