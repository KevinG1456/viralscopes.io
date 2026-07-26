import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';
import { subscriptions } from './subscriptions.js';

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    provider: text('provider').notNull(),
    providerInvoiceId: text('provider_invoice_id').notNull().unique(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('gbp'),
    status: text('status').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    hostedUrl: text('hosted_url'),
    pdfUrl: text('pdf_url'),
    ...auditColumns(),
  },
  (table) => [
    index('idx_invoices_org_id').on(table.orgId),
    index('idx_invoices_status').on(table.status),
    check(
      'invoices_status_check',
      sql`${table.status} IN ('draft', 'open', 'paid', 'void', 'uncollectible')`,
    ),
  ],
);
