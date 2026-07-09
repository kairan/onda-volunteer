# 175 — web-onda Phase 5: Production cutover (T17)

**Type:** Feature  
**Status:** Ready for Execute — unblocked ([#174](https://github.com/kairan/onda-volunteer/issues/174) merged 2026-07-05, PR [#178](https://github.com/kairan/onda-volunteer/pull/178))  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-CUT-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)

## Problem

Production still targets `apps/web`. After route parity, switch deploy to `@onda/web-onda` and remove legacy frontend packages.

## What to build

- **T17** — Production deploy → `web-onda`; delete `apps/web` + `apps/web-next`; drop workspace/CI/root script references; archive `frontend-migration-web-next` TLC per AD-001; document URL redirects

**Note:** **T16** CI wiring shipped with #170 (`cb948cb`).

## Acceptance criteria

- [ ] RST-CUT-01 complete (`spec.md`)
- [ ] `apps/web` and `apps/web-next` **gone**; `pnpm install` + CI green with only `@onda/web-onda` (+ `api`)
- [ ] No `@onda/web` / `@onda/web-next` filter references in repo
- [x] Visual sign-off checklist (`design.md` §9) signed — volunteer + leader at 1440px (2026-07-04)
- [ ] `STATE.md` + `ROADMAP.md` updated; TLC feature archived per AD-001

### Done when (slice gates)

- [ ] Deploy/runbook documents production entrypoint
- [ ] Branch protection updated (drop legacy web checks; require `typecheck-web-onda`, `playwright-web-onda`)

## HITL (required)

- [x] design.md §9 — side-by-side serve-well vs `web-onda` at 1440px (Volunteer + Leader) — signed off 2026-07-04

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/175
