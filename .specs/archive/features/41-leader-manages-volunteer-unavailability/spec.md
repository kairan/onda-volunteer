# Feature Spec: Leader manages Volunteer Unavailability (#41)

## Problem statement

Leaders currently rely on volunteer self-service or admin intervention for ministry-scoped unavailability updates. This slows pastoral coordination and creates unnecessary escalation for routine schedule adjustments.

## Requirements

- REQ-41-01: A Leader can create Unavailability for a Volunteer only when the Volunteer has membership in a Ministry the Leader stewards.
- REQ-41-02: A Leader can edit or remove Unavailability only within Ministries they lead.
- REQ-41-03: Cross-ministry and cross-church access is denied with a stable authorization error.
- REQ-41-04: UI copy distinguishes Leader-managed support actions from Volunteer self-service Time away flows.
- REQ-41-05: Existing UTC persistence and overlap semantics remain unchanged.

## Non-goals

- Volunteer self-service redesign or expansion (covered by shipped #39 and related follow-ups).
- New role model changes beyond current Leader stewardship rules.
- Bulk unavailability mirroring behavior changes.

## Dependencies and blockers

- Upstream dependency: issue #39 shipped and remains the baseline behavior.
- Reuses stewardship rules from Organization/Identity authorization checks.
- No additional PRD or ADR gating identified.

## Verification approach

- API tests for authorized create/update/delete by a qualifying Leader.
- API tests for unauthorized Leader attempts (wrong ministry/church).
- UI tests for support-action labeling and flow distinction from self-service.
- Regression checks to confirm unchanged UTC persistence and conflict behavior.
