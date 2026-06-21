# 144 — web-next migration Slice 2: Volunteer screens (T14–T16.5–T17)

**Type:** Feature (first end-to-end proof against live APIs)  
**Status:** Open — **ready for agent** (Slice 1 [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21)  
**Label:** `ready-for-agent`  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-VOL-01, UI-VOL-01..05)  
**Design:** `.specs/features/ui-refresh-onda-brand/` · reference [`design-reference/serve-well/`](../../design-reference/serve-well/README.md)

## Parent

- Blocked by: **none** (foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped)
- Volunteer queries (T14) are **in this slice**, not part of #143

## Nav IA (locked in #143)

Per `frontend-migration-web-next/context.md` and T13.5 preview:

| Route | Volunteer view |
|-------|----------------|
| `/dashboard` | Home — greeting, assignment **count** summary, time-away preview (≤3) |
| `/scheduling` | **My Assignments** — 2-col `AssignmentCard` grid (UI-VOL-02, UI-VOL-04) |
| `/time-away` | Full unavailability CRUD (T17) |

Design north star: `design-reference/serve-well/src/components/onda/dashboards/VolunteerDashboard.tsx` (layout split across routes). Optional HITL: `.specs/features/frontend-migration-web-next/hitl-signoff.md`.

## Tasks (atomic commits)

- [ ] **T14** — volunteer assignments + unavailability `queryOptions` + mutation fns
- [ ] **T15** — `AssignmentCard` (Onda tokens, skeleton, localized campus time)
- [ ] **T16** — `VolunteerDashboardPage` at `/dashboard` (greeting, assignment count, time-away preview, empty states) **+ Playwright e2e smoke** — supersedes T13.5 dashboard preview only
- [ ] **T16.5** — volunteer **My Assignments** at `/scheduling` (role branch in `scheduling.tsx`; `AssignmentCard` grid from `volunteerAssignmentsQuery`) — supersedes `VolunteerMyAssignmentsPreview`; design ref `VolunteerMyAssignmentsPreview` / serve-well assignments layout
- [ ] **T17** — `TimeAwayPage` full route (Unavailability CRUD, pessimistic mutations, cache invalidation)

## Done when

- [ ] `/dashboard` greets by name; assignment count summary correct (incl. 0); time-away preview (≤3) + "View all" → `/time-away`
- [ ] Volunteer `/scheduling` renders assignment cards linking to `/scheduling/events/$eventId`; empty state when none
- [ ] `/time-away` full CRUD with inline error feedback (ADR 0001)
- [ ] Vitest behavior tests (`@testing-library/user-event`) + volunteer-dashboard Playwright smoke green
- [ ] `pnpm lint` clean

**Gate:** full (T16 e2e), quick (others).

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/144
