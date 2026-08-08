# Phase 11 — Infrastructure / DevOps Implications

**Status: proposal only. No infra file, Dockerfile, Compose file, or CI workflow has been touched.**

---

## 1. Docker — no new services proposed

Verified by reading `docker-compose.prod.yml` and the dev `docker-compose.yml`: the admin panel is entirely new routes on the existing `api` image and new pages on the existing `web` image. No separate "admin service" or "admin image" is proposed — splitting it out would be a real architectural change with no stated requirement driving it, and would contradict the "don't invent abstractions beyond what's needed" principle this engagement has followed throughout.

Existing hardening (`no-new-privileges`, `read_only` + `tmpfs:/tmp` on `api`/`web` specifically, per Phase 10 Milestone 4) applies to Phase 11's new code automatically, since it's the same two images. Every milestone that changes backend or frontend code should rebuild and boot-verify both containers, per the standing discipline established across every prior phase (and the specific, hard-won lesson from the Phase 5-era Docker-boot-crash blocker logged in `PROJECT_STATUS.md`, where a code change broke container boot in a way local `tsx` dev mode never surfaced).

## 2. No new environment variables anticipated, with one exception

If Milestone 4's impersonation design uses a separate short-lived token type (recommended in `03-milestones.md`/`05-api-impact.md`) rather than extending the existing access-token, a new signing secret or TTL config value may be needed (e.g., `IMPERSONATION_TOKEN_SECRET` or reuse of the existing JWT secret with a distinct `typ` claim — a decision for Milestone 4's design checkpoint, not resolved here). If a feature flag is added to gate the impersonation entry point (recommended in `03-milestones.md` Milestone 4's rollback-impact section), that would be a new env var too (e.g., `ADMIN_IMPERSONATION_ENABLED`). Both are flagged as *possible*, not committed.

## 3. CI/CD — no workflow changes proposed

`.github/workflows/ci.yml` and `security.yml` (both SHA-pinned per Phase 10 Milestone 4) require no structural changes for Phase 11 — new routes/pages ride the existing lint/type-check/build/format/secretlint pipeline and both CodeQL sources unchanged. The one real CI-relevant lesson from Phase 10 (the PR #23 "Missing rate limiting" false-negative on `businessRateLimit`) is not a workflow change but an implementation habit: every new sensitive admin route should carry an explicit `config: { rateLimit: {...} }` override from the start, rather than discovering the CodeQL gap after the fact again (see `07-security-impact.md` §4).

## 4. No Traefik/network changes proposed for Phase 11 itself

`07-security-impact.md` §6 already establishes that no IP-allowlisting exists for any service, admin included, and that this is explicitly out of Phase 11's scope. If you want this addressed, it's more naturally a Phase 14 (Production Deployment) or dedicated infra-hardening item, since `docker-compose.prod.yml` isn't deployed anywhere real yet — building network-level restrictions against a nonexistent deployment would be unverifiable speculation, not a real control.

## 5. Grafana embedding (Milestone 8) — the one infra-adjacent open question

Grafana/Prometheus/Loki already run in the dev Compose stack (confirmed in earlier Phase 10 infrastructure work). Whether Milestone 8 embeds Grafana panels via iframe, deep-links to them, or builds equivalent visualisations natively in the admin panel is an open decision (see `03-milestones.md` Milestone 8) with infra implications only in the iframe case (Grafana's own auth/CORS/embedding config would need review — not configured today, unverified whether Grafana's default settings even permit iframe embedding without changes). This can only be verified against the local dev stack in this environment, since no production Grafana instance exists.

## 6. Docker verification requirements, consolidated (see also `09-testing-verification.md`)

Every milestone that touches `apps/api` or `apps/web` source must, at minimum:
1. Rebuild the affected image(s) (`docker build`, matching the existing `infra/docker/Dockerfile.{api,web}`, both already digest-pinned per Phase 10)
2. Boot the container and confirm no startup crash (the specific failure mode that went undetected for most of Phase 4–5 last time)
3. Exercise the new/changed endpoint(s) against the *containerized* instance, not just local `tsx`, for any milestone touching auth-adjacent code (Milestones 1, 2, 4 especially)

No milestone in Phase 11 is expected to require a `docker-compose.prod.yml` change, a new Traefik route, or a new CI job — flagged explicitly so any actual need discovered during implementation is treated as a real, reportable deviation from this plan, not silently absorbed.
