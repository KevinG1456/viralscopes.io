import { type Database, schema } from '@viralscopes/db';
import { and, eq, ne } from 'drizzle-orm';

export type SessionRow = typeof schema.sessions.$inferSelect;

export async function createSession(
  db: Database,
  input: {
    userId: string;
    refreshTokenHash: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
  },
): Promise<SessionRow> {
  const [row] = await db.insert(schema.sessions).values(input).returning();
  return row;
}

export async function findSessionByHash(
  db: Database,
  refreshTokenHash: string,
): Promise<SessionRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.refreshTokenHash, refreshTokenHash));
  return row;
}

export async function findSessionById(db: Database, id: string): Promise<SessionRow | undefined> {
  const [row] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
  return row;
}

export async function listActiveSessionsForUser(
  db: Database,
  userId: string,
): Promise<SessionRow[]> {
  return db
    .select()
    .from(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), eq(schema.sessions.revoked, false)));
}

export async function revokeSession(db: Database, id: string): Promise<void> {
  await db.update(schema.sessions).set({ revoked: true }).where(eq(schema.sessions.id, id));
}

export async function revokeAllSessionsForUser(
  db: Database,
  userId: string,
  exceptSessionId?: string,
): Promise<number> {
  const condition = exceptSessionId
    ? and(
        eq(schema.sessions.userId, userId),
        eq(schema.sessions.revoked, false),
        ne(schema.sessions.id, exceptSessionId),
      )
    : and(eq(schema.sessions.userId, userId), eq(schema.sessions.revoked, false));

  const rows = await db
    .update(schema.sessions)
    .set({ revoked: true })
    .where(condition)
    .returning({ id: schema.sessions.id });
  return rows.length;
}

export async function touchSessionLastUsed(db: Database, id: string): Promise<void> {
  await db
    .update(schema.sessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.sessions.id, id));
}
