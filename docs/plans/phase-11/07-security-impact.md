# Phase 11 — Security Implications

**Status: proposal only.** This document extends `Security_Architecture.md` with Phase-11-specific analysis; it does not modify that document. Any correction it identifies will be applied to `Security_Architecture.md` itself during Milestone 9 (Hardening & Final Verification), not before implementation.

---

## 1. What `Security_Architecture.md` already anticipates (verified)

§3's Permissions Matrix (line 214-238) already lists, as Super-Admin-only capabilities: "Access Super Admin Panel", "Manage all organisations", "Override any org plan", "Trigger n8n workflows", "View dead-letter queue." §18's audit taxonomy (line 1279) already includes an "Admin actions" category: *"User suspended, plan overridden, dead-letter job retried, quota reset, workflow triggered."* **Phase 11's scope is not a security surprise — the design intent has existed in the doc since before this phase started.** What's missing is the implementation and, in one case (§18's `GET /api/v1/admin/audit-logs` claim), the doc describes something not yet built as if it already exists — corrected per `01-phase-11-overview.md` §4.

---

## 2. The core gating pattern, reused unchanged

Every new admin route uses `requireSuperAdmin` (live DB read of `users.role`, DEC-017) — this is correct, already battle-tested, and not being redesigned. The security question for Phase 11 is not "how do we gate admin routes" (solved) but "what do admin routes now let a super admin *do*, and is each new capability's blast radius appropriately controlled." That's assessed per-milestone below.

---

## 3. New attack surface introduced, by milestone

**Milestone 1 (Foundation):** New `GET /api/v1/admin/me`-style endpoint is low-risk (read-only, no PII beyond a boolean). Main risk: if implemented carelessly, the endpoint itself could leak more than intended (e.g., accidentally returning full user role/permissions data instead of a minimal boolean) — scope the response shape deliberately.

**Milestone 2 (User Management):** Force-password-reset and suspend are both classic account-takeover/DoS-adjacent primitives *if the admin account itself is compromised* — this elevates the importance of protecting super-admin credentials specifically (see §5, MFA gap). Suspend must be immediately effective (session revocation), not just block new logins, or it's a false sense of control. A super admin must not be able to suspend the only other super admin (or themselves) into a state with no path to reverse it — needs an explicit guard, flagged as an open implementation question in `03-milestones.md` Milestone 2.

**Milestone 3 (Organisation Management):** Plan override is a direct financial-state mutation — the audit trail must capture enough to support a real billing dispute (who, when, previous value, new value, stated reason). Org suspend must genuinely block org-scoped access for all members, or it's cosmetic.

**Milestone 4 (Impersonation) — by far the largest new attack surface in Phase 11:**
- A compromised super-admin credential (single-factor, per §5) now has a documented, sanctioned mechanism to view *any* customer organisation's private data. This is not a new risk Phase 11 invents — a super admin arguably already has this via direct DB access — but Phase 11 is building a *dedicated, named feature* for it, which raises the bar on how carefully it must be scoped, time-boxed, and audited, precisely because it becomes an expected, discoverable, repeatable capability rather than an emergency-only DB action.
- Must be genuinely read-only, server-side-enforced (not merely hidden in the UI)
- Must be time-boxed with a hard expiry — an impersonation session that can be held open indefinitely is materially worse than one that auto-expires in 30 minutes
- Must not be escalatable to a longer-lived or write-capable session under any code path
- Must be fully auditable after the fact — both that it happened and, ideally, what was accessed during it
- The interaction with Milestone 3's org-suspend and Milestone 5's billing-admin surfaces must be explicitly tested (e.g., can an admin impersonate into a *suspended* org? Should they be able to, for support/investigation purposes, even though a normal member can't? This is a real product/security question requiring your input, not assumed either way here.)

**Milestone 5 (Billing & Quota):** Apply-credits and reset-usage are financial/quota mutations with real monetary or resource-allocation consequences — same audit rigor as Milestone 3's plan override. If the Stripe-driven option is chosen for credits, credentials/API-key handling reuses the existing `billing-provider.ts` abstraction (already correctly scoped, no new secret-handling surface).

**Milestone 6 (Job & Workflow):** Lowest-risk milestone — dismiss is a straightforward extension of the already-real, already-verified retry mechanism.

**Milestone 7 (Prompt Library):** No new attack surface; audit-wiring only.

**Milestone 8 (System Health):** If Grafana is embedded (vs. linked externally), its own access control must not be weakened to enable the embed — flagged as a specific verification item in `03-milestones.md` Milestone 8.

---

## 4. Rate limiting

Per Phase 10's own PR #23 CodeQL finding (a real, resolved false-negative on `businessRateLimit`'s recognizability), every new *sensitive* mutating admin route in Phase 11 (suspend, plan-override, impersonate, credits, reset-usage) should carry an explicit `config: { rateLimit: {...} }` override on top of `businessRateLimit`, matching the established convention. This is both a genuine defense-in-depth improvement (these are high-impact, should-be-infrequent actions) and avoids re-triggering the same class of CI-blocking finding.

---

## 5. Residual risk this phase does not close: no MFA for Super Admin accounts

`Security_Architecture.md` §6 defers MFA/WebAuthn to v2.0/v3.0, explicitly noting WebAuthn is "required for Super Admin accounts" as a future-state goal — not built today. Phase 11 is explicitly not building MFA (`01-phase-11-overview.md` §6). This means every new capability this phase adds — suspend, plan override, credits, and especially impersonation — is gated by a single-factor (password or OAuth) super-admin account. This is not a Phase 11 regression (the risk pre-exists Phase 11), but Phase 11 measurably *raises the value* of that single factor by giving it more to do. This must be recorded as an explicit, elevated-severity risk-register entry (`11-risk-register.md`), not silently absorbed.

---

## 6. No network-level restriction exists for the admin surface

Confirmed by reading `infra/traefik/traefik.yml` and `infra/traefik/dynamic/middlewares.yml` directly: no IP-allowlisting or comparable network-level middleware exists for any service today, admin or otherwise — only transport-level headers (HSTS, frame-deny, nosniff, referrer-policy). `docker-compose.prod.yml` is not deployed to any real server (no domain/host provisioned yet). This means, as of Phase 11, `/api/v1/admin/*` and the new `/admin/*` frontend routes are reachable from anywhere the rest of the app is reachable from, defended only by the application-layer `requireSuperAdmin` gate (and, once deployed, whatever WAF/DDoS protection Phase 14 eventually configures). This is explicitly out of Phase 11's scope (`01-phase-11-overview.md` §6) but recorded here as a real, currently-true statement about the production security posture Phase 11 ships into, not a hypothetical.

---

## 7. Audit logging as a security control, not just a compliance checkbox

TD-027's fix (Milestone 1's `auditLogPlatform()`) is the load-bearing security control for almost everything else in this phase: without it, suspend/plan-override/impersonate/credits are all unaccountable admin actions. Milestone 1 being first, and every subsequent milestone being required to wire into it, is a deliberate sequencing choice for exactly this reason — not an arbitrary "do infrastructure first" convention.
