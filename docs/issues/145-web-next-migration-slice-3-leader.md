# 145 — web-next migration Slice 3: Ministry Leader screens (T18–T23)

**Type:** Feature  
**Status:** Open — **ready for agent** (Slice 1 [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21)  
**Label:** `ready-for-agent`  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-LEAD-01, UI-LEAD-01..06, MIG-CUT-01)  
**Design:** `.specs/features/ui-refresh-onda-brand/` · reference [`design-reference/serve-well/`](../../design-reference/serve-well/README.md)

## Parent

- Blocked by: **none** (foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped)

## Shared route note

`/scheduling.tsx` is **role-aware**: volunteer My Assignments ([#144](https://github.com/kairan/onda-volunteer/issues/144) T16.5) and leader roster (T20) share the file via grant-based branch (established in #143 T13.5). Coordinate merges; T20 replaces **leader** preview only.

## Tasks (atomic commits)

- [ ] **T18** — leader event/detail `queryOptions` + assign/release mutations (pessimistic; release = `void`, not self-release)
- [ ] **T19** — `RosterByEventSection` (fill ratio badge, assigned/unfilled rows, initials avatar)
- [ ] **T20** — `LeaderSchedulingPage` (ministry hero, weekly summary, roster-by-event, CTAs) **+ e2e smoke** — supersedes T13.5 **leader** preview on `/scheduling`
- [ ] **T21** — `SchedulingEventDetailPage` (full roster, assign/release) **+ e2e smoke**
- [ ] **T22** — `SchedulingCreatePrivateEventPage` at `/scheduling/events/new-private`
- [ ] **T23** — `LeaderVolunteerTimeAwayPage` at `/leader/volunteer-time-away` (in-form ministry + volunteer picker; no `$volunteerId` URL segment)

## Note

Release semantics: leader stewardship `POST /assignments/:id/void` (ROSTER-A1), not volunteer self-release.

**Route parity:** exact URLs from `apps/web` — cleanup deferred post-cutover (`context.md`).

## Done when

- [ ] Ministry hero + open-slot summary; roster fill badges; Assign/Release with inline error feedback
- [ ] T23 uses `/leader/volunteer-time-away` with in-form ministry/volunteer selection
- [ ] Vitest behavior tests + leader-scheduling / event-detail Playwright smoke green
- [ ] `pnpm lint` clean

**Gate:** full (T20/T21 e2e), quick (others).

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/145
