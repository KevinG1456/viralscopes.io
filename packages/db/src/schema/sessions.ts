import { boolean, index, inet, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

// RLS: user-scoped (no org_id column) -- see migration 0003.
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // sha256(refresh_token) -- the plaintext token is never persisted.
    refreshTokenHash: text('refresh_token_hash').notNull().unique(),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_sessions_user_id').on(table.userId),
    index('idx_sessions_expires_at').on(table.expiresAt),
  ],
);
