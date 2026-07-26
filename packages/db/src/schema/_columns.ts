import { timestamp } from 'drizzle-orm/pg-core';

// The standard created_at/updated_at pair used on every non-append-only
// table (Database_Schema.md section 3). updated_at is kept current by the
// set_updated_at trigger created in migration 0001, not by the application.
export function auditColumns() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  };
}
