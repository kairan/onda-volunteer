# 61 — CI: ESLint and coverage

**Status:** Shipped via PR [#83](https://github.com/kairan/onda-volunteer/pull/83)  
**Type:** Platform / test infrastructure  
**Normative refs:** `AGENTS.md`; `docs/issues/architecture-debt.md`

## Problem

At creation, [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) gated PRs with **build** and **test** only. The repo had no ESLint config, no coverage scripts, and known web `tsc --noEmit` strict debt (`AGENTS.md`).

## What to build

1. **ESLint** (and optional Prettier): root or per-package config, `pnpm lint` script, fix or baseline violations, then add a CI job (optional required check).
2. **Coverage**: Vitest (`@vitest/coverage-v8`) + Jest `--coverage`; upload report artifact or Codecov **without** failing thresholds initially; add thresholds only after an honest baseline.
3. **Typecheck** (optional earlier slice): API-only `tsc --noEmit` in CI before enabling full monorepo typecheck once web strict errors are cleared.

## Acceptance criteria

- [x] `pnpm lint` exists and exits cleanly with warnings report-only.
- [x] CI runs lint on `pull_request` without making lint a required gate.
- [x] Coverage artifacts are published on PRs; no merge gate on % until agreed.
- [x] API typecheck runs in CI; full web typecheck remains deferred until strict errors are resolved.

## Out of scope

- Replacing API Jest e2e or Playwright (see `60-web-playwright-browser-e2e.md`).
