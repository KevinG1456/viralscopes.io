import { type Database, schema, type TenantContext, withTenant } from '@viralscopes/db';
import { and, desc, eq, isNull, lt, ne, sql } from 'drizzle-orm';

export type SubscriptionRow = typeof schema.subscriptions.$inferSelect;
export type InvoiceRow = typeof schema.invoices.$inferSelect;
export type BillingEventRow = typeof schema.billingEvents.$inferSelect;

export interface OrgForBilling {
  id: string;
  name: string;
  plan: string;
  ownerId: string;
  ownerEmail: string;
}

// organizations/users have no RLS (root tables, filtered by application
// logic -- see their own schema comments); no withTenant() needed here, but
// the explicit id + deletedAt filters are still required (RLS is
// defense-in-depth, not the only line -- PROJECT_RULES.md §3.8). Used to
// validate the organisation is real and not soft-deleted before creating a
// checkout/portal session, and to source the owner's email for Stripe.
// `ownerId` doubles as the `TenantContext.userId` for webhook-driven writes
// (a webhook has no acting user of its own -- see webhook.service.ts).
export async function findOrgWithOwnerEmail(
  db: Database,
  orgId: string,
): Promise<OrgForBilling | undefined> {
  const [row] = await db
    .select({
      id: schema.organizations.id,
      name: schema.organizations.name,
      plan: schema.organizations.plan,
      ownerId: schema.organizations.ownerId,
      ownerEmail: schema.users.email,
    })
    .from(schema.organizations)
    .innerJoin(schema.users, eq(schema.users.id, schema.organizations.ownerId))
    .where(
      and(
        eq(schema.organizations.id, orgId),
        isNull(schema.organizations.deletedAt),
        isNull(schema.users.deletedAt),
      ),
    );
  return row;
}

// No RLS on organizations (root tenant container) -- plain, explicitly
// id-filtered update. Kept in sync with subscriptions.plan by every webhook
// handler that changes plan, since organizations.plan is the fast-path
// feature-gating value the JWT's planTier claim is populated from.
export async function updateOrganizationPlan(
  db: Database,
  orgId: string,
  plan: string,
): Promise<void> {
  await db.update(schema.organizations).set({ plan }).where(eq(schema.organizations.id, orgId));
}

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
  canceledAt: Date | null;
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

// Defensive cross-check for customer.subscription.updated/deleted: org_id
// is already resolved from the event's own metadata (DEC-027), so this is
// scoped by tenant, not a global lookup -- it just confirms the org's
// current subscription row actually matches the Stripe subscription the
// event is about, rather than blindly trusting the one-subscription-rule.
export async function findSubscriptionByProviderSubscriptionId(
  db: Database,
  tenant: TenantContext,
  providerSubscriptionId: string,
): Promise<SubscriptionRow | undefined> {
  return withTenant(db, tenant, async (tx) => {
    const [row] = await tx
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.providerSubscriptionId, providerSubscriptionId));
    return row;
  });
}

export interface UpsertInvoiceInput {
  subscriptionId: string | null;
  providerInvoiceId: string;
  amountCents: number;
  currency: string;
  status: string;
  paidAt: Date | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
}

// Idempotent on providerInvoiceId (UNIQUE constraint) -- Stripe can send
// invoice.payment_failed then later invoice.paid for the same invoice;
// this must update the existing row, not create a second one.
export async function upsertInvoiceForOrg(
  db: Database,
  tenant: TenantContext,
  input: UpsertInvoiceInput,
): Promise<InvoiceRow> {
  return withTenant(db, tenant, async (tx) => {
    const [existing] = await tx
      .select({ id: schema.invoices.id })
      .from(schema.invoices)
      .where(eq(schema.invoices.providerInvoiceId, input.providerInvoiceId));

    if (existing) {
      const [row] = await tx
        .update(schema.invoices)
        .set(input)
        .where(eq(schema.invoices.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await tx
      .insert(schema.invoices)
      .values({ orgId: tenant.orgId, provider: 'stripe', ...input })
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

// No RLS (billing_events, see above) -- the 90-day retention purge
// docs/architecture/billing/04-database-design.md documents, run daily by
// jobs/grace-period-expiry.job.ts's repeatable BullMQ job alongside the
// grace-period sweep, per 07-subscription-lifecycle.md's resolved decision
// ("the same repeatable job also runs the billing_events 90-day retention
// purge... rather than a separate unspecified mechanism").
export async function purgeOldBillingEvents(db: Database, olderThan: Date): Promise<number> {
  const deleted = await db
    .delete(schema.billingEvents)
    .where(lt(schema.billingEvents.createdAt, olderThan))
    .returning({ id: schema.billingEvents.id });
  return deleted.length;
}

// organizations has no RLS (root tenant container) -- safe to list every
// org directly. Used only by the grace-period-expiry maintenance job,
// which must loop per-org to check `subscriptions` (which DOES have RLS)
// under each org's own tenant context via withTenant() -- there is no
// single-query way to scan an RLS-protected, org-scoped table across every
// tenant at once under the app_user role (DEC-014), and this codebase's
// established pattern for "needs cross-tenant access" is dedicated no-RLS
// tables (sessions/oauth_accounts/organization_members/billing_events),
// not a superuser-role bypass -- subscriptions/invoices deliberately were
// NOT added to that list (DEC-027), so a per-org loop is the correct fit
// here rather than a new bypass precedent. Fine for a low-frequency daily
// batch job at this org count; revisit if the org count ever makes an N+1
// loop here a real cost.
export async function listOrganizationsForMaintenance(
  db: Database,
): Promise<{ id: string; ownerId: string }[]> {
  return db
    .select({ id: schema.organizations.id, ownerId: schema.organizations.ownerId })
    .from(schema.organizations)
    .where(isNull(schema.organizations.deletedAt));
}
