import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users.js';

// Platform configuration, admin-managed -- no RLS. Only one active version per
// prompt name is enforced at the application layer (see Database_Schema.md section 8).
export const promptLibrary = pgTable(
  'prompt_library',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    version: integer('version').notNull(),
    model: text('model').notNull(),
    systemPrompt: text('system_prompt').notNull(),
    userTemplate: text('user_template').notNull(),
    outputSchema: jsonb('output_schema').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_prompt_library_name_version').on(table.name, table.version),
    index('idx_prompt_library_name').on(table.name),
    index('idx_prompt_library_is_active')
      .on(table.name, table.isActive)
      .where(sql`${table.isActive} = TRUE`),
  ],
);
