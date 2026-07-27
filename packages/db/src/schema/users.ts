import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';

// No RLS -- root identity table, not org-scoped. Access is filtered by
// session/application logic, not by a tenant column. See Database_Schema.md
// section 12.
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name'),
    avatarUrl: text('avatar_url'),
    // NULL for OAuth-only accounts (see oauth_accounts.ts).
    passwordHash: text('password_hash'),
    emailVerified: boolean('email_verified').notNull().default(false),
    role: text('role').notNull().default('user'),
    onboardingDone: boolean('onboarding_done').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex('uq_users_email')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_users_role').on(table.role),
    check('users_role_check', sql`${table.role} IN ('super_admin', 'user')`),
  ],
);
