import { type Database, schema } from '@viralscopes/db';
import { and, eq, isNull } from 'drizzle-orm';

export type UserRow = typeof schema.users.$inferSelect;

export async function findUserByEmail(db: Database, email: string): Promise<UserRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, email), isNull(schema.users.deletedAt)));
  return row;
}

export async function findUserById(db: Database, id: string): Promise<UserRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.id, id), isNull(schema.users.deletedAt)));
  return row;
}

export async function createUser(
  db: Database,
  input: { email: string; name: string; passwordHash: string | null },
): Promise<UserRow> {
  const [row] = await db.insert(schema.users).values(input).returning();
  return row;
}

export async function markEmailVerified(db: Database, userId: string): Promise<void> {
  await db.update(schema.users).set({ emailVerified: true }).where(eq(schema.users.id, userId));
}

export async function updatePasswordHash(
  db: Database,
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, userId));
}
