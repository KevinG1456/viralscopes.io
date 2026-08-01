# 01-architecture-review.md
# Phase 10 Milestone 1 — Security Architecture Review

> Reviews the real, current implementation (post-Phase 9) against `Security_Architecture.md`, `PROJECT_RULES.md` §4, and `Database_Schema.md`'s RLS design — subsystem by subsystem, grounded in the actual code, not the aspirational spec. Every claim below was checked against a real file; file paths are cited throughout. Findings are cross-referenced into `04-security-findings.md` by ID (F-01, F-02, ...).

Organized into 7 clusters covering all 22 requested subsystems. Each subsystem documents: attack surface, trust boundaries, privileged operations, authentication requirements, authorization model, tenant isolation, sensitive data, existing protections, identified risks, recommendations.

---

## Cluster A — Identity & Access

### A.1 Authentication

- **Attack surface:** `POST /auth/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, both OAuth callback routes. All public, unauthenticated by definition.
- **Trust boundary:** Internet → `apps/api`. No proxy-level auth in front of it yet (no WAF/Cloudflare — infra not provisioned, see TD-001).
- **Privileged operations:** None directly — these routes *establish* trust, they don't yet act on it.
- **Authentication requirements:** N/A (these are the entry points).
- **Authorization model:** N/A.
- **Tenant isolation:** N/A — pre-tenant-context by definition.
- **Sensitive data:** Plaintext password (in the request body only, in transit), email address, single-use tokens (verification, reset).
- **Existing protections (verified, not assumed):**
  - bcrypt cost-factor 12 (`auth.service.ts`); confirmed no plaintext password ever persisted or logged (`logger.plugin.ts`'s redact list includes `*.password`).
  - Generic `401 INVALID_CREDENTIALS` for all three failure branches — no account exists, wrong password, unverified email (DEC-015) — confirmed live in Phase 4/8 verification history; still true in the current code.
  - Per-IP rate limits registered per-route (`auth.routes.ts`), matching `Security_Architecture.md` §15's table.
  - Account lockout via `lib/lockout.ts`: Redis-backed failure counter, progressive lockout, correctly resets on success.
  - Password length 10–128 enforced (Zod schema) before ever reaching bcrypt.
- **Identified risks:** See F-01 (no common-password blocklist found in the current schema — see below).
- **Recommendations:** Confirm whether the "top 10,000 common passwords" blocklist described in `Security_Architecture.md` §2 was actually implemented; if not, this is a real gap, not just documentation drift (checked: `auth.service.ts`'s registration path validates length/type only — no blocklist check found in the current code). Logged as F-01.

### A.2 Session Management

- **Attack surface:** `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/sessions/revoke-others`.
- **Trust boundary:** Browser (httpOnly cookie) ↔ API. The cookie itself is the boundary artifact — JavaScript never touches it.
- **Privileged operations:** Refresh (mints a new access token), revocation (ends a session).
- **Authentication requirements:** Refresh requires the `refresh_token` cookie; the other session-management routes require a valid access token.
- **Authorization model:** A session belongs to exactly one user; `sessions` has no RLS (root/identity table, see migration 0006) — isolation is enforced by an explicit `user_id` filter in the repository layer, confirmed by code (`session.repository.ts`), not by the database.
- **Tenant isolation:** N/A at this layer (sessions are user-scoped, not org-scoped) — confirmed correct per migration 0006's own design note.
- **Sensitive data:** `sha256(refreshToken)` only (never plaintext) in the `sessions` table; `ip_address`, `user_agent` for anomaly context.
- **Existing protections:**
  - Refresh token rotation on every use; the old token is invalidated in the same transaction.
  - Reuse-detection: a rotated-and-later-replayed refresh token invalidates all sessions for that user (verified present in `auth.service.ts`'s refresh path).
  - `HttpOnly`, `Secure`, `SameSite=Strict` cookie flags (`cookie.plugin.ts`).
- **Identified risks:** None found beyond TD-013 (no audit-log entry written when reuse-detection actually fires — see A.4/Cluster F).
- **Recommendations:** None beyond TD-013's existing resolution plan (Phase 10 Milestone 2, already scoped).

### A.3 JWT Lifecycle

- **Attack surface:** The `Authorization: Bearer <token>` header on every protected route.
- **Trust boundary:** Once verified, the JWT's claims (`orgId`, `orgRole`, `planTier`) are trusted for the request's lifetime — this is a deliberate, documented trust boundary (see A.6/RBAC and Phase 9's `getEnforcedPlanTier()` work, which explicitly does *not* trust `planTier` for anything authorization-critical).
- **Privileged operations:** None — the JWT itself just carries identity/role/plan; it doesn't act.
- **Authentication requirements:** `authenticate` middleware (`middleware/authenticate.ts`) verifies signature + expiry on every call; no route bypasses it except the explicit public list.
- **Authorization model:** `orgRole` claim feeds `requireRole()`; `planTier` claim is display-only (Phase 9 Milestone 5 made this explicit and enforced it in code, not just in a comment).
- **Tenant isolation:** `orgId` claim is what every `withTenant()` call scopes to — this is the single most load-bearing claim in the system.
- **Sensitive data:** No PII in the JWT payload itself (`sub`/`userId`/`orgId`/`orgRole`/`planTier`/`iat`/`exp`/`jti` only — no email, no name).
- **Existing protections:**
  - 15-minute expiry, confirmed in `config.ts` (`JWT_ACCESS_EXPIRY`) and live-tested repeatedly across every phase's own verification.
  - `HS256` with a 64+ character secret (`JWT_SECRET`), separate from `JWT_REFRESH_SECRET`.
  - Platform-level admin status (`super_admin`) is deliberately **not** a JWT claim — `require-super-admin.ts` does a live DB read specifically to avoid a demoted admin retaining access for the token's remaining lifetime (DEC-017). This is the single strongest design decision in the whole auth system, and it was verified correct, not just asserted, across two separate phases.
- **Identified risks:** None found. No JWT secret rotation procedure has ever been *exercised* (only documented) — logged as an Informational item, not a Medium/High finding, since it's a process gap with no live exploit path.
- **Recommendations:** None for this milestone; a rotation drill belongs in Milestone 6's final audit or a future operational runbook, not application code.

### A.4 Refresh Tokens

- Covered jointly with A.2 (Session Management) above — same code path, same table, same protections. No separate findings.

### A.5 RBAC

- **Attack surface:** Every mutating route's `preHandler` chain.
- **Trust boundary:** `orgRole` (JWT claim, org-scoped) vs. `role` (`users.role`, platform-scoped, `'user' | 'super_admin'`) — these are two genuinely separate axes, and the codebase keeps them separate correctly (confirmed: `requireRole()` reads only `orgRole`; `requireSuperAdmin` reads only the DB `role` column; no code path conflates them).
- **Privileged operations:** Role-gated mutations across watchlists, alert rules, API keys, billing, admin routes.
- **Authentication requirements:** `authenticate` always precedes `requireRole`/`requireSuperAdmin` — confirmed on every route file, not assumed.
- **Authorization model:** Three layers, as `Security_Architecture.md` §3 describes and as verified live in Phase 5/9: (1) route middleware (`requireRole`), (2) service-layer checks (`assertCanManage` in `watchlist.service.ts`/`alert.service.ts` — creator-or-org-manager), (3) RLS. All three are demonstrated in real, shipped code, not just designed.
- **Tenant isolation:** Enforced at all three layers simultaneously for every tenant-scoped resource.
- **Sensitive data:** N/A directly — this is a control, not a data store.
- **Existing protections:** As above. `requireRole()`'s allowlist model (`roles.includes(orgRole)`) is a deny-by-default design — an unlisted role is always rejected, matching S3/S4 (secure by default, fail securely) from `Security_Architecture.md` §1.
- **Identified risks:** The role hierarchy `Security_Architecture.md` §3 documents includes a `viewer` role that does not exist anywhere in the real schema (`organization_members.role` — need to confirm the actual enum). Checked: the real role set in use throughout the codebase is `owner`/`admin`/`member` (confirmed via `MANAGE_ROLES = ['owner', 'admin']` in `watchlist.service.ts`/`alert.service.ts`, and the RBAC verification tables in every Phase 9 milestone report, which only ever tested owner/admin/member). `viewer` is spec-only, never implemented. This is a documentation-vs-reality mismatch, not a vulnerability — logged as F-02 for the doc-update pass, not a security finding.
- **Recommendations:** Correct `Security_Architecture.md` §3's role table to match the real three-role model, or explicitly mark `viewer` as "not implemented, v-next" the way MFA is already marked.

### A.6 OAuth

- **Attack surface:** `GET /auth/oauth/google`, `/github`, and both callback routes.
- **Trust boundary:** Google/GitHub's identity assertion is trusted once the `state` parameter is verified and the code exchange succeeds — this is an external trust boundary the application cannot itself harden further than "verify what the provider signs."
- **Privileged operations:** Account creation, account linking.
- **Authentication requirements:** None (pre-auth by definition), except CSRF-style `state` verification on the callback.
- **Authorization model:** N/A directly, but the **account-linking policy** (DEC-016) is itself an authorization-adjacent control: it explicitly refuses to link an OAuth identity to an existing-but-unverified local account (`OAUTH_ACCOUNT_REQUIRES_VERIFICATION`), closing a real pre-account-hijack vector that a naive upsert-by-email implementation would have. This was verified correct in Phase 4, not just designed.
- **Tenant isolation:** N/A — identity-establishment layer.
- **Sensitive data:** OAuth access/refresh tokens from the provider, stored in `oauth_accounts`.
- **Existing protections:** `state` parameter CSRF check on callback; DEC-016's three-case linking policy (reuse existing link → link to a verified match → refuse an unverified match, never silently merge).
- **Identified risks:** `Security_Architecture.md` §7 describes application-level AES-256-GCM encryption of `oauth_accounts.access_token`/`refresh_token` columns (beyond Supabase's disk-level encryption). Checked: no `encrypt()`/`decrypt()` function or `DB_ENCRYPTION_KEY` config exists anywhere in `apps/api`. This is a genuine, real gap — OAuth provider tokens are currently stored with only disk-level (not column-level) encryption. Logged as F-03.
- **Recommendations:** Either implement column-level encryption for `oauth_accounts`' token fields, or explicitly downgrade `Security_Architecture.md`'s claim to "disk-level encryption only, column-level deferred" so the document matches reality. Given these tokens are rarely if ever re-used server-side today (no feature currently reads them back to call Google/GitHub APIs on the user's behalf, confirmed by grep), the practical exposure is lower than the spec implies, but the gap is real and should be an explicit, tracked decision, not silent drift.

---

## Cluster B — Multi-Tenancy

### B.1 Multi-Tenant RLS

- **Attack surface:** Every query against a tenant-scoped table, from every route.
- **Trust boundary:** The `app_user` Postgres role (least-privilege, confirmed via `.env`/`.env.example` — `apps/api` has no credential for the owner/migration role at all, so a compromised API process *cannot* escalate to bypass RLS even with arbitrary SQL execution) vs. the `postgres` owner role (migrations/seeds only).
- **Privileged operations:** Any `withTenant()`-wrapped write.
- **Authentication requirements:** N/A — this is the data layer, downstream of authentication/authorization.
- **Authorization model:** Postgres RLS policies (`org_id = current_setting('app.current_org_id', true)::uuid`), set per-transaction by `withTenant()`, never trusted from client input.
- **Tenant isolation:** This *is* the tenant-isolation layer — the last line of defense per `Security_Architecture.md` §3's Layer 3.
- **Sensitive data:** All org-scoped business data (videos-per-org associations, watchlists, alert rules, subscriptions, invoices, audit logs).
- **Existing protections:** Live-verified repeatedly across every phase (most recently Phase 9 Milestone 6): an unauthorized read/write with no tenant context set returns zero rows / fails, not an error that leaks existence. A deliberate, catalogued exception list exists for tables that must be queried before tenant context can exist (`sessions`, `oauth_accounts`, `organization_members`, `billing_events`) — each with its own schema-comment justification, not an ad-hoc bypass.
- **Identified risks:** None found that aren't already tracked. The `audit_logs` RLS policy (`org_id = current_setting(...)::uuid`, no `NULL` exception) will actively **reject** any future write with `orgId: null` — this doesn't affect anything today (nothing currently writes a null-org audit row), but it is the concrete blocker Milestone 2's TD-013 resolution will hit on day one. Logged as F-04 so it's tracked now rather than discovered mid-implementation.
- **Recommendations:** Resolve F-04 in Milestone 2 exactly as already planned (relax `WITH CHECK` only, leave `USING` — i.e., read visibility — untouched, so tenant-scoped reads never gain visibility into null-org rows).

---

## Cluster C — Billing & Subscription

### C.1 Billing

- **Attack surface:** `POST /billing/checkout`, `/portal`, `GET /billing/subscription`, `/plan`, `POST /webhooks/stripe`.
- **Trust boundary:** Stripe's HMAC signature (webhook) and Stripe's own hosted checkout/portal pages (the frontend never touches card data — confirmed, no Stripe.js/Elements anywhere in `apps/web`).
- **Privileged operations:** Checkout creation, portal creation, plan mutation (webhook-driven only, never client-driven).
- **Authentication requirements:** JWT for the 4 API routes; HMAC signature (not a session) for the webhook.
- **Authorization model:** Owner-only for checkout/portal, owner+admin for viewing (`requireRole`) — already live-verified across Phase 9's own milestones.
- **Tenant isolation:** Every Stripe object is stamped with `metadata.org_id` at creation (DEC-027), so the webhook handler resolves tenant context from the event's own payload — never a database lookup before tenant context exists, avoiding an RLS-bypass precedent on a financial-data table.
- **Sensitive data:** No card data ever touches this system (PCI scope is entirely Stripe's). Provider IDs (`provider_customer_id`, `provider_subscription_id`) are stored but never returned to any client.
- **Existing protections:** Signature verification + Stripe's own replay-tolerance window + a durable, DB-backed idempotency table (`billing_events`) that survives a retry days later — this is a genuinely mature design, already reviewed once in Phase 9 Milestone 6's own hardening pass, which found and fixed two real bugs (a quota-bypass path and a retry-safety bug) at that time.
- **Identified risks:** None new. Phase 9 Milestone 6 already did a dedicated hardening pass on this exact subsystem; re-litigating it here would be redundant. The one carried-forward item is TD-026 (a reviewed, accepted race-condition window in `upsertSubscriptionForOrg`), already logged.
- **Recommendations:** None beyond what's already tracked (TD-026). No live Stripe account has ever processed a real transaction — this remains the one structural verification gap for the whole phase, already disclosed.

### C.2 Subscription Enforcement

- **Attack surface:** Every plan-limited mutation (watchlist/alert-rule creation, API-key creation).
- **Trust boundary:** `getEnforcedPlanTier()` (`lib/plan-enforcement.ts`) — a live DB read, deliberately not the JWT's `planTier` claim, specifically to close the "stale-JWT quota bypass" window Phase 9 Milestone 6 found and fixed.
- **Privileged operations:** N/A — this is an enforcement mechanism, not a privilege.
- **Authentication requirements:** Downstream of authentication; assumes a valid tenant context.
- **Authorization model:** Plan-tier-based, not role-based — a distinct axis from RBAC.
- **Tenant isolation:** Scoped by `tenant.orgId`, same as every other tenant-scoped read.
- **Sensitive data:** N/A.
- **Existing protections:** Live grace-period-expiry check independent of the daily maintenance job; the quota-bypass vulnerability found in Milestone 6 (a subscription canceled via `.updated` rather than `.deleted` retaining paid access) is fixed and live-verified.
- **Identified risks:** None new — this subsystem just underwent a dedicated hardening milestone. Re-auditing it here would duplicate that work rather than add to it.
- **Recommendations:** None.

### C.3 API Keys

- **Attack surface:** `GET/POST /api-keys`, `DELETE /api-keys/:id`.
- **Trust boundary:** None at request-authentication time — **API keys are not currently used to authenticate any incoming request** (TD-025). This is worth stating plainly: the entire subsystem, as it exists today, is a credential-management UI with no corresponding credential-consumption path.
- **Privileged operations:** Key creation (gated by `apiAccess` plan flag), revocation.
- **Authentication requirements:** Creating/listing/revoking a key requires a normal JWT session — the key itself, once created, currently unlocks nothing.
- **Authorization model:** Any org member can list; creation requires `apiAccess` (Professional+); no role restriction on create/revoke beyond org membership (worth double-checking against `Security_Architecture.md` §3's matrix, which says Owner/Admin/Super Admin only — checked: `api-key.routes.ts` gates behind `requireOrgContext` only, not `requireRole` — **any** org member, including a plain `member`, can create and revoke API keys today, not just owner/admin as the spec's permission matrix states).
- **Tenant isolation:** `withTenant()`-scoped correctly.
- **Sensitive data:** `sha256(key)` only, confirmed no plaintext persistence; the plaintext is returned exactly once at creation and never logged (confirmed against `logger.plugin.ts`'s redact list, which includes `*.apiKey`/`*.api_key`).
- **Identified risks:** F-05 — `api-key.routes.ts` does not enforce the Owner/Admin-only restriction `Security_Architecture.md`'s own Role Permissions Matrix documents for "Create/Revoke API keys." A plain `member` can currently create and revoke org API keys. Because the keys themselves authenticate nothing yet (TD-025), the *practical* impact today is limited to key-management noise (a member could revoke a key an owner is relying on), not data exposure — but this is a real RBAC gap that will become materially more serious the moment TD-025 is resolved and keys start granting real access.
- **Recommendations:** Add `requireRole('owner', 'admin')` to the create/revoke routes now, before TD-025 makes the gap security-critical rather than merely inconvenient. Low effort, should be fixed in Milestone 2, not deferred to "whenever TD-025 lands."

---

## Cluster D — Backend Workflows & Admin

### D.1 n8n Workflows

- **Attack surface:** n8n's own public hostname (`n8n.viralscopes.io` per `docker-compose.prod.yml`'s Traefik labels) serves both n8n's admin UI *and* the webhook endpoints `apps/api`'s queue worker calls.
- **Trust boundary:** A shared secret (`N8N_SERVICE_TOKEN`), identical in both services' environments, checked in **both directions**: `apps/api`'s `requireServiceToken` middleware (incoming, timing-safe) and an n8n "Valid Service Token?" IF-node (outgoing calls from `apps/api` to n8n, confirmed present in `foundation-demo.json` and `prompt-test.json` by direct inspection — `heartbeat.json` correctly has no such node, since n8n never receives a call for that workflow, it only *sends* one).
- **Privileged operations:** Triggering a workflow execution.
- **Authentication requirements:** `X-Service-Token` header, both directions.
- **Authorization model:** Binary — valid token or not. No workflow-level granularity (any valid token can trigger any n8n workflow).
- **Tenant isolation:** N/A — n8n workflows are platform-wide infrastructure, not tenant-scoped.
- **Sensitive data:** Job payloads (workflow name + arbitrary caller-supplied data) pass through n8n; none currently contain PII (the only real workflows are `foundation-demo`, `heartbeat`, `prompt-test`).
- **Existing protections:** Both-direction token verification, confirmed by direct inspection of the workflow JSON, not assumed from documentation.
- **Identified risks:** F-06 — n8n's own webhook-auth check is a plain string-equality IF-node condition, not a timing-safe comparison (unlike `apps/api`'s `requireServiceToken`, which explicitly uses `crypto.timingSafeEqual`). This is a third-party tool limitation (n8n's IF node has no timing-safe string-compare primitive), not a defect in code this project owns, and the practical exploitability of a timing attack over a real network (rather than a local benchmark) against a 32+ character secret is very low — logged as Informational, not Medium, for that reason. F-07 — n8n's admin UI and its webhook endpoints share one public hostname with no additional network-level separation (e.g., an IP allowlist restricting the admin UI path specifically); anyone who can reach `n8n.viralscopes.io` can attempt to log into n8n's own admin panel (protected by `N8N_BASIC_AUTH_USER`/`PASSWORD`, a separate credential from the service token) — this is an accepted, standard n8n deployment pattern, not a gap this project introduced, but worth stating explicitly as a documented trust boundary rather than an implicit assumption.
- **Recommendations:** F-06: no action needed (third-party constraint, negligible practical risk). F-07: consider a Traefik IP-allowlist or basic-auth-at-the-edge restriction on n8n's admin path specifically, once a real production domain exists (infra-not-provisioned today, so this can't be built or verified yet — logged for Milestone 4 or later).

### D.2 AI Prompt Library

- **Attack surface:** `/admin/prompts/*` — every route.
- **Trust boundary:** `requireSuperAdmin` on every single route, confirmed by direct inspection (`prompt-library.routes.ts` line 57's `preHandler` array) — there is no org-facing view at all, by deliberate design (Phase 9's DEC discussion already established this: the prompt library has no plan dimension because there's nothing org-facing to gate).
- **Privileged operations:** Creating/activating a prompt version, running the test harness.
- **Authentication requirements:** JWT + live super-admin DB check.
- **Authorization model:** Platform-admin-only, binary.
- **Tenant isolation:** N/A — platform-wide, no org scoping.
- **Sensitive data:** Prompt text itself (system prompts, templates) — not user PII, but arguably business-sensitive (product IP). No RLS on this table (by design, matching the "no org-facing view" reasoning), so a super_admin sees everything, which is correct given the role's scope.
- **Existing protections:** Consistent `requireSuperAdmin` gating on every route, verified directly.
- **Identified risks:** None found.
- **Recommendations:** None.

### D.3 Admin APIs

- **Attack surface:** `/admin/users`, `/organizations`, `/jobs`, `/dead-letter`, `/jobs/:workflow/trigger`, `/metrics`.
- **Trust boundary:** `requireSuperAdmin` (live DB check) + `businessRateLimit` on every route, confirmed by direct inspection.
- **Privileged operations:** Manually triggering a workflow with an arbitrary caller-supplied payload; retrying a dead-lettered job.
- **Authentication requirements:** JWT + live super-admin check.
- **Authorization model:** Binary (super_admin or nothing) — no finer-grained admin-role tiers exist, matching the real schema (`users.role` is `'user' | 'super_admin'` only).
- **Tenant isolation:** N/A by design — these routes intentionally read across every organization (`users`/`organizations`/`job_logs`/`dead_letter_jobs` all have no RLS, explicitly for this reason, per each table's own schema comment).
- **Sensitive data:** Cross-tenant user/organization listings — appropriately gated behind the platform's highest trust tier.
- **Existing protections:** `POST /jobs/:workflow/trigger` validates the `workflow` name against the actual registered `Map` of live queues (unknown names correctly 404, not silently accepted) — confirmed by direct inspection, closing an injection-adjacent concern before it could exist.
- **Identified risks:** `triggerBodySchema` (`z.record(z.string(), z.unknown()).default({})`) accepts an arbitrary-shaped payload forwarded to n8n. This is not a vulnerability in the traditional sense — only a `super_admin` can reach it — but it is a genuine insider-trust-abuse surface (a compromised or malicious super_admin account could use it to send unexpected data into a workflow). Logged as Informational, since the mitigating control (super_admin is already the platform's maximum trust tier) is itself the correct, intentional design, not a gap.
- **Recommendations:** None required; this is already the correct trust model for a platform-admin-only tool. Worth noting explicitly in `Security_Architecture.md` as an accepted, intentional trust boundary rather than leaving it undocumented.

### D.4 Queue Workers

- **Attack surface:** None directly exposed — BullMQ workers run in-process within `apps/api`, consuming from Redis; there is no separate network-reachable surface.
- **Trust boundary:** The worker trusts n8n's HTTP response (`dispatchToN8n()` reads `body.success`/`body.message` and treats it as authoritative) — but that call only ever targets `config.n8n.internalUrl` (the Docker-internal address), never a client-supplied URL, so there is no SSRF vector here (confirmed by direct inspection of `lib/queue.ts`).
- **Privileged operations:** Job retry/backoff/dead-letter transition.
- **Authentication requirements:** N/A — internal, in-process.
- **Authorization model:** N/A.
- **Tenant isolation:** N/A — workflow queues are platform infrastructure, not tenant-scoped (the workflows themselves may carry tenant data in their payload, but the queue mechanism itself has no isolation concept, correctly, since it's not a tenant-facing surface).
- **Sensitive data:** Job payloads may contain org-identifying data (e.g., the billing-maintenance job's per-org loop) — stored transiently in Redis and in `job_logs`/`dead_letter_jobs` (no RLS, admin-only, already covered under D.3).
- **Existing protections:** Fixed retry backoff (0s/30s/5min, 4 attempts) with a hard dead-letter transition on exhaustion — prevents an infinite-retry resource-exhaustion pattern.
- **Identified risks:** None found beyond what Cluster C.1 already covers for the billing-specific maintenance queue.
- **Recommendations:** None.

---

## Cluster E — Frontend

### E.1 Frontend Authentication

- **Attack surface:** Every page under `(dashboard)`, gated by `DashboardLayout`'s client-side check; `proxy.ts` (Next.js middleware) as a UX-only pre-check.
- **Trust boundary:** The access token is held **only** in an in-memory JavaScript variable (`lib/api/client.ts`), never `localStorage`/`sessionStorage` — confirmed by direct inspection, not assumed. This is the correct mitigation against token theft via a successful XSS (an attacker who achieves script execution still can't read a variable scoped to a module closure the way they could read `localStorage`).
- **Privileged operations:** N/A — the frontend never makes an authorization *decision* itself; every real check happens server-side (confirmed: `proxy.ts`'s own comment explicitly states it's "NOT the security boundary," and checks only for the *presence* of the `csrf_token` cookie as a UX heuristic, never as an authorization decision).
- **Authentication requirements:** A valid refresh-token cookie (silently exchanged for an access token via `AuthProvider`'s mount-time effect).
- **Authorization model:** None client-side — RBAC-driven UI hiding (e.g., `/settings/billing`'s owner/admin/member branching) is UX only; the backend re-checks everything independently, and this was explicitly verified (not assumed) throughout Phase 9's frontend milestones.
- **Tenant isolation:** N/A — the frontend has no concept of cross-tenant data; it only ever renders what the backend, itself RLS-protected, returns for the authenticated session's own org.
- **Sensitive data:** The access token in memory (mitigated as above); the cached display-only user object in `localStorage` (name/email, explicitly documented as "never treated as an authorisation source").
- **Existing protections:** Memory-only access token; httpOnly refresh cookie; CSRF double-submit on the few browser-session mutations that need it; `DOMPurify`/`dangerouslySetInnerHTML` usage confirmed **absent entirely** from the codebase (grepped directly — zero matches), meaning React's default escaping is the only XSS defense currently in play, and there is no user-generated-HTML rendering path that would need more than that today.
- **Identified risks:** No application-level CSP is set anywhere in `apps/web` (no nonce-based CSP middleware, confirmed by inspecting `proxy.ts`) — Next.js's own framework defaults don't include a CSP header out of the box. This is the same underlying gap as the API's missing Helmet headers (Cluster F), just on the other origin. Logged as F-08 (tracked once, applies to both apps).
- **Recommendations:** Add a CSP (with a per-request nonce, matching `Security_Architecture.md` §11's spec) via `proxy.ts`, scoped to Milestone 2.

---

## Cluster F — Infrastructure & Operations

### F.1 Redis

- **Attack surface:** No direct client exposure — Redis is only ever reached from `apps/api`/BullMQ, never from the browser.
- **Trust boundary:** Docker-internal network only in production (confirmed: `docker-compose.prod.yml`'s `redis` service has no `ports:` mapping, i.e. not reachable from the host or the internet — only reachable by other containers on the `viralscopes` network) + `requirepass` (confirmed: `command: redis-server --requirepass ${REDIS_PASSWORD}`). Local dev intentionally exposes port 6379 to the host for developer convenience — correctly not a production concern.
- **Privileged operations:** N/A.
- **Authentication requirements:** Password auth in production; none in local dev (acceptable — local dev Redis holds no real user data, only ephemeral test-session state).
- **Authorization model:** N/A — single shared credential, no per-key ACLs (Redis 7 supports ACLs; not configured — a reasonable simplification at MVP scale).
- **Tenant isolation:** N/A at the Redis layer — key names are namespaced by purpose (`ratelimit:`, `auth:`, `vs:ai-cache:`) and, where relevant, by `userId`/`orgId` as part of the key string, but nothing prevents one authenticated Redis client from reading another key's data (there's only one client: `apps/api` itself).
- **Sensitive data:** Failed-login counters (keyed by `userId`, a UUID — low sensitivity), rate-limit counters, AI-response cache (prompt input/output — could include user-supplied video metadata, not classic PII).
- **Existing protections:** Password-protected, network-isolated in production; no PII values stored (only UUIDs as key components and non-PII counters/cache payloads).
- **Identified risks:** None found beyond the already-accepted TD-004 (no Redis persistence at launch — an availability/durability trade-off, not a security one).
- **Recommendations:** None for this milestone.

### F.2 Docker

- **Attack surface:** The built images themselves (supply-chain), and the running containers' process boundary.
- **Trust boundary:** Each image runs as a dedicated non-root user (`nodejs`/`nextjs`, confirmed by direct inspection of both Dockerfiles — `USER nodejs`/`USER nextjs` after `addgroup`/`adduser` with fixed UIDs), not root.
- **Privileged operations:** N/A within the container (no setuid binaries, no privileged Docker flags used anywhere in the compose files).
- **Authentication requirements:** N/A.
- **Authorization model:** N/A.
- **Tenant isolation:** N/A.
- **Sensitive data:** Confirmed no real secrets baked into either image — the only `ARG`/`ENV` values set at build time are `NEXT_PUBLIC_*` (intentionally public, by Next.js's own convention) and `NODE_ENV`/`PORT`/`HOSTNAME` (non-secret). All real secrets are `env_file`-injected at container start (`docker-compose.prod.yml`), never present in a layer.
- **Existing protections:** Non-root user in both images; multi-stage builds that discard build-time dependencies from the final image; `turbo prune`-based dependency pruning for `apps/api` specifically (keeps the runtime image free of unrelated workspace packages).
- **Identified risks:** F-09 — both Dockerfiles use a floating base-image tag (`node:22-alpine`), not a pinned digest. A base-image update between builds is currently unpinned and unreviewed — a supply-chain reproducibility gap (already anticipated in the Phase 10 plan), not an active vulnerability.
- **Recommendations:** Pin both Dockerfiles' base images to a specific digest, per the existing Milestone 4 plan.

### F.3 Secrets & Environment Variables

- **Attack surface:** `.env` files (local), Coolify env vars (production, not yet provisioned), GitHub Actions secrets (CI).
- **Trust boundary:** `.env` is gitignored; `.env.example` contains only key names + placeholder/example values (confirmed by direct inspection — no real secret value exists in the committed template).
- **Privileged operations:** N/A.
- **Authentication requirements:** N/A.
- **Authorization model:** N/A.
- **Tenant isolation:** N/A.
- **Sensitive data:** Every credential class the app uses (JWT secrets, DB credentials, Stripe keys, OAuth app secrets, N8N service token).
- **Existing protections:** `secretlint` runs pre-commit (`.husky/pre-commit`, confirmed configured with `@secretlint/secretlint-rule-preset-recommend`) and in CI (`.github/workflows/ci.yml`'s Secrets step, confirmed passing on every recent PR per this repo's own CI history); `config.ts` validates every required env var at boot via Zod, failing fast on a missing/malformed value rather than silently running with `undefined`.
- **Identified risks:** None found. This subsystem is genuinely mature — confirmed via direct inspection, not assumed from the spec.
- **Recommendations:** None.

### F.4 Logging

- **Attack surface:** N/A directly — logs are an output, not an input surface, but a redaction failure would be an *output*-side data-leakage risk.
- **Trust boundary:** Structured Pino logs, written to stdout (captured by Loki in the monitoring stack) — not directly internet-reachable.
- **Privileged operations:** N/A.
- **Authentication requirements:** N/A (log *access* is a Grafana/Loki concern, out of this application's own boundary).
- **Authorization model:** N/A within the app.
- **Tenant isolation:** Logs are not tenant-partitioned — an operator with Loki access sees every org's log lines. Acceptable at this stage (single-operator, pre-launch), but worth noting as a scaling consideration, not a Phase 10 finding.
- **Sensitive data:** Confirmed redacted at the source (`logger.plugin.ts`'s `redact` list: `*.password`, `*.password_hash`, `*.token`, `*.apiKey`/`*.api_key`, `*.secret`, `*.authorization`, `*.email`, `*.name`, `*.ip_address`, plus the raw `req.headers.authorization`/`req.headers.cookie`) — this is a genuinely thorough, defensively-designed redaction list, wider than `Security_Architecture.md` itself specifies (it also redacts email/name, which the spec doesn't explicitly call out but is good practice).
- **Existing protections:** As above, confirmed by direct inspection of the actual redaction config, not assumed from the spec.
- **Identified risks:** None found in the redaction config itself. One adjacent risk: `errorHandlerPlugin` (fixed in Phase 9 Milestone 6 to log 5xx `AppError`s) logs the *entire* error object (`{ err }`) — if any future `AppError` is ever thrown with sensitive data embedded in its `details` field, it would bypass the string-path-based redaction list (which matches on log-record field paths, not on arbitrary nested error properties reliably in every Pino version/config). Checked: no current `AppError` call site puts secret material in `details` — this is a preventive note, not an active finding.
- **Recommendations:** Add a lint/code-review convention (not urgent enough to block Milestone 1) that `AppError` `details` payloads are never populated with anything from a redacted field. Informational only.

### F.5 Audit Logs

- Covered under Cluster B.1 (the RLS finding, F-04) and Cluster A (TD-013, already tracked). No additional findings here beyond what's already logged.

---

## Cluster G — Network & Third-Party

### G.1 Rate Limiting

- **Attack surface:** Every route.
- **Trust boundary:** Two independent limiters: `@fastify/rate-limit` (per-route, IP-keyed, registered `global: false`, used by auth routes) and the bespoke `businessRateLimit` (per-authenticated-user, plan-tier-aware, used by every Phase 5+ business route).
- **Privileged operations:** N/A.
- **Authentication requirements:** `businessRateLimit` requires `request.user` to exist (throws `UNAUTHENTICATED` otherwise) — meaning it only ever runs *after* `authenticate` has already succeeded.
- **Authorization model:** N/A.
- **Tenant isolation:** N/A (rate limiting is per-user, not per-org).
- **Sensitive data:** N/A.
- **Existing protections:** Redis-backed (shared across instances, not reset per-process); plan-tier-aware ceiling via `requestsPerMinuteFor()`; correct fallback behavior for undocumented tiers (a real bug in this exact logic was found and fixed back in Phase 5).
- **Identified risks:** F-10 — because `businessRateLimit` only activates *after* successful authentication, an **unauthenticated** request to a protected business route (e.g., a malformed or missing token) fails fast with `401` but is not itself rate-limited by anything in this application (only specific *auth* routes have their own per-IP limiter; a general protected route like `GET /watchlists` has no limiter at all ahead of the `authenticate` check). In production this gap is intended to be closed by Cloudflare's edge rate limiting (`Security_Architecture.md` §16, "100 req/min per IP on `/api/*`") — but that infrastructure does not exist yet in this environment (same category as TD-001). This is a real, currently-unmitigated gap at the application layer, distinct from "no CDN yet" — a global, low-ceiling, IP-keyed limiter ahead of `authenticate` itself would close it independent of whether Cloudflare is ever provisioned.
- **Recommendations:** Add a global, IP-keyed, generous-but-nonzero rate limit (e.g., via `@fastify/rate-limit`'s `global: true` mode) ahead of authentication, so an unauthenticated flood of requests to any route is throttled by the application itself, not solely by infrastructure that doesn't exist yet. Scoped to Milestone 3.

### G.2 CSP / CORS / CSRF

- **CORS: attack surface** — any cross-origin browser request. **Trust boundary** — `cors.plugin.ts`'s single allowed origin (`config.appUrl`), confirmed no wildcard anywhere. **Existing protections** — credentials enabled only for the one trusted origin; explicit allowed-headers/methods lists. **Identified risks** — none found.
- **CSRF: attack surface** — state-changing requests riding an authenticated browser session's cookies. **Trust boundary** — Double Submit Cookie pattern (`middleware/csrf.ts`), applied only where it matters (`auth.routes.ts`'s logout/session-revocation — the only mutations that are cookie-authenticated rather than Bearer-token-authenticated; every other mutation requires the Bearer token explicitly, which an attacker's cross-site request cannot attach). **Existing protections** — confirmed correctly scoped, not over- or under-applied. **Identified risks** — none found.
- **CSP: attack surface** — any injected script if an XSS vector were ever found. **Trust boundary** — currently **none** — no CSP header is set anywhere (API or frontend). **Identified risks** — F-08 (already logged under E.1; restated here since it's also explicitly named in this cluster). This is a defense-in-depth gap: today's actual XSS exposure is low (no `dangerouslySetInnerHTML`, no raw HTML rendering anywhere, confirmed by direct grep), but CSP is precisely the kind of control meant to catch a *future* mistake, not just today's clean state. **Recommendation** — Helmet.js (API) + a nonce-based CSP (frontend), both already scoped to Milestone 2.

### G.3 Third-Party Integrations

- **Attack surface:** Stripe (billing), Google/GitHub (OAuth), and — not yet integrated — SendGrid/Resend (email, TD-010) and OpenAI/Anthropic (AI, TD-023).
- **Trust boundary:** Each integration is accessed exclusively through a provider abstraction the business logic depends on (`BillingProvider` for Stripe, confirmed no direct `stripe` SDK import outside `billing-provider.ts`, per PROJECT_RULES.md P10) — the same pattern is *planned* but not yet demonstrated for AI providers, since none are configured (TD-023).
- **Privileged operations:** Charging a customer (fully delegated to Stripe — this app never touches card data).
- **Authentication requirements:** API keys for each provider, held only as environment variables, never in code.
- **Authorization model:** N/A — provider-side.
- **Tenant isolation:** Stripe objects stamped with `org_id` metadata (DEC-027) is the tenant-isolation mechanism for the one integration that's actually live.
- **Sensitive data:** Provider API keys/secrets (Stripe, OAuth app credentials) — covered under F.3.
- **Existing protections:** Provider-abstraction pattern (swap-without-touching-business-logic); no direct SDK coupling in route/service code outside the abstraction layer.
- **Identified risks:** None found for Stripe/OAuth (both live and already reviewed). Email and AI providers are not yet configured at all (TD-010, TD-023) — nothing to review because nothing is built; correctly out of scope for this milestone.
- **Recommendations:** None beyond the already-tracked TDs.

---

*Continued in `02-threat-model.md`, `03-trust-boundary-diagram.md`, `04-security-findings.md`, `05-risk-register.md`, `06-remediation-plan.md`.*
