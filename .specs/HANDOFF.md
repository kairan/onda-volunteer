# Session handoff (2026-07-09)

## Completed this session

1. **#174 Phase 4 TLC hygiene** — spec/tasks/README/validation, tracker, STATE, issue #175 aligned with merged PR [#178](https://github.com/kairan/onda-volunteer/pull/178).
2. **Regional campuses** — PR [#179](https://github.com/kairan/onda-volunteer/pull/179): seed/demo data uses real Onda Dura campuses (Onda Brasil / Onda USA / Onda Europa); review addressed; CI green; ready for merge.

## Next agent action

1. **Merge PR [#179](https://github.com/kairan/onda-volunteer/pull/179)** (regional campuses).
2. Start Phase 5 cutover **[#175](https://github.com/kairan/onda-volunteer/issues/175)** (T17) — label `ready-for-agent` when picking up.

## Backlog (web-onda)

| Issue | Phase | Tasks | Status |
|------:|-------|-------|--------|
| [#175](https://github.com/kairan/onda-volunteer/issues/175) | Cutover | T17 | Open — unblocked |

## Blockers

_(none)_

## HITL

- **1440px layout sign-off** (design.md §9) — ✅ signed 2026-07-04 (volunteer + leader).

## Known deferrals (not blocking #175)

- `/scheduling/events/new` — public event create placeholder (accredited-admin)
- `frontend-migration-web-next` TLC archive (T17 / AD-001)
- Roster nav dedupe (PR #171 note)
- Shared monorepo package for campus catalog (API + web `ondaCampuses.ts` stay in sync via comments for now)

## Doc map (quick)

| Need | Path |
|------|------|
| Active TLC | `.specs/features/frontend-restart-serve-well-base/` |
| Shipped #174 | `docs/issues/done/174-web-onda-phase-4-admin.md` |
| Shipped #173 | `docs/issues/done/173-web-onda-phase-3-leader.md` |
| Shipped #172 | `docs/issues/done/172-web-onda-phase-2-volunteer.md` |
| Next execute | `docs/issues/175-web-onda-phase-5-cutover.md` |
| Campus seed | `apps/api/prisma/ondaCampuses.ts` |
