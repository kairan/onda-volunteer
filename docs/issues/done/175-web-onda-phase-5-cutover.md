# 175 — web-onda Phase 5: Production cutover (T17)

**Type:** Feature  
**Status:** Shipped (Execute complete; Verifier pending)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-CUT-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)  
**GitHub:** [#175](https://github.com/kairan/onda-volunteer/issues/175)

## What shipped

- Production frontend is **`@onda/web-onda` only**
- **Deleted** `apps/web` and `apps/web-next` from the monorepo
- Root scripts, CI (`typecheck-web*`, Playwright), ESLint ignores, and coverage artifacts retargeted to `web-onda`
- Redirect / deploy runbook: [`docs/runbooks/web-onda-cutover-redirects.md`](../runbooks/web-onda-cutover-redirects.md)
- Branch protection checklist updated: require `typecheck-web-onda` + `playwright-web-onda`
- Archived TLC `frontend-migration-web-next` per AD-001
- design.md §9 visual checklist signed 2026-07-28 (PO-authorized cutover)
- App canvas `#f4f4f2` (ondadura.com.br); BrandBook `#eeeee7` on auth gradient only

## Acceptance criteria

- [x] RST-CUT-01 complete
- [x] `apps/web` / `apps/web-next` gone; workspace has `@onda/web-onda` + `api` (+ `web-legacy` reference)
- [x] No `@onda/web` / `@onda/web-next` filter scripts in root `package.json` / CI
- [x] Visual sign-off checklist signed
- [x] STATE.md + ROADMAP.md updated
- [x] Deploy/runbook documents production entrypoint
- [x] Branch protection doc drops legacy web checks

## Tracker

Close [#175](https://github.com/kairan/onda-volunteer/issues/175) after Verifier PASS + PR merge.
