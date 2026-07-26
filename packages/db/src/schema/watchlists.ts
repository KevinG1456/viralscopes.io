import { sql } from 'drizzle-orm';
import { boolean, check, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';
import { users } from './users.js';
import { workspaces } from './workspaces.js';

export const watchlists = pgTable(
  'watchlists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    type: text('type').notNull(),
    target: text('target').notNull(),
    targetMetadata: jsonb('target_metadata').notNull().default({}),
    isActive: boolean('is_active').notNull().default(true),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_watchlists_org_id').on(table.orgId),
    index('idx_watchlists_type').on(table.type),
    index('idx_watchlists_is_active')
      .on(table.orgId, table.isActive)
      .where(sql`${table.deletedAt} IS NULL`),
    check(
      'watchlists_type_check',
      sql`${table.type} IN ('channel', 'keyword', 'niche', 'competitor')`,
    ),
  ],
);
