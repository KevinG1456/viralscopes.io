import { sql } from 'drizzle-orm';
import { index, jsonb, pgTable, timestamp, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';

// RLS: org-scoped via org_id -- see migration 0003.
export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    settings: jsonb('settings').notNull().default({}),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_workspaces_org_id').on(table.orgId),
    // Not in Database_Schema.md's original table listing -- added so the
    // dev seed's "Default Workspace" insert can be a true idempotent
    // insert-if-missing (see seeds/organisations.seed.ts). Names aren't
    // globally unique, only unique per organisation.
    uniqueIndex('uq_workspaces_org_name')
      .on(table.orgId, table.name)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
