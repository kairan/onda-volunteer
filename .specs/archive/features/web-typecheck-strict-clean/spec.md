# Feature Spec: Web typecheck strict clean (#128)

## Problem statement

API typecheck gates CI (`typecheck-api` job). Web `tsc --noEmit` reports 59 strict errors across 27 files, blocking [#61](../../docs/issues/done/61-ci-lint-and-coverage.md) promotion criterion #3 (full monorepo typecheck gate).

## Requirements

- **TC-01:** `cd apps/web && pnpm exec tsc --noEmit` exits 0
- **TC-02:** Root `pnpm typecheck:web` script runs web typecheck
- **TC-03:** CI `typecheck-web` job runs in parallel with `typecheck-api`
- **TC-04:** Document `CI / typecheck-web` in branch protection runbook (HITL enable after green `main`)
- **TC-05:** `pnpm test` + `pnpm lint` remain green — no runtime behavior change

## Non-goals

- New product features
- Coverage threshold enforcement (separate slice)
- API typecheck changes (already green)

## Dependencies

- Builds on shipped [#61](../../docs/issues/done/61-ci-lint-and-coverage.md) and [#126](../../docs/issues/done/126-eslint-baseline-clean.md)
- Post–#124 `IdentityMePayload.newlyFulfilledInvites` field drives test fixture updates

## Verification approach

- `pnpm typecheck:web` → exit 0
- `pnpm lint` + `pnpm test` → green
- CI `typecheck-web` job green on PR

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/128
