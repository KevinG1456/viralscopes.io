-- Migration: 0010_billing_cycle_and_checkout_session
--
-- Phase 9 (Billing). Three additions to `subscriptions`, all required
-- before the Stripe integration can run:
--
-- 1. billing_cycle: whether the subscription is monthly or annual. Needed
--    for analytics, email copy, and Pricing_Strategy.md §5.4's proration
--    rules. Added nullable, backfilled to 'monthly' (every subscription
--    that could exist before this migration is monthly-only, since annual
--    billing didn't exist in the schema until now), then constrained
--    NOT NULL -- the staged pattern Database_Schema.md §14 requires for a
--    zero-downtime column addition.
--
-- 2. checkout_session_id: correlates a `checkout.session.completed` webhook
--    with the subscription row created by the `POST /billing/checkout`
--    call that started it. UNIQUE so a replayed webhook event can be
--    matched back to exactly one subscription.
--
-- 3. uq_subscriptions_org_active: a partial unique index enforcing at most
--    one non-canceled subscription per org, matching the documented
--    "one-subscription rule" (docs/architecture/billing/03-domain-model.md).
--    Not created CONCURRENTLY: this project's migration runner
--    (packages/db/src/migrate.ts) applies every migration inside a single
--    transaction, and Postgres refuses CREATE INDEX CONCURRENTLY inside a
--    transaction block. A plain CREATE UNIQUE INDEX takes a brief lock,
--    which is a non-issue at this table's current size (zero production
--    traffic exists yet, per PROJECT_STATUS.md TD-008).

-- Up

ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT;
ALTER TABLE subscriptions ADD COLUMN checkout_session_id TEXT;

UPDATE subscriptions SET billing_cycle = 'monthly' WHERE billing_cycle IS NULL;

ALTER TABLE subscriptions ALTER COLUMN billing_cycle SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN billing_cycle SET DEFAULT 'monthly';

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_billing_cycle_check
  CHECK (billing_cycle IN ('monthly', 'annual'));

ALTER TABLE subscriptions ADD CONSTRAINT uq_subscriptions_checkout_session_id
  UNIQUE (checkout_session_id);

CREATE UNIQUE INDEX uq_subscriptions_org_active
  ON subscriptions (org_id)
  WHERE status != 'canceled';

-- Down

DROP INDEX IF EXISTS uq_subscriptions_org_active;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS uq_subscriptions_checkout_session_id;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_check;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS checkout_session_id;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS billing_cycle;
