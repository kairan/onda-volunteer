# 165 — Role slot capacity per event (T01–T09)

**Type:** Feature (Scheduling / leader roster)  
**Status:** Done  
**TLC:** `.specs/archive/features/role-slot-capacity-per-event/` (SCHED-SLOT-01..05)  
**Design:** [design.md](../../.specs/archive/features/role-slot-capacity-per-event/design.md)  
**Related:** [ui-refresh-onda-brand](../../.specs/archive/features/ui-refresh-onda-brand/spec.md) (UI-LEAD), Serve Well roster visual (orthogonal)

## Problem

Churches need multiple volunteers in the same **Role** per **Event** (e.g. 2× Audio). Today web-next assumed one assignment per role (`buildRosterRows` `.find()`); workaround used duplicate role names. API allowed hidden duplicate assignments.

## What shipped

- `EventRoleCapacity` model — capacity per `(event, ministry, role)`, seeded on private event create
- Assignment guards: `ROLE_SLOTS_FULL`, `VOLUNTEER_ALREADY_ON_ROLE_SLOT`
- PATCH `/events/:eventId/role-capacities` with `CAPACITY_BELOW_FILLED_SLOTS`
- web-next: multi-slot roster rows, fill badges, capacity editor on private event detail
- Tests: API e2e + web-next unit/behavior + Playwright smoke

## Acceptance criteria

- [x] **T01** — Migration + seed capacities on private event create
- [x] **T02** — Assignment capacity guards + `scheduling-rules.test.ts`
- [x] **T03** — PATCH role capacities + `CAPACITY_BELOW_FILLED_SLOTS`
- [x] **T04** — Event detail includes `roleCapacities`; web-next types
- [x] **T05** — `buildRosterRows` expands by capacity
- [x] **T06** — Roster UI assign/release per `slotKey`
- [x] **T07** — Capacity editor + pt-BR/en i18n
- [x] **T08** — Playwright: 2× Audio, badge `2/2`
- [x] **T09** — `CONTEXT.md` **Role slot** glossary

### Done when (slice gates)

- [x] Leader can set Audio capacity 2, assign two volunteers, see `2/2` fill badge
- [x] Third assign rejected `ROLE_SLOTS_FULL`; duplicate volunteer rejected `VOLUNTEER_ALREADY_ON_ROLE_SLOT`
- [x] `pnpm test` green (API + web-next)
- [x] No roster path relies on one-assignment-per-role `.find()`

## Out of scope (v1)

- Public event multi-ministry capacity editor
- Ministry hierarchy / volunteer skills
- `MinistryRole.defaultCapacity` (P2 ORG-SLOT-01)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/165
