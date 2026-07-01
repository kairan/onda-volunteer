# 170 — web-onda Phase 0–1: Foundation (T01–T07)

**Type:** Feature  
**Status:** Open — blocked by [#169](https://github.com/kairan/onda-volunteer/pull/169) merge  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-FND-01..03, RST-SHELL-01)  
**Supersedes cutover:** [#148](https://github.com/kairan/onda-volunteer/issues/148) (closed superseded 2026-07-01)

## Parent

- ADR: [0007](../adr/0007-frontend-serve-well-plus-api.md)
- Visual authority: `design-reference/serve-well/`
- Working context: `.specs/features/working-context-picker/` (absorbed into shell)

## Tasks (atomic commits)

**Phase 0 — scaffold**

- [ ] **T01** — Create `apps/web-onda` package (`@onda/web-onda`, port 5175, `dev:web-onda`)
- [ ] **T02** — Port serve-well theme + full shadcn `ui/`; self-host fonts; theme contract test
- [ ] **T03** — Graft data core from `web-next` (`api/`, `auth/`, `query/`, `i18n/` skeleton)

**Phase 1 — shell**

- [ ] **T04** — Working context module (`buildWorkingContextOptions`, `resolveWorkingContext`)
- [ ] **T05** — `OrganizationProvider` + `useApiScope()`
- [ ] **T06** — Shell from serve-well (`AppShell`, `AppSidebar`, `WorkingContextPicker`) — no demo role dropdown
- [ ] **T07** — Router scaffold for all production paths (placeholders OK except auth)

## Done when

- [ ] `pnpm --filter @onda/web-onda build` + typecheck green
- [ ] Theme contract + apiClient/auth tests pass
- [ ] Signed-in shell matches serve-well layout at 1440px; nav reacts to working context
- [ ] All routes in `design.md` §6 resolve without 404

**Gate:** build + CI run.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/170
