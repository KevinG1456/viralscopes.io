# 04-security-review.md
# Billing Architecture Review — Security

---

## Webhook Security

| Control | Design | Verdict |
|---|---|---|
| Signature verification | `stripe.webhooks.constructEvent(rawBody, sig, secret)`, raw buffer via `addContentTypeParser` | **Sound.** Correctly identifies the raw-body requirement that is the single most common Stripe-integration bug (JSON re-serialization breaks HMAC verification). |
| Replay protection | Stripe's own 5-minute timestamp window (automatic) + durable `stripe_event_id` UNIQUE table | **Sound**, defense-in-depth is appropriate here. |
| Return codes to Stripe | Always `200` once signature-verified, even on internal processing failure; dead-letter + alert instead | **Sound** — correct pattern, prevents unnecessary retry storms. |
| Rate limiting on webhook endpoint | Exempted from plan-tier limiting; relies on "Cloudflare WAF rule limits to Stripe's IP ranges" | **Needs verification** — no Cloudflare/WAF configuration exists anywhere in this repository today (infra is Traefik via Coolify per Deployment_Guide.md, not Cloudflare in front of the API by any evidence found in this codebase). This control is asserted, not confirmed to exist. If it doesn't exist, the webhook endpoint is reachable by anyone on the internet who can forge a POST — which is fine *only if* signature verification is airtight and always runs first (it is designed to), but the stated defense-in-depth layer (IP allowlisting) needs an actual owner and confirmation it can be implemented on the real infrastructure, not assumed. |

---

## Secrets

| Secret | Design | Verdict |
|---|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Env-var injected, never in code/images | **Sound**, matches existing `config.ts` Zod-schema-driven env pattern used for every other secret (`JWT_SECRET`, `N8N_SERVICE_TOKEN`, etc.) |
| Restricted API key scope | Explicit minimum-permission set (customers, subscriptions, checkout/portal sessions, invoices read) | **Sound and above-average diligence** — most integrations default to the full secret key. |
| Secret-scanning tool | Claimed: `detect-secrets` | **Factually wrong** — repo uses secretlint (see `02-consistency-review.md` §7). Low severity (cosmetic), but should be corrected so a future engineer doesn't go looking for a hook that isn't there. |

---

## RBAC — highest-severity finding in this review

**Claim (09-security.md):** "Super Admin JWT includes `role = 'super_admin'`. The billing middleware must explicitly exclude Super Admin from plan-based restrictions."

**Reality:** `apps/api/src/lib/jwt.ts`'s `AccessTokenPayload` has exactly five fields: `sub, userId, orgId, orgRole, planTier`. There is no `role` field in the JWT at all. The actual super-admin check (`apps/api/src/middleware/require-super-admin.ts`) performs a live database read of `users.role` on every request, with an explicit code comment stating this is deliberate: *"Deliberately NOT based on the JWT."*

**Why this is CONFIRMED, not just plausible:** both files were read directly; the JWT type definition and the middleware's own comment are unambiguous and were written specifically to rule out exactly the design the billing security document assumes.

**Impact if implemented as designed:** any billing middleware written to check `request.user.role === 'super_admin'` for an "exclude Super Admin from plan gating" bypass would **always evaluate false** (the field doesn't exist on the decoded token type, so this would either be a TypeScript compile error against the real `AccessTokenPayload` type, or — if someone loosens the type to make it compile — a silent, permanently-false runtime check that never actually grants the intended admin bypass). Either way, the "Super Admin can access everything" billing requirement (FR-09, admin override endpoint) would not work as specified unless it correctly calls the existing `require-super-admin.ts` middleware (a real DB read) instead of trying to read a nonexistent JWT claim.

**Required fix before implementation:** every place the billing design says "JWT includes `role`" must instead say "call `require-super-admin.ts`, which does a live DB check" — this is not a rewrite of the security model, just a correction to point at the control that already exists and already works.

---

## RBAC — role-set inconsistency (second-highest severity)

Three different documents (`03-domain-model.md`, `05-api-design.md`, `09-security.md`) state billing mutations (checkout, portal) require "owner or admin." This conflicts with the Owner-only rule found in Security_Architecture.md's permission matrix. `05-api-design.md` additionally contradicts *itself* within the same section (Admin Endpoints header says "`super_admin` or `admin`"; the endpoint immediately below says "`super_admin` role" only).

**Recommendation:** resolve to a single, explicitly-cited role set per operation before implementation, sourced from Security_Architecture.md directly rather than restated from memory in three separate documents (restating the same fact three times independently is how it drifted three different ways).

---

## RLS

Already covered in depth in `02-consistency-review.md` §4 — the Supabase-style `auth.uid()`/`TO authenticated` SQL shown in `04-database-design.md` and `09-security.md` would not run against this schema at all. This is a **security-relevant** finding, not just a style issue: if an implementer copy-pasted this SQL as-is, it would fail to apply (Postgres would error on `auth.uid()` not existing), likely causing the migration to simply not create the intended isolation — the failure mode here is "migration doesn't apply," not "silently permissive policy," so the risk is a blocked deploy rather than a security hole, but it needs correcting regardless. Separately: **no new RLS policy is actually required** — `subscriptions` and `invoices` already carry a correct `FOR ALL USING/WITH CHECK` tenant-isolation policy from migration `0003`. The architecture should say "no RLS change needed" for these two tables and remove the incorrect re-specification entirely.

---

## CSRF

Claim: webhook routes need CSRF "bypassed." Reality: `validateCsrf` (`apps/api/src/middleware/csrf.ts`) is opt-in per route via `preHandler`, not a global hook — there is nothing to bypass, the webhook route simply never includes it, identically to how every other unauthenticated route (e.g. `POST /auth/login`) already works today. **Low severity** — the intended end state (webhook route doesn't require CSRF) is correct, the document just describes a bypass mechanism that doesn't need to exist.

---

## JWT staleness handling

The recommendation (Option A: Redis/DB is authoritative, JWT `planTier` is a display hint only) is the correct choice and is consistent with how the JWT already works for other stale-claim scenarios in this codebase (nothing currently forces re-login on a mid-session RBAC change either). **Sound**, no issues.

---

## PCI

Zero-card-data design (Stripe Checkout + Customer Portal only, no Stripe Elements) is correct and well-reasoned. The ESLint-rule mitigation against accidental `@stripe/react-stripe-js` imports is a genuinely good, cheap preventive control that doesn't exist in any form today (no such ESLint rule is configured currently) — this should be added as an actual M1-or-earlier task, not left as prose.

---

## Idempotency

Functionally correct end state (duplicate webhook events must not double-process), but over-specified with four different mechanisms across three documents (Redis TTL key, DB UNIQUE table, per-entity UNIQUE constraints, and a one-off pending-customer Redis key for out-of-order `customer.created` events). More surface area to test and more ways for the mechanisms to disagree with each other than the problem requires — see `02-consistency-review.md`'s consolidation recommendation. This is a maintainability/correctness risk, not strictly a security hole, but idempotency bugs in billing systems directly cause double-charges or missed-charge states, which is why it's included here rather than only in the performance review.

---

## Audit Logging

The `action` taxonomy (`billing.subscription.created`, `billing.invoice.paid`, etc.) is sound and consistent with the existing `audit_logs` schema (`org_id`, `user_id` nullable, `action`, `resource_type`, `resource_id`, `metadata jsonb`). No `auditLog()` helper function exists in the codebase yet — every call site shown in the billing documents is new code that must be written, not a call into existing infrastructure. This is a scope-sizing note (see `03-roadmap-validation.md`), not a security defect — the metadata shown (never includes card numbers, only amounts/IDs/plan names) is appropriately scrubbed of sensitive payment data.

---

## Rate Limiting / Abuse Prevention

Checkout/portal session creation limits (5/req 15 min, 10/req 15 min) are reasonable and don't conflict with any existing rate-limit key namespace. Admin-override abuse mitigation (role gate + audit log + no public IP access) is sound in principle but repeats the same "super_admin from JWT" error noted above if the actual guard is implemented against the wrong field.

---

## Trust Boundary Diagram

Correct and clearly drawn: public internet / Stripe-pre-verification, authenticated-but-stale-claims, trusted-post-verification, and system/service-role tiers are the right mental model for this integration.

---

## Findings Ranked by Severity

| # | Finding | Severity | Confirmed / Plausible |
|---|---|---|---|
| 1 | Super Admin bypass designed against a JWT `role` claim that does not exist; real check is a live DB read via `require-super-admin.ts` | **High** | Confirmed |
| 2 | Billing-mutation role set ("owner or admin") inconsistent across 3 documents and self-contradictory within one of them; conflicts with Security_Architecture.md's stricter Owner-only rule | **High** | Confirmed (self-contradiction) / Plausible (vs. Security_Architecture.md, pending final reconciliation) |
| 3 | RLS SQL uses Supabase's `auth.uid()`/`authenticated` role, which don't exist in this schema — would fail to apply as written | **Medium** (blocks deploy, doesn't create a silent hole) | Confirmed |
| 4 | Webhook IP-allowlisting relies on an unconfirmed Cloudflare WAF layer not evidenced anywhere in this infrastructure | **Medium** | Needs verification with whoever owns production infra |
| 5 | Four overlapping idempotency mechanisms increase the chance of a correctness bug that manifests as a billing/security issue (double-processing) | **Low–Medium** | Plausible, design-quality concern rather than a confirmed bug |
| 6 | Secret-scanning tool misnamed (`detect-secrets` vs. real secretlint) | **Low** | Confirmed, cosmetic |
| 7 | CSRF "bypass" describes a mechanism that doesn't need to exist (opt-in middleware, not global) | **Low** | Confirmed, cosmetic |

**No PCI, no card-data-handling, and no secrets-in-code risks were found** — those aspects of the design are sound and above the bar typically seen in a first-pass integration spec.
