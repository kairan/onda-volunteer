# Tasks: Coverage threshold gates (#129)

**Spec:** `.specs/features/coverage-threshold-gates/spec.md`

## Task list

- [x] T-COV-01: Fix API jest-e2e `rootDir` / `collectCoverageFrom` for honest coverage collection
  - Verify: `pnpm --filter @onda/api test:coverage` reports non-zero %
- [x] T-COV-02: Add `coverageThreshold` to `apps/api/test/jest-e2e.json` (lines 85, statements 85, branches 63, functions 88)
  - Verify: API coverage passes at baseline
- [x] T-COV-03: Add Vitest `coverage.thresholds` (lines 61, statements 60, branches 49, functions 61)
  - Verify: web coverage passes at baseline
- [x] T-COV-04: Remove `continue-on-error` from CI coverage job; TLC closeout docs
  - Verify: `pnpm test:coverage` green; CI coverage job blocking

## Gates

- `pnpm test:coverage`
- `pnpm test`
- `pnpm lint`
