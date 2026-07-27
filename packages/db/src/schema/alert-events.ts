import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { alertRules } from './alert-rules.js';
import { organizations } from './organizations.js';

// Immutable log of dispatched alert notifications.
// RLS: org-scoped via org_id -- see migration 0003.
export const alertEvents = pgTable(
  'alert_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id),
    alertRuleId: uuid('alert_rule_id')
      .notNull()
      .references(() => alertRules.id),
    triggerType: text('trigger_type').notNull(),
    payload: jsonb('payload').notNull().default({}),
    deliveryChannel: text('delivery_channel').notNull(),
    deliveryTarget: text('delivery_target').notNull(),
    status: text('status').notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_alert_events_org_id').on(table.orgId, table.createdAt.desc()),
    index('idx_alert_events_alert_rule_id').on(table.alertRuleId),
    check('alert_events_status_check', sql`${table.status} IN ('sent', 'failed', 'throttled')`),
  ],
);
