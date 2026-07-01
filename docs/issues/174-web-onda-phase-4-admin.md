# 174 — web-onda Phase 4: Org-admin + system-admin (T14–T15)

**Type:** Feature  
**Status:** Blocked by [#173](https://github.com/kairan/onda-volunteer/issues/173)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-ADMIN-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)

## Problem

Org admins and system operators still use `apps/web` / `web-next` for stewardship routes. Port functionally to `web-onda` with serve-well/neutral tokens.

## What to build

- **T14** — `/ministries`, `/volunteers`, `/ministry-leaders` — web-next logic, serve-well tokens
- **T15** — `/system-admin/*` — web-next routes + serve-well `OperatorShell` pattern; ADR 0005 guards

**Reuses:** `apps/web-next/src/routes/{ministries,volunteers,ministryLeaders}.tsx`; `apps/web-next/src/system-admin/*`

## Acceptance criteria

- [ ] **T14** — RST-ADMIN-01 org-admin criteria met
- [ ] **T15** — System-admin behavior tests pass; ADR 0005 access guards preserved

### Done when (slice gates)

- [ ] Org-admin + system-admin routes functional against live API
- [ ] Vitest behavior tests ported or rewritten for `web-onda`
- [ ] CI green (`pnpm test`, `typecheck-web-onda`)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/174
