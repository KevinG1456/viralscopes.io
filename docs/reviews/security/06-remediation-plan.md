# 06-remediation-plan.md
# Phase 10 Milestone 1 — Prioritized Remediation Plan

> No fix is implemented in this milestone (architecture review only, per instruction). This sequences every open finding from `04-security-findings.md`/`05-risk-register.md` into the concrete order they should be addressed, confirming (or adjusting) the milestone assignments already sketched in the Phase 10 plan.

---

## Priority Order

Ordered by: (1) severity, (2) whether a later milestone's own work would otherwise hit the gap as a blocking failure, (3) implementation cost.

### Must fix first — blocks other Milestone 2 work

**1. F-04 — `audit_logs` RLS `WITH CHECK` gap.**
Must be resolved *before* any auth-event audit-log write is added (the write would otherwise fail immediately). This is a prerequisite step within Milestone 2, not a parallel task.

### Milestone 2 — Application Security Hardening

Order within the milestone, cheapest/least-risky first:

**2. F-01 — Common-password blocklist.** Self-contained Zod validation addition. No dependency on anything else.

**3. F-05 — API key RBAC restriction.** A single `requireRole()` addition to two existing routes. No schema change, no migration.

**4. F-03 — OAuth token column-level encryption.** Larger than the above (new encryption/decryption utility, a migration to encrypt existing rows, careful handling of the encryption key itself as a new secret) — sequence after the smaller items so a mistake here doesn't block simpler, lower-risk fixes from landing.

**5. F-08 — Helmet.js (API) + CSP (frontend).** Two-part: `apps/api`'s headers first (self-contained, no cross-app dependency), then `apps/web`'s nonce-based CSP (touches `proxy.ts`, needs its own verification pass against every existing page to confirm nothing breaks under the new policy).

**6. TD-013 resolution itself** (audit-log writes for auth events) — depends on #1 above being done first.

### Milestone 3 — API Security & Abuse Protection

**7. F-10 — Global pre-authentication rate limit.** Independent of Milestone 2's work; can proceed in parallel once Milestone 1 (this review) is approved.

### Milestone 4 — Infrastructure Security

**8. F-09 — Pin Docker base images to a digest.** Independent, no code dependency — can happen any time after this review, sequenced into M4 per the original plan for grouping with the other infra items (Dependabot, the dead Traefik redirect middleware).

### Documentation-only, no implementation milestone required

**9. F-02 — Correct `Security_Architecture.md`'s role table.** Can happen as part of this milestone's own documentation pass (see below) or Milestone 6's final reconciliation — either is acceptable since there's no code dependency.

### Accepted, no action planned

**F-06, F-07** — third-party tool constraints / standard deployment shape, already resolved by documenting them (done, in `04-security-findings.md`).

---

## Sequencing Rationale

- **F-04 before TD-013's own resolution** is the only hard *ordering* dependency in this entire plan — everything else is independently sequenced by risk/cost, not by a technical blocking relationship.
- **F-05 and F-01 before F-03** — not a dependency, a risk-management choice: land the cheap, low-risk-of-regression fixes first so Milestone 2 has early, verifiable progress before attempting the riskier encryption change (which introduces a *new* secret — `DB_ENCRYPTION_KEY` — that itself needs careful handling, matching the same secret-management discipline already applied to `JWT_SECRET`/`JWT_REFRESH_SECRET`).
- **F-08's two halves are sequenced API-first** because the API's Helmet headers are fully self-contained (one plugin registration, no other file touches it), while the frontend CSP requires verifying every existing page still renders correctly under a restrictive policy — a wider blast radius, better attempted once the team has already re-established its verification rhythm on the API side this milestone.
- **F-10 and F-09 have zero dependency on Milestone 2's outcome** and could technically be pulled forward — kept in Milestones 3/4 respectively to match the plan already approved, not because a technical dependency requires it.

---

## What This Milestone Explicitly Did Not Do

Per instruction, no code was written, no migration was created, and no configuration was changed during this review. The one exception under consideration is documentation: `Security_Architecture.md`/`PROJECT_STATUS.md` updates, addressed in `00-executive-summary.md`'s closing recommendation, not in application code.

---

*This is the last of the six required review deliverables. See `00-executive-summary.md` for the consolidated recommendation and scoring.*
