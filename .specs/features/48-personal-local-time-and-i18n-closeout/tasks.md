# Tasks: Personal-local time and i18n closeout (#48)

## Task list

- [ ] T48-01: Inventory remaining shell/dashboard/scheduling literals and missing i18n keys.
  - Verify: key coverage checklist created for targeted surfaces.
- [ ] T48-02: Implement remaining translation key wiring for `pt-BR` and `en`.
  - Verify: unit/integration checks confirm locale string resolution.
- [ ] T48-03: Implement/refine personal-local time toggle rendering in event/assignment views.
  - Verify: integration tests cover canonical + personal-local dual display.
- [ ] T48-04: Implement/refine local/session persistence for time-display preference.
  - Verify: tests confirm preference survives reload within chosen persistence boundary.
- [ ] T48-05: Validate fallback behavior (`pt-BR -> en`) and error-safe rendering for missing keys.
  - Verify: i18n fallback tests pass.
- [ ] T48-06: Run regression checks that UTC persistence and API payload semantics are unchanged.
  - Verify: API/UI assertions confirm canonical UTC remains source of truth.

## Parallelization notes

- T48-02 and T48-03 can run in parallel after T48-01.
- T48-05 can run in parallel with T48-04 once key wiring is stable.
