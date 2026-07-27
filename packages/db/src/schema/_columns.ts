import { timestamp } from 'drizzle-orm/pg-core';

// The standard created_at/updated_at pair used on every non-append-only
// table (Database_Schema.md section 3). updated_at is kept current by the
// set_updated_at trigger created in migration 0002, not by the application.
// Drizzle's chained column-builder type (NotNullBuilder<...>) isn't
// practical to spell out by hand and isn't a public contract -- it's only
// ever spread into a pgTable() column map, which re-infers it there.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function auditColumns() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  };
}
