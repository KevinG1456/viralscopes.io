import { sql } from 'drizzle-orm';
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { users } from './users.js';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    plan: text('plan').notNull().default('free'),
    logoUrl: text('logo_url'),
    settings: jsonb('settings').notNull().default({}),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex('uq_organizations_slug')
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_organizations_owner_id').on(table.ownerId),
    index('idx_organizations_plan').on(table.plan),
    check(
      'organizations_plan_check',
      sql`${table.plan} IN ('free', 'starter', 'professional', 'business', 'enterprise')`,
    ),
  ],
);
