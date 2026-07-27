import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

// RLS: org-scoped via org_id -- see migration 0003.
export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'),
    invitedBy: uuid('invited_by').references(() => users.id),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_org_members_org_id').on(table.orgId),
    index('idx_org_members_user_id').on(table.userId),
    uniqueIndex('uq_organization_members_org_user').on(table.orgId, table.userId),
    check(
      'organization_members_role_check',
      sql`${table.role} IN ('admin', 'owner', 'member', 'viewer')`,
    ),
  ],
);
