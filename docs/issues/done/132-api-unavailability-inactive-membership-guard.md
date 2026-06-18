# 132 — API: reject Unavailability create for inactive membership

**Type:** AFK  
**Status:** Shipped (validated 2026-06-18, PR [#137](https://github.com/kairan/onda-volunteer/pull/137))  
**TLC:** `.specs/features/ubiquitous-language-drift/` (AVAIL-01)

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (AVAIL-01)

## What was built

Aligned `SchedulingService.createUnavailability` with bulk mirror membership guards: reject `INACTIVE` membership with `MEMBERSHIP_NOT_ACTIVE`. Shared guard logic in `scheduling-rules.ts`. API e2e regression test added.

## Acceptance criteria

- [x] POST single **Unavailability** returns `MEMBERSHIP_NOT_ACTIVE` for `INACTIVE` membership.
- [x] **Pending** and **Active** still allowed.
- [x] Bulk and single-create share consistent guard logic.
- [x] API e2e regression test.

## Specification links

- Spec: `.specs/features/ubiquitous-language-drift/spec.md`
- Tasks: `.specs/features/ubiquitous-language-drift/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/132
