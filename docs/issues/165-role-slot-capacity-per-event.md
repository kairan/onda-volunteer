# 165 — Role slot capacity per event (T01–T09)

**Type:** Feature (Scheduling / leader roster)  
**Status:** Ready for Execute  
**TLC:** `.specs/features/role-slot-capacity-per-event/` (SCHED-SLOT-01..05)  
**Design:** [design.md](../../.specs/features/role-slot-capacity-per-event/design.md)  
**Related:** [ui-refresh-onda-brand](../../.specs/features/ui-refresh-onda-brand/spec.md) (UI-LEAD), Serve Well roster visual (orthogonal)

## Problem

Churches need multiple volunteers in the same **Role** per **Event** (e.g. 2× Audio). Today web-next assumes one assignment per role (`buildRosterRows` `.find()`); workaround uses duplicate role names. API allows hidden duplicate assignments.

## What to build

- `EventRoleCapacity` model — capacity per `(event, ministry, role)`, editable per event
- Assignment guards: `ROLE_SLOTS_FULL`, `VOLUNTEER_ALREADY_ON_ROLE_SLOT`
- PATCH `/events/:eventId/role-capacities`
- web-next: multi-slot roster rows, fill badges, capacity editor on event detail
- Tests: API e2e + web-next unit/behavior + Playwright smoke

## Acceptance criteria

- [ ] **T01** — Migration + seed capacities on private event create
- [ ] **T02** — Assignment capacity guards + `scheduling-rules.test.ts`
- [ ] **T03** — PATCH role capacities + `CAPACITY_BELOW_FILLED_SLOTS`
- [ ] **T04** — Event detail includes `roleCapacities`; web-next types
- [ ] **T05** — `buildRosterRows` expands by capacity
- [ ] **T06** — Roster UI assign/release per `slotKey`
- [ ] **T07** — Capacity editor + pt-BR/en i18n
- [ ] **T08** — Playwright: 2× Audio, badge `2/2`
- [ ] **T09** — `CONTEXT.md` **Role slot** glossary

### Done when (slice gates)

- [ ] Leader can set Audio capacity 2, assign two volunteers, see `2/2` fill badge
- [ ] Third assign rejected `ROLE_SLOTS_FULL`; duplicate volunteer rejected `VOLUNTEER_ALREADY_ON_ROLE_SLOT`
- [ ] `pnpm test` green (API + web-next)
- [ ] No roster path relies on one-assignment-per-role `.find()`

## Out of scope (v1)

- Public event multi-ministry capacity editor
- Ministry hierarchy / volunteer skills
- `MinistryRole.defaultCapacity` (P2 ORG-SLOT-01)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/165
