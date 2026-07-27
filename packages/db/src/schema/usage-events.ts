import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Partitioned by month on created_at (migration 0004) -- never updated.
// The primary key includes created_at because Postgres requires the
// partition key to be part of every unique constraint on a partitioned
// table. Retention: 13 months. RLS: org-scoped via org_id -- see migration 0003.
export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').notNull().defaultRandom(),
    orgId: uuid('org_id').notNull(),
    userId: uuid('user_id'),
    eventType: text('event_type').notNull(),
    quantity: integer('quantity').notNull().default(1),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    index('idx_usage_events_org_id').on(table.orgId, table.createdAt),
    index('idx_usage_events_event_type').on(table.eventType, table.createdAt),
    check(
      'usage_events_event_type_check',
      sql`${table.eventType} IN ('video_analyzed', 'api_request', 'export_created', 'alert_triggered', 'ai_chat_message', 'search_executed')`,
    ),
  ],
);
