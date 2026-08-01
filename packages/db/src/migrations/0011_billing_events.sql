-- Migration: 0011_billing_events
--
-- Phase 9 (Billing): webhook idempotency ledger. A webhook delivers
-- `event.id` + a payload referencing a provider customer/subscription id --
-- the org that event belongs to is only discoverable by looking up
-- `subscriptions.provider_customer_id`, which happens AFTER the event is
-- received and BEFORE any tenant context exists for the request. Same
-- chicken-and-egg identity problem 0006/0007 already documented for
-- sessions/oauth_accounts/organization_members: a webhook is not an
-- authenticated, org-scoped request, so an org-scoped RLS policy would
-- have nothing to key on at insert time.
--
-- Reclassified into the same "root identity table, filtered by
-- application/session logic" category. The compensating control here is
-- the UNIQUE (provider, provider_event_id) constraint (the provider's
-- documented idempotency key) enforced at insert time, plus explicit
-- org_id filtering in every repository query once org_id is resolved and
-- backfilled onto the row.
--
-- Named provider-agnostically (not stripe_webhook_events): `subscriptions`.
-- `billing_provider` already treats stripe as one of four values
-- (stripe/paddle/crypto/manual) -- see
-- docs/reviews/billing/02-consistency-review.md §1.

-- Up

CREATE TABLE billing_events (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider            TEXT        NOT NULL DEFAULT 'stripe',
  provider_event_id   TEXT        NOT NULL,
  event_type          TEXT        NOT NULL,
  org_id              UUID        REFERENCES organizations(id),
  subscription_id     UUID        REFERENCES subscriptions(id),
  status              TEXT        NOT NULL DEFAULT 'processed'
                                  CHECK (status IN ('processed', 'failed', 'skipped')),
  error_message       TEXT,
  raw_payload         JSONB       NOT NULL DEFAULT '{}',
  processed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_billing_events_provider_event_id UNIQUE (provider, provider_event_id)
);
CREATE INDEX idx_billing_events_org_id ON billing_events (org_id);
CREATE INDEX idx_billing_events_processed_at ON billing_events (processed_at);

-- Down

DROP TABLE billing_events;
