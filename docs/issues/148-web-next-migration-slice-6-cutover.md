# 148 — web-next migration Slice 6: CI parity & cutover (T27–T30)

**Type:** Feature / infrastructure  
**Status:** Open — **ready for agent** (Slices 1–5 [#143](https://github.com/kairan/onda-volunteer/issues/143)–[#147](https://github.com/kairan/onda-volunteer/issues/147) shipped 2026-06-24)  
**Label:** `ready-for-agent`  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ENG-01, MIG-CUT-01)

## Parent

- Blocked by: **none** (all feature slices at parity)
- **T28 shipped** via [#157](https://github.com/kairan/onda-volunteer/pull/157) (Playwright smoke CI); **T27 partial** (typecheck + test in CI; coverage floors for `@onda/web-next` still open)
- **T30a shipped** on branch `chore/rename-web-to-web-legacy` (pending PR): `apps/web` → `apps/web-legacy`, `@onda/web` → `@onda/web-legacy`, CI job renames; `apps/web-next` unchanged

## Tasks (atomic commits)

- [x] **T27** — CI parity: extend `pnpm test:coverage` + CI `coverage` job to `@onda/web-next`; Vitest coverage floors (#129) — functions floor ratcheted at 60% (60.61% actual); excludes documented stubs/e2e-only in `vitest.config.ts`
- [x] **T28** — Playwright config + `playwright-web-next` CI job (volunteer + leader smoke green) — shipped [#157](https://github.com/kairan/onda-volunteer/pull/157)
- [x] **T30a** — Legacy rename: `apps/web` → `apps/web-legacy`, scripts + CI (`typecheck-web-legacy`, `playwright-web-legacy`) — branch `chore/rename-web-to-web-legacy` (PR pending)
- [ ] **T29** — **Cutover PR 1**: repoint build/deploy to `apps/web-next` — **blocked**: no deploy/Dockerfile config in repo yet (discovery required)
- [ ] **T30** — **Cutover PR 2**: rename `web-next`→`web`, retire `apps/web-legacy`, swap `DESIGN_SYSTEM.md`, ADR 0006 shipped

## Done when

- [ ] All CI gates green for `web-next` (lint, typecheck, test, coverage floors, e2e) — coverage ✅ on branch; full CI pending merge
- [ ] Deploy serves `web-next`; `apps/web-next`→`apps/web` rename complete; `apps/web-legacy` retired
- [ ] `DESIGN_SYSTEM.md` documents Onda; ADR 0006 status = shipped

**Gate:** build + CI run.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/148
