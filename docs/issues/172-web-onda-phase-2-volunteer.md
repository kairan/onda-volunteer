# 172 — web-onda Phase 2: Volunteer vertical slice (T08–T10)

**Type:** Feature  
**Status:** Ready for Execute (after #170 merge)  
**Label:** `ready-for-agent` (apply after PR #171 merges)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-VOL-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170) (foundation shipped via PR [#171](https://github.com/kairan/onda-volunteer/pull/171))

## Problem

Phase 0–1 scaffolded placeholder routes. Volunteers need live `/dashboard`, volunteer `/scheduling`, and `/time-away` with serve-well presentation wired to real API queries.

## What to build

- **T08** — `/dashboard`: serve-well `VolunteerDashboard` layout; `volunteerAssignmentsQuery`, unavailability preview
- **T09** — Volunteer `/scheduling`: serve-well assignment cards; live assignments query
- **T10** — `/time-away`: serve-well list + dialog; unavailability CRUD; ministry pre-selected from working context

**Reuses:** `design-reference/serve-well/` dashboards; `apps/web-next/src/routes/{dashboard,scheduling,timeAway}.tsx` data wiring; `apps/web-next/src/volunteer/*` queries

## Acceptance criteria

- [ ] **T08** — Live dashboard: greeting, assignment count, time-away preview + "View all"
- [ ] **T09** — Volunteer My Assignments grid at `/scheduling` (working context = volunteer)
- [ ] **T10** — Time away CRUD with pessimistic mutations and inline errors (ADR 0001)

### Done when (slice gates)

- [ ] RST-VOL-01 volunteer criteria met (`spec.md`)
- [ ] `dashboard.behavior.test.tsx` + scheduling/time-away behavior tests pass
- [ ] Playwright volunteer smoke extended (dashboard + at least one assignment path)
- [ ] `pnpm --filter @onda/web-onda test` + `pnpm test:e2e:web-onda` green

## Out of scope

- Leader `/scheduling` ([#173](https://github.com/kairan/onda-volunteer/issues/173))
- Org-admin routes ([#174](https://github.com/kairan/onda-volunteer/issues/174))

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/172
