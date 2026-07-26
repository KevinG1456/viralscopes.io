import { sql } from 'drizzle-orm';

import type { Database } from '../client.js';
import { users } from '../schema/index.js';

/** Two dev accounts: one super_admin, one regular user. Password: `devpassword` for both. */
export async function seedUsers(db: Database) {
  // bcrypt hash of "devpassword" -- fixed for reproducible seed data, never used outside dev.
  const passwordHash = '$2b$10$K7Lz1rF3z7z0z0z0z0z0z.eZ0z0z0z0z0z0z0z0z0z0z0z0z0z0z0';

  const [admin, member] = await db
    .insert(users)
    .values([
      {
        email: 'admin@viralscopes.dev',
        name: 'Dev Admin',
        role: 'super_admin',
        emailVerified: true,
        passwordHash,
      },
      {
        email: 'member@viralscopes.dev',
        name: 'Dev Member',
        role: 'user',
        emailVerified: true,
        passwordHash,
      },
    ])
    .onConflictDoNothing({ target: users.email, where: sql`${users.deletedAt} IS NULL` })
    .returning();

  return { admin, member };
}
