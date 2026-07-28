# 09-security.md
# Billing Architecture — Security

---

## Trust Boundaries

```
UNTRUSTED:  Public internet, browser, Stripe webhook payloads (before signature verification)
SEMI-TRUSTED: Authenticated API requests (JWT verified, but plan claims may be stale)
TRUSTED:    Fastify service layer after authentication, Stripe after signature verification
SYSTEM:     Service role DB connections, BullMQ workers, n8n workflows
```

---

## Webhook Signature Verification

**Every Stripe webhook must be verified before any DB write or business logic executes.**

```typescript
// apps/api/src/routes/webhook.routes.ts (flat path, no v1/ subdirectory — see 02-system-architecture.md)
fastify.post('/api/v1/webhooks/stripe', async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    request.log.warn('Missing Stripe signature or secret');
    return reply.code(400).send({ error: 'Invalid request' });
  }

  let event: Stripe.Event;
  try {
    // request.body is a Buffer (addContentTypeParser with parseAs: 'buffer')
    event = stripe.webhooks.constructEvent(request.body as Buffer, sig, secret);
  } catch (err) {
    request.log.warn({ err }, 'Stripe webhook signature verification failed');
    return reply.code(400).send({ error: 'Webhook signature verification failed' });
  }

  // Now safe to process
  await webhookService.dispatch(event);
  return reply.code(200).send({ received: true });
});
```

**Why raw buffer:** `stripe.webhooks.constructEvent` computes HMAC over the raw body bytes. If the body is parsed to JSON and re-serialised, key ordering may change and the signature will fail. The Fastify content-type parser must be configured to yield a `Buffer` on this route.

---

## Replay Protection

Dual-layer protection against replayed webhooks:

**Layer 1 — Stripe timestamp check (automatic):**
`constructEvent` validates the `t=` timestamp in the `Stripe-Signature` header. By default, Stripe rejects events older than 300 seconds (5 minutes). This is enforced by the Stripe SDK.

**Layer 2 — Our idempotency table (decided — sole mechanism, the earlier Redis TTL key is removed, see `04-database-design.md`/`06-webhook-design.md`):**
`billing_events.(provider, provider_event_id) UNIQUE` ensures a given event ID can only be processed once, even if Stripe replays it after the 5-minute window.

```typescript
// In WebhookService.dispatch():
const existing = await db.select()
  .from(billingEventsTable)
  .where(and(
    eq(billingEventsTable.provider, 'stripe'),
    eq(billingEventsTable.providerEventId, event.id),
  ))
  .limit(1);

if (existing.length > 0) {
  logger.info({ eventId: event.id }, 'Duplicate webhook event — skipping');
  return; // Idempotent: already processed
}
```

---

## CSRF Considerations

Billing endpoints are called from browser sessions. They require:
1. Valid JWT in `Authorization` header — this is a custom header, immune to CSRF
2. `X-CSRF-Token` header matching the `csrf_token` cookie (existing double-submit pattern from Phase 4)

The Stripe Checkout redirect uses a GET request to an external domain — no CSRF risk.

**Webhook endpoint is CSRF-exempt** — it is verified by Stripe signature, not by our CSRF mechanism. **Corrected:** there is nothing to "bypass" — `validateCsrf` (`apps/api/src/middleware/csrf.ts`) is an opt-in `preHandler`, not a global hook. The webhook route simply never includes `validateCsrf` in its `preHandler` array, identically to how every other unauthenticated route (e.g. `POST /auth/login`) already works today.

---

## JWT Interaction

The JWT `planTier` claim is **informational only** in the billing context:

- Used by frontend for rendering decisions (which UI to show)
- **Not used by the API for security enforcement** — the API always loads the live plan from Redis/DB
- May be stale by up to 15 minutes (access token lifetime) after a plan change

This design is intentional: it avoids forced re-login on plan upgrade while still enforcing the correct plan on every API request.

**Admin impersonation — corrected (high-severity fix from the architecture review):** the JWT does **not** have a `role` field. `AccessTokenPayload` (`apps/api/src/lib/jwt.ts`) is exactly `{ sub, userId, orgId, orgRole, planTier }`. Super-admin status is **never** read from the JWT — `apps/api/src/middleware/require-super-admin.ts` performs a live database read of `users.role` on every request, with its own code comment stating this is deliberate ("Deliberately NOT based on the JWT"). Billing's admin-override endpoint must call this existing middleware directly; it must never attempt to branch on a `request.user.role` field, which does not exist and would either fail to compile against the real `AccessTokenPayload` type or silently never grant the intended bypass.

---

## RBAC for Billing Operations

**Decided — sourced directly from Security_Architecture.md's Role Permissions Matrix, "Billing" row (lines 208–211):**

| Operation | Required role | Notes |
|---|---|---|
| View `/usage` | Any authenticated org member | Can see their own org's usage |
| Create checkout session | **`owner` only** | Upgrade/downgrade is Owner-only per the permissions matrix — `admin` has view access, not mutation rights |
| Open customer portal | **`owner` only** | Same — portal access allows plan changes and cancellation |
| View invoices / usage | `owner` or `admin` | View-only, matches the matrix's "View billing and invoices" row |
| Admin plan override | `super_admin` only, via `require-super-admin.ts` (live DB check) | Platform-level operation, never JWT-based |
| View admin subscription details | `admin` or `super_admin`, via `requireRole()` | View-only |

Enforced by the existing `requireRole()` middleware (`apps/api/src/middleware/require-role.ts`) for org-role checks and `require-super-admin.ts` for platform-level checks. No new role definitions required — only correct use of the two existing middlewares.

---

## Row Level Security

**Corrected:** this project does not use Supabase Auth — there is no `auth.uid()` function and no `authenticated` Postgres role. RLS is enforced via `current_setting('app.current_org_id', true)::uuid`, set per-transaction by `withTenant()` (`packages/db/src/client.ts`), populated by this project's own custom JWT/session system.

| Table | RLS policy |
|---|---|
| `subscriptions` | **Already exists, no change needed** — `FOR ALL USING/WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid)`, migration `0003_rls_policies.sql` |
| `invoices` | Same, already exists |
| `usage_events` | Same, already exists |
| `billing_events` | No RLS — root identity table, same justification as `sessions`/`oauth_accounts` (migrations `0006`/`0007`); see `04-database-design.md` |

RLS ensures that even if a bug in our service layer omits a `WHERE org_id = ?` clause, PostgreSQL enforces tenant isolation — this is already true today for `subscriptions`/`invoices`/`usage_events`, independent of anything Phase 9 adds, since the app connects as the restricted `app_user` role, not a superuser.

**Service layer still adds explicit `WHERE org_id = ?`** — RLS is the last line of defence, not the first.

---

## Secrets Management

| Secret | Env var | Rotation trigger |
|---|---|---|
| Stripe Secret Key (live) | `STRIPE_SECRET_KEY` | Key compromise or team member departure |
| Stripe Webhook Signing Secret | `STRIPE_WEBHOOK_SECRET` | Webhook endpoint re-registered or compromise |
| Stripe Publishable Key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Key compromise only (public key) |
| Stripe Price IDs | `STRIPE_PRICE_ID_*` (8 values) | Stripe product restructure |

All stored in Coolify environment variables. No secrets in code or Docker images. The repository's actual secret-scanning tool is **secretlint** (`.secretlintrc.json`, wired into `.github/workflows/ci.yml` and the husky pre-commit hook via `.lintstagedrc.json`) — not `detect-secrets`, which is not present anywhere in this repository. `sk_live_`/`sk_test_`/`whsec_` patterns should be added to `.secretlintrc.json`'s configuration explicitly.

**Stripe restricted keys:** Use a Stripe Restricted API Key (not the full secret key) with only the permissions required:
- `customers`: read, write
- `subscriptions`: read, write
- `checkout.sessions`: write
- `billing_portal.sessions`: write
- `invoices`: read

This limits blast radius if the key is compromised.

---

## PCI Considerations

**PCI scope: Zero.**

- No card data is ever transmitted to, stored on, or processed by ViralScopes servers
- Stripe Checkout is hosted on `checkout.stripe.com` — an entirely different domain
- No Stripe Elements (card input fields) are embedded in our pages
- The Stripe Publishable Key is used only to redirect to Stripe-hosted pages

**To maintain zero PCI scope:**
- Never import `@stripe/stripe-js` or `@stripe/react-stripe-js` for card input
- Never accept card numbers, CVCs, or expiry dates via any API endpoint
- ESLint rule to detect Stripe Elements imports outside the billing module should be added

---

## Audit Logging

All billing state changes produce immutable `audit_logs` entries. See `03-domain-model.md` for the full list. **Note:** no `auditLog()` helper function exists anywhere in `apps/api/src` today (confirmed by full-repo search) — every call site below is new code Phase 9 must write, matching the existing `audit_logs` schema shape (`org_id`, `user_id` nullable, `action`, `resource_type`, `resource_id`, `metadata jsonb`), not a call into pre-existing infrastructure.

**Audit log for webhook processing:**
```typescript
await auditLog({
  orgId: org.id,
  userId: null,      // system-initiated
  action: 'billing.invoice.paid',
  resourceType: 'subscription',
  resourceId: subscription.id,
  metadata: {
    stripeEventId: event.id,
    stripeInvoiceId: invoice.id,
    amountCents: invoice.amount_paid,
    plan: subscription.plan,
    billingCycle: subscription.billingCycle,
  },
});
```

---

## Rate Limiting

| Endpoint | Rate limit | Why |
|---|---|---|
| `POST /billing/checkout` | 5 req/15 min per user | Prevent checkout session spam |
| `POST /billing/portal` | 10 req/15 min per user | Prevent portal session spam |
| `GET /usage` | Existing plan-tier limits | Normal API limit |
| `POST /webhooks/stripe` | No limit (relies on signature verification as the real control; IP allowlisting is a defense-in-depth nice-to-have, **not confirmed to exist** — this infrastructure runs behind Traefik via Coolify per Deployment_Guide.md, with no evidence of a Cloudflare layer in front of it; needs confirmation from whoever owns production infra before being relied upon) | Stripe must never be rate-limited |

---

## Abuse Prevention

**Checkout abuse:** A user could repeatedly create checkout sessions without completing them, generating URLs that expire. The 5 req/15 min limit above mitigates this. Additionally, if a valid `checkout_session_id` exists in `subscriptions` for the same org + plan, return the existing URL.

**Admin override abuse:** All admin plan overrides require `super_admin` role (via `require-super-admin.ts`'s live DB check, not a JWT claim) + audit log entry. IP allowlisting for the admin API is a defense-in-depth nice-to-have, not confirmed to exist on current infrastructure — see the note on the webhook rate-limit row above.

**Quota bypass attempt:** Quota checks run in Redis before the handler. Redis is on the internal Docker network, not accessible from the public internet. Circumventing the API to write directly to Redis is not possible without internal network access.

