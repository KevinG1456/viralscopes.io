import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

import * as schema from './schema/index.js';

export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Creates a Drizzle client bound to the given connection string.
 *
 * `connectionString` should be the pooled connection string
 * (Supabase's pooler, port 6543, transaction mode) in production, and the
 * direct connection string in local development -- see
 * apps/api/src/config.ts's `databaseUrl` / `databasePoolUrl`.
 */
export function createDbClient(connectionString: string): Database {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

/**
 * Tenant context for a single request, used to scope Row Level Security.
 *
 * The app authenticates and resolves org membership itself (custom JWT auth,
 * not Supabase Auth) -- RLS policies read this session-local value via
 * `current_setting('app.current_org_id', true)` as a second line of defence
 * behind the explicit `org_id` filters every repository query already
 * applies. See DEC-015 / AD-1 in PROJECT_STATUS.md for why this replaces the
 * `auth.uid()` pattern.
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
 * tenant-scoped or user-scoped tables (see migration 0001_add_rls_policies).
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
