# Feature Spec: API Assignment route under Scheduling (#57)

## Problem statement

Assignment creation currently lives on an Events HTTP seam while rule ownership sits in Scheduling. This split obscures ownership and complicates module boundaries.

## Requirements

- REQ-57-01: Expose assignment creation from a Scheduling-owned HTTP route.
- REQ-57-02: Web shell roster write paths consume the Scheduling-owned route.
- REQ-57-03: Legacy Events-nested assignment POST is removed or made explicitly deprecated with clear behavior.
- REQ-57-04: Assignment creation behavior and error contract remain unchanged.
- REQ-57-05: Updated API documentation reflects route ownership under Scheduling.

## Non-goals

- Moving event detail read paths away from Events.
- Refactoring assignment invariants themselves (#54).
- New assignment workflow capabilities.

## Dependencies and blockers

- Depends on #38 write baseline (already shipped; issue now effectively unblocked).
- Depends on stable Scheduling service boundary.
- Aligns with architecture debt candidate #4.

## Verification approach

- API e2e tests for assignment create success/failure on new Scheduling route.
- Web integration tests verifying roster writes call the new route.
- Negative tests for legacy route behavior (removed or explicit deprecation path).
- Contract regression checks ensuring unchanged domain error semantics.
