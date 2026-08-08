# Phase 11 — Risk Register

**Status: proposal only.** New risk entries proposed below are not yet added to `PROJECT_STATUS.md`'s own risk register — that happens at Milestone 9 (documentation reconciliation) once the actual, implemented state is known, not speculatively here.

---

## Risk 1 — Impersonation is a single-factor-protected path to any customer's data

| | |
|---|---|
| **Severity** | High |
| **Likelihood** | Low (requires a compromised super-admin credential) |
| **Source milestone** | 4 |
| **Description** | No MFA exists for Super Admin accounts (`Security_Architecture.md` §6, deferred to v2.0/v3.0, explicitly out of Phase 11 scope). Milestone 4 builds a dedicated, discoverable, repeatable impersonation feature gated by that same single factor. |
| **Mitigation proposed** | Hard time-box + auto-expiry; server-side write-rejection (defense in depth beyond UI hiding); full audit trail of start/end and (if feasible) resources accessed; a feature flag allowing the capability to be disabled instantly without a code rollback if abuse is suspected. |
| **Mitigation NOT proposed by Phase 11** | MFA itself — explicitly out of scope. This risk is *reduced* by the mitigations above but not *closed* by Phase 11. |
| **Owner for acceptance** | Repo owner — this is a genuine risk/velocity trade-off requiring your explicit sign-off at Milestone 4's design-approval checkpoint, not a unilateral engineering decision. |

## Risk 2 — Plan override could desync from Stripe's actual billing state

| | |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Medium, if the "direct column write" option is chosen over the provider-driven option |
| **Source milestone** | 3 |
| **Description** | `04-database-impact.md` §3: if an admin plan-override writes `organizations.plan` directly while `subscriptions` (Stripe-backed) remains unchanged, the next real Stripe webhook event could silently revert the override, or the two could simply disagree indefinitely, and the app's feature-enforcement logic might read whichever one it happens to check. |
| **Mitigation proposed** | Recommend the provider-driven option (routes the override through `billing-provider.ts` so `subscriptions` stays the single source of truth) — see `03-milestones.md` Milestone 3 and `04-database-impact.md` §3. Requires your decision before Milestone 3 implementation begins. |
| **Owner for acceptance** | Repo owner — architectural decision, not resolved by this document. |

## Risk 3 — Reset-usage/apply-credits mechanisms are genuinely undesigned today

| | |
|---|---|
| **Severity** | Medium |
| **Likelihood** | High (certain to require a real design decision, not a risk of something going wrong so much as a risk of building the wrong thing if rushed) |
| **Source milestone** | 5 |
| **Description** | `usage_events` is append-only by design; "credits" has zero prior art in this codebase. Building either without deliberate design (proposed options in `04-database-impact.md` §4–5) risks corrupting historical usage data or creating a second, unreconciled source of financial truth alongside Stripe. |
| **Mitigation proposed** | Explicit design-approval checkpoint before implementation (already built into Milestone 5's stopping criteria in `03-milestones.md`) — this is a process mitigation, not a technical one, and is the correct mitigation for a risk whose root cause is "undesigned," not "designed-but-flawed." |
| **Owner for acceptance** | Repo owner. |

## Risk 4 — No network-level restriction on the admin surface

| | |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low today (nothing is deployed to production yet), rising once Phase 14 ships |
| **Source milestone** | Pre-existing, not introduced by Phase 11, but Phase 11 adds more capability behind the same unrestricted surface |
| **Description** | `07-security-impact.md` §6: no IP allowlisting or comparable control exists anywhere in `infra/traefik/` for any service. The admin panel's only defense is the application-layer `requireSuperAdmin` gate. |
| **Mitigation proposed** | None within Phase 11 (explicitly out of scope, `01-phase-11-overview.md` §6). Recommend flagging for Phase 14 (Production Deployment) planning or a dedicated infra-hardening pass once a real server/domain exists to configure this against. |
| **Owner for acceptance** | Repo owner — accepted as a known gap for the duration of Phase 11, to be revisited before real production traffic exists. |

## Risk 5 — Suspend actions could create an unrecoverable lockout

| | |
|---|---|
| **Severity** | Medium |
| **Likelihood** | Low, but the consequence (no super admin left with API access) is severe enough to warrant an explicit guard |
| **Source milestone** | 2 |
| **Description** | If a super admin can suspend the only other super admin (or, depending on implementation, themself), the platform could end up with no super-admin account able to reverse the action via the API — recoverable only via direct DB access, which is exactly what Phase 11 exists to make unnecessary. |
| **Mitigation proposed** | An explicit application-layer guard (e.g., refuse to suspend the last remaining super admin, or refuse self-suspension) — flagged as an open implementation question in `03-milestones.md` Milestone 2, to be resolved at that milestone's kickoff, not assumed away here. |
| **Owner for acceptance** | Repo owner, if the guard's exact behavior (hard block vs. warn-and-allow) needs a product call. |

## Risk 6 — Dependency-bump timing could introduce noise mid-phase

| | |
|---|---|
| **Severity** | Low–Medium |
| **Likelihood** | Medium, if #28/#30's major-version Dependabot groups are merged mid-phase rather than deliberately timed |
| **Source milestone** | Cross-cutting |
| **Description** | `10-technical-debt.md` §4 details three majors (`bullmq`, `ioredis`, `zod`) directly touching code Phase 11 writes, plus a TypeScript double-major and Tailwind major in the dev-tooling group. Absorbing these mid-phase risks misattributing bugs. |
| **Mitigation proposed** | Deliberate timing decision (recommend #28 before Milestone 1, #30 after Milestone 9) rather than default/incidental merging — see `10-technical-debt.md` §5 for the full recommendation. |
| **Owner for acceptance** | Repo owner. |

## Risk 7 — Phase 5/6 incompleteness could surface an unanticipated blocker mid-phase

| | |
|---|---|
| **Severity** | Low |
| **Likelihood** | Low — the specific dependencies Phase 11 needs from Phase 5/6 (admin routes, dead-letter/queue infrastructure) are already confirmed real and working |
| **Source milestone** | Cross-cutting |
| **Description** | Phase 5 is 63% and Phase 6 is 32% complete against their full ROADMAP task lists. While the *specific* pieces Phase 11 depends on are verified working, an unverified assumption about some other adjacent piece of Phase 5/6 could still surface mid-milestone. |
| **Mitigation proposed** | Each milestone's own IDENTIFY step (re-confirm current real behavior before implementing, per `09-testing-verification.md` §2) is the mitigation — this is exactly why the discipline exists, not a new control invented for this risk specifically. |
| **Owner for acceptance** | N/A — process mitigation already built into the standing workflow. |

---

## Risk severity summary

| Severity | Count |
|---|---|
| High | 1 (impersonation/MFA gap) |
| Medium | 4 (plan-override desync, reset-usage/credits design, network restriction gap, suspend lockout) |
| Low–Medium | 1 (dependency timing) |
| Low | 1 (Phase 5/6 incompleteness) |

No Critical-severity risk is identified. The one High-severity item (Risk 1) is a pre-existing gap (no MFA) that Phase 11 measurably raises the stakes on, not a new vulnerability class Phase 11 introduces from nothing — but it still requires your explicit acceptance before Milestone 4 proceeds.
