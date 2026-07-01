# 170 — web-onda Phase 0–1: Foundation (T01–T07)

**Type:** Feature  
**Status:** Shipped (validated 2026-07-01)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-FND-01..03, RST-SHELL-01, RST-ENG-01 partial)  
**Supersedes cutover:** [#148](https://github.com/kairan/onda-volunteer/issues/148) (closed superseded 2026-07-01)

## Parent

- ADR: [0007](../adr/0007-frontend-serve-well-plus-api.md)
- Visual authority: `design-reference/serve-well/`
- Working context: `.specs/features/working-context-picker/` (absorbed into shell)

## What was built

`apps/web-onda` (`@onda/web-onda`, port 5175): serve-well theme + shadcn `ui/`, data layer from `web-next`, working context module, `OrganizationProvider` + `useApiScope()`, serve-well shell (no demo role dropdown), production route scaffold, Right Grotesk self-hosted fonts, local dev `.env.example`, `/` index redirect, API CORS for 5175. CI: root `test`/`coverage`, `typecheck-web-onda`, `playwright-web-onda` smoke (62 Vitest + 2 Playwright).

**PR:** [#171](https://github.com/kairan/onda-volunteer/pull/171)  
**Validation:** `.specs/features/frontend-restart-serve-well-base/validation.md`

## Tasks (atomic commits)

**Phase 0 — scaffold**

- [x] **T01** — Create `apps/web-onda` package (`@onda/web-onda`, port 5175, `dev:web-onda`)
- [x] **T02** — Port serve-well theme + full shadcn `ui/`; self-host fonts; theme contract test
- [x] **T03** — Graft data core from `web-next` (`api/`, `auth/`, `query/`, `i18n/` skeleton)

**Phase 1 — shell**

- [x] **T04** — Working context module (`buildWorkingContextOptions`, `resolveWorkingContext`)
- [x] **T05** — `OrganizationProvider` + `useApiScope()`
- [x] **T06** — Shell from serve-well (`AppShell`, `AppSidebar`, `WorkingContextPicker`) — no demo role dropdown
- [x] **T07** — Router scaffold for all production paths (placeholders OK except auth)

**Also shipped (post-validation):** **T16** CI wiring (`cb948cb`)

## Done when

- [x] `pnpm --filter @onda/web-onda build` + typecheck green (CI `typecheck-web-onda`)
- [x] Theme contract + apiClient/auth tests pass (62 Vitest in CI `test`)
- [x] Nav reacts to working context (`AppShell.behavior.test.tsx`)
- [x] All routes in `design.md` §6 resolve without 404 (`router.test.ts`)
- [x] Signed-in shell at 1440px — author manual sign-off on PR #171; formal design.md §9 checklist deferred pre-cutover (RST-ENG-01 HITL)

**Gate:** build + full CI green on PR #171.

## Next

- [#172](https://github.com/kairan/onda-volunteer/issues/172) — Phase 2 Volunteer (T08–T10)
- [#173](https://github.com/kairan/onda-volunteer/issues/173) — Phase 3 Leader (T11–T13)
- [#174](https://github.com/kairan/onda-volunteer/issues/174) — Phase 4 Admin (T14–T15)
- [#175](https://github.com/kairan/onda-volunteer/issues/175) — Phase 5 Cutover (T17)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/170
