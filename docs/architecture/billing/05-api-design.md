# 05-api-design.md
# Billing Architecture — API Design

---

## Public Endpoints (No Authentication)

### GET `/api/v1/billing/plans`

Returns the static plan catalogue. Used by the pricing page and onboarding.

**Auth:** None
**Rate limit:** 60 req/min per IP (existing Traefik limit)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "free",
        "displayName": "Free",
        "monthlyPricePence": 0,
        "annualPricePence": 0,
        "limits": {
          "videosPerMonth": 20,
          "watchlists": 1,
          "alertRules": 2,
          "teamSeats": 1,
          "workspaces": 1,
          "exportsPerMonth": 0,
          "apiAccess": false
        }
      },
      {
        "id": "starter",
        "displayName": "Starter",
        "monthlyPricePence": 3900,
        "annualPricePence": 37400,
        "limits": { "videosPerMonth": 200, ... }
      },
      { "id": "professional", ... },
      { "id": "business", ... },
      {
        "id": "enterprise",
        "displayName": "Enterprise",
        "monthlyPricePence": null,
        "annualPricePence": null,
        "limits": null
      }
    ]
  }
}
```

**Implementation note:** Data comes from `PLANS` constant in `packages/shared/src/plans.ts`. No DB query. Stripe Price IDs are excluded from the public response.

---

## Authenticated Endpoints

All require `Authorization: Bearer <jwt>`.

---

### GET `/api/v1/usage`

Current-period quota consumption for the authenticated organisation.

**Auth:** JWT (any role)
**Rate limit:** Plan-tier limits (existing middleware)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "billingCycle": "monthly",
    "period": {
      "start": "2026-07-01T00:00:00Z",
      "end": "2026-07-31T23:59:59Z",
      "daysRemaining": 11
    },
    "usage": {
      "videosAnalysed": {
        "used": 312,
        "limit": 1000,
        "percentUsed": 31.2,
        "warningThreshold": 800
      },
      "exportsCreated": {
        "used": 4,
        "limit": 20,
        "percentUsed": 20.0,
        "warningThreshold": 16
      },
      "apiRequestsToday": {
        "used": 8420,
        "limit": 50000,
        "percentUsed": 16.8,
        "warningThreshold": 40000
      }
    },
    "gracePeriodEndsAt": null
  }
}
```

**Implementation:**
1. Load plan from Redis cache (`vs:plan:{orgId}`) — cache miss falls back to DB
2. Read Redis counters (`vs:quota:{orgId}:video_analyzed:{periodKey}`, etc.)
3. Compute `period` from `subscriptions.current_period_start/end`
4. Return assembled response — **no DB read in the happy path**

**Errors:** `401` (unauthenticated)

---

### POST `/api/v1/billing/checkout`

Creates a Stripe Checkout Session for a plan upgrade.

**Auth:** JWT (**`owner` role only** — decided per Security_Architecture.md's Role Permissions Matrix, "Billing" row: `admin` has view access only, not the ability to initiate a plan change)
**Idempotency:** If an open checkout session already exists for this org + plan, return the existing URL (check `subscriptions.checkout_session_id` is not null and the session has not expired)

**Request:**
```json
{
  "plan": "professional",
  "billingCycle": "monthly",
  "successUrl": "https://app.viralscopes.io/settings/billing?checkout=success",
  "cancelUrl": "https://app.viralscopes.io/settings/billing"
}
```

**Validation (Zod):**
```typescript
const checkoutSchema = z.object({
  plan: z.enum(['starter', 'professional', 'business']),  // Enterprise excluded (custom)
  billingCycle: z.enum(['monthly', 'annual']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
```

**Business logic:**
- Current plan must be LOWER than requested plan (upgrades only; downgrades via Customer Portal)
- Resolve Stripe Price ID from env var `STRIPE_PRICE_ID_{PLAN}_{CYCLE}` (uppercased)
- Call `stripe.checkout.sessions.create()` with:
  - `mode: 'subscription'`
  - `price_id`: resolved above
  - `client_reference_id`: `orgId`
  - `customer_email`: org owner's email (for new customers) OR `customer`: existing `provider_customer_id`
  - `metadata`: `{ org_id: orgId, billing_cycle: billingCycle }`
  - `success_url`, `cancel_url`
  - `allow_promotion_codes: true`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_..." }
}
```

**Errors:**
- `422` — plan is not an upgrade (e.g. requesting current plan or lower plan)
- `422` — Enterprise plan requested (must contact sales)
- `402` — org already has an active higher-tier plan
- `500` — Stripe API error

---

### POST `/api/v1/billing/portal`

Creates a Stripe Customer Portal session.

**Auth:** JWT (**`owner` role only** — same reasoning as `POST /checkout`; portal access allows plan changes and cancellation, both Owner-only actions)

**Request:**
```json
{ "returnUrl": "https://app.viralscopes.io/settings/billing" }
```

**Validation:**
```typescript
const portalSchema = z.object({
  returnUrl: z.string().url(),
});
```

**Business logic:**
- Load `provider_customer_id` from active subscription
- If null (org is on Free, never subscribed): return `402` with message "No billing account found. Please subscribe first."
- Call `stripe.billingPortal.sessions.create({ customer, return_url })`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "portalUrl": "https://billing.stripe.com/session/bps_live_..." }
}
```

**Errors:**
- `402` — no Stripe customer exists (never subscribed)
- `500` — Stripe API error

---

## Admin Endpoints

**Corrected (was self-contradictory — this section previously said "admin or super_admin" while the first endpoint below said "super_admin" only):** the plan-override endpoint is **`super_admin` only**. The subscription-detail viewer below it is **`admin` or `super_admin`**. These are different endpoints with different, correctly-scoped requirements — stated explicitly per-endpoint rather than in one blanket section header, to avoid the ambiguity that caused the original contradiction.

Both are gated by `require-super-admin.ts` (a live database read of `users.role`) or `requireRole('admin')`, never by a JWT claim — the JWT has no `role` field (see `09-security.md`).

---

### PUT `/api/v1/admin/organisations/:id/plan`

Manually override an organisation's plan. Bypasses Stripe entirely.

**Auth:** JWT + `require-super-admin.ts` middleware (live DB check of `users.role === 'super_admin'`; **`super_admin` role only**, no `admin` fallback)
**Audit:** Writes `billing.admin.plan_override` to `audit_logs`

**Request:**
```json
{
  "plan": "professional",
  "reason": "Comped access for beta user @maya_chen",
  "billingCycle": "monthly",
  "expiresAt": "2026-09-01T00:00:00Z"
}
```

**Validation:**
```typescript
const adminPlanOverrideSchema = z.object({
  plan: z.enum(['free', 'starter', 'professional', 'business', 'enterprise']),
  reason: z.string().min(10).max(500),
  billingCycle: z.enum(['monthly', 'annual']).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});
```

**Business logic:**
1. Load existing subscription for the org (if any)
2. UPSERT `subscriptions` with `billing_provider = 'manual'`, `status = 'active'`, `plan = requested plan`
3. UPDATE `organizations.plan = requested plan`
4. DEL Redis plan cache key `vs:plan:{orgId}`
5. INSERT `audit_logs` entry
6. If `expiresAt` is set, schedule expiry via BullMQ delayed job

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "message": "Plan updated to 'professional' for org 01HXYZ..." }
}
```

---

### GET `/api/v1/admin/organisations/:id/subscription`

View subscription details for any org.

**Auth:** JWT + `requireRole('admin', 'super_admin')` (view-only, matches the Billing row of Security_Architecture.md's Role Permissions Matrix)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "01HXYZ...",
      "plan": "professional",
      "status": "active",
      "billingProvider": "stripe",
      "billingCycle": "monthly",
      "providerCustomerId": "cus_xxx",
      "providerSubscriptionId": "sub_xxx",
      "currentPeriodStart": "2026-07-01T00:00:00Z",
      "currentPeriodEnd": "2026-07-31T23:59:59Z",
      "gracePeriodEndsAt": null,
      "cancelAtPeriodEnd": false
    },
    "currentUsage": {
      "videosAnalysed": 312,
      "exportsCreated": 4
    }
  }
}
```

---

## Webhook Endpoint

### POST `/api/v1/webhooks/stripe`

Receives Stripe lifecycle events.

**Auth:** None (verified via `Stripe-Signature` header HMAC-SHA256)
**Content-Type:** Must be parsed as raw buffer (not JSON) before verification
**Idempotency:** Full — duplicate events are safely ignored

**Critical implementation detail:**
```typescript
// In Fastify route registration:
fastify.addContentTypeParser(
  'application/json',
  { parseAs: 'buffer' },
  (_req, body, done) => done(null, body)
);

fastify.post('/api/v1/webhooks/stripe', async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body as Buffer,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return reply.code(400).send({ error: 'Webhook signature verification failed' });
  }
  // ... dispatch to WebhookService
  reply.code(200).send({ received: true });
});
```

**Expected Stripe events and our handling:**

Every handler is guarded first by the single consolidated idempotency check (`billing_events.(provider, provider_event_id)` UNIQUE — see `04-database-design.md`, `06-webhook-design.md`). Per-entity fields below are the natural-key idempotency that falls out of UPSERT semantics on top of that, not a second competing mechanism:

| Event | Handler | Natural-key UPSERT target |
|---|---|---|
| `checkout.session.completed` | `handleCheckoutCompleted` | `subscriptions.checkout_session_id` |
| `customer.created` | `handleCustomerCreated` | `subscriptions.provider_customer_id` |
| `invoice.paid` | `handleInvoicePaid` | `invoices.provider_invoice_id` UNIQUE |
| `invoice.payment_failed` | `handlePaymentFailed` | `invoices.provider_invoice_id` + grace_period already-set check |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | `subscriptions.provider_subscription_id` |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | `subscriptions.provider_subscription_id` |

**Response:** Always `200 OK` with `{ received: true }` if the signature is valid. Processing happens synchronously but errors are caught and logged — we never return non-200 to Stripe (which would cause retries for already-processed events).

**Rate limiting:** Exempt from plan-based rate limiting. Cloudflare WAF rule limits to Stripe's IP ranges only.

**Errors (logged, not returned as HTTP errors):**
- DB write failure → dead_letter_jobs entry + admin notification
- Email send failure → logged; non-fatal

---

## Error Codes (Billing-Specific)

| Code | HTTP Status | Description |
|---|---|---|
| `PLAN_LIMIT_EXCEEDED` | **403** (was 429) | A quota *within* an included feature has been exhausted for the period (e.g. all 20 free videos used this month) — not a "too many requests, try again shortly" condition, so 429 (Too Many Requests) was the wrong code; 403 (Forbidden until upgrade or next period) is correct |
| `PLAN_UPGRADE_REQUIRED` | 402 | Feature not available on current plan at all (distinct from a quota being exhausted) |
| `INVALID_PLAN_TRANSITION` | 422 | Requested plan is not an upgrade from current |
| `ENTERPRISE_CUSTOM_ONLY` | 422 | Enterprise plan requires contacting sales |
| `NO_BILLING_ACCOUNT` | 402 | Organisation has never subscribed (portal redirect not available) |
| `STRIPE_ERROR` | 502 | Stripe API returned an error |
| `INVALID_WEBHOOK_SIGNATURE` | 400 | Stripe-Signature header verification failed |

The `code` field, not the HTTP status, is what callers should branch on — `NO_BILLING_ACCOUNT` and `PLAN_UPGRADE_REQUIRED` intentionally share `402` for two different conditions, matching the existing `AppError` convention (`apps/api/src/lib/errors.ts`) where `code` is always the disambiguator.

