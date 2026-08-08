# Phase 11 — Frontend Impact

**Status: proposal only. No page, component, or hook has been written.**

Current-state facts verified directly against `apps/web/src/app/` and `apps/web/src/components/`, not assumed.

---

## 1. Current frontend admin surface (verified)

```
apps/web/src/app/(dashboard)/
  admin/prompts/page.tsx           -- list view
  admin/prompts/[name]/page.tsx    -- detail/edit/version/test-harness view
  layout.tsx                       -- auth gate for the whole (dashboard) group (regular users + admins alike)
```

No `admin/layout.tsx` exists. The two prompt pages sit inside the same route group and use the same `Card`/`Badge`/`Button`/`Select`/`Spinner`/`EmptyState` component kit as every ordinary product page, plus TanStack Query hooks (`use-prompts.ts`) for data fetching. Auth gating is reactive-only: a non-admin's request 403s and the page renders an `EmptyState`; nothing prevents the page from attempting to render first. `Sidebar.tsx`'s `NAV_ITEMS` shows the "AI Prompts" link to every authenticated user unconditionally.

`AuthProvider.tsx`'s `AuthState`/`PublicUser` carries no `role`/`isSuperAdmin` field — the frontend cannot currently distinguish a super admin from a regular user client-side at all.

---

## 2. Proposed new route tree

```
apps/web/src/app/(dashboard)/admin/
  layout.tsx                       -- NEW (Milestone 1): admin nav shell
  prompts/...                      -- existing, unchanged, adopted into the new layout
  users/page.tsx                   -- NEW (Milestone 2)
  organizations/page.tsx           -- NEW (Milestone 3)
  organizations/[id]/page.tsx      -- NEW (Milestone 3): org detail, hosts suspend/plan-override/impersonate actions
  organizations/[id]/billing/      -- NEW (Milestone 5), likely a tab within [id]/page.tsx rather than a separate route
  jobs/page.tsx                    -- NEW (Milestone 6)
  dead-letter/page.tsx             -- NEW (Milestone 6)
  system/page.tsx                  -- NEW (Milestone 8)
```

Each new page follows the `/admin/prompts` pattern: TanStack Query hook (`use-admin-users.ts`, `use-admin-organizations.ts`, etc.) + existing component kit. No new UI library or state-management approach is proposed.

---

## 3. Admin shell and nav (Milestone 1)

`admin/layout.tsx` wraps every route above with:
- A dedicated admin nav (distinct from `Sidebar.tsx`'s product nav) linking to Organisations / Users / Billing / Jobs / Dead-letter / Prompts / System
- Whatever admin-check signal is chosen in `02-architecture.md` §2.2, used to avoid rendering the shell's contents (or to show a clean "not authorized" state) before a real API call ever fires for a non-admin

**`Sidebar.tsx` change:** the existing "AI Prompts" link (and any future single top-level "Admin" link replacing it) should only render for confirmed admins, closing the nav-leak gap identified during this planning research. This is a small, low-risk, high-value fix bundled into Milestone 1 rather than left for later.

---

## 4. Impersonation UI (Milestone 4) — the one genuinely novel UX surface

- An "Impersonate (read-only)" action on the organisation detail page, requiring explicit confirmation (not a single accidental click — a confirm dialog stating scope and duration)
- A persistent, unmissable banner shown across the **entire product UI** (not just admin pages) for the duration of an active impersonation session — e.g., "Viewing [Org Name] as read-only admin impersonation. Ends at [time]. [End now]"
- This means the banner must be threaded through the *regular* dashboard layout too, not just the admin layout, since impersonation's whole purpose is viewing the target org's regular product screens (watchlists, alerts, home, etc.) — this is a real cross-cutting frontend change, not confined to `admin/`. Flagged explicitly so it isn't underscoped as "just an admin page."
- All write-capable UI controls (buttons, forms) encountered while impersonating should be disabled/hidden client-side as a UX courtesy, while the actual security boundary remains the server-side rejection described in `05-api-impact.md` §2 Milestone 4 — the client-side disabling is not a substitute for that, and must be documented as such to avoid a future contributor mistakenly treating it as the real control.

---

## 5. Component/hook reuse inventory

| Need | Reuse from | New? |
|---|---|---|
| Data tables/lists | `admin/prompts/page.tsx`'s existing list pattern | No |
| Detail/edit views | `admin/prompts/[name]/page.tsx`'s pattern | No |
| Toasts/errors | `ToastProvider`, `ApiClientError` handling already used everywhere | No |
| Pagination | Whatever `admin/prompts` (or the broader dashboard) already uses for paginated lists — to be confirmed at Milestone 2 kickoff by reading the exact component, not assumed | Likely no |
| Plan-tier display | `packages/shared`'s `PLANS`/`PLAN_LIMITS` (already used elsewhere in `apps/web`, e.g., billing settings) | No |
| Impersonation banner | None exists | **Yes — net new** |
| Admin nav shell | None exists | **Yes — net new** |
| Suspend/confirm dialogs | Existing `Dialog`/confirm patterns (need to confirm one exists generically, e.g., account-deletion confirmation on the profile settings page, and reuse it rather than building a new confirm-dialog component) | Likely no, pending confirmation |

---

## 6. Testing implications (see `09-testing-verification.md` for full detail)

No E2E test suite exists yet in this repo (Phase 12 — Testing — is a separate, later ROADMAP phase, still 0% per `PROJECT_STATUS.md`). Phase 11's frontend verification will therefore be **manual, live-browser verification against the real running app**, following the same discipline used for every prior phase's frontend work (Phase 8, Phase 9's billing dashboard) — not a claim of automated coverage that doesn't exist yet.
