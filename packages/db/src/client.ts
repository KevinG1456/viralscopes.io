import { sql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

// Keeps `$client` in the type so callers (migrate.ts, seeds/run.ts) can
// call `db.$client.end()` to close the connection without importing
// `postgres` themselves.
export type Database = PostgresJsDatabase<typeof schema> & { $client: postgres.Sql };

/**
 * Creates a Drizzle client bound to the given connection string.
 *
 * `connectionString` should be the pooled connection string (Supabase's
 * PgBouncer pooler in production) or the direct local connection string in
 * development -- see apps/api/src/config.ts's `databaseUrl`.
 */
export function createDbClient(connectionString: string): Database {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

/**
 * Tenant context for a single request, used to scope Row Level Security.
 *
 * This project authenticates with its own JWT/OAuth system (own `users` /
 * `sessions` tables, bcrypt password hashes, custom refresh-token sessions --
 * see Security_Architecture.md section 5 and PRD.md FR-43), not Supabase
 * Auth. RLS policies therefore cannot use Supabase's `auth.uid()`; instead
 * they read these session-local values via
 * `current_setting('app.current_org_id', true)` /
 * `current_setting('app.current_user_id', true)` as a second line of
 * defence behind the explicit `org_id` filters every repository query
 * already applies. See migration 0003_rls_policies.sql and the corrected
 * RLS section in Database_Schema.md section 12.
 */
export interface TenantContext {
  orgId: string;
  userId: string;
}

/**
 * Runs `fn` inside a transaction with `app.current_org_id` and
 * `app.current_user_id` set for the duration of the transaction, so RLS
 * policies scope every statement to the caller's organisation/identity.
 * Always use this (never a bare `db.transaction`) for queries against
 * tenant-scoped or user-scoped tables.
 */
export async function withTenant<T>(
  db: Database,
  tenant: TenantContext,
  fn: (tx: Database) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.current_org_id', ${tenant.orgId}, true)`);
    await tx.execute(sql`select set_config('app.current_user_id', ${tenant.userId}, true)`);
    return fn(tx as unknown as Database);
  });
}
