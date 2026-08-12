# Frontend restart — serve-well + API — Validation (#175 / T17 cutover)

**Date**: 2026-07-28  
**Phase verified**: Phase 5 cutover Execute — issue [#175](https://github.com/kairan/onda-volunteer/issues/175) / T17  
**Spec**: [./spec.md](./spec.md) (archive; redirect stub at `.specs/features/frontend-restart-serve-well-base/`)  
**Diff range**: `1dc12fd^..61eb805` (`1dc12fd` canvas `#f4f4f2` + `61eb805` T17 cutover) on `feat/175-web-onda-cutover`  
**Verifier**: independent sub-agent (author ≠ verifier)

**Prior phases**: Phase 0–1 (#170), Phase 2 (#172), Phase 3 (#173), Phase 4 (#174) previously PASSed in earlier Verifier runs (evidence in git history of this file / ship records under `docs/issues/done/`). This report scopes **RST-CUT-01** + T17 Done-when + cutover Build gates.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T01–T16 | ✅ Done (prior) | Phases 0–4 + CI wiring shipped |
| T17 | ✅ Done | Legacy `apps/web` + `apps/web-next` removed; scripts/CI retargeted; redirects runbook; migration TLC archived; §9 signed |

---

## Spec-Anchored Acceptance Criteria — RST-CUT-01

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion / evidence | Result |
| ------------------------- | -------------------- | ---------------------------------- | ------ |
| WHEN route parity reached and CI green THEN deploy target SHALL switch from `apps/web` to `apps/web-onda` | Sole production frontend package `@onda/web-onda`; root/CI scripts target web-onda only | `package.json:8-13` — `typecheck:web-onda`, `test`/`test:coverage`/`test:e2e:web-onda`/`dev:web-onda` filter `@onda/web-onda` only; `docs/runbooks/web-onda-cutover-redirects.md:3,9-12` — production entrypoint; `.github/workflows/ci.yml:82-103` — `typecheck-web-onda` job; `.github/workflows/e2e-web.yml:9-56` — `playwright-web-onda` | ✅ PASS |
| WHEN cutover completes THEN `apps/web` and `apps/web-next` packages SHALL be removed (dirs, workspace, CI, root scripts) | Directories gone; no `@onda/web` / `@onda/web-next` filter scripts | Filesystem: `apps/` contains `api`, `web-onda`, `web-legacy` only (`apps/web` / `apps/web-next` **GONE**); `package.json` scripts have zero `@onda/web` / `@onda/web-next` filters (`rg` CLEAN); `.github/workflows/{ci,e2e-web}.yml` reference `@onda/web-onda` only; commit `61eb805` deletes both trees (~36k LOC) | ✅ PASS |
| WHEN `apps/web-next` removed THEN required modules SHALL already live under `apps/web-onda` | No remaining imports from deleted paths | `rg` over `apps/web-onda` + `apps/api` for `apps/web-next` / `@onda/web-next` / `@onda/web"` → **zero matches**; `pnpm --filter @onda/web-onda build` exit 0 (2145 modules) | ✅ PASS |
| WHEN TLC artifacts for frozen migration preserved THEN `frontend-migration-web-next` SHALL be archived per AD-001 | Archive + redirect stub | `.specs/features/frontend-migration-web-next/README.md:1-7` — archive redirect stub; `.specs/archive/features/frontend-migration-web-next/` present; `.specs/archive/features/INDEX.md:34` indexes slug | ✅ PASS |
| WHEN URLs differ from legacy THEN server redirects documented in cutover PR | Documented redirect / deploy map | `docs/runbooks/web-onda-cutover-redirects.md:35-41` — `/events/$eventId` → `/scheduling/events/$eventId`; host serves web-onda; `apps/web-onda/src/router.tsx:125-131` — client redirect; `apps/web-onda/src/router.test.ts:124` — redirect test | ✅ PASS |

### RST-ENG-01 (HITL §9 — cutover gate)

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| Manual side-by-side serve-well vs web-onda at 1440px before cutover | Visual checklist signed | `design.md:198-203` — all §9 items **signed 2026-07-28** (PO authorized #175); `docs/issues/done/175-web-onda-phase-5-cutover.md:17` | ✅ PASS (HITL signed; Verifier does not re-run interactive UAT) |
| lint / typecheck / vitest / coverage / Playwright bar | Same automation bar as prior web package | Gates below; CI jobs `typecheck-web-onda` + `playwright-web-onda` present | ✅ PASS (Playwright job wired; not re-executed in this Verifier pass) |

### T17 Done-when

| Criterion | Evidence | Result |
| --------- | -------- | ------ |
| RST-CUT-01 complete | Table above — 5/5 ACs | ✅ |
| `apps/web` + `apps/web-next` gone; workspace `@onda/web-onda` + `api` | `apps/` listing; `apps/*/package.json` names `@onda/api` + `@onda/web-onda` only (`web-legacy` reference tree, no package.json) | ✅ |
| No `pnpm --filter @onda/web` or `@onda/web-next` remain | `rg` on `package.json` + `.github/workflows` → CLEAN | ✅ |
| Visual sign-off checklist (design.md §9) signed | `design.md:198-203` | ✅ |
| STATE.md + ROADMAP updated | `.specs/project/STATE.md:9` — #175 Execute decision; `.specs/project/ROADMAP.md:21,24,32` | ✅ |

**Status**: ✅ All RST-CUT-01 ACs covered with `file:line` / filesystem evidence

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `apps/web-onda/src/styles/globals.css:97` | Flipped cutover-critical `:root --background` from `oklch(0.9666 0.0026 106.45)` (`#f4f4f2`) → `oklch(0.9999 0 0)` | ✅ Killed — `theme.contract.test.ts:98-99` `expect(globalsCss).toMatch(/--background:\s*oklch\(0\.9666\s+0\.0026\s+106\.45\)/)` failed; restored via `git checkout`; re-run 13/13 pass |

**Sensor depth**: lightweight (1 behavior-level mutation on highest-risk cutover token from `1dc12fd`)  
**Scratch**: in-place mutate → focused vitest → `git checkout --` restore (working tree clean after)  
**Result**: 1/1 killed — PASS ✅

Note: A fake `@onda/web` root script would not be killed by Vitest (no package-json contract test). Absence of legacy filters verified by static `rg` gate instead — not counted as a surviving mutant.

---

## Interactive UAT Results

| # | Test | Result | Details |
| - | ---- | ------ | ------- |
| 1 | design.md §9 1440px visual checklist | 🧑 HITL signed (author/PO) | Signed 2026-07-28 in `design.md:198-203` — Verifier accepts as RST-ENG-01 closeout; no interactive re-walk this pass |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Deletion-heavy cutover; no drive-by features |
| Surgical changes | ✅ Scripts/CI/docs + delete legacy apps |
| No scope creep | ✅ `web-legacy` left as non-package reference (out of RST-CUT-01 delete set) |
| Matches patterns | ✅ Sole `@onda/web-onda` mirrors prior dual-package CI shape |
| Spec-anchored outcome check | ✅ RST-CUT-01 outcomes match evidence |
| Per-layer Coverage Expectation | ✅ Cutover is infra/docs; theme lock covered by contract test; redirect covered by `router.test.ts` |
| Every test maps to AC / Done-when | ✅ Sensor target maps to canvas lock (`1dc12fd` / BrandBook); gate suite is package health |
| Documented guidelines | ✅ `AGENTS.md` Running tests; AD-001 archive; `docs/runbooks/web-onda-cutover-redirects.md` |

---

## Edge Cases

- [x] Host already serves new app at prior origin — no extra CDN map required (`web-onda-cutover-redirects.md:41`)
- [x] Legacy `/events/$eventId` bookmark — client redirect preserved (`router.tsx:125-131`)
- [x] Frozen migration TLC preserved as history-only (`frontend-migration-web-next` archive + stub)
- [x] `apps/web-legacy` retained as non-workspace reference — does **not** violate RST-CUT-01 (spec names `apps/web` + `apps/web-next` only)

---

## Gate Check

- **Gate commands** (cutover-relevant Build gates from Verifier brief / T17 Done-when):
  1. Confirm `apps/web` + `apps/web-next` gone — ✅
  2. `pnpm typecheck:web-onda` — ✅ exit 0
  3. `pnpm --filter @onda/web-onda test` — ✅ **132 passed** / 31 files
  4. `pnpm --filter @onda/web-onda build` — ✅ exit 0
  5. `pnpm lint` — ✅ exit 0 (`--max-warnings 0`)
  6. Optional `rg` — no `@onda/web` / `@onda/web-next` filter scripts in root `package.json` / CI — ✅ CLEAN
- **Result**: all listed gates passed, 0 failed
- **Test count before #175 cutover** (Phase 4 validation): 112 Vitest
- **Test count after**: 132 Vitest (+20; no unjustified deletion of web-onda suite — legacy package tests removed with deleted trees by design)
- **Skipped**: Playwright e2e not re-run in this Verifier pass (CI job `playwright-web-onda` present)
- **Failures**: none

---

## Fix Plans

_(none — PASS)_

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| RST-CUT-01 | Implementing / Execute complete | ✅ Verified |
| RST-ENG-01 (§9 HITL) | Pending cutover sign-off | ✅ Verified (signed 2026-07-28) |
| T17 | Execute complete — Verifier pending | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 RST-CUT-01 ACs matched; RST-ENG-01 §9 HITL signed  
**Sensor**: 1/1 mutations killed  
**Gate**: typecheck + vitest (132) + build + lint + dir/script hygiene — all green  

**What works**: Production frontend is `@onda/web-onda` only; legacy packages deleted; CI/root scripts clean; redirects documented; migration TLC archived; canvas `#f4f4f2` locked by theme contract.

**Issues found**: none blocking

**Next steps**: Merge #175 PR; close GitHub #175; archive `frontend-restart-serve-well-base` per AD-001 after merge (STATE.md already notes this).

**Minor doc hygiene (non-blocking)**: `spec.md` Goals checkbox for cutover still `[ ]` while tasks/ship record mark complete — author may tick on archive.
