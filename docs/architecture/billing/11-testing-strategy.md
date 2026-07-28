# 11-testing-strategy.md
# Billing Architecture — Testing Strategy

---

## Overview

Phase 9 billing is high-risk code — bugs can cause incorrect charges, incorrect plan enforcement, or missed revenue. The testing strategy has four layers: unit, integration, webhook simulation, and end-to-end.

All tests use Stripe's **Test Mode** — no real money is ever moved during testing.

**Prerequisite (not optional, budget for it explicitly):** no test framework of any kind exists anywhere in this repository today — no Vitest/Jest/Playwright dependency in any `package.json`, no `*.test.ts`/`*.spec.ts` file, no `e2e/` directory. The root `npm test` script (`turbo run test`) is currently a no-op because no workspace defines a `test` script. Every code sample below assumes a working Vitest (unit/integration) and Playwright (E2E) setup that must be installed and configured for `apps/api` (and `apps/web`/`e2e` if E2E is kept in scope) as its own task before any billing test can actually run — see `12-implementation-plan.md`'s corrected M10.

**E2E strategy decided:** rather than driving Stripe's own hosted Checkout page's DOM with Playwright (fragile — Stripe controls that markup, not this project, and it can change without notice), E2E tests stop at asserting the redirect to `checkout.stripe.com` and use the Stripe CLI (`stripe trigger`) to simulate the rest of the lifecycle. The full-DOM-driving example later in this document is kept for reference but is not the recommended approach.

---

## Unit Tests (Vitest)

Target: > 90% coverage on billing service and feature gating logic.

### Plan limits and hierarchy

```typescript
// packages/shared/src/plans.test.ts
import { describe, it, expect } from 'vitest';
import { PLANS, PLAN_HIERARCHY, PLAN_LIMITS } from './plans';

describe('PLAN_HIERARCHY', () => {
  it('enforces correct ordering', () => {
    expect(PLAN_HIERARCHY.free).toBeLessThan(PLAN_HIERARCHY.starter);
    expect(PLAN_HIERARCHY.starter).toBeLessThan(PLAN_HIERARCHY.professional);
    expect(PLAN_HIERARCHY.professional).toBeLessThan(PLAN_HIERARCHY.business);
    expect(PLAN_HIERARCHY.business).toBeLessThan(PLAN_HIERARCHY.enterprise);
  });
});

describe('PLAN_LIMITS', () => {
  it('free plan has no API access', () => {
    expect(PLAN_LIMITS.free.apiAccess).toBe(false);
    expect(PLAN_LIMITS.free.apiRequestsPerDay).toBe(0);
  });

  it('starter plan has more videos than free', () => {
    expect(PLAN_LIMITS.starter.videosPerMonth)
      .toBeGreaterThan(PLAN_LIMITS.free.videosPerMonth);
  });

  it('enterprise has null (unlimited) for all quota fields', () => {
    // null, not -1 — matches the existing sentinel convention already
    // established in apps/api/src/lib/plan-limits.ts (see 08-feature-gating.md)
    expect(PLAN_LIMITS.enterprise.videosPerMonth).toBeNull();
    expect(PLAN_LIMITS.enterprise.watchlists).toBeNull();
  });
});
```

### Grace period gating logic

```typescript
// apps/api/src/services/usage.service.test.ts
describe('getPlanForGating', () => {
  it('returns free when grace period has expired', async () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    mockRedis.hgetall.mockResolvedValue({
      plan: 'professional',
      gracePeriodEndsAt: pastDate,
    });
    const plan = await getPlanForGating('org-123');
    expect(plan).toBe('free');
  });

  it('returns current plan during active grace period', async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    mockRedis.hgetall.mockResolvedValue({
      plan: 'professional',
      gracePeriodEndsAt: futureDate,
    });
    const plan = await getPlanForGating('org-123');
    expect(plan).toBe('professional');
  });
});
```

### Stripe Price ID resolution

```typescript
describe('resolveStripePriceId', () => {
  it('resolves starter monthly', () => {
    process.env.STRIPE_PRICE_ID_STARTER_MONTHLY = 'price_test_123';
    expect(resolveStripePriceId('starter', 'monthly')).toBe('price_test_123');
  });

  it('throws for enterprise (custom pricing)', () => {
    expect(() => resolveStripePriceId('enterprise', 'monthly'))
      .toThrow('ENTERPRISE_CUSTOM_ONLY');
  });
});
```

---

## Integration Tests (Vitest + MSW + test DB)

Test the full request → service → DB path using a real test PostgreSQL instance and Mock Service Worker for Stripe API calls.

### Checkout session creation

```typescript
describe('POST /api/v1/billing/checkout', () => {
  it('creates checkout session for upgrade', async () => {
    // Seed: org with plan='free', user with role='owner'
    const { authToken } = await seedOrgWithOwner({ plan: 'free' });

    server.use(
      http.post('https://api.stripe.com/v1/checkout/sessions', () =>
        HttpResponse.json({ id: 'cs_test_xxx', url: 'https://checkout.stripe.com/...' })
      )
    );

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: { Authorization: `Bearer ${authToken}` },
      payload: { plan: 'starter', billingCycle: 'monthly',
                 successUrl: 'https://app.test/billing?success=true',
                 cancelUrl: 'https://app.test/billing' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.checkoutUrl).toContain('checkout.stripe.com');
  });

  it('rejects downgrade attempt', async () => {
    const { authToken } = await seedOrgWithOwner({ plan: 'professional' });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: { Authorization: `Bearer ${authToken}` },
      payload: { plan: 'starter', billingCycle: 'monthly',
                 successUrl: 'https://app.test/billing?success=true',
                 cancelUrl: 'https://app.test/billing' },
    });

    expect(res.statusCode).toBe(422);
    expect(res.json().error.code).toBe('INVALID_PLAN_TRANSITION');
  });

  it('requires owner role — viewer rejected', async () => {
    const { authToken } = await seedOrgWithViewer({ plan: 'free' });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: { Authorization: `Bearer ${authToken}` },
      payload: { plan: 'starter', billingCycle: 'monthly',
                 successUrl: 'https://app.test/s', cancelUrl: 'https://app.test/c' },
    });

    expect(res.statusCode).toBe(403);
  });

  it('requires owner role — admin rejected too (decided: admin is view-only for billing)', async () => {
    const { authToken } = await seedOrgWithAdmin({ plan: 'free' });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/checkout',
      headers: { Authorization: `Bearer ${authToken}` },
      payload: { plan: 'starter', billingCycle: 'monthly',
                 successUrl: 'https://app.test/s', cancelUrl: 'https://app.test/c' },
    });

    expect(res.statusCode).toBe(403);
  });
});
```

### Usage tracking

```typescript
describe('UsageService', () => {
  it('increments Redis counter on emit', async () => {
    await usageService.emit('org-123', 'video_analyzed', 1, {});
    const count = await redis.get('vs:quota:org-123:video_analyzed:2026-07');
    expect(parseInt(count!)).toBe(1);
  });

  it('throws PLAN_LIMIT_EXCEEDED when quota reached', async () => {
    await redis.set('vs:quota:org-123:video_analyzed:2026-07', '20');
    await expect(usageService.checkQuota('org-123', 'video_analyzed'))
      .rejects.toMatchObject({ code: 'PLAN_LIMIT_EXCEEDED' });
  });
});
```

---

## Webhook Tests

### Signature verification

```typescript
describe('POST /api/v1/webhooks/stripe', () => {
  it('rejects invalid signature', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/webhooks/stripe',
      headers: { 'stripe-signature': 'invalid', 'content-type': 'application/json' },
      payload: Buffer.from('{}'),
    });
    expect(res.statusCode).toBe(400);
  });

  it('processes invoice.paid idempotently', async () => {
    const payload = buildStripeEvent('invoice.paid', { ... });
    const sig = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payload),
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

    // First call
    const r1 = await app.inject({ method: 'POST', url: '/api/v1/webhooks/stripe',
      headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
      payload: Buffer.from(JSON.stringify(payload)) });
    expect(r1.statusCode).toBe(200);

    // Second call (replay)
    const r2 = await app.inject({ method: 'POST', url: '/api/v1/webhooks/stripe',
      headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
      payload: Buffer.from(JSON.stringify(payload)) });
    expect(r2.statusCode).toBe(200); // not an error

    // Verify subscription only updated once
    const sub = await db.select().from(subscriptionsTable).where(eq(...));
    expect(sub).toHaveLength(1);
  });
});
```

### Full webhook lifecycle test

```typescript
it('complete lifecycle: checkout → paid → failed → grace → expired', async () => {
  const orgId = await seedFreeOrg();

  // 1. Checkout completed
  await dispatchWebhook('checkout.session.completed', buildCheckoutEvent(orgId));
  expect(await getOrgPlan(orgId)).toBe('starter');

  // 2. First renewal paid
  await dispatchWebhook('invoice.paid', buildInvoiceEvent(orgId, 'paid'));
  expect(await getGracePeriodEndsAt(orgId)).toBeNull();

  // 3. Payment fails
  await dispatchWebhook('invoice.payment_failed', buildInvoiceEvent(orgId, 'failed'));
  const gracePeriod = await getGracePeriodEndsAt(orgId);
  expect(gracePeriod).not.toBeNull();
  expect(new Date(gracePeriod) > new Date()).toBe(true);

  // 4. Subscription deleted (grace period expired + Stripe gave up)
  await dispatchWebhook('customer.subscription.deleted', buildSubscriptionDeletedEvent(orgId));
  expect(await getOrgPlan(orgId)).toBe('free');
});
```

---

## End-to-End Tests (Playwright + Stripe Test Mode)

E2E tests run against a staging environment with Stripe Test Mode active.

```typescript
// e2e/billing.spec.ts
test('complete subscription flow: free → starter', async ({ page }) => {
  // Register and complete onboarding
  await registerAndOnboard(page, 'test@example.com');

  // Navigate to billing
  await page.goto('/settings/billing');
  await expect(page.locator('[data-testid="current-plan"]')).toContainText('Free');

  // Click upgrade
  await page.click('[data-testid="upgrade-to-starter"]');

  // Redirected to Stripe Checkout
  await expect(page).toHaveURL(/checkout\.stripe\.com/);

  // Fill test card details
  await page.fill('[placeholder="Card number"]', '4242 4242 4242 4242');
  await page.fill('[placeholder="MM / YY"]', '12/28');
  await page.fill('[placeholder="CVC"]', '123');
  await page.click('[type="submit"]');

  // Redirected back to billing settings
  await expect(page).toHaveURL(/settings\/billing/);

  // Wait for webhook to process (polling)
  await expect(async () => {
    await page.reload();
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Starter');
  }).toPass({ timeout: 30000, intervals: [2000] });
});
```

---

## Failure Injection Tests

```typescript
describe('billing resilience', () => {
  it('handles Stripe API timeout gracefully', async () => {
    server.use(
      http.post('https://api.stripe.com/v1/checkout/sessions', async () => {
        await new Promise(r => setTimeout(r, 35000)); // Timeout
        return new HttpResponse(null, { status: 500 });
      })
    );
    const res = await app.inject({ method: 'POST', url: '/api/v1/billing/checkout', ... });
    expect(res.statusCode).toBe(502);
    expect(res.json().error.code).toBe('STRIPE_ERROR');
  });

  it('handles Redis unavailable gracefully for quota check', async () => {
    mockRedis.incr.mockRejectedValue(new Error('ECONNREFUSED'));
    // Quota check should fail open (allow the request) with logged error
    const res = await app.inject({ method: 'POST', url: '/api/v1/videos/analyze', ... });
    // Expected: allow the request (fail open), log error
    expect(res.statusCode).toBe(202);
  });
});
```

**`[ASSUMPTION — requires approval]`** Redis failure behavior for quota checks: **fail open** (allow the request) vs **fail closed** (block). Failing open is recommended for MVP to avoid outages during Redis restarts, but this means a brief Redis outage could allow quota overage. Document the trade-off and set a Grafana alert for Redis unavailability.

---

## Rollback Testing

Before every production billing deployment:

```bash
# 1. Apply migration to staging
npm run db:migrate --env=staging

# 2. Run full test suite on staging
npm run test:staging

# 3. Verify migration rollback works
npm run db:migrate:rollback --env=staging
# Confirm: billing_cycle column removed, billing_events table dropped

# 4. Re-apply migration
npm run db:migrate --env=staging

# 5. Deploy billing code to staging
# 6. Run smoke tests + E2E billing flow
# 7. Promote to production with manual approval
```

