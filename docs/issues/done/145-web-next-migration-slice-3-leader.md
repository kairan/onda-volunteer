# 145 — web-next migration Slice 3: Ministry Leader screens (T18–T23)

**Type:** Feature  
**Status:** Shipped (validated 2026-06-23)  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-LEAD-01, UI-LEAD-01..06, MIG-CUT-01)  
**Design:** `.specs/features/ui-refresh-onda-brand/` · reference [`design-reference/serve-well/`](../../design-reference/serve-well/README.md)

## Parent

- Foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21
- Shares role-aware `/scheduling.tsx` with volunteer slice [#144](https://github.com/kairan/onda-volunteer/issues/144)

## What was built

Leader query/mutation layer, `RosterByEventSection`, `LeaderSchedulingPage`, `SchedulingEventDetailPage`, private event create, leader volunteer time-away management. Leader Playwright smoke tests.

**PR:** [#158](https://github.com/kairan/onda-volunteer/pull/158)

## Acceptance criteria

- [x] **T18** — leader event/detail `queryOptions` + assign/release mutations (void, not self-release)
- [x] **T19** — `RosterByEventSection` (fill ratio badge, assigned/unfilled rows, initials avatar)
- [x] **T20** — `LeaderSchedulingPage` + e2e smoke
- [x] **T21** — `SchedulingEventDetailPage` + e2e smoke
- [x] **T22** — `SchedulingCreatePrivateEventPage` at `/scheduling/events/new-private`
- [x] **T23** — `LeaderVolunteerTimeAwayPage` at `/leader/volunteer-time-away`

### Done when (slice gates)

- [x] Ministry hero + open-slot summary; roster fill badges; Assign/Release with inline error feedback
- [x] T23 uses `/leader/volunteer-time-away` with in-form ministry/volunteer selection
- [x] Vitest behavior tests + leader-scheduling / event-detail Playwright smoke green
- [x] `pnpm lint` clean

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/145
