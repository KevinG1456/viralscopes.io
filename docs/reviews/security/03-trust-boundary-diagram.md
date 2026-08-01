# 03-trust-boundary-diagram.md
# Phase 10 Milestone 1 — Trust Boundary Diagram

> ASCII, not a rendered image, per the milestone's own instruction ("Markdown/ASCII is fine"). Boundaries are numbered and referenced from `01-architecture-review.md`/`04-security-findings.md` where relevant.

```
                                    ┌───────────────────────────────────────────┐
                                    │              INTERNET (untrusted)          │
                                    └───────────────────────┬─────────────────────┘
                                                            │
                          ══════════════════════════════ BOUNDARY 1 ══════════════════════════════
                          No WAF / CDN / DDoS layer provisioned yet (TD-001).
                          No real TLS termination exists in this environment
                          (Traefik config-as-code is written but never deployed).
                                                            │
                    ┌───────────────────────────────────────┼───────────────────────────────────────┐
                    │                                       │                                       │
                    ▼                                       ▼                                       ▼
          ┌──────────────────┐                  ┌──────────────────────┐               ┌──────────────────────┐
          │    apps/web       │                  │      apps/api          │               │   n8n (public host)    │
          │  (Next.js, public) │                  │  (Fastify, public)     │               │  admin UI + webhooks    │
          └─────────┬─────────┘                  └───────────┬────────────┘               └───────────┬──────────┘
                    │                                        │                                         │
        access token: in-memory JS var only         ══ BOUNDARY 2 ══                          ══ BOUNDARY 3 ══
        refresh token: httpOnly/Secure/              Every route except an explicit           Two independent auth
        SameSite=Strict cookie                       public allowlist requires a               checks, both directions:
        No dangerouslySetInnerHTML,                   verified JWT (`authenticate`) or           - apps/api → n8n:
        no CSP yet (F-08)                             a webhook HMAC signature.                    N8N_SERVICE_TOKEN header,
                    │                                  CORS locked to one origin,                    verified by n8n's own
                    │                                  no wildcard. CSRF double-submit                IF-node (F-06: not
                    │                                  on the few cookie-authenticated                timing-safe, but a
                    │                                  mutations (logout/session-revoke).             third-party constraint)
                    │                                        │                                     - n8n → apps/api:
                    │                                        │                                        same token, verified
                    │                                        │                                        by apps/api's
                    │                                        │                                        timing-safe check
                    │                                        │                                         │
                    └──────────────HTTPS(planned)───────────►│                                         │
                                                              │                                         │
                              ══════════════════════════════ BOUNDARY 4 ══════════════════════════════
                              Fastify request pipeline: authenticate → requireOrgContext →
                              requireRole()/requireSuperAdmin → businessRateLimit → handler
                              (RBAC Layer 1 — route middleware)
                                                              │
                    ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                    │                                         │                                         │
                    ▼                                         ▼                                         ▼
          ┌──────────────────┐                    ┌──────────────────────┐                  ┌──────────────────────┐
          │  Service layer     │                    │       Redis             │                  │   BullMQ workers        │
          │  (RBAC Layer 2:     │                    │  (password-protected     │                  │  (in-process, no        │
          │  assertCanManage,   │                    │   in prod, no public      │                  │   external surface)     │
          │  plan enforcement)  │                    │   port mapping)            │                  └───────────┬──────────┘
          └─────────┬─────────┘                    └──────────────────────┘                              │
                    │                                                                                      │
        ══════════ BOUNDARY 5 ══════════                                                    dispatches to n8n via
        Postgres RLS (RBAC Layer 3,                                                        INTERNAL URL only — never
        the last line of defense).                                                          a caller-supplied URL
        `app_user` role only — apps/api                                                    (no SSRF vector, confirmed)
        holds no credential for the
        migration/owner role at all.
                    │
                    ▼
          ┌──────────────────────────────────────────────────────────────────┐
          │                    PostgreSQL (RLS-enforced)                        │
          │                                                                      │
          │  Org-scoped, RLS ON:           Root/identity, RLS OFF (by design):    │
          │   subscriptions, invoices,       sessions, oauth_accounts,              │
          │   watchlists, alert_rules,       organization_members, billing_events,  │
          │   api_keys, audit_logs*          users, organizations                   │
          │  (*audit_logs write gap:                                                │
          │   F-04 — null-org WITH CHECK)                                           │
          └──────────────────────────────────────────────────────────────────┘

                              ══════════════════════════════ BOUNDARY 6 ══════════════════════════════
                              Outbound to third parties — each behind a provider-abstraction interface,
                              never called directly from business logic (PROJECT_RULES.md P10)
                                                              │
                    ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                    │                                         │                                         │
                    ▼                                         ▼                                         ▼
          ┌──────────────────┐                    ┌──────────────────────┐                  ┌──────────────────────┐
          │      Stripe          │                    │   Google / GitHub OAuth  │                  │  SendGrid/Resend (TD-010) │
          │  (billing, PCI scope  │                    │  (identity assertion,     │                  │  OpenAI/Anthropic (TD-023) │
          │   entirely delegated)  │                    │   state+PKCE verified)    │                  │  — neither configured yet   │
          └──────────────────────┘                    └──────────────────────┘                  └──────────────────────┘
```

## Boundary Notes

| # | Boundary | Enforced by | Verified this milestone |
|---|---|---|---|
| 1 | Internet ↔ edge | Nothing yet (TD-001) | Cannot verify — infra not provisioned |
| 2 | Public request ↔ authenticated request | `authenticate` middleware, CORS, CSRF | Yes — live-tested across every prior phase, re-confirmed this milestone |
| 3 | `apps/api` ↔ n8n (both directions) | Shared service token, both directions | Yes — confirmed by direct inspection of workflow JSON and middleware code |
| 4 | Route ↔ service layer | RBAC Layer 1 (`requireRole`/`requireSuperAdmin`) | Yes |
| 5 | Application ↔ database | Postgres RLS + least-privilege `app_user` role | Yes — re-confirmed via `.env` inspection (no owner credential present) |
| 6 | Application ↔ third parties | Provider-abstraction pattern | Yes for Stripe/OAuth (live); N/A for email/AI (not built yet) |

*See `01-architecture-review.md` for the full subsystem-by-subsystem detail behind each boundary, and `04-security-findings.md` for every finding referenced above (F-01 through F-10).*
