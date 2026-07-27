import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { auditColumns } from './_columns.js';
import { organizations } from './organizations.js';

// One active subscription per organisation; historical subscriptions are
// preserved. RLS: org-scoped via org_id -- see migration 0003.
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id),
    plan: text('plan').notNull(),
    status: text('status').notNull(),
    billingProvider: text('billing_provider').notNull().default('stripe'),
    providerCustomerId: text('provider_customer_id'),
    providerSubscriptionId: text('provider_subscription_id'),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
    gracePeriodEndsAt: timestamp('grace_period_ends_at', { withTimezone: true }),
    canceledAt: timestamp('canceled_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => [
    index('idx_subscriptions_org_id').on(table.orgId),
    index('idx_subscriptions_status').on(table.status),
    index('idx_subscriptions_provider_subscription_id').on(table.providerSubscriptionId),
    check(
      'subscriptions_plan_check',
      sql`${table.plan} IN ('free', 'starter', 'professional', 'business', 'enterprise')`,
    ),
    check(
      'subscriptions_status_check',
      sql`${table.status} IN ('active', 'trialing', 'past_due', 'canceled', 'paused')`,
    ),
    check(
      'subscriptions_billing_provider_check',
      sql`${table.billingProvider} IN ('stripe', 'paddle', 'crypto', 'manual')`,
    ),
  ],
);
