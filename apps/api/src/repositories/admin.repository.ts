import { type Database, schema } from '@viralscopes/db';
import { and, desc, eq, gte, isNull, sql } from 'drizzle-orm';

// All tables here are "no RLS, admin-only internal operations data" per
// their own schema comments (users/organizations are root tables filtered
// by application logic; job_logs/dead_letter_jobs are explicitly
// admin-only) -- access control is entirely the requireSuperAdmin
// middleware, not the database. Plain db.* queries, no withTenant().

export type AdminUserRow = Omit<typeof schema.users.$inferSelect, 'passwordHash'>;

export async function listUsers(
  db: Database,
  limit: number,
  offset: number,
): Promise<{ rows: AdminUserRow[]; total: number }> {
  const where = isNull(schema.users.deletedAt);
  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        avatarUrl: schema.users.avatarUrl,
        emailVerified: schema.users.emailVerified,
        role: schema.users.role,
        onboardingDone: schema.users.onboardingDone,
        deletedAt: schema.users.deletedAt,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(where)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(where),
  ]);
  return { rows, total: count };
}

export type OrganizationRow = typeof schema.organizations.$inferSelect;

export async function listOrganizations(
  db: Database,
  limit: number,
  offset: number,
): Promise<{ rows: OrganizationRow[]; total: number }> {
  const where = isNull(schema.organizations.deletedAt);
  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.organizations)
      .where(where)
      .orderBy(desc(schema.organizations.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.organizations)
      .where(where),
  ]);
  return { rows, total: count };
}

export type JobLogRow = typeof schema.jobLogs.$inferSelect;

export interface JobLogFilters {
  status?: string;
  workflowName?: string;
}

export async function listJobLogs(
  db: Database,
  filters: JobLogFilters,
  limit: number,
  offset: number,
): Promise<{ rows: JobLogRow[]; total: number }> {
  const conditions = [
    filters.status ? eq(schema.jobLogs.status, filters.status) : undefined,
    filters.workflowName ? eq(schema.jobLogs.workflowName, filters.workflowName) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.jobLogs)
      .where(where)
      .orderBy(desc(schema.jobLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.jobLogs)
      .where(where),
  ]);
  return { rows, total: count };
}

export type DeadLetterJobRow = typeof schema.deadLetterJobs.$inferSelect;

export async function listDeadLetterJobs(
  db: Database,
  resolved: boolean | undefined,
  limit: number,
  offset: number,
): Promise<{ rows: DeadLetterJobRow[]; total: number }> {
  const where = resolved !== undefined ? eq(schema.deadLetterJobs.resolved, resolved) : undefined;
  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(schema.deadLetterJobs)
      .where(where)
      .orderBy(desc(schema.deadLetterJobs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.deadLetterJobs)
      .where(where),
  ]);
  return { rows, total: count };
}

export async function findDeadLetterJobById(
  db: Database,
  id: string,
): Promise<DeadLetterJobRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.deadLetterJobs)
    .where(eq(schema.deadLetterJobs.id, id));
  return row;
}

export async function markDeadLetterJobForRetry(
  db: Database,
  id: string,
): Promise<DeadLetterJobRow | undefined> {
  const [row] = await db
    .update(schema.deadLetterJobs)
    .set({
      retryAttempts: sql`${schema.deadLetterJobs.retryAttempts} + 1`,
      lastAttemptAt: new Date(),
    })
    .where(eq(schema.deadLetterJobs.id, id))
    .returning();
  return row;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalOrganizations: number;
  jobsByStatusLast24h: Record<string, number>;
  unresolvedDeadLetterJobs: number;
}

export async function getPlatformMetrics(db: Database): Promise<PlatformMetrics> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [[{ userCount }], [{ orgCount }], jobRows, [{ deadLetterCount }]] = await Promise.all([
    db
      .select({ userCount: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(isNull(schema.users.deletedAt)),
    db
      .select({ orgCount: sql<number>`count(*)::int` })
      .from(schema.organizations)
      .where(isNull(schema.organizations.deletedAt)),
    db
      .select({ status: schema.jobLogs.status, count: sql<number>`count(*)::int` })
      .from(schema.jobLogs)
      .where(gte(schema.jobLogs.createdAt, since24h))
      .groupBy(schema.jobLogs.status),
    db
      .select({ deadLetterCount: sql<number>`count(*)::int` })
      .from(schema.deadLetterJobs)
      .where(eq(schema.deadLetterJobs.resolved, false)),
  ]);

  const jobsByStatusLast24h: Record<string, number> = {};
  for (const row of jobRows) {
    jobsByStatusLast24h[row.status] = row.count;
  }

  return {
    totalUsers: userCount,
    totalOrganizations: orgCount,
    jobsByStatusLast24h,
    unresolvedDeadLetterJobs: deadLetterCount,
  };
}
