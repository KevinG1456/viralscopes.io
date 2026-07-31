import type { Database } from '@viralscopes/db';
import type { FastifyBaseLogger } from 'fastify';

import { auditLog } from '../lib/audit-log.js';
import {
  findActiveSubscriptionForOrg,
  listOrganizationsForMaintenance,
  purgeOldBillingEvents,
  updateOrganizationPlan,
  upsertSubscriptionForOrg,
} from '../repositories/billing.repository.js';

const BILLING_EVENTS_RETENTION_DAYS = 90;

// docs/architecture/billing/07-subscription-lifecycle.md's resolved
// "grace-period expiry mechanism" decision, run daily via a BullMQ
// repeatable job (see lib/billing-maintenance-queue.ts) rather than an n8n
// scheduled workflow -- this is an in-process billing maintenance task,
// not a workflow n8n needs to know about.
//
// This is NOT the real-time enforcement boundary -- lib/plan-enforcement.ts's
// getEnforcedPlanTier() already checks grace_period_ends_at live, on every
// request that needs it, independent of this job's schedule. This job keeps
// `subscriptions.status`/`organizations.plan` eventually-consistent for
// display and billing-history accuracy (so the billing dashboard doesn't
// say "active" forever after a grace period silently expired), and runs
// the billing_events retention purge as a second scheduled task, per the
// architecture's explicit decision to fold both into one job rather than
// inventing a second unspecified mechanism.
export async function runGracePeriodExpiry(
  db: Database,
  logger: FastifyBaseLogger,
): Promise<{ downgraded: number; purgedBillingEvents: number }> {
  const orgs = await listOrganizationsForMaintenance(db);
  let downgraded = 0;

  for (const org of orgs) {
    const tenant = { orgId: org.id, userId: org.ownerId };
    const subscription = await findActiveSubscriptionForOrg(db, tenant);
    if (!subscription) continue;
    if (subscription.status !== 'active') continue;
    if (!subscription.gracePeriodEndsAt || subscription.gracePeriodEndsAt >= new Date()) continue;

    const updated = await upsertSubscriptionForOrg(db, tenant, {
      plan: subscription.plan,
      status: 'past_due',
      billingProvider: subscription.billingProvider,
      billingCycle: subscription.billingCycle,
      providerCustomerId: subscription.providerCustomerId,
      providerSubscriptionId: subscription.providerSubscriptionId,
      checkoutSessionId: subscription.checkoutSessionId,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      gracePeriodEndsAt: subscription.gracePeriodEndsAt,
      canceledAt: subscription.canceledAt,
    });
    await updateOrganizationPlan(db, org.id, 'free');
    await auditLog(db, tenant, {
      userId: null,
      action: 'billing.subscription.grace_period_ended',
      resourceType: 'subscription',
      resourceId: updated.id,
      metadata: { gracePeriodEndsAt: subscription.gracePeriodEndsAt.toISOString() },
    });
    downgraded += 1;
    logger.info(
      { orgId: org.id, subscriptionId: updated.id },
      'Grace period expired -- downgraded to free',
    );
  }

  const cutoff = new Date(Date.now() - BILLING_EVENTS_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const purgedBillingEvents = await purgeOldBillingEvents(db, cutoff);

  return { downgraded, purgedBillingEvents };
}
