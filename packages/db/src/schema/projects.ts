import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { workspaces } from './workspaces.js';

// RLS: org-scoped indirectly, via workspace_id -> workspaces.org_id --
// see migration 0003 (projects has no org_id column of its own).
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [index('idx_projects_workspace_id').on(table.workspaceId)],
);
