# 04-security-findings.md
# Phase 10 Milestone 1 — Security Findings

> Every finding below was verified against a real file, not inferred from the spec. No fix is implemented in this milestone — recommendations describe the architectural direction only, per instruction. Severity follows a standard Critical/High/Medium/Low/Informational scale, judged on realistic exploitability in this system's actual current state, not worst-case hypotheticals.

**Summary:** 0 Critical, 0 High, 4 Medium, 3 Low, 3 Informational. No Critical or High findings — the core auth/session/RLS/billing subsystems that would carry the highest severity if broken were each independently, repeatedly live-verified across Phases 4–9 and remain correct. Every Medium finding is a genuine, fixable gap; none is exploitable for cross-tenant data access or authentication bypass today.

---

## F-01 — No common-password blocklist enforced at registration

**Severity:** Low

**Subsystem:** Authentication

**Description:** `Security_Architecture.md` §2 specifies rejecting the top 10,000 common passwords (HaveIBeenPwned list). The real registration path (`auth.service.ts`) validates only length (10–128 chars) and type before hashing — no blocklist check exists.

**How it could be exploited:** An attacker with a list of common passwords could register (or a user could set) an account password like `Password123`, which passes length validation but offers minimal resistance to a targeted guess. This doesn't bypass any control directly — it just means the account is weaker than the documented policy claims.

**Why it exists:** The blocklist is a discrete piece of validation logic with an external data dependency (the HaveIBeenPwned list, or a bundled subset of it) that appears to have been deprioritized during Phase 4's implementation in favor of the auth flows' core correctness (session management, OAuth, lockout) — consistent with this project's own established practice of sequencing correctness before completeness.

**Recommendation:** Add a Zod `.refine()` check against a bundled common-password list (a static list is sufficient at this scale — no live HaveIBeenPwned API call needed) in the registration/password-change schemas. Small, self-contained, no architectural change required.

---

## F-02 — RBAC role hierarchy documentation includes an unimplemented `viewer` role

**Severity:** Informational

**Subsystem:** RBAC

**Description:** `Security_Architecture.md` §3's Role Permissions Matrix documents five roles including `viewer`. The real, shipped role set (confirmed via `MANAGE_ROLES` constants and every RBAC verification performed across Phase 9's six milestones) is exactly three: `owner`, `admin`, `member`.

**How it could be exploited:** Not exploitable — this is a documentation/reality mismatch, not a code defect. Flagged because a future engineer reading the spec could reasonably write code assuming `viewer` exists and is enforced somewhere, introducing a real bug at that point.

**Why it exists:** The spec was written pre-implementation, aspirationally, matching the same pattern found and corrected during Phase 9's own architecture-review phase for billing.

**Recommendation:** Correct `Security_Architecture.md` §3 to describe the real three-role model, or explicitly mark `viewer` as a documented-but-deferred future role (matching how MFA is already marked "v2.0 — not implemented" elsewhere in the same document).

---

## F-03 — No column-level encryption for OAuth provider tokens

**Severity:** Medium

**Subsystem:** OAuth / Encryption at Rest

**Description:** `Security_Architecture.md` §7 specifies application-level AES-256-GCM encryption for `oauth_accounts.access_token`/`refresh_token`, beyond Supabase's disk-level encryption. No `encrypt()`/`decrypt()` function or `DB_ENCRYPTION_KEY` configuration exists anywhere in `apps/api`.

**How it could be exploited:** If an attacker gained read access to a database backup or an active connection (via a separate, more severe compromise — this is not itself the entry vector), OAuth provider tokens would be recoverable in plaintext, usable to act as the affected user against Google/GitHub APIs, limited only by whatever scopes were originally granted.

**Why it exists:** No current feature reads these tokens back to call a provider API on the user's behalf (confirmed by grep — they're stored but not currently consumed anywhere), which likely deprioritized this control relative to features with an active consumer.

**Recommendation:** Implement column-level AES-256-GCM encryption for these two columns before any feature is built that actually reads them back (e.g., a future "connect your Google Calendar" feature). Until such a feature exists, the practical exposure is lower than the spec implies, but the gap should be closed proactively rather than discovered when the first token-consuming feature is designed.

---

## F-04 — `audit_logs`' RLS policy will reject the org-less writes TD-013's resolution needs

**Severity:** Medium

**Subsystem:** Multi-Tenant RLS / Audit Logs

**Description:** `audit_logs`' RLS policy (`org_id = current_setting('app.current_org_id', true)::uuid`, both `USING` and `WITH CHECK`) has no exception for `org_id IS NULL`. Some auth events TD-013 is scoped to log (e.g., a failed login for a nonexistent email, or registration before any organisation exists) have no resolvable `org_id` at write time.

**How it could be exploited:** Not exploitable as a vulnerability — this is a correctness/reliability finding. Left unaddressed, it would surface as a hard failure (an `AppError`/exception) the first time Milestone 2 attempts to write one of these events, potentially in a code path that isn't expecting a database error (e.g., inside a login-failure handler that shouldn't itself throw).

**Why it exists:** `audit_logs`' RLS policy was written for its already-live use case (billing events, which always have a real `org_id` — DEC-027 guarantees this) before TD-013's auth-event logging was ever attempted against it.

**Recommendation:** A migration relaxing only the `WITH CHECK` clause to permit `org_id IS NULL` inserts, leaving `USING` (read visibility) unchanged — so a tenant-scoped read never gains visibility into null-org rows, preserving today's isolation guarantee exactly. This is the specific fix already scoped into Milestone 2's plan; logged here so it's tracked as a confirmed-real finding, not merely a plan assumption.

---

## F-05 — API key create/revoke has no role restriction beyond org membership

**Severity:** Medium

**Subsystem:** API Keys / RBAC

**Description:** `Security_Architecture.md`'s own Role Permissions Matrix restricts "Create API keys"/"Revoke API keys" to Owner/Admin/Super Admin. The real route (`api-key.routes.ts`) gates `POST`/`DELETE` behind `requireOrgContext` only — any org role, including a plain `member`, can currently create and revoke API keys.

**How it could be exploited today:** Limited. Since API keys don't yet authenticate any request (TD-025), a member creating a key grants nothing beyond what their own session already has, and a member revoking a key affects only their own organisation's operations (not a cross-tenant issue). The realistic exploit today is a **malicious or careless member disrupting their own org's integrations** by revoking a key an owner depends on — an availability/integrity issue scoped to a single org, not a confidentiality breach.

**Why it becomes more severe later:** The moment TD-025 (API-key request-authentication) is resolved, a key becomes a durable, revocable credential distinct from a session — at that point, an unrestricted member being able to *create* one starts to matter more (e.g., if key scopes are ever broadened beyond the creating member's own session-equivalent access).

**Why it exists:** `api-key.service.ts`'s `apiAccess`-plan-flag check was the control implemented and tested during Phase 5; the separate role restriction the spec also calls for was not additionally wired onto the route at the same time.

**Recommendation:** Add `requireRole('owner', 'admin')` to the create/revoke routes, matching the documented matrix exactly. Small, isolated change — recommended for Milestone 2 rather than deferred until TD-025 makes it more urgent.

---

## F-06 — n8n's own inbound webhook-auth check is not a timing-safe comparison

**Severity:** Informational

**Subsystem:** n8n Workflows

**Description:** `apps/api`'s outbound calls to n8n are validated by an n8n "Valid Service Token?" IF-node using plain string equality (`{{$json.headers['x-service-token']}} equals {{$env.N8N_SERVICE_TOKEN}}`), confirmed by direct inspection of `foundation-demo.json`/`prompt-test.json`. This is asymmetric with `apps/api`'s own inbound check (`requireServiceToken`), which explicitly uses `crypto.timingSafeEqual`.

**How it could be exploited:** In principle, a timing side-channel across many requests could narrow down a shared secret one byte at a time. In practice, this requires an attacker to make a very large number of precisely-timed requests over a real network (not a local benchmark) against a secret with no theoretical maximum length — a genuinely low-probability, high-effort attack against a token this length, and one this project doesn't control the underlying tooling for.

**Why it exists:** n8n's IF node has no timing-safe string-comparison primitive available — this is a third-party tool constraint, not a decision made in code this project owns.

**Recommendation:** No action recommended. Documenting the asymmetry is the correct closure for this finding; replacing n8n's built-in comparison isn't practical, and the residual risk is negligible.

---

## F-07 — n8n's admin UI and its webhook endpoints share one public hostname

**Severity:** Informational

**Subsystem:** n8n Workflows / Infrastructure

**Description:** `docker-compose.prod.yml` routes `n8n.viralscopes.io` to n8n's single port, which serves both the admin UI (protected by `N8N_BASIC_AUTH_USER`/`PASSWORD`) and the webhook endpoints (protected by the shared service token). No additional network-level separation exists between the two paths.

**How it could be exploited:** Not directly — each surface has its own independent credential. This is noted because it's an implicit trust boundary that should be an explicit, documented one, not because a gap was found in either credential itself.

**Why it exists:** This is n8n's standard, expected deployment shape — a single service exposing both concerns is how n8n is designed to run.

**Recommendation:** Once a real production domain exists (not yet — infra not provisioned), consider an edge-level IP allowlist or additional basic-auth layer specifically on the admin UI path. Cannot be built or verified in this environment today; logged for a later infrastructure milestone, not blocking.

---

## F-08 — No Content-Security-Policy anywhere (API or frontend)

**Severity:** Medium

**Subsystem:** CSP/CORS/CSRF, Frontend Authentication

**Description:** Neither `apps/api` (no `helmet` dependency at all) nor `apps/web` (`proxy.ts` sets no CSP header, and Next.js's own defaults don't include one) sets a Content-Security-Policy. `Security_Architecture.md` §11/§14 specifies a nonce-based CSP for both.

**How it could be exploited:** CSP is a defense-in-depth control against XSS, not the primary defense — its absence doesn't create a vulnerability by itself. Today's actual XSS surface is low: confirmed by direct grep, zero instances of `dangerouslySetInnerHTML`, `eval()`, or `Function()` exist anywhere in `apps/web`, and React's default output-escaping is the only control currently protecting rendered content. If a future change ever introduced an XSS-vulnerable pattern (e.g., rendering unescaped HTML from a new user-generated-content feature), there would currently be no CSP to contain the resulting script execution.

**Why it exists:** Security headers were explicitly scoped to Phase 10 from the start (see `infra/traefik/dynamic/middlewares.yml`'s own comment: "Content-Security-Policy... [is] set by Helmet.js in the API itself — that's Phase 5 scope, once the API has real routes to protect" — written ahead of time, correctly deferred, not an oversight).

**Recommendation:** Helmet.js in `apps/api`, and a nonce-based CSP via `apps/web`'s middleware — both already scoped into Milestone 2 of this phase's plan.

---

## F-09 — Docker base images are floating tags, not pinned digests

**Severity:** Low

**Subsystem:** Docker

**Description:** Both `Dockerfile.api` and `Dockerfile.web` use `FROM node:22-alpine` — a floating tag that can silently point to a different image on a future rebuild. `Security_Architecture.md`/`PROJECT_RULES.md` §4.5 call for pinned, reviewed digests.

**How it could be exploited:** Requires a successful upstream compromise of the official `node` image (a real but historically rare event for a widely-scrutinized official image) landing between two of this project's own builds. The existing production-aware `npm audit` CI gate covers npm-level dependencies but has no visibility into the base OS image layer itself.

**Why it exists:** Reasonable simplification at MVP scale/pre-launch — no build has yet needed the reproducibility guarantee a pinned digest provides.

**Recommendation:** Pin both Dockerfiles to a specific digest, reviewed on each deliberate update. Already scoped into Milestone 4.

---

## F-10 — No rate limiting ahead of authentication on protected business routes

**Severity:** Medium

**Subsystem:** Rate Limiting

**Description:** `businessRateLimit` requires `request.user` to already exist (it throws `UNAUTHENTICATED` otherwise), meaning it only ever runs *after* `authenticate` has already succeeded. A request to a protected route with no token, or an invalid/expired one, fails with `401` but is not itself rate-limited by anything in this application — only specific *auth* routes (login, register, etc.) have their own per-IP limiter.

**How it could be exploited:** A sustained flood of requests against any protected business route (with no or garbage tokens) costs the server a JWT-verification cycle per request, and for routes like the admin ones, a database round-trip (`requireSuperAdmin`'s live lookup) even before authentication fails, since Fastify's `preHandler` chain runs `authenticate` first but doesn't reject the connection at the network layer. This is an availability concern (resource exhaustion), not a data-access one — authentication still correctly fails every time.

**Why it exists:** `Security_Architecture.md` §16 assigns this responsibility to Cloudflare's edge rate limiting ("100 req/min per IP on `/api/*`"), which doesn't exist in this environment (TD-001) — the application-layer gap is real and independent of whether that infrastructure is ever provisioned, since relying solely on infrastructure that doesn't exist yet leaves zero mitigation today.

**Recommendation:** A global, IP-keyed, generous-ceiling rate limit ahead of `authenticate` (e.g., `@fastify/rate-limit` in `global: true` mode, sized well above any legitimate user's traffic but low enough to blunt a flood). Already scoped into Milestone 3.

---

## Findings Index

| ID | Subsystem | Severity | Status |
|---|---|---|---|
| F-01 | Authentication | Low | Open — recommend Milestone 2 |
| F-02 | RBAC (documentation) | Informational | Open — documentation correction only |
| F-03 | OAuth / Encryption at Rest | Medium | Open — recommend Milestone 2 or when a token-consuming feature is built |
| F-04 | RLS / Audit Logs | Medium | Open — already scoped into Milestone 2 (TD-013 resolution) |
| F-05 | API Keys / RBAC | Medium | Open — recommend Milestone 2 |
| F-06 | n8n Workflows | Informational | Accepted — no action recommended |
| F-07 | n8n Workflows / Infrastructure | Informational | Deferred — infra not provisioned |
| F-08 | CSP/CORS/CSRF, Frontend Auth | Medium | Open — already scoped into Milestone 2 |
| F-09 | Docker | Low | Open — already scoped into Milestone 4 |
| F-10 | Rate Limiting | Medium | Open — already scoped into Milestone 3 |

*See `05-risk-register.md` for these findings translated into tracked risks with owners/timelines, and `06-remediation-plan.md` for the prioritized fix sequence.*
