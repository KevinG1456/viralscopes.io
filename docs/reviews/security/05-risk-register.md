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
| **Status** | Open |

**Description:** `api-key.routes.ts` allows any org member (not just owner/admin) to create and revoke API keys, contradicting `Security_Architecture.md`'s own Role Permissions Matrix. Currently low-impact since API keys authenticate nothing (TD-025), but the control gap is real today regardless.

**Owner:** To be assigned (Phase 10 Milestone 2)
**Target resolution:** Milestone 2 (Application Security Hardening)

---

### SEC-RISK-02 — `audit_logs` RLS will reject the writes TD-013 needs (F-04)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Certain — will manifest as a hard failure the moment Milestone 2 attempts the write, if not fixed first |
| **Subsystem** | Multi-Tenant RLS / Audit Logs |
| **Phases affected** | Phase 3 (RLS policy authored), Phase 10 (found; will be resolved in the same milestone that needs it) |
| **Status** | Open — already scoped as a prerequisite step within Milestone 2 |

**Description:** Not an exploitable vulnerability but a correctness risk that must be fixed *before* (or as the first step of) wiring auth-event audit logging, or that work will fail immediately on any org-less event.

**Owner:** To be assigned (Phase 10 Milestone 2)
**Target resolution:** Milestone 2, before any auth-event audit-log write is added

---

### SEC-RISK-03 — No CSP anywhere in the application (F-08)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Low today (no known XSS vector exists), but this is a defense-in-depth control meant to catch a *future* mistake, not today's state |
| **Subsystem** | CSP/CORS/CSRF, Frontend Authentication |
| **Phases affected** | Phase 8 (frontend built without one), Phase 5/9 (API built without one), Phase 10 (closing it) |
| **Status** | Open — already scoped into Milestone 2 |

**Description:** Neither `apps/api` nor `apps/web` sets a Content-Security-Policy header. Deliberately deferred to this phase from the start (confirmed by `infra/traefik/dynamic/middlewares.yml`'s own forward-looking comment), not an oversight.

**Owner:** To be assigned (Phase 10 Milestone 2)
**Target resolution:** Milestone 2

---

### SEC-RISK-04 — No rate limiting ahead of authentication (F-10)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Medium — doesn't require any special access, just sustained traffic; realistic today given no CDN/WAF exists yet |
| **Subsystem** | Rate Limiting |
| **Phases affected** | Phase 5 (business-rate-limit introduced, auth-only scope), Phase 10 (found) |
| **Status** | Open — already scoped into Milestone 3 |

**Description:** An unauthenticated flood against any protected route costs a JWT-verification cycle (and, for some routes, a DB round-trip) with no application-layer throttle ahead of `authenticate`. The documented mitigation (Cloudflare) doesn't exist in this environment.

**Owner:** To be assigned (Phase 10 Milestone 3)
**Target resolution:** Milestone 3 (API Security & Abuse Protection)

---

### SEC-RISK-05 — No column-level encryption for OAuth provider tokens (F-03)

| Property | Value |
|---|---|
| **Severity** | Medium |
| **Probability** | Low — requires a separate, more severe database compromise as a prerequisite |
| **Subsystem** | OAuth / Encryption at Rest |
| **Phases affected** | Phase 4 (OAuth built), Phase 10 (found) |
| **Status** | Open |

**Description:** `oauth_accounts.access_token`/`refresh_token` rely on disk-level encryption only; `Security_Architecture.md` §7 specifies application-level AES-256-GCM as well. No feature currently reads these tokens back, which limits practical exposure today but doesn't eliminate the gap.

**Owner:** To be assigned
**Target resolution:** Milestone 2, or no later than whenever a feature is built that actually consumes these tokens (whichever comes first)

---

### SEC-RISK-06 — Docker base images not pinned to a digest (F-09)

| Property | Value |
|---|---|
| **Severity** | Low |
| **Probability** | Low — requires a successful upstream compromise of an official, widely-scrutinized image |
| **Subsystem** | Docker |
| **Phases affected** | Phase 2 (Dockerfiles authored), Phase 10 (found) |
| **Status** | Open — already scoped into Milestone 4 |

**Description:** `node:22-alpine` is a floating tag in both Dockerfiles. Supply-chain reproducibility gap, not an active vulnerability.

**Owner:** To be assigned (Phase 10 Milestone 4)
**Target resolution:** Milestone 4 (Infrastructure Security)

---

### SEC-RISK-07 — No common-password blocklist (F-01)

| Property | Value |
|---|---|
| **Severity** | Low |
| **Probability** | Low — bcrypt cost-12 + lockout + rate limiting already substantially mitigate brute-force, blocklist is an additional layer, not the only one |
| **Subsystem** | Authentication |
| **Phases affected** | Phase 4 (registration built), Phase 10 (found) |
| **Status** | Open |

**Description:** Registration/password-change validate length only, not against a common-password list, as `Security_Architecture.md` §2 specifies.

**Owner:** To be assigned
**Target resolution:** Milestone 2 (low effort, bundled with other application hardening)

---

## Accepted / Informational Items (not tracked as risks — no action planned)

| Finding | Reason not tracked as a risk |
|---|---|
| F-02 (RBAC doc mismatch) | Documentation-only correction, not a code risk |
| F-06 (n8n's non-timing-safe comparison) | Third-party tool constraint; negligible practical exploitability |
| F-07 (n8n shared public hostname) | Standard n8n deployment shape; each surface has its own independent credential |

---

## Risk Summary

| Severity | Count | Risk IDs | All have a scoped milestone? |
|---|---|---|---|
| Critical | 0 | — | — |
| High | 0 | — | — |
| Medium | 5 | SEC-RISK-01, 02, 03, 04, 05 | Yes — M2 or M3 |
| Low | 2 | SEC-RISK-06, 07 | Yes — M2 or M4 |
| Informational (accepted, no risk entry) | 3 | F-02, F-06, F-07 | N/A |

*See `06-remediation-plan.md` for these risks sequenced into a concrete, prioritized fix order across Milestones 2–4.*
