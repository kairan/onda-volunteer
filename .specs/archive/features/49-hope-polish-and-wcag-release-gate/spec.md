# Feature Spec: HOPE polish and WCAG release gate (#49)

## Problem statement

Core scheduling and time-away workflows need a final accessibility and visual quality pass before release. Without a focused gate, regressions in keyboard flow, focus visibility, reduced motion, and dense-table readability are likely.

## Requirements

- REQ-49-01: Core Scheduling and Time away surfaces pass keyboard-only smoke coverage.
- REQ-49-02: Focus states remain visibly compliant with WCAG 2.2 AA expectations on HOPE surfaces.
- REQ-49-03: Reduced-motion behavior is respected for overlays, hover transitions, and loading states.
- REQ-49-04: Skeleton loading and dense table treatments preserve readability and HOPE contract alignment.
- REQ-49-05: Human WCAG/polish sign-off is required before release completion.

## Non-goals

- New domain workflows outside polish/accessibility hardening.
- Replacing existing scheduling invariants or authorization logic.
- Full redesign of route architecture.

## Dependencies and blockers

- Upstream dependencies #36, #37, #38, and #39 are listed as shipped in issue and architecture tracker.
- Must align with ADR 0001 structural accessibility decisions and ADR 0003 visual direction.
- Depends on existing Playwright capability from #60 for browser-level smoke coverage.

## Verification approach

- Playwright keyboard navigation smoke tests on core scheduling/time-away paths.
- Component/integration checks for focus rings and reduced-motion behavior.
- Visual regression/snapshot checks for skeleton and dense table readability.
- HITL WCAG and visual-polish sign-off artifact captured as a release gate.
