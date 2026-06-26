# Feature Spec: Admin manages Ministry membership lifecycle (#46)

## Problem statement

Admins need church-scoped controls for membership onboarding and offboarding. Lifecycle actions must keep future schedules accurate while preserving historical service records.

## Requirements

- REQ-46-01: Accredited Admins can add a Volunteer to a Ministry as Pending or Active within an accredited Church.
- REQ-46-02: Accredited Admins can transition membership from Pending to Active within scope.
- REQ-46-03: Accredited Admins can deactivate Active membership within scope.
- REQ-46-04: Deactivation voids assignments only for events whose scheduled end is still in the future.
- REQ-46-05: Assignments for events that already ended remain preserved for history/reporting.
- REQ-46-06: Lifecycle copy and support workflow expectations receive human sign-off.
- REQ-46-07: If deactivation transaction code is touched, assignment voiding is invoked through Scheduling seam or an explicit exception rationale is documented.

## Non-goals

- Reworking already-shipped backend behavior when only UI wiring is changed.
- Redesigning volunteer identity/authentication flows.
- Introducing new membership statuses beyond Pending and Active for this slice.

## Dependencies and blockers

- No hard blocker listed in issue; can start immediately.
- Reuses existing deactivation voiding semantics already implemented in done/05.
- Optional architecture fold from `docs/issues/architecture-debt.md` candidate #5 if transaction internals are changed.

## Verification approach

- API tests for add/activate/deactivate authorization boundaries.
- Integration tests validating future-only voiding and past-assignment preservation.
- UI tests for lifecycle actions and status transitions in admin flows.
- HITL sign-off checkpoint for lifecycle language and operator guidance.
