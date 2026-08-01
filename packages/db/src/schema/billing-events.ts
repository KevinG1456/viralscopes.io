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

import { organizations } from './organizations.js';
import { subscriptions } from './subscriptions.js';

// Webhook idempotency ledger (Phase 9). No RLS -- same "identity must be
// looked up before tenant context exists" problem migrations 0006/0007
// already solved for sessions/oauth_accounts/organization_members: a
// webhook payload references a provider customer/subscription id, and the
// org it belongs to is only discoverable by looking that id up, which
// happens before any tenant context exists for the request (a webhook is
// not an authenticated, org-scoped request at all). The compensating
// control is the UNIQUE (provider, provider_event_id) constraint (the
// provider's documented idempotency key) enforced at insert time, plus
// explicit org_id filtering once it's resolved and backfilled onto the row.
//
// Named provider-agnostically (not stripe_webhook_events): subscriptions'
// billing_provider column already treats stripe as one of four values
// (stripe/paddle/crypto/manual) -- see docs/reviews/billing/02-consistency-review.md §1.
export const billingEvents = pgTable(
  'billing_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull().default('stripe'),
    providerEventId: text('provider_event_id').notNull(),
    eventType: text('event_type').notNull(),
    orgId: uuid('org_id').references(() => organizations.id),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    status: text('status').notNull().default('processed'),
    errorMessage: text('error_message'),
    rawPayload: jsonb('raw_payload').notNull().default({}),
    processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_billing_events_provider_event_id').on(table.provider, table.providerEventId),
    index('idx_billing_events_org_id').on(table.orgId),
    index('idx_billing_events_processed_at').on(table.processedAt),
    check(
      'billing_events_status_check',
      sql`${table.status} IN ('processed', 'failed', 'skipped')`,
    ),
  ],
);
