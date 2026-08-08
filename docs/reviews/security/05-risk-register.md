# 05-risk-register.md
# Phase 10 Milestone 1 — Security Risk Register

> Format matches `PROJECT_STATUS.md`'s existing RISK-01/RISK-02 register, extended with a Probability column since these are security risks (likelihood of exploitation), not project risks (likelihood of schedule slip). Each entry maps 1:1 to a finding in `04-security-findings.md`.

---

### SEC-RISK-01 — API key create/revoke lacks role restriction (F-05)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Low today, rising to Medium once TD-025 lands |
| **Subsystem** | API Keys / RBAC |
| **Phases affected** | Phase 5 (introduced), Phase 10 (found), future TD-025 resolution (severity changes) |
| **Status** | **Resolved** — Milestone 2. `requireRole('owner', 'admin')` added to `POST`/`DELETE /api-keys`; verified live (member gets 403, owner unaffected) |

**Description:** `api-key.routes.ts` allows any org member (not just owner/admin) to create and revoke API keys, contradicting `Security_Architecture.md`'s own Role Permissions Matrix. Currently low-impact since API keys authenticate nothing (TD-025), but the control gap is real today regardless.

**Owner:** Resolved in Phase 10 Milestone 2
**Target resolution:** ~~Milestone 2 (Application Security Hardening)~~ Done

---

### SEC-RISK-02 — `audit_logs` RLS will reject the writes TD-013 needs (F-04)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Certain — will manifest as a hard failure the moment Milestone 2 attempts the write, if not fixed first |
| **Subsystem** | Multi-Tenant RLS / Audit Logs |
| **Phases affected** | Phase 3 (RLS policy authored), Phase 10 (found; will be resolved in the same milestone that needs it) |
| **Status** | **Resolved** — Milestone 2, migration `0012_audit_logs_null_org_write.sql`. `WITH CHECK` now permits `org_id IS NULL`; `USING` deliberately left unchanged (verified: a null-org row is still invisible to any tenant-scoped read, isolation preserved) |

**Description:** Not an exploitable vulnerability but a correctness risk that must be fixed *before* (or as the first step of) wiring auth-event audit logging, or that work will fail immediately on any org-less event.

**Owner:** Resolved in Phase 10 Milestone 2
**Target resolution:** ~~Milestone 2, before any auth-event audit-log write is added~~ Done

---

### SEC-RISK-03 — No CSP anywhere in the application (F-08)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Low today (no known XSS vector exists), but this is a defense-in-depth control meant to catch a *future* mistake, not today's state |
| **Subsystem** | CSP/CORS/CSRF, Frontend Authentication |
| **Phases affected** | Phase 8 (frontend built without one), Phase 5/9 (API built without one), Phase 10 (closing it) |
| **Status** | **Resolved** — Milestone 2. Helmet (`default-src 'none'`) on `apps/api`; nonce-based CSP generated per-request in `apps/web/src/proxy.ts`. Verified: headers present on both apps, Next.js's own inline scripts confirmed carrying the correct nonce |

**Description:** Neither `apps/api` nor `apps/web` sets a Content-Security-Policy header. Deliberately deferred to this phase from the start (confirmed by `infra/traefik/dynamic/middlewares.yml`'s own forward-looking comment), not an oversight.

**Owner:** Resolved in Phase 10 Milestone 2
**Target resolution:** ~~Milestone 2~~ Done

---

### SEC-RISK-04 — No rate limiting ahead of authentication (F-10)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Medium — doesn't require any special access, just sustained traffic; realistic today given no CDN/WAF exists yet |
| **Subsystem** | Rate Limiting |
| **Phases affected** | Phase 5 (business-rate-limit introduced, auth-only scope), Phase 10 (found) |
| **Status** | **Resolved** — Milestone 2 (moved up from the original Milestone 3 target at the repo owner's request). `plugins/rate-limit.plugin.ts` now registers `global: true` with a 300/min/IP default, hooking `onRequest` ahead of `authenticate` for every route. Verified live: exactly 300 requests succeed, the 301st onward gets a real 429 with correct headers |

**Description:** An unauthenticated flood against any protected route costs a JWT-verification cycle (and, for some routes, a DB round-trip) with no application-layer throttle ahead of `authenticate`. The documented mitigation (Cloudflare) doesn't exist in this environment.

**Owner:** Resolved in Phase 10 Milestone 2
**Target resolution:** ~~Milestone 3 (API Security & Abuse Protection)~~ Done, Milestone 2

---

### SEC-RISK-05 — No column-level encryption for OAuth provider tokens (F-03)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Low — requires a separate, more severe database compromise as a prerequisite |
| **Subsystem** | OAuth / Encryption at Rest |
| **Phases affected** | Phase 4 (OAuth built), Phase 10 (found) |
| **Status** | **Resolved** — Milestone 2. `lib/encryption.ts` (AES-256-GCM, matching `Security_Architecture.md` §7 exactly) wired transparently into `oauth.repository.ts`'s create/find functions; verified against the real DB that the stored column is ciphertext and the round-trip returns the original plaintext. `createOAuthAccount`'s input type also extended to accept token fields it previously silently dropped, so the mechanism has real effect whenever a future feature captures tokens |

**Description:** `oauth_accounts.access_token`/`refresh_token` rely on disk-level encryption only; `Security_Architecture.md` §7 specifies application-level AES-256-GCM as well. No feature currently reads these tokens back, which limits practical exposure today but doesn't eliminate the gap.

**Owner:** Resolved in Phase 10 Milestone 2
**Target resolution:** ~~Milestone 2, or no later than whenever a feature is built that actually consumes these tokens (whichever comes first)~~ Done

---

### SEC-RISK-06 — Docker base images not pinned to a digest (F-09)

| Property | Value |
|---|---|
| **Severity** | Low |
| **Probability** | Low — requires a successful upstream compromise of an official, widely-scrutinized image |
| **Subsystem** | Docker |
| **Phases affected** | Phase 2 (Dockerfiles authored), Phase 10 (found) |
| **Status** | **Resolved** — Milestone 4. Both `FROM node:22-alpine` lines in each Dockerfile pinned to the digest verified via `docker pull` immediately before pinning; both images rebuilt and confirmed booting correctly (verified live: `/ready`, `/health`, security headers, CSP, login redirect all functioning) |

**Description:** `node:22-alpine` is a floating tag in both Dockerfiles. Supply-chain reproducibility gap, not an active vulnerability.

**Owner:** Resolved in Phase 10 Milestone 4
**Target resolution:** ~~Milestone 4 (Infrastructure Security)~~ Done

---

### SEC-RISK-07 — No common-password blocklist (F-01) — **RETRACTED, Milestone 6**

| Property | Value |
|---|---|
| **Severity** | N/A |
| **Status** | **Retracted.** This risk never existed — a real ~300-entry blocklist has been live since Phase 4 (`0bb43eb`), confirmed by direct code inspection and a 9-case logic-level test during Milestone 6's final audit. Milestone 1's original finding (F-01) was factually wrong |

**Description (historical, for the record):** Milestone 1's review claimed registration/password-change validated length only, not against a common-password list. This was incorrect — `lib/password.ts`'s `hashPassword()` already called `validatePasswordStrength()` → `isCommonPassword()` on both paths at the time that review was written.

**Owner:** N/A — nothing to resolve
**Target resolution:** N/A

---

### SEC-RISK-08 — Open redirect via the login page's `from` parameter (F-11)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Medium — requires only a crafted link, no privileged access; the kind of link a phishing campaign would send anyway |
| **Subsystem** | Frontend Authentication |
| **Phases affected** | Phase 4/8 (login page built), Phase 10 (found and fixed same milestone) |
| **Status** | **Resolved** — Milestone 3. `safeRedirectTarget()` added to `login/page.tsx`; verified against a full battery of attack payloads (absolute URL, protocol-relative, backslash-prefixed, bare hostname, `javascript:`) all correctly falling back to `/home`, and confirmed the exact fix logic present in the built production Docker bundle |

**Description:** `router.push(searchParams.get('from') ?? '/home')` on the login page passed an unvalidated, fully attacker-controlled query parameter straight into Next.js's client router. Traced through the router's own source (not assumed) to confirm an external URL there triggers a genuine full-page browser navigation (`mpaNavigation: true`), not merely a failed internal route lookup — a real, exploitable post-login open redirect, not a theoretical one.

**Owner:** Resolved in Phase 10 Milestone 3
**Target resolution:** Done

---

## Accepted / Informational Items (not tracked as risks — no action planned)

| Finding | Reason not tracked as a risk |
|---|---|
| F-02 (RBAC doc mismatch) | Documentation-only correction, not a code risk |
| F-06 (n8n's non-timing-safe comparison) | Third-party tool constraint; negligible practical exploitability |
| F-07 (n8n shared public hostname) | Standard n8n deployment shape; each surface has its own independent credential |
| F-12 (auth rate-limit table drift) | Documentation-only correction, code was never laxer than documented anywhere it drifted — corrected in Milestone 3 |

---

## Risk Summary

| Severity | Count | Risk IDs | Status |
|---|---|---|---|
| Critical | 0 | — | — |
| High | 0 | — | — |
| Medium | 6 | SEC-RISK-01, 02, 03, 04, 05, 08 | **All 6 resolved** (5 in Milestone 2, 1 — SEC-RISK-08, found and fixed the same day — in Milestone 3) |
| Low | 1 | SEC-RISK-06 | **Resolved in Milestone 4** |
| Retracted (never a real risk) | 1 | SEC-RISK-07 | Milestone 6 — the underlying finding (F-01) was factually wrong; a real blocklist has existed since Phase 4 |
| Informational (accepted, no risk entry) | 4 | F-02, F-06, F-07, F-12 | N/A |

*See `06-remediation-plan.md` for original sequencing. Milestone 2 (2026-08-01) resolved 5 Medium findings from the Milestone 1 review. Milestone 3 (2026-08-01) resolved a 6th Medium finding (SEC-RISK-08 / F-11) discovered during its own open-redirect audit, plus a documentation-only rate-limit-table correction (F-12) — both verified with real tests, not assumed. Milestone 4 (2026-08-01) resolved the one remaining scoped finding (SEC-RISK-06 / F-09, Docker digest pinning) plus infrastructure hardening beyond the original findings list (Traefik HTTP->HTTPS redirect, Dependabot, GitHub Actions SHA-pinning, container hardening flags). Milestone 6 (2026-08-05), while re-verifying every open finding for the final audit, retracted SEC-RISK-07/F-01 as a factually incorrect finding — see `PROJECT_STATUS.md`'s Status Update History for the consolidated summary.*
