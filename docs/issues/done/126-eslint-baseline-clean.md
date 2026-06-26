# 126 — ESLint baseline clean

**Type:** Tech debt / CI hygiene  
**Status:** Shipped (validated 2026-06-11)  
**TLC:** `.specs/archive/features/eslint-baseline-clean/` (spec, tasks)

## Problem

CI lint ran in report-only mode per #61 promotion criteria. `pnpm lint` reported 13 `@typescript-eslint/no-unused-vars` warnings across 11 files, blocking promotion to a required merge gate.

## What was built

- Fixed all 13 unused-var warnings (API src + e2e tests, web routes + shell)
- Added `--max-warnings 0` to root `pnpm lint` script
- Removed `continue-on-error: true` from CI `lint` job
- Documented `CI / lint` as required check in branch protection runbook (HITL: enable in GitHub Settings)

## Acceptance criteria

- [x] `pnpm lint` exits 0 with zero warnings (LINT-CLEAN-01)
- [x] Lint script uses `--max-warnings 0` (LINT-CLEAN-02)
- [x] CI lint job no longer uses `continue-on-error` (LINT-CLEAN-03)
- [x] Branch protection runbook lists `CI / lint` (LINT-CLEAN-04)
- [x] `pnpm test` green — no behavior change

## Specification links

- Spec: `.specs/archive/features/eslint-baseline-clean/spec.md`
- Tasks: `.specs/archive/features/eslint-baseline-clean/tasks.md`
- Extends: `docs/issues/done/61-ci-lint-and-coverage.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/126
