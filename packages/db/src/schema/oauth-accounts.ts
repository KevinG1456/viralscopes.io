import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { users } from './users.js';

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerUid: text('provider_uid').notNull(),
    // Encrypted at rest by the application layer before insert.
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_oauth_accounts_user_id').on(table.userId),
    uniqueIndex('uq_oauth_accounts_provider_uid').on(table.provider, table.providerUid),
    check('oauth_accounts_provider_check', sql`${table.provider} IN ('google', 'github')`),
  ],
);
