import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';
import { users } from './users.js';
import { watchlists } from './watchlists.js';

export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    watchlistId: uuid('watchlist_id').references(() => watchlists.id, { onDelete: 'cascade' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    triggerType: text('trigger_type').notNull(),
    thresholdValue: numeric('threshold_value', { precision: 5, scale: 2 }),
    deliveryChannels: jsonb('delivery_channels').notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_alert_rules_org_id').on(table.orgId),
    index('idx_alert_rules_watchlist_id').on(table.watchlistId),
    index('idx_alert_rules_is_active')
      .on(table.isActive)
      .where(sql`${table.deletedAt} IS NULL`),
    check(
      'alert_rules_trigger_type_check',
      sql`${table.triggerType} IN ('viral_score_threshold', 'trend_spike', 'channel_upload', 'breakout_prediction')`,
    ),
  ],
);
