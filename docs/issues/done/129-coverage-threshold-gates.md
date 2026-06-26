# 129 — Coverage threshold gates

**Type:** Tech debt / CI hygiene  
**Status:** Shipped (validated 2026-06-11)  
**TLC:** `.specs/archive/features/coverage-threshold-gates/` (spec, tasks, baseline)

## Problem

CI `coverage` job published artifacts in report-only mode per #61 T61-06. No merge gate prevented coverage regressions.

## What was built

- Fixed API `jest-e2e.json` `rootDir` so Jest collects honest API coverage (~86% lines)
- `coverageThreshold` in `apps/api/test/jest-e2e.json` (85/85/63/88 global)
- Vitest `coverage.thresholds` in `apps/web/vitest.config.ts` (61/60/49/61 global)
- Removed `continue-on-error: true` from CI `coverage` job
- Baseline recorded in `.specs/archive/features/coverage-threshold-gates/baseline.md`

## Acceptance criteria

- [x] COV-01: API Jest coverage floors enforced
- [x] COV-02: Web Vitest coverage floors enforced
- [x] COV-03: API coverage collection fixed (`rootDir` / `collectCoverageFrom`)
- [x] COV-04: CI coverage job blocking
- [x] COV-05: `pnpm test:coverage` fails when thresholds not met

## Specification links

- Spec: `.specs/archive/features/coverage-threshold-gates/spec.md`
- Tasks: `.specs/archive/features/coverage-threshold-gates/tasks.md`
- Extends: `docs/issues/done/61-ci-lint-and-coverage.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/129
