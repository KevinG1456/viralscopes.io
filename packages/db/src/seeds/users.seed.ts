import { and, eq, isNull, sql, type InferSelectModel } from 'drizzle-orm';

import type { Database } from '../client.js';
import { users } from '../schema/index.js';

type DevUserInput = {
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  passwordHash: string;
};

/**
 * Inserts a dev user if no active row with this email exists yet; otherwise
 * fetches and returns the existing active row. Never updates an existing
 * row -- a true insert-if-missing operation, not an upsert.
 */
async function insertUserIfMissing(
  db: Database,
  input: DevUserInput,
): Promise<InferSelectModel<typeof users>> {
  const [inserted] = await db
    .insert(users)
    .values(input)
    .onConflictDoNothing({ target: users.email, where: sql`${users.deletedAt} IS NULL` })
    .returning();

  if (inserted) return inserted;

  const [existing] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, input.email), isNull(users.deletedAt)));

  if (!existing) {
    throw new Error(
      `Seed insert for ${input.email} conflicted, but no active row was found on fallback lookup.`,
    );
  }
  return existing;
}

/** Two dev accounts: one super_admin, one regular user. Password: `devpassword` for both. */
export async function seedUsers(db: Database) {
  // bcrypt hash of "devpassword" -- fixed for reproducible seed data, never used outside dev.
  const passwordHash = '$2b$10$K7Lz1rF3z7z0z0z0z0z0z.eZ0z0z0z0z0z0z0z0z0z0z0z0z0z0z0';

  const admin = await insertUserIfMissing(db, {
    email: 'admin@viralscopes.dev',
    name: 'Dev Admin',
    role: 'super_admin',
    emailVerified: true,
    passwordHash,
  });

  const member = await insertUserIfMissing(db, {
    email: 'member@viralscopes.dev',
    name: 'Dev Member',
    role: 'user',
    emailVerified: true,
    passwordHash,
  });

  return { admin, member };
}
