# Tasks: API request-scoped auth context (#55)

## Task list

- [ ] T55-01: Define request-context type contract and migration target architecture.
  - Verify: context type reviewed and agreed for controller/service usage.
- [ ] T55-02: Implement HTTP-layer resolver (guard/middleware/interceptor) that populates authenticated context.
  - Verify: resolver unit/integration tests pass for JWT and dev-header flows.
- [ ] T55-03: Migrate high-traffic controller paths from raw header forwarding to context object.
  - Verify: controller compile checks pass and no raw-header plumbing remains on migrated paths.
- [ ] T55-04: Add compatibility wrappers for non-migrated paths to reduce merge risk during transition.
  - Verify: mixed migrated/non-migrated paths still pass integration tests.
- [ ] T55-05: Validate unchanged authorization behavior with API e2e for JWT and dev-header modes.
  - Verify: targeted e2e scenarios remain green.
- [ ] T55-06: Document request context contract in runbook/project docs.
  - Verify: doc section added and linked from contributor guidance.

## Parallelization notes

- T55-03 can be split by controller/module in parallel after T55-02.
- T55-06 can run in parallel after context contract stabilizes.
