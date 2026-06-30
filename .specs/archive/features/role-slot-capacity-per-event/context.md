# Role slot capacity per event — context & decisions

Captured during Specify (2026-06-27). Resolves gray areas for multiple roster slots per **Role** on a single **Event**.

## Domain background (church operations)

- **Ministry bases** (Technical, Communications, Support, Worship) map to flat **Ministry** rows — no parent/child hierarchy.
- Sub-areas such as Audio, Projection, Lighting, Guitar are **Role** catalog entries, not separate ministries.
- A volunteer may play different **Roles** on different Sundays (e.g. acoustic guitar one week, electric guitar the next) via separate **Assignments** — one membership in Worship, different `roleId` per event.
- Need: **two people on Audio** in the same service without duplicate catalog names (`Audio 1` / `Audio 2`).

## Locked decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Capacity scope | **Per event** — each **Event** may define how many slots each **Role** needs (Easter 3× Audio, normal Sunday 2×) | User confirmed; matches real church planning |
| Same volunteer, same role, same event | **Block** — reject `VOLUNTEER_ALREADY_ON_ROLE_SLOT` | User confirmed |
| Reduce capacity below filled slots | **Reject** — `CAPACITY_BELOW_FILLED_SLOTS`; leader must release first | Prevents orphaned assignments |
| Slot identity | **Derived** `slotIndex` 0..capacity−1 in UI; not persisted | Minimizes schema; stable sort by assignment `startsAtUtc`, then `id` |
| Private events | **In scope v1** — seed capacities on private **Event** create | Matches leader workflow today |
| Public events | **Deferred v1** — no capacity editor for multi-ministry public events until UX specified | Higher complexity; document in design |
| Catalog template | **P2** — optional `MinistryRole.defaultCapacity` seeds new events only | Override always on event |
| Workaround after ship | **Do not** add `Audio 1` / `Audio 2` duplicate roles when capacity exists | Anti-pattern in admin onboarding |

## Relationship to Serve Well / UI refresh

| Workstream | Relationship |
|------------|--------------|
| Serve Well port (`design-reference/serve-well`, `web-next`) | **Orthogonal** — visual/layout only; mock roster already shows multiple slots |
| `ui-refresh-onda-brand` UI-LEAD-01..03 | **Aligns** — fill ratio and open slots assume N slots per role |
| This feature | **Required** for roster to match prototype behavior with real APIs |

Port Serve Well in parallel; wire roster to `roleCapacities` before calling leader roster "done".

## Brownfield finding

Prisma/API **already allow** multiple `Assignment` rows with the same `eventId` + `roleId`. **web-next** truncates to one row via `buildRosterRows` `.find()`. Treat invisible duplicates as tech debt closed by capacity guards + roster refactor.

## Assumptions & open questions

| Item | Assumption (v1) |
|------|-----------------|
| Public event capacities | Not editable in v1; existing public roster uses implicit capacity 1 per active role until phase 2 |
| Existing duplicate assignments in DB | Backfill migration sets capacity = max(1, active assignment count per role+event); no auto-delete |
| Same volunteer, two different roles, same event, overlapping window | **Allowed** today (only cross-ministry overlap is guarded) — unchanged unless product requests block |
| Slot labels in UI | Show role name; optional suffix when capacity > 1 (e.g. "Audio (2)") — implementer choice in T06 |

## ADR / CONTEXT impact

- Update [`CONTEXT.md`](../../../CONTEXT.md) with **Role slot** glossary (task T09).
- No new ADR required unless public-event phase changes scheduling invariants.
