# Feature Spec: API church stewardship access module (#56)

## Problem statement

Church/ministry stewardship checks are duplicated across Events, Organization, and Identity code paths, increasing drift risk and making permission updates expensive to apply consistently.

## Requirements

- REQ-56-01: Provide a single Organization-scoped stewardship module for church/ministry access decisions.
- REQ-56-02: Expose reusable decisions for event visibility, leader ministry authority, admin church accreditation, and accessible context aggregation.
- REQ-56-03: Events, Scheduling, and Identity call the shared stewardship module (or narrow wrappers) instead of duplicating membership queries.
- REQ-56-04: Event list/detail visibility and leader mutation authorization continue to match current behavior.
- REQ-56-05: No HTTP route or response shape changes are introduced unless a bug fix requires it.

## Non-goals

- Adding new permission types not already defined in CONTEXT.md.
- Web-side organization context redesign.
- Product-facing UX changes unrelated to access consolidation.

## Dependencies and blockers

- No hard blocker; issue recommends scheduling during or after #42-#47 if duplication pressure increases.
- Depends on stable organization membership/accreditation schema semantics.
- Aligns with architecture debt candidate #1.

## Verification approach

- API tests for shared visibility and mutation checks through the new seam.
- E2E regressions for event visibility and leader assignment paths.
- Internal contract tests for stewardship decision helpers.
- Diff review confirming no public API contract drift.
