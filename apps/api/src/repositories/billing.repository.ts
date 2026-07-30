import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, ne, sql } from 'drizzle-orm';

export type SubscriptionRow = typeof schema.subscriptions.$inferSelect;
export type InvoiceRow = typeof schema.invoices.$inferSelect;
export type BillingEventRow = typeof schema.billingEvents.$inferSelect;

// RLS-protected (org_id) -- every query here must run inside withTenant().
// Design note (Phase 9): unlike sessions/oauth_accounts, subscriptions and
// invoices keep their migration-0003 RLS policy unchanged -- there is no
// "look up before tenant context exists" problem here, because every Stripe
// object this service creates is stamped with `metadata.org_id` (and
// Checkout Sessions additionally with `client_reference_id`) at creation
// time (see billing.service.ts). A webhook handler therefore always reads
// org_id directly out of the Stripe event's own payload before touching the
// database, never by looking a provider id up first -- so every write here
// can go through withTenant() like any other authenticated request would.

export async function findActiveSubscriptionForOrg(
  db: Database,
  tenant: TenantContext,
): Promise<SubscriptionRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.subscriptions)
      .where(ne(schema.subscriptions.status, 'canceled'))
      .orderBy(desc(schema.subscriptions.createdAt))
      .limit(1);
    return row;
  });
}

export async function findSubscriptionById(
  db: Database,
  tenant: TenantContext,
  id: string,
): Promise<SubscriptionRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, id));
    return row;
  });
}

export interface UpsertSubscriptionInput {
  plan: string;
  status: string;
  billingProvider: string;
  billingCycle: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  checkoutSessionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: Date | null;
}

// One row per org, matching the documented "one-subscription rule"
// (docs/architecture/billing/03-domain-model.md): update the org's existing
// non-canceled row if one exists, otherwise insert a new one.
export async function upsertSubscriptionForOrg(
  db: Database,
  tenant: TenantContext,
  input: UpsertSubscriptionInput,
): Promise<SubscriptionRow> {
  return withTenant(db, tenant, async (tx) => {
    const [existing] = await tx
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(ne(schema.subscriptions.status, 'canceled'))
      .orderBy(desc(schema.subscriptions.createdAt))
      .limit(1);

    if (existing) {
      const [row] = await tx
        .update(schema.subscriptions)
        .set(input)
        .where(eq(schema.subscriptions.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await tx
      .insert(schema.subscriptions)
      .values({ orgId: tenant.orgId, ...input })
      .returning();
    return row;
  });
}

export async function listInvoicesForOrg(
  db: Database,
  tenant: TenantContext,
  limit: number,
  offset: number,
): Promise<{ rows: InvoiceRow[]; total: number }> {
  return withTenant(db, tenant, async (tx) => {
    const [rows, [{ count }]] = await Promise.all([
      tx
        .select()
        .from(schema.invoices)
        .orderBy(desc(schema.invoices.createdAt))
        .limit(limit)
        .offset(offset),
      tx.select({ count: sql<number>`count(*)::int` }).from(schema.invoices),
    ]);
    return { rows, total: count };
  });
}

// No RLS (see packages/db/src/migrations/0011_billing_events.sql) -- a
// webhook idempotency check runs before any tenant context can exist.
export interface RecordBillingEventInput {
  provider: string;
  providerEventId: string;
  eventType: string;
  orgId: string | null;
  subscriptionId: string | null;
  status: 'processed' | 'failed' | 'skipped';
  errorMessage?: string;
  rawPayload: unknown;
}

export async function findBillingEventByProviderEventId(
  db: Database,
  provider: string,
  providerEventId: string,
): Promise<BillingEventRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.billingEvents)
    .where(
      and(
        eq(schema.billingEvents.provider, provider),
        eq(schema.billingEvents.providerEventId, providerEventId),
      ),
    );
  return row;
}

export async function recordBillingEvent(
  db: Database,
  input: RecordBillingEventInput,
): Promise<BillingEventRow> {
  const [row] = await db
    .insert(schema.billingEvents)
    .values({
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      orgId: input.orgId,
      subscriptionId: input.subscriptionId,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      rawPayload: input.rawPayload as Record<string, unknown>,
    })
    .returning();
  return row;
}
