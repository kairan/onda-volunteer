# Tasks: HOPE polish and WCAG release gate (#49)

## Task list

- [x] T49-01: Create accessibility/polish gate checklist mapped to ADR 0001 and ADR 0003 expectations.
  - Verify: checklist approved before implementation work.
- [x] T49-02: Add Playwright keyboard-only smoke tests for core scheduling and time-away flows.
  - Verify: browser smoke tests pass in CI/local e2e pipeline.
- [x] T49-03: Add/extend tests for visible focus treatment on key interactive states.
  - Verify: focus checks pass for targeted components/surfaces.
- [x] T49-04: Add/extend reduced-motion behavior checks for overlays/loading/hover transitions.
  - Verify: reduced-motion tests pass under `prefers-reduced-motion`.
- [x] T49-05: Validate skeleton and dense-table visual readability under HOPE styling.
  - Verify: component/integration checks and manual review notes recorded.
- [ ] T49-06: Complete HITL WCAG + visual polish sign-off artifact.
  - Verify: gate sign-off captured in `hitl-signoff.md` before release.

## Parallelization notes

- T49-02, T49-03, and T49-04 can run in parallel after T49-01.
- T49-05 and T49-06 complete after automated checks stabilize.
