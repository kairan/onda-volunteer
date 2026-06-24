# 144 — web-next migration Slice 2: Volunteer screens (T14–T16.5–T17)

**Type:** Feature (first end-to-end proof against live APIs)  
**Status:** Shipped (validated 2026-06-21)  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-VOL-01, UI-VOL-01..05)  
**Design:** `.specs/features/ui-refresh-onda-brand/` · reference [`design-reference/serve-well/`](../../design-reference/serve-well/README.md)

## Parent

- Foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21
- Unblocks Slice 6 CI/cutover [#148](https://github.com/kairan/onda-volunteer/issues/148)

## What was built

Volunteer query layer (`volunteerAssignmentsQuery`, `volunteerUnavailabilityQuery`, unavailability mutations), `AssignmentCard`, live `/dashboard` (greeting, assignment count, time-away preview), `/scheduling` My Assignments grid (T16.5), full `/time-away` CRUD. Playwright volunteer dashboard smoke + Vitest behavior tests.

**PRs:** [#156](https://github.com/kairan/onda-volunteer/pull/156) (T14–T17), [#157](https://github.com/kairan/onda-volunteer/pull/157) (Playwright CI wiring — T28 partial)

## Acceptance criteria

- [x] **T14** — volunteer assignments + unavailability `queryOptions` + mutation fns
- [x] **T15** — `AssignmentCard` (Onda tokens, skeleton, localized campus time)
- [x] **T16** — `VolunteerDashboardPage` at `/dashboard` + Playwright e2e smoke
- [x] **T16.5** — volunteer My Assignments at `/scheduling` (`AssignmentCard` grid)
- [x] **T17** — `TimeAwayPage` full route (Unavailability CRUD, pessimistic mutations, cache invalidation)

### Done when (slice gates)

- [x] `/dashboard` greets by name; assignment count summary correct (incl. 0); time-away preview (≤3) + "View all" → `/time-away`
- [x] Volunteer `/scheduling` renders assignment cards linking to `/scheduling/events/$eventId`; empty state when none
- [x] `/time-away` full CRUD with inline error feedback (ADR 0001)
- [x] Vitest behavior tests + volunteer-dashboard Playwright smoke green
- [x] `pnpm lint` clean

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/144
