# Role slot capacity per event — Validation

**Date**: 2026-06-30 (re-verify iteration 1)
**Spec**: `.specs/features/role-slot-capacity-per-event/spec.md`
**Diff range**: `main...feat/165-role-slot-capacity-per-event` (`a2f3f5c`..`a76dbc8`, 11 commits)
**Verifier**: independent sub-agent (author ≠ verifier)
**New commits since prior FAIL**: `baed38d`, `a76dbc8`

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T01  | ✅ Done | Schema, migration, seed on private create |
| T02  | ✅ Done | Assignment guards + unit/e2e |
| T03  | ✅ Done | PATCH role-capacities |
| T04  | ✅ Done | Event detail payload + web-next types |
| T05  | ✅ Done | `buildRosterRows` multi-slot |
| T06  | ✅ Done | Roster UI slotKey busy/rows |
| T07  | ✅ Done | Capacity editor + i18n files |
| T08  | ✅ Done | Playwright multi-slot smoke |
| T09  | ✅ Done | CONTEXT.md glossary + issue archive |

---

## Prior Gap Closure (iteration 1)

| # | Prior gap | Evidence (file:line + assertion) | Status |
| - | --------- | ---------------------------------- | ------ |
| 1 | GET `/events/:id` `roleCapacities` on private event | `role-slot-capacity.e2e-spec.ts:138-140` — `expect(res.body.roleCapacities).toEqual([{ ministryId, roleId, capacity: 1 }])` | ✅ CLOSED |
| 2 | Retired role excluded from capacity seed | `role-slot-capacity.e2e-spec.ts:179-183` — `expect(capacities).toHaveLength(1)`; `toMatchObject({ roleId: activeRole.id, capacity: 1 })` (retired `Legacy Door` absent) | ✅ CLOSED |
| 3 | Void-then-refill at capacity | `role-slot-capacity.e2e-spec.ts:186-215` — fill 2 → void first → assign memberC `.expect(201)` | ✅ CLOSED |
| 4 | Per-slot `busyRoleKey` behavior test | `RosterByEventSection.behavior.test.tsx:103-125` — `busyRoleKey: 'evt-1:role-audio:1'` → `assignButtons[0]` not disabled, `assignButtons[1]` disabled | ✅ CLOSED |
| 5 | PATCH capacity &lt; 1 → `INVALID_ROLE_CAPACITY` | `role-slot-capacity.e2e-spec.ts:218-232` — `capacity: 0` → `.expect(400)`; `expect(res.body.code).toBe('INVALID_ROLE_CAPACITY')` | ✅ CLOSED |
| 6 | Capacity editor success path (change to 2, see second row) | `schedulingEventDetail.behavior.test.tsx:134-144` — type `2`, save → `findByText('Greeter (2)')`; `toHaveTextContent('0/2 filled')`; `getAllByRole('button', { name: /assign/i })` length 2 | ✅ CLOSED |
| 7 | pt-BR capacity editor strings | `schedulingEventDetail.behavior.test.tsx:147-163` — `findByRole('heading', { name: 'Vagas por função neste evento' })`; `getByRole('button', { name: 'Salvar vagas' })` | ✅ CLOSED |

**All 7 prior gaps closed with automated evidence.**

---

## Spec-Anchored Acceptance Criteria

### SCHED-SLOT-01 — Per-event role capacity

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN a **private Event** is created THEN seed `EventRoleCapacity` per non-retired **Role** with `capacity` **1** | One row per active catalog role, `capacity: 1` | `events-create-private.e2e-spec.ts:120-124` — `expect(capacities).toHaveLength(1)`; `toMatchObject({ roleId: role.id, capacity: 1 })` | ✅ PASS |
| WHEN **Leader**/**Admin** updates capacities THEN `capacity` integer ≥ 1 | PATCH accepts valid integers; invalid values rejected | `role-slot-capacity.e2e-spec.ts:284-300` — PATCH `capacity: 3` `.expect(200)`; `expect(res.body.roleCapacities).toEqual([{ roleId, capacity: 3 }])`; `:218-232` — `capacity: 0` → `INVALID_ROLE_CAPACITY` | ✅ PASS |
| WHEN `capacity` set below filled count THEN reject `CAPACITY_BELOW_FILLED_SLOTS` | HTTP 400, `code: 'CAPACITY_BELOW_FILLED_SLOTS'` | `role-slot-capacity.e2e-spec.ts:332-342` — `expect(res.body.code).toBe('CAPACITY_BELOW_FILLED_SLOTS')` | ✅ PASS |
| WHEN **Role** is **retired** THEN new private events SHALL NOT receive capacity row | No `EventRoleCapacity` for retired roles on create | `role-slot-capacity.e2e-spec.ts:143-183` — active + retired roles seeded; `expect(capacities).toHaveLength(1)` for active only | ✅ PASS |
| WHEN event detail read THEN include `roleCapacities` | Response includes `roleCapacities` array for ministry context | `role-slot-capacity.e2e-spec.ts:128-140` — GET private event → populated `roleCapacities`; `events.e2e-spec.ts:127` — public returns `roleCapacities: []` | ✅ PASS |

### SCHED-SLOT-02 — Assignment guards

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN active count **<** `capacity` THEN create proceeds | HTTP 201 when guards pass | `role-slot-capacity.e2e-spec.ts:239-251` — two `.expect(201)` at capacity 2; `scheduling-rules.test.ts:104-110` — `toMatchObject({ ok: true })` when count 1 &lt; capacity 2 | ✅ PASS |
| WHEN active count ≥ `capacity` THEN reject `ROLE_SLOTS_FULL` | HTTP 400, `code: 'ROLE_SLOTS_FULL'` | `role-slot-capacity.e2e-spec.ts:253-260` — `expect(res.body.code).toBe('ROLE_SLOTS_FULL')`; `scheduling-rules.test.ts:95-102` — `toMatchObject({ ok: false, code: 'ROLE_SLOTS_FULL' })` | ✅ PASS |
| WHEN same **Volunteer** already on role THEN reject `VOLUNTEER_ALREADY_ON_ROLE_SLOT` | HTTP 400, stable code | `role-slot-capacity.e2e-spec.ts:274-281` — `expect(res.body.code).toBe('VOLUNTEER_ALREADY_ON_ROLE_SLOT')`; `scheduling-rules.test.ts:82-92` — `code: 'VOLUNTEER_ALREADY_ON_ROLE_SLOT'` | ✅ PASS |
| WHEN voiding assignment THEN capacity unchanged; new assign MAY fill slot | Void does not change capacity; assign after void succeeds | `role-slot-capacity.e2e-spec.ts:186-215` — fill 2 → void → third volunteer `.expect(201)` | ✅ PASS |

### SCHED-SLOT-03 — Leader roster UI (web-next)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN roster loads THEN render **capacity** rows per **Role** | N rows per role from capacity | `leaderQueries.test.ts:169-177` — `expect(roster).toHaveLength(2)` (capacity 2, 0 assigns) | ✅ PASS |
| WHEN slot has **Assignment** THEN show label, name, initials, **Release** | Volunteer name, avatar initials, release button | `RosterByEventSection.behavior.test.tsx:60-61` — `getByText('Sarah Chen')`, `getByText('SC')`; `:76-77` — release handler with `assignmentId` | ✅ PASS |
| WHEN slot unfilled THEN "Unfilled" + **Assign** | Localized unfilled label and assign CTA | `RosterByEventSection.behavior.test.tsx:67-68` — `getByText('Unfilled')`; `getByRole('button', { name: /assign/i })` | ✅ PASS |
| WHEN fill badge renders THEN `filled/total` sums slots | Cross-role slot totals (e.g. 5) | `leaderQueries.test.ts:231` — `expect(rosterFillCounts(roster)).toEqual({ filled: 0, total: 5 })`; `RosterByEventSection.behavior.test.tsx:54` — `toHaveTextContent('1/2 filled')` | ✅ PASS |
| WHEN assign/release in flight THEN busy key `eventId:roleId:slotIndex` | Per-slot busy isolation | `RosterByEventSection.behavior.test.tsx:103-125` — only busy slot's assign button disabled | ✅ PASS |
| WHEN multiple slots THEN disambiguating label | e.g. `Audio (1)`, `Audio (2)` | `RosterByEventSection.behavior.test.tsx:98-99` — `getByText('Audio (1)')`, `getByText('Audio (2)')`; Playwright `scheduling-event-detail.spec.ts:23-24` | ✅ PASS |

### SCHED-SLOT-04 — Capacity editor UI

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN **Leader** opens private event detail THEN adjust per-role capacity | Numeric input/stepper visible and editable | `schedulingEventDetail.behavior.test.tsx:134-139` — `findByRole('spinbutton')`; clear + type `2`; save succeeds | ✅ PASS |
| WHEN save fails `CAPACITY_BELOW_FILLED_SLOTS` THEN inline error (ADR 0001) | Alert with error copy | `schedulingEventDetail.behavior.test.tsx:62-66` — `findByRole('alert')` + `/cannot reduce slots below the number already filled/i` | ✅ PASS |
| WHEN strings shown THEN pt-BR and en updated | Both locale files + rendered pt-BR copy | `locales/en/scheduling.json:110-120` (`capacityEditor.*`); `locales/pt-BR/scheduling.json:110-120`; `schedulingEventDetail.behavior.test.tsx:158-163` — pt-BR heading + save button | ✅ PASS |

### ORG-SLOT-01 — Catalog default capacity (P2)

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| P2 deferred | Out of scope T01–T09 | `tasks.md` traceability | N/A (deferred) |

### SCHED-SLOT-05 — Tests & docs

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| API e2e: capacity 2 → two OK → third `ROLE_SLOTS_FULL`; duplicate volunteer; reduce below filled | All three scenarios green | `role-slot-capacity.e2e-spec.ts:235-260`, `:263-281`, `:314-342` | ✅ PASS |
| web-next: `buildRosterRows` + roster behavior assert multi-slot rows and fill counts | Unit + behavior coverage | `leaderQueries.test.ts:169-231`; `RosterByEventSection.behavior.test.tsx:80-125` | ✅ PASS |
| CONTEXT.md defines **Role slot** | Glossary entry distinct from Role/Assignment | `CONTEXT.md:33-34`, `:134-136` — **Role slot** definition | ✅ PASS (doc review) |

**Status**: ✅ **21/21 ACs** with matching evidence (ORG-SLOT-01 excluded as deferred P2)

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `apps/web-next/src/leader/buildRosterRows.ts` | Reverted to single row per catalog role (`.find()`-style, ignores capacity loop) | ✅ Killed — `leaderQueries.test.ts` 3 failures (`expands capacity 2`, `two assignments`, `mixed roles`) |
| 2 | `apps/api/src/scheduling/scheduling.service.ts:466-475` | Bypassed `validateRoleSlotGuards` before create | ✅ Killed — `role-slot-capacity.e2e-spec.ts` 2 failures (`ROLE_SLOTS_FULL`, `VOLUNTEER_ALREADY_ON_ROLE_SLOT`) |
| 3 | `apps/api/src/scheduling/scheduling-rules.ts:157` | Flipped `activeAssignmentCount >= capacity` → `>` | ✅ Killed — `scheduling-rules.test.ts` `rejects assignment when role slots are full` fails |

**Sensor depth**: lightweight (3 targeted mutations)
**Result**: 3/3 killed — ✅ PASS
**Scratch state**: all mutations discarded; working tree clean (feature files restored via `git checkout`)

---

## Interactive UAT Results (if performed)

Not performed — automated verification sufficient per spec scope.

---

## Code Quality

| Principle        | Status |
| ---------------- | ------ |
| Minimum code     | ✅ Focused schema, guards, roster expansion |
| Surgical changes | ✅ Touches API events/scheduling + web-next leader paths only |
| No scope creep   | ✅ `apps/web` unchanged; ORG-SLOT-01 deferred |
| Matches patterns | ✅ NestJS service guards, RTL + userEvent, Playwright smoke |
| Spec-anchored outcome check | ✅ All 21 ACs have file:line assertions |
| Per-layer Coverage Expectation | ✅ API e2e + unit + web-next behavior + Playwright |
| Every test maps to spec requirement | ✅ New gap-closure tests trace to SCHED-SLOT ACs |
| Documented guidelines followed | ✅ `AGENTS.md` (userEvent in behavior tests, DATABASE_URL for e2e) |

---

## Edge Cases

- [x] Missing `roleCapacities` row defaults to capacity 1 — `buildRosterRows.ts:22-23`; `leaderQueries.test.ts:153-165`
- [x] Retired roles excluded from roster expansion — `buildRosterRows.ts:11` filters `!role.retired`
- [x] Retired role excluded from new event capacity seed — `role-slot-capacity.e2e-spec.ts:143-183`
- [x] Public event detail returns empty `roleCapacities` — `events.e2e-spec.ts:127`
- [x] Non-leader PATCH rejected — `role-slot-capacity.e2e-spec.ts:345-358` (`ADMIN_NOT_ACCREDITED`)

---

## Gate Check

- **Gate command**: `export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onda?schema=public && pnpm test`
- **Playwright command**: `pnpm --filter @onda/web-next test:e2e`
- **Result**: ✅ PASS (retry after transient DB flake on first run)
  - API unit: 9 passed (2 suites)
  - API e2e: 170 passed (32 suites) — includes 9 new `role-slot-capacity.e2e-spec.ts` cases
  - web (legacy): 144 passed (47 files)
  - web-next unit: 114 passed (32 files)
  - **Monorepo total**: 437 passed, 0 failed, 0 skipped
  - Playwright smoke: 4 passed
- **Note**: First full-suite run hit unrelated environmental flakes (`church-metadata` timeout, `campus-metadata` FK during parallel e2e). Postgres confirmed running; immediate retry green.
- **Skipped tests**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SCHED-SLOT-01 | ⚠️ Gaps (AC2, AC4, AC5) | ✅ Verified |
| SCHED-SLOT-02 | ⚠️ Gap (AC4 void-refill) | ✅ Verified |
| SCHED-SLOT-03 | ⚠️ Gap (AC5 busy key) | ✅ Verified |
| SCHED-SLOT-04 | ⚠️ Spec-precision gaps | ✅ Verified |
| SCHED-SLOT-05 | ✅ Verified | ✅ Verified |
| ORG-SLOT-01 | Deferred | Deferred (P2) |

---

## Summary

**Overall**: ✅ **PASS**

**Spec-anchored check**: 21/21 ACs matched spec outcome (ORG-SLOT-01 excluded)
**Prior gaps**: 7/7 closed (`baed38d`, `a76dbc8`)
**Sensor**: 3/3 mutations killed
**Gate**: 437 passed, 0 failed; Playwright 4/4

**Remaining ranked gaps**: none

**Next steps**: Ready for merge from verification perspective.
