import { index, inet, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { organizations } from './organizations.js';
import { users } from './users.js';

// Immutable -- never updated, never soft-deleted. Retention: 2 years.
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').references(() => organizations.id),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: text('resource_id'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_org_id').on(table.orgId),
    index('idx_audit_logs_user_id').on(table.userId),
    index('idx_audit_logs_created_at').on(table.createdAt),
    index('idx_audit_logs_action').on(table.action),
  ],
);
