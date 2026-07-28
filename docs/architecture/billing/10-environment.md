# 10-environment.md
# Billing Architecture — Environment Configuration

---

## Environment Variables

All billing-specific environment variables are prefixed `STRIPE_`. They are injected at runtime via Coolify. No values appear in this document — only names, descriptions, and where to obtain them.

### Required for Phase 9

| Variable | Description | Where to get it | Required in |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Restricted API Key (live or test) | Stripe Dashboard → Developers → API Keys → Create restricted key | API service |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks → (endpoint) → Signing secret | API service |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (public; safe for browser) | Stripe Dashboard → Developers → API Keys | Web service |
| `STRIPE_PRICE_ID_STARTER_MONTHLY` | Stripe Price ID for Starter monthly | Stripe Dashboard → Products → Starter → Prices | API service |
| `STRIPE_PRICE_ID_STARTER_ANNUAL` | Stripe Price ID for Starter annual | Same | API service |
| `STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY` | Stripe Price ID for Professional monthly | Same | API service |
| `STRIPE_PRICE_ID_PROFESSIONAL_ANNUAL` | Stripe Price ID for Professional annual | Same | API service |
| `STRIPE_PRICE_ID_BUSINESS_MONTHLY` | Stripe Price ID for Business monthly | Same | API service |
| `STRIPE_PRICE_ID_BUSINESS_ANNUAL` | Stripe Price ID for Business annual | Same | API service |

**Total new env vars: 9**

### Existing Variables Used by Billing (No Change)

| Variable | Already defined in |
|---|---|
| `DATABASE_APP_URL` | Phase 3/4 (`apps/api/src/config.ts` — note: `apps/api` connects via the restricted `app_user` role, never `DATABASE_URL`, which is the migration/owner connection) |
| `REDIS_URL` | Phase 2 |
| `APP_URL` | Phase 1 |

**Corrected — not pre-existing:** `SENDGRID_API_KEY`/`RESEND_API_KEY`/`EMAIL_FROM_ADDRESS` do **not** exist in `.env.example`, `apps/api/.env`, or `apps/api/src/config.ts`'s Zod env schema. No real email provider has ever been wired in (TD-010) — `email.service.ts` is a dev-only logging stub that throws in staging/production. These three variables are **new and Phase-9-blocking** if billing emails are to work anywhere but a developer's local machine — not reusable Phase 4 infrastructure.

---

## `.env.example` Additions

```bash
# ── Stripe Billing (Phase 9) ──────────────────────────────────────────────────

# Stripe API Keys
# Get from: Stripe Dashboard → Developers → API Keys
# Use sk_test_* for development/staging; sk_live_* for production
STRIPE_SECRET_KEY=sk_test_replace_me

# Stripe Publishable Key (safe for browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me

# Stripe Webhook Signing Secret
# Get from: Stripe Dashboard → Developers → Webhooks → (your endpoint) → Signing secret
# For local dev: use stripe CLI (stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe)
STRIPE_WEBHOOK_SECRET=whsec_replace_me

# Stripe Price IDs
# Get from: Stripe Dashboard → Products (after creating products and prices)
STRIPE_PRICE_ID_STARTER_MONTHLY=price_replace_me
STRIPE_PRICE_ID_STARTER_ANNUAL=price_replace_me
STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY=price_replace_me
STRIPE_PRICE_ID_PROFESSIONAL_ANNUAL=price_replace_me
STRIPE_PRICE_ID_BUSINESS_MONTHLY=price_replace_me
STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_replace_me
```

---

## Local Development Setup

### Stripe CLI (required for local webhook testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local API
stripe listen --forward-to http://localhost:3001/api/v1/webhooks/stripe

# The CLI will print a webhook signing secret:
# > Ready! Your webhook signing secret is whsec_xxxx
# Add this to .env.local as STRIPE_WEBHOOK_SECRET
```

### Test Card Numbers

| Card | Behaviour |
|---|---|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 0341` | Attaches to customer but payment fails |

All test cards use any future expiry date and any 3-digit CVC.

### Trigger Test Webhook Events

```bash
# Trigger specific events for testing
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted

# Or trigger via checkout (manual)
# 1. Start checkout: POST /billing/checkout
# 2. Complete checkout using test card 4242...
# 3. Watch webhook events in stripe listen output
```

---

## Staging Environment

| Variable | Staging value |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Test Mode key (`sk_test_*`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Test Mode key (`pk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | Staging webhook endpoint signing secret (separate from production) |
| `STRIPE_PRICE_ID_*` | Test mode Price IDs (separate from production) |

**Two Stripe webhook endpoints must be registered:**
1. `https://api.viralscopes.io/api/v1/webhooks/stripe` (production)
2. `https://api.staging.viralscopes.io/api/v1/webhooks/stripe` (staging)

Each has its own signing secret. Staging uses Stripe Test Mode; production uses Live Mode.

---

## Production Deployment

No additional Docker services are required for billing. Phase 9 uses existing:
- Fastify API container (new billing routes added)
- Redis (existing; new key namespace `vs:quota:*`)
- PostgreSQL (existing; new table + 2 new columns)
- BullMQ (existing; new queue `vs:standard:billing-persist`)

**Pre-deployment checklist:**
- [ ] Stripe products and prices created in live mode
- [ ] Production webhook endpoint registered in Stripe
- [ ] All 9 new environment variables set in Coolify (production)
- [ ] Database migrations `0010` and `0011` applied to production before container swap (numbering corrected — repo's actual latest migration is `0009`)
- [ ] Stripe Customer Portal configured (plan changes + cancellation enabled)

---

## Secret Security Notes

- `STRIPE_SECRET_KEY` must be a **Restricted Key** with minimum permissions (see Security doc)
- `STRIPE_WEBHOOK_SECRET` must never be committed to the repository
- Both must be rotated immediately if compromised
- Coolify encrypts environment variables at rest
- The repository's actual secret-scanning tool, **secretlint** (`.secretlintrc.json`, not `detect-secrets`), will catch any `sk_live_` or `whsec_` strings accidentally committed once those patterns are added to its configuration

