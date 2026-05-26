# Design: HOPE polish and WCAG release gate (#49)

## Scope

Define release-hardening checks for accessibility and visual polish on core scheduling and time-away surfaces after core functional slices are landed.

## Key design decisions

- Treat WCAG/polish as a formal release gate with explicit HITL sign-off.
- Use Playwright for keyboard smoke and route-level behavior checks.
- Use component/integration checks for focus visibility and reduced-motion adherence.
- Keep ADR 0001 structural accessibility expectations and ADR 0003 visual direction as normative baselines.
- Limit scope to hardening existing surfaces, not introducing new domain features.

## Risks and mitigations

- Risk: subjective polish criteria drift.
  - Mitigation: checklist anchored to WCAG and explicit HOPE contract items.
- Risk: flaky keyboard/accessibility browser checks.
  - Mitigation: deterministic, minimal smoke scenarios with stable selectors.
- Risk: reduced-motion regressions from future styling changes.
  - Mitigation: lock reduced-motion expectations in repeatable tests.
