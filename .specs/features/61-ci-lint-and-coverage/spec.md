# Feature Spec: CI lint and coverage baseline (local #61)

## Problem statement

CI currently gates only build and test. Missing lint and coverage signals reduce maintainability feedback and make quality trends harder to track across pull requests.

## Requirements

- REQ-61-01: Add a runnable `pnpm lint` command with repository-appropriate ESLint configuration and baseline handling.
- REQ-61-02: Add CI lint execution on pull requests, initially non-blocking until baseline is stable.
- REQ-61-03: Publish coverage artifacts for API and web tests in CI without enforcing thresholds initially.
- REQ-61-04: Define threshold-gating criteria as a later decision after baseline data is collected.
- REQ-61-05: Add optional API-first typecheck CI step before full monorepo typecheck gating.
- REQ-61-06: Preserve existing build/test CI behavior and avoid long-suite expansion in this planning slice.

## Non-goals

- Replacing Jest e2e or Playwright test strategies.
- Forcing strict web typecheck gate before existing strict debt is addressed.
- Immediate high-threshold coverage enforcement.

## Dependencies and blockers

- Local backlog item (no current GitHub issue mapping).
- Depends on establishing lint configuration and resolving or baselining existing violations.
- Must align with AGENTS.md CI/testing notes and architecture-debt backlog index.

## Verification approach

- Validate `pnpm lint` runs locally and in CI.
- Validate coverage reports are generated and attached/published on PRs.
- Validate CI remains green with report-only posture before threshold gating.
- Confirm documented follow-up criteria for promoting lint/coverage checks to required.
