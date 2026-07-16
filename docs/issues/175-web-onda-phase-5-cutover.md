# 175 — web-onda Phase 5: Production cutover (T17)

**Type:** Feature  
**Status:** Blocked by [#180](https://github.com/kairan/onda-volunteer/issues/180) — official BrandBook alignment must merge to `main` before T17  
**Prerequisite:** [#180](https://github.com/kairan/onda-volunteer/issues/180) (`official-brandbook-web-onda`) — **Execute complete** on branch `feat/180-official-brandbook-web-onda` (tokens, Logo 1 PNG `igreja onda`, Balanced flourishes, ADR 0006 amended). Include #180 in cutover PR or merge #180 first.  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-CUT-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)  
**Also:** [#174](https://github.com/kairan/onda-volunteer/issues/174) cleared (shipped 2026-07-04)

## Problem

Production still targets `apps/web`. After route parity, switch deploy to `@onda/web-onda` and remove legacy frontend packages.

## What to build

- **T17** — Production deploy → `web-onda`; delete `apps/web` + `apps/web-next`; drop workspace/CI/root script references; archive `frontend-migration-web-next` TLC per AD-001; document URL redirects

**Note:** **T16** CI wiring shipped with #170 (`cb948cb`).

## Acceptance criteria

- [ ] RST-CUT-01 complete (`spec.md`)
- [ ] `apps/web` and `apps/web-next` **gone**; `pnpm install` + CI green with only `@onda/web-onda` (+ `api`)
- [ ] No `@onda/web` / `@onda/web-next` filter references in repo
- [ ] Visual sign-off checklist (`design.md` §9) signed — **required before merge**
- [ ] `STATE.md` + `ROADMAP.md` updated; TLC feature archived per AD-001

### Done when (slice gates)

- [ ] Deploy/runbook documents production entrypoint
- [ ] Branch protection updated (drop legacy web checks; require `typecheck-web-onda`, `playwright-web-onda`)

## HITL (required)

- [ ] design.md §9 — side-by-side serve-well vs `web-onda` at 1440px (Volunteer + Leader)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/175
