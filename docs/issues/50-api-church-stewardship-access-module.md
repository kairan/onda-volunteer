# 50 — API: church stewardship access module (tech debt)

**Type:** Tech debt (defer)  
**Bounded context:** **Organization** (stewardship **seam**)  
**Index:** `docs/issues/architecture-debt.md` (candidate **#1**)

## Problem

“What may this **Volunteer** see or do in this **Church** / **Ministry**?” is implemented separately in **Events** (`churchEventAccess`), **Organization** (`getAccessibleOrganizationContext`), and **Identity** (`assertLeaderCanActOnMinistry`). Same Prisma tables, three shapes — rules can drift when accreditation or visibility changes.

## What to build

One **Organization**-scoped module whose **interface** answers stewardship questions:

- View **Events** in a **Church**
- Lead a **Ministry**
- **Admin** accredited for a **Church**
- List accessible **Ministries** / **Churches** for context aggregation

**Events**, **Scheduling**, and **Identity** call this module instead of re-querying membership tables inline.

## Acceptance criteria

- [ ] Single implementation path for church-scoped visibility used by event list and event detail reads.
- [ ] Leader and **Admin** checks for mutations delegate to the same module (or thin wrappers).
- [ ] E2e for event visibility and leader assign paths remain green.
- [ ] No change to HTTP routes or response JSON shapes unless required for bug fixes.

## When to schedule

- When implementing **40–43** (new **Event** create/cancel flows) **if** adding a fourth copy of access queries — **or**
- Post **47** as consolidation sprint.

## Blocked by

None

## Out of scope

- New permission types not in `CONTEXT.md`
- Web org context provider (separate web concern)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/56
