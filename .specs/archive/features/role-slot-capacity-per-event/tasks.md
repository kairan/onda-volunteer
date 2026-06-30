# Role slot capacity per event — Tasks

**Design**: [./design.md](./design.md)  
**Spec**: [./spec.md](./spec.md)  
**Status**: Execute complete (2026-06-30)

## GitHub issue

| Issue | Tasks | Summary |
|------:|-------|---------|
| [#165](https://github.com/kairan/onda-volunteer/issues/165) | T01–T09 | Role slot capacity per event (SCHED-SLOT-01..05) |

Issue spec: [`docs/issues/165-role-slot-capacity-per-event.md`](../../../docs/issues/165-role-slot-capacity-per-event.md)

---

## Execution plan

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09
```

Sequential API foundation first, then web-next read model, roster UI, capacity editor, e2e, docs.

---

## Task breakdown

### T01: Schema + seed capacities on private event create

**What**: Add `EventRoleCapacity` model, migration with backfill for existing private events, seed rows when creating a private **Event** (capacity 1 per active **Role**).

**Where**: `apps/api/prisma/schema.prisma`, new migration, `apps/api/src/events/events.service.ts`

**Requirements**: SCHED-SLOT-01 (AC 1, 4)

**Done when**:

- [x] Migration applies cleanly on empty and seeded DB
- [x] Creating private event returns event with capacities seeded
- [x] API e2e: new event has one capacity row per active role

**Verify**: `pnpm --filter @onda/api test:e2e` (relevant event create spec)

---

### T02: Assignment guards (capacity + duplicate volunteer)

**What**: Before assignment create, enforce `ROLE_SLOTS_FULL` and `VOLUNTEER_ALREADY_ON_ROLE_SLOT`; pure functions in `scheduling-rules.ts` + unit tests.

**Where**: `apps/api/src/scheduling/scheduling.service.ts`, `scheduling-rules.ts`, `scheduling-rules.test.ts`

**Requirements**: SCHED-SLOT-02

**Done when**:

- [x] Unit tests cover at-capacity and duplicate volunteer
- [x] API e2e: 2 assigns at capacity 2 OK; 3rd fails `ROLE_SLOTS_FULL`
- [x] API e2e: same volunteer twice same role fails `VOLUNTEER_ALREADY_ON_ROLE_SLOT`

**Verify**: `pnpm --filter @onda/api test` + e2e

---

### T03: PATCH role capacities endpoint

**What**: `PATCH /events/:eventId/role-capacities` with validation `capacity >= filled count`; leader/admin auth. Register as `@Patch(':id/role-capacities')` on `EventsController` — do not overload existing `@Patch(':id')` `editEvent`.

**Where**: `apps/api/src/events/events.controller.ts`, `events.service.ts`, e2e tests

**Requirements**: SCHED-SLOT-01 (AC 2, 3)

**Done when**:

- [x] Increase capacity 1→2 persists
- [x] Decrease below filled count returns `CAPACITY_BELOW_FILLED_SLOTS`
- [x] Non-leader rejected

**Verify**: API e2e PATCH scenarios

---

### T04: Event detail payload + web-next types

**What**: Include `roleCapacities` in event detail API response; update `eventDetailPayload.ts` and leader queries.

**Where**: `apps/api/src/events/events.service.ts`, `apps/web-next/src/eventDetailPayload.ts`, `leader/eventDetailQuery.ts`

**Requirements**: SCHED-SLOT-01 (AC 5)

**Done when**:

- [x] Event detail JSON includes `roleCapacities`
- [x] web-next types compile; query tests pass

**Verify**: `pnpm typecheck:web-next` + unit tests touching payload

---

### T05: Refactor `buildRosterRows` for multi-slot

**What**: Implement slot expansion algorithm from design.md; update `RosterRow` type; fix `rosterFillCounts` / `countOpenSlotsAcrossRosters`.

**Where**: `apps/web-next/src/leader/buildRosterRows.ts`, `types.ts`, `leaderQueries.test.ts`

**Requirements**: SCHED-SLOT-03 (AC 1, 4)

**Done when**:

- [x] Unit test: capacity 2, 0 assigns → 2 unfilled rows
- [x] Unit test: capacity 2, 2 assigns → 2 filled rows; fill 2/2
- [x] Unit test: mixed roles sum correct total slots

**Verify**: `pnpm --filter @onda/web-next test` (leaderQueries)

---

### T06: Roster UI — slots, assign/release, busy keys

**What**: Replace `${eventId}:${roleId}` `rosterRoleKey` busy keys with per-slot `slotKey` everywhere capacity > 1 matters. Today both `LeaderSchedulingPage.tsx` and `RosterByEventSection.tsx` define/use `rosterRoleKey(eventId, roleId)` — update **both** call sites plus `schedulingEventDetail.tsx`. Assign targets an unfilled slot row; release unchanged (by `assignmentId`).

**Where**: `apps/web-next/src/components/RosterByEventSection.tsx`, `routes/schedulingEventDetail.tsx`, `routes/LeaderSchedulingPage.tsx`, behavior tests

**Requirements**: SCHED-SLOT-03 (AC 2, 3, 5, 6)

**Done when**:

- [x] Behavior tests: two Audio rows visible when capacity 2
- [x] Assign on second unfilled row succeeds
- [x] `busyRoleKey` / row `key` use `slotKey` in `RosterByEventSection` and `LeaderSchedulingPage` (no `${eventId}:${roleId}` for multi-slot rows)

**Verify**: `RosterByEventSection.behavior.test.tsx`, `schedulingEventDetail.behavior.test.tsx`

---

### T07: Capacity editor on event detail + i18n

**What**: UI to PATCH capacities per role; inline errors; pt-BR + en strings.

**Where**: `schedulingEventDetail.tsx`, `i18n/locales/*/scheduling.json`, optional mutation module

**Requirements**: SCHED-SLOT-04

**Done when**:

- [x] Leader can set Audio to 2 and see second row after refetch
- [x] Error message shown for `CAPACITY_BELOW_FILLED_SLOTS`

**Verify**: behavior test + manual or Playwright (T08)

---

### T08: Playwright smoke — multi-slot roster

**What**: E2e: create/configure event with Audio capacity 2, assign two volunteers, assert fill badge.

**Where**: `apps/web-next/e2e/scheduling-event-detail.spec.ts`, `e2e/apiMocks.ts` if needed

**Requirements**: SCHED-SLOT-03, SCHED-SLOT-05

**Done when**:

- [x] `pnpm test:e2e:web-next` green including new scenario

**Verify**: CI parity job `playwright-web-next`

---

### T09: CONTEXT.md glossary + issue doc archive prep

**What**: Add **Role slot** to `CONTEXT.md`; create/update `docs/issues/<#>-role-slot-capacity-per-event.md`; update `docs/issues/README.md`.

**Where**: `CONTEXT.md`, `docs/issues/`

**Requirements**: SCHED-SLOT-05 (AC 3)

**Done when**:

- [x] Glossary entry merged
- [x] Issue spec file matches GitHub issue number

**Verify**: Doc review; no code gate

---

## Slice gates (feature complete)

- [x] All SCHED-SLOT-01..05 acceptance criteria met
- [x] `pnpm test` green (API + web-next)
- [x] No leader roster path uses `.find()` one-assignment-per-role
- [x] `validation.md` written after TLC Verifier pass (post-Execute)

---

## Requirement traceability

| Requirement | Tasks |
|-------------|-------|
| SCHED-SLOT-01 | T01, T03, T04 |
| SCHED-SLOT-02 | T02 |
| SCHED-SLOT-03 | T05, T06, T08 |
| SCHED-SLOT-04 | T07 |
| SCHED-SLOT-05 | T02, T05, T06, T08, T09 |
| ORG-SLOT-01 (P2) | Future — not in T01–T09 |
