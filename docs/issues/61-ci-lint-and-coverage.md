# 61 — CI: ESLint and coverage (deferred)

**Status:** Backlog  
**Type:** Platform / test infrastructure  
**Normative refs:** `AGENTS.md`; `docs/issues/architecture-debt.md`

## Problem

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) gates PRs with **build** and **test** only. The repo has no ESLint config, no coverage scripts, and known web `tsc --noEmit` strict debt (`AGENTS.md`).

## What to build

1. **ESLint** (and optional Prettier): root or per-package config, `pnpm lint` script, fix or baseline violations, then add a CI job (optional required check).
2. **Coverage**: Vitest (`@vitest/coverage-v8`) + Jest `--coverage`; upload report artifact or Codecov **without** failing thresholds initially; add thresholds only after an honest baseline.
3. **Typecheck** (optional earlier slice): API-only `tsc --noEmit` in CI before enabling full monorepo typecheck once web strict errors are cleared.

## Acceptance criteria

- [ ] `pnpm lint` exists and passes locally.
- [ ] CI runs lint on `pull_request` (required only after baseline is clean).
- [ ] Coverage published on PRs (report-only); no merge gate on % until agreed.
- [ ] Web `tsc --noEmit` in CI when strict errors are resolved.

## Out of scope

- Replacing API Jest e2e or Playwright (see `done/60-web-playwright-browser-e2e.md`).
