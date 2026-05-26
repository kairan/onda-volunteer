# Feature Spec: Role catalog maintain/rename/retire (#44)

## Problem statement

Leaders and Admins need safe role catalog maintenance without losing historical assignment truth. The system must support adding, renaming, and retiring roles while preventing new assignment of retired roles.

## Requirements

- REQ-44-01: Authorized Leaders/Admins can add Role catalog entries in an authorized Ministry.
- REQ-44-02: Authorized Leaders/Admins can rename existing Role catalog entries.
- REQ-44-03: Authorized Leaders/Admins can retire a Role without deleting historical Assignment references.
- REQ-44-04: New Assignment creation with a retired Role is rejected with a stable domain error.
- REQ-44-05: Historical assignments continue to show the recorded Role for reporting/audit use.
- REQ-44-06: Retire flow copy and recovery guidance receive human sign-off.

## Non-goals

- Historical row rewrites or role backfill migrations.
- Permission model redesign beyond current Leader/Admin scope.
- Assignment route relocation (#57).

## Dependencies and blockers

- Depends on #38 roster write baseline (issue lists this dependency; shipped).
- Depends on role retirement semantics from platform PRD and CONTEXT.md.
- Interacts with scheduling rule enforcement for assignment creation.

## Verification approach

- API tests for add/rename/retire authorization paths.
- API/integration tests for retired-role assignment rejection.
- Reporting/read tests confirming historical role preservation.
- HITL review captured for retire copy and operator guidance.
