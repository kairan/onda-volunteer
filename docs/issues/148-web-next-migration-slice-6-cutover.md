# 148 — web-next migration Slice 6: CI parity & cutover (T27–T30)

**Type:** Feature / infrastructure  
**Status:** **Frozen** (2026-07-01) — cutover superseded by [ADR 0007](../adr/0007-frontend-serve-well-plus-api.md) / [`.specs/features/frontend-restart-serve-well-base/`](../../.specs/features/frontend-restart-serve-well-base/). Do not execute.  
**Label:** ~~`ready-for-agent`~~ removed  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ENG-01, MIG-CUT-01)

## Parent

- Blocked by: **none** (all feature slices at parity)
- **T28 shipped** via [#157](https://github.com/kairan/onda-volunteer/pull/157) (Playwright smoke CI); **T27 partial** (typecheck + test in CI; coverage floors for `@onda/web-next` still open)

## Tasks (atomic commits)

- [ ] **T27** — CI parity: extend `pnpm test:coverage` + CI `coverage` job to `@onda/web-next`; Vitest coverage floors (#129)
- [x] **T28** — Playwright config + `playwright-web-next` CI job (volunteer + leader smoke green) — shipped [#157](https://github.com/kairan/onda-volunteer/pull/157)
- [ ] **T29** — **Cutover PR 1**: repoint build/deploy to `apps/web-next` (deploy mechanism TBD)
- [ ] **T30** — **Cutover PR 2**: rename `web-next`→`web`, retire old `apps/web`, swap `DESIGN_SYSTEM.md`, ADR 0006 shipped

## Done when

- [ ] All CI gates green for `web-next` (lint, typecheck, test, coverage floors, e2e)
- [ ] Deploy serves `web-next`; `apps/web-next`→`apps/web` rename complete; old source retired
- [ ] `DESIGN_SYSTEM.md` documents Onda; ADR 0006 status = shipped

**Gate:** build + CI run.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/148
