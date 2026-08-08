# gdpr-requests.md
# Fulfilling a GDPR Data Subject Request

> Referenced from `README.md`'s FAQ. Written in Phase 10 Milestone 5
> alongside the self-serve endpoints below — this file didn't exist
> before, even though the README already linked to it.

## Self-serve (the normal path)

A user who can still log in should use these directly — no engineering
involvement needed:

- **Right to access / data portability:** `GET /api/v1/account/export`
  (also reachable from Settings → Profile → "Download my data")
- **Right to deletion:** `DELETE /api/v1/account` (also reachable from
  Settings → Profile → "Delete my account")

Deletion immediately scrubs the user's PII (email replaced with a
non-recoverable placeholder, name/avatar/password hash cleared), deletes
their OAuth links and sessions, and marks the row `deleted_at`. A daily
background job (`lib/privacy-maintenance-queue.ts`) attempts to physically
remove the now-empty row 30 days later; it's retained (harmlessly, since
it holds no PII by that point) if it's still referenced by watchlists,
alert rules, API keys, or an organisation it owns.

Deletion is refused (`409 ACCOUNT_DELETION_BLOCKED_BY_OWNERSHIP`) if the
user solely owns an organisation that has other members — there is no
ownership-transfer feature yet (TD-011), so this is a deliberate
guardrail against orphaning teammates rather than a bug. Ask the user to
either remove the other members or contact support to arrange ownership
transfer before retrying.

## Manual fulfilment (user cannot access their account)

**No admin API exists for this today** — there is no
`POST /api/v1/admin/users/:id/delete` or equivalent. This is a genuine
gap, not an oversight this guide is glossing over. Until that exists,
fulfilling a request for a user who cannot log in requires an engineer
with direct database access to run the equivalent of what
`account.service.ts`'s `deleteAccount()` does:

1. Confirm the requester's identity through an out-of-band channel
   (support ticket + a fact only the real account holder would know --
   never solely on the basis of an email claiming to be them).
2. Check whether they solely own an organisation with other members (the
   same guard the self-serve endpoint enforces) — resolve that first if
   so.
3. Run, as the `app_user` role (never the migration/owner role, per this
   project's own least-privilege design):
   - Delete their `oauth_accounts` rows
   - Delete their `sessions` rows
   - Update their `users` row: `email` → a `deleted-<id>@deleted.invalid`
     placeholder, `name`/`avatar_url`/`password_hash` → `NULL`,
     `deleted_at` → `now()`
4. The 30-day purge job picks up physical row removal automatically from
   there — no separate manual step needed.

Building a real admin-initiated deletion endpoint (so this manual path
stops being necessary) is a reasonable candidate for a later milestone,
not done here — Milestone 5 was scoped to the self-serve endpoints only.
