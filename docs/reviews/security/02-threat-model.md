# 02-threat-model.md
# Phase 10 Milestone 1 — Threat Model

> Built from `01-architecture-review.md`'s findings, not independently of them. Threat actors and scenarios are grounded in what this system actually does (a multi-tenant SaaS with Stripe billing, JWT auth, org-scoped content) — no generic/speculative threats have been added for completeness.

---

## Threat Actors

| Actor | Capability | Motivation | Relevant subsystems |
|---|---|---|---|
| **Unauthenticated external attacker** | Network access to public endpoints only | Credential stuffing, account takeover, data scraping, DoS | Authentication, OAuth, Rate Limiting, CSP/CORS |
| **Authenticated attacker (own account)** | Valid session, own org's data | Privilege escalation, cross-tenant data access, quota bypass | RBAC, RLS, Subscription Enforcement, API Keys |
| **Malicious/compromised org member** | Valid session, `member` role | Exceed intended role (e.g., manage API keys as a non-owner) | RBAC (API Keys — F-05) |
| **Malicious/compromised `super_admin`** | Full platform access | Abuse cross-tenant visibility, inject arbitrary workflow payloads | Admin APIs, Prompt Library, n8n Workflows |
| **Network-position attacker (MITM)** | Can observe/intercept traffic | Token theft, credential interception | Encryption in Transit, JWT Lifecycle |
| **Supply-chain attacker** | Compromises a dependency or base image | Inject malicious code into the build | Docker (F-09), Dependency Audit |
| **Insider with Redis/DB access** | Direct infrastructure access | Data exfiltration | Redis, Secrets, Encryption at Rest |
| **Stripe (or an attacker impersonating Stripe)** | Can send webhook payloads | Forge billing state, replay old events | Billing, Webhook Security |

---

## Attack Scenarios

Each scenario is scored **Likelihood × Impact** (informal, Low/Medium/High each) and cross-referenced to the relevant finding ID where one exists.

### S-01: Credential stuffing against `/auth/login`
- **Actor:** Unauthenticated external attacker.
- **Path:** Automated login attempts using a leaked credential list.
- **Mitigations in place:** Per-IP rate limit (10/min), progressive account lockout (5/10/15 failures), bcrypt cost-12 hashing, generic failure response (no email-existence oracle).
- **Residual risk:** Low. The combination of IP rate-limiting + per-account lockout + a non-oracle response is a strong, already-verified defense.
- **Related finding:** F-01 (no common-password blocklist) modestly increases the odds a stuffed credential happens to also be a weak, common password chosen by the victim — not the attack surface itself.

### S-02: Forged/replayed Stripe webhook
- **Actor:** External attacker impersonating Stripe.
- **Path:** POST a crafted event to `/webhooks/stripe` claiming a subscription upgrade or cancellation.
- **Mitigations in place:** HMAC signature verification (rejects any payload not signed with the real `STRIPE_WEBHOOK_SECRET`), timestamp-tolerance replay rejection (independently verified in Phase 9 Milestone 3/6), durable idempotency table.
- **Residual risk:** Low. This subsystem already received a dedicated hardening pass.

### S-03: Stale-JWT quota bypass
- **Actor:** Authenticated attacker on their own account.
- **Path:** Downgrade/cancel a subscription, then continue using a still-valid (≤15 min) access token to create resources above the new plan's limit.
- **Mitigations in place:** `getEnforcedPlanTier()` resolves plan state live from the database on every gated mutation, not from the JWT — closed in Phase 9 Milestone 5/6.
- **Residual risk:** Low. Already fixed and live-verified, including the specific "canceled via `.updated`" bypass variant found in Milestone 6.

### S-04: A `member` manages org API keys without owner/admin approval
- **Actor:** Malicious or compromised org member.
- **Path:** Call `POST /api-keys` or `DELETE /api-keys/:id` directly — no role check beyond org membership exists today.
- **Mitigations in place:** None at the route layer (F-05).
- **Residual risk:** **Medium today, rising to High once TD-025 (API-key request-authentication) is resolved.** Currently limited to key-management disruption (a member revoking a key an owner depends on) since keys authenticate nothing yet; becomes a genuine unauthorized-access vector the moment a key can actually be used to call the API.
- **Related finding:** F-05.

### S-05: Cross-tenant data read via a missing/incorrect tenant-context call
- **Actor:** Authenticated attacker on their own account, or a coding-error scenario.
- **Path:** A future route or repository function forgets to call `withTenant()`, or calls it with the wrong `orgId`.
- **Mitigations in place:** Defense in depth — even if the *application* forgets, Postgres RLS is the last line and defaults to returning zero rows without a valid tenant context (fail-secure, not fail-open). Verified live and repeatedly across every phase.
- **Residual risk:** Low. This is precisely the scenario RLS exists to catch, and it has been directly tested (not just designed) multiple times.

### S-06: Unauthenticated request flood against a protected route
- **Actor:** Unauthenticated external attacker (or a botnet).
- **Path:** Repeatedly call a protected business route (e.g., `GET /watchlists`) with no or an invalid token.
- **Mitigations in place:** None at the application layer beyond the per-route auth-endpoint limiters — `businessRateLimit` only activates *after* authentication succeeds (F-10). The intended mitigation (Cloudflare edge rate limiting) doesn't exist in this environment yet.
- **Residual risk:** **Medium.** Each request still costs a JWT-verification cycle and a database round-trip in the worst case (for routes with per-request DB reads like `requireSuperAdmin`), so a sustained flood has a real, if modest, resource-exhaustion effect. Not exploitable for data access (auth still correctly fails), but a real availability concern independent of whether a CDN is ever provisioned.
- **Related finding:** F-10.

### S-07: OAuth pre-registration account hijack
- **Actor:** Unauthenticated external attacker.
- **Path:** Attacker registers `victim@example.com` with a password only they control; the real victim later signs in via a real Google/GitHub account on that same address, expecting to "just log in."
- **Mitigations in place:** DEC-016's account-linking policy explicitly refuses to auto-link an OAuth identity to an existing-but-unverified local account, forcing the real owner through an explicit password-reset reclamation flow instead of a silent merge. Verified correct in Phase 4.
- **Residual risk:** Low. This is a textbook version of a well-known IdP-merge attack, and the mitigation was purpose-built for it.

### S-08: OAuth provider token theft via database compromise
- **Actor:** Insider with DB access, or an attacker who achieves broader DB compromise (e.g., via a future SQL-adjacent bug).
- **Path:** Read `oauth_accounts.access_token`/`refresh_token` directly from a database backup or compromised connection.
- **Mitigations in place:** Disk-level encryption only (Supabase infrastructure) — the column-level AES-256-GCM encryption `Security_Architecture.md` §7 describes does not exist in code (F-03).
- **Residual risk:** Medium. A full database compromise is already a severe event regardless, but column-level encryption is specifically meant to reduce the blast radius of exactly this scenario, and it's currently absent. Low likelihood (requires DB compromise first) but the impact (usable third-party account access) is real if it occurs.
- **Related finding:** F-03.

### S-09: Supply-chain compromise via an unpinned Docker base image
- **Actor:** Supply-chain attacker (compromises the `node:22-alpine` upstream image or a transitive package within it).
- **Path:** A routine rebuild silently pulls a compromised image because the tag isn't pinned to a specific digest.
- **Mitigations in place:** None currently (F-09). Partially offset by the existing production-aware `npm audit` CI gate, which covers *npm* dependencies but not the base OS image layer itself.
- **Residual risk:** Low-Medium. Requires a successful upstream compromise of a widely-used, actively-maintained official image — a real but not high-probability event — combined with this project happening to rebuild during the compromised window.
- **Related finding:** F-09.

### S-10: Malicious/compromised super_admin abuses the workflow-trigger endpoint
- **Actor:** Malicious or compromised `super_admin` account.
- **Path:** `POST /admin/jobs/:workflow/trigger` with an arbitrary payload.
- **Mitigations in place:** `requireSuperAdmin` (live DB check) — this *is* the correct and complete mitigation for an insider-trust scenario at the platform's maximum trust tier; no further application-layer control is appropriate here (the alternative — restricting what a super_admin can do — would undermine the role's actual purpose).
- **Residual risk:** Low, and correctly so. Logged as Informational in the findings, not a gap to close.

---

## Data Flow Summary (for threat-model context)

```
[Browser] --HTTPS(planned)--> [apps/web] --HTTPS(planned)--> [apps/api]
                                                                  |
                    +---------------------------------------------+---------------------------------------------+
                    |                       |                     |                    |                        |
              [PostgreSQL/RLS]         [Redis]              [BullMQ workers]      [Stripe API]           [n8n (internal)]
                    |                       |                     |                    |                        |
             org-scoped data      rate-limit/lockout/    dispatch to n8n       webhook events          workflow execution
             (RLS-enforced)         AI-cache counters      (internal URL only)   (HMAC-verified)        (shared-secret both ways)
```

No component in this system currently terminates real TLS (no production domain/cert provisioned) — this is the single largest "cannot fully verify" item across the whole threat model, consistent with TD-001.

---

*See `03-trust-boundary-diagram.md` for the corresponding boundary diagram, and `04-security-findings.md` for the full findings list with severity classification.*
