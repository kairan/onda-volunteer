# Role slot capacity per event — Validation

**Feature:** `role-slot-capacity-per-event` (#165)  
**Verdict:** PASS  
**Date:** 2026-06-30  
**Diff range:** `a2f3f5c`..`bc4ec69` (9 commits on `feat/165-role-slot-capacity-per-event`)

## Gate results

| Gate | Command | Result |
|------|---------|--------|
| API unit + e2e | `pnpm --filter @onda/api test` | PASS |
| web-next unit | `pnpm --filter @onda/web-next test` | PASS (111 tests) |
| web-next Playwright smoke | `pnpm --filter @onda/web-next test:e2e` | PASS (4 tests) |

## Spec-anchored coverage (selected ACs)

| AC | Evidence | Spec outcome |
|----|----------|--------------|
| SCHED-SLOT-01 AC1 seed on private create | `apps/api/test/events-create-private.e2e-spec.ts` — `expect(capacities).toHaveLength(1)` | capacity 1 per active role |
| SCHED-SLOT-02 ROLE_SLOTS_FULL | `apps/api/test/role-slot-capacity.e2e-spec.ts` — `expect(res.body.code).toBe('ROLE_SLOTS_FULL')` | third assign rejected |
| SCHED-SLOT-02 duplicate volunteer | `role-slot-capacity.e2e-spec.ts` — `VOLUNTEER_ALREADY_ON_ROLE_SLOT` | same volunteer blocked |
| SCHED-SLOT-03 multi-slot rows | `leaderQueries.test.ts` — capacity 2 → `toHaveLength(2)` | N rows per role |
| SCHED-SLOT-03 fill badge | `RosterByEventSection.behavior.test.tsx` — `1/2 filled` | slot-based totals |
| SCHED-SLOT-04 capacity editor error | `schedulingEventDetail.behavior.test.tsx` — `findByRole('alert')` | inline `CAPACITY_BELOW_FILLED_SLOTS` |
| SCHED-SLOT-05 Playwright | `e2e/scheduling-event-detail.spec.ts` — `2/2 filled` | multi-slot smoke |

## Discrimination sensor

| Mutant | Target | Tests killed? |
|--------|--------|---------------|
| `.find()` one assignment per role in `buildRosterRows` | `apps/web-next/src/leader/buildRosterRows.ts` | Yes — `leaderQueries.test.ts` capacity-2 cases fail |
| Skip slot guard before create | `scheduling.service.ts` | Yes — `role-slot-capacity.e2e-spec.ts` |

## Gaps

None blocking ship. Public-event capacity editor remains deferred per spec.
