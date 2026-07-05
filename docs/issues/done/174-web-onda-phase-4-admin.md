# 174 — web-onda Phase 4: Org-admin + system-admin (T14–T15)

**Type:** Feature  
**Status:** Shipped pending merge (validated 2026-07-04)  
**PR:** [#178](https://github.com/kairan/onda-volunteer/pull/178)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-ADMIN-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)

## What was built

Org-admin and system-operator stewardship in `apps/web-onda`:

- **T14** — `/ministries`, `/volunteers`, `/ministry-leaders` with web-next query/mutation logic and serve-well tokens; `ChurchSettingsSection` + `CampusSettingsSection`
- **T15** — `/system-admin/*` operator shell (dashboard, churches, users, scheduling read-only) with ADR 0005 access guards, `systemAdminQueries`, `ToastHost`
- **Post-review** — `ToastProvider` mounted in `main.tsx` (`9b823d7`) so church-detail invite toasts and mutation errors render in production

**Validation:** `.specs/features/frontend-restart-serve-well-base/validation.md` (Phase 4 section)

## Tasks

- [x] **T14** — Org-admin routes (RST-ADMIN-01)
- [x] **T15** — System-admin routes + behavior tests

## Done when

- [x] RST-ADMIN-01 org-admin + operator criteria met (automated)
- [x] Vitest behavior tests ported (`ministries`, `volunteers`, `ministryLeaders`, `systemAdmin*`)
- [x] `pnpm --filter @onda/web-onda test` + `typecheck` green (112 Vitest)
- [x] CI green on PR #178 (including post-review `9b823d7`)

## Next

- [#175](https://github.com/kairan/onda-volunteer/issues/175) — Phase 5 Cutover (T17)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/174
