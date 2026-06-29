# Role slot capacity per event — Specification

## Status

- **Phase:** Specify complete (2026-06-27)
- **Design:** [design.md](./design.md)
- **Decisions:** [context.md](./context.md)
- **Tasks:** [tasks.md](./tasks.md)
- **Related:** [ui-refresh-onda-brand](../ui-refresh-onda-brand/spec.md) (UI-LEAD-01..03), [CONTEXT.md](../../../CONTEXT.md)

## Problem Statement

Churches roster multiple volunteers in the same **Role** for one **Event** (e.g. 2× Audio, 2× Projection, 1× Lighting in Technical base). The product models **Role** as a ministry catalog entry and **Assignment** as one volunteer on one role — but the leader roster UI assumes **at most one assignment per role per event** (`buildRosterRows` uses `.find()`). Workarounds use duplicate catalog names (`Audio 1`, `Audio 2`), which pollutes the role catalog and breaks the domain model (functions are **Roles**, not sub-ministries).

The API does not enforce a one-slot limit; extra assignments are **hidden** in web-next — a correctness bug.

## Goals

- [ ] **Leaders** define how many **Role slots** each catalog **Role** needs **per Event** (e.g. Easter service: 3× Audio).
- [ ] **Assignment** creation respects slot capacity and blocks duplicate volunteer on the same role+event.
- [ ] **web-next** leader roster renders N rows per role, correct fill badges, assign/release per slot.
- [ ] Align shipped UI-LEAD copy ("open slots", fill ratio) with real slot math.
- [ ] pt-BR + en for new/changed strings.

## Out of Scope

| Item | Reason |
|------|--------|
| Ministry hierarchy (base → sub-team) | Bases are ministries; functions are roles — see context.md |
| Volunteer skills / qualified roles | Leader picks role at assign time; no skills API |
| Named slots (`Audio A`, `Audio B` entity) | Derived slotIndex sufficient for v1 |
| Public event capacity editor (multi-ministry) | Deferred phase 2 — see context.md |
| `apps/web` parity | web-next is migration target (#148) |
| Serve Well visual port | Separate workstream; consumes this API when roster is wired |
| Accept/Decline assignment workflow | Not in domain model |
| Migrating `Audio 1`/`Audio 2` duplicate role names | Manual admin cleanup; document anti-pattern |

---

## Requirements — Scheduling & API

### SCHED-SLOT-01 ⭐ MVP — Per-event role capacity

**User Story**: As a **Leader**, I want to set how many slots each **Role** needs on a specific **Event**, so I can roster 2× Audio without duplicating the catalog.

**Acceptance Criteria**:

1. WHEN a **private Event** is created for a **Ministry** THEN the system SHALL create `EventRoleCapacity` rows for each non-**retired** **Role** in that ministry's catalog with `capacity` default **1**.
2. WHEN an authorized **Leader** or accredited **Admin** updates capacities for `(eventId, ministryId)` THEN each **Role** SHALL have `capacity` as an integer ≥ 1.
3. WHEN `capacity` is set below the count of active (non-voided) **Assignments** for that `(eventId, ministryId, roleId)` THEN the system SHALL reject with stable code `CAPACITY_BELOW_FILLED_SLOTS`.
4. WHEN a **Role** is **retired** THEN existing event capacities and history remain; new private events SHALL NOT receive a capacity row for that role.
5. WHEN event detail is read THEN the response SHALL include `roleCapacities` for the requesting ministry context (or church-wide for admin reads as today).

### SCHED-SLOT-02 ⭐ MVP — Assignment guards

**User Story**: As the system, I must enforce slot limits so rosters stay consistent with configured capacity.

**Acceptance Criteria**:

1. WHEN active assignment count for `(eventId, ministryId, roleId)` is **less than** `capacity` THEN create assignment SHALL proceed if existing guards pass (membership, unavailability, window, retired role).
2. WHEN active assignment count ≥ `capacity` THEN create assignment SHALL reject with `ROLE_SLOTS_FULL`.
3. WHEN the same **Volunteer** already has an active assignment for the same `(eventId, ministryId, roleId)` THEN create assignment SHALL reject with `VOLUNTEER_ALREADY_ON_ROLE_SLOT`.
4. WHEN voiding an assignment THEN slot capacity unchanged; a new assignment MAY fill the freed slot.

### SCHED-SLOT-03 ⭐ MVP — Leader roster UI (web-next)

**User Story**: As a **Leader**, I want the roster to show every slot so I know what is filled and what is open.

**Acceptance Criteria**:

1. WHEN roster data loads THEN the UI SHALL render **capacity** rows per **Role** (not one row per catalog role only).
2. WHEN a slot has an **Assignment** THEN the row SHALL show **Role** label, volunteer name, initials avatar, and **Release**.
3. WHEN a slot has no assignment THEN the row SHALL show "Unfilled" (localized) and **Assign**.
4. WHEN the fill badge renders THEN `filled/total` SHALL sum **slots** across roles (e.g. Audio×2 + Projection×2 + Lighting×1 → total 5).
5. WHEN assign or release is in flight THEN busy state SHALL key on `eventId:roleId:slotIndex`, not `roleId` alone.
6. WHEN more than one slot exists for a role THEN rows MAY show a disambiguating label (e.g. role name + slot index) — copy in i18n.

### SCHED-SLOT-04 ⭐ MVP — Capacity editor UI

**User Story**: As a **Leader**, I want to adjust slot counts on the event before or while rostering.

**Acceptance Criteria**:

1. WHEN a **Leader** opens event detail for a private **Event** they steward THEN they SHALL adjust per-role capacity (numeric input or stepper).
2. WHEN save fails (e.g. `CAPACITY_BELOW_FILLED_SLOTS`) THEN inline error feedback SHALL appear per ADR 0001.
3. WHEN strings are shown THEN pt-BR and en locales SHALL be updated.

### ORG-SLOT-01 P2 — Catalog default capacity

**User Story**: As an **Admin**, I want default slot counts on new events from the role catalog.

**Acceptance Criteria**:

1. WHEN `MinistryRole.defaultCapacity` is set THEN new private events SHALL seed `EventRoleCapacity.capacity` from that value (fallback 1).
2. WHEN an event already exists THEN changing catalog default SHALL NOT retroactively change event capacities.

---

## Requirements — Engineering

### SCHED-SLOT-05 ⭐ MVP — Tests & docs

1. WHEN API e2e runs THEN scenarios SHALL cover: capacity 2 → two assigns OK → third rejects `ROLE_SLOTS_FULL`; duplicate volunteer rejects `VOLUNTEER_ALREADY_ON_ROLE_SLOT`; reduce capacity below filled rejects.
2. WHEN web-next tests run THEN `buildRosterRows` and roster behavior tests SHALL assert multi-slot rows and fill counts.
3. WHEN feature ships THEN [`CONTEXT.md`](../../../CONTEXT.md) SHALL define **Role slot** distinct from **Role** and **Assignment**.

---

## Implicit requirements (dimensions sweep)

| Dimension | Resolution |
|-----------|------------|
| Input validation | `capacity` integer ≥ 1; PATCH must include at least one role update |
| Partial failure | PATCH capacities transactional per request (all or nothing) |
| Idempotency | Re-posting same capacity values is safe (200) |
| Auth | Leader on ministry or Admin accredited for church — mirror existing assign auth |
| Concurrency | Last-write-wins on capacity PATCH; assign uses DB count at create time (acceptable race: rare, document) |
| Data lifecycle | `EventRoleCapacity` cascades on event delete; capacities kept for cancelled events (assignments voided separately) |
| Observability | N/A — use existing API error codes |
| Public events v1 | No capacity rows required; roster treats missing row as capacity 1 |

---

## Assumptions

See [context.md](./context.md). Public event multi-ministry capacity editing is **out of scope v1**.
