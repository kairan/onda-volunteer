# 172 — web-onda Phase 2: Volunteer vertical slice (T08–T10.1)

**Type:** Feature  
**Status:** Shipped (validated 2026-07-03)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-VOL-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170) (foundation via PR [#171](https://github.com/kairan/onda-volunteer/pull/171))

## What was built

Live volunteer vertical slice in `apps/web-onda`:

- **T08** — `/dashboard`: greeting, assignment count, time-away preview (`volunteerAssignmentsQuery`, `volunteerUnavailabilityQuery`)
- **T09** — Volunteer `/scheduling`: serve-well assignment grid (`VolunteerMyAssignmentsPage`, `AssignmentCard`)
- **T10** — `/time-away`: unavailability CRUD with pessimistic mutations, ministry pre-select from working context
- **T10.1** — Optional `Unavailability.description` (API migration + create/edit textarea + list display)

Shared modules: `apps/web-onda/src/volunteer/*`, route test setup/utils. Playwright API-backed smoke: dashboard + scheduling. Seed demo dates roll forward (`SEED_DEMO_EVENT_DAY_OFFSET`) for stable e2e.

**PR:** [#176](https://github.com/kairan/onda-volunteer/pull/176)  
**Validation:** `.specs/features/frontend-restart-serve-well-base/validation.md` (Phase 2 section)

## Tasks

- [x] **T08** — Volunteer dashboard (live)
- [x] **T09** — Volunteer My Assignments at `/scheduling`
- [x] **T10** — Time away route (CRUD, pessimistic mutations)
- [x] **T10.1** — Optional description field (API + UI)

## Done when

- [x] RST-VOL-01 volunteer criteria met (automated; 1440px HITL deferred pre-cutover)
- [x] `dashboard.behavior.test.tsx` + scheduling/time-away behavior tests pass (84 Vitest)
- [x] Playwright volunteer smoke (`pnpm test:e2e:web-onda`) green
- [x] CI green on PR #176

**Gate:** build + test + coverage + lint + typecheck + `playwright-web-onda` on PR #176.

## Next

- [#173](https://github.com/kairan/onda-volunteer/issues/173) — Phase 3 Leader (T11–T13)
- [#174](https://github.com/kairan/onda-volunteer/issues/174) — Phase 4 Admin (T14–T15)
- [#175](https://github.com/kairan/onda-volunteer/issues/175) — Phase 5 Cutover (T17)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/172
