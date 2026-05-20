# 48 — API: **Scheduling** invariants module (tech debt)

**Type:** Tech debt (post-MVP hardening)  
**Bounded context:** **Scheduling** (+ reads **Availability** rules)  
**Index:** `docs/issues/architecture-debt.md` (candidate **#2**)

## Problem

Roster rules from `CONTEXT.md` (half-open **UTC** overlap, **Active** **Ministry membership**, **Unavailability**, **Retired** **Role**, assignment window inside **Event**) live inside a large Nest **implementation** fused with Prisma. The primary test **seam** is full-stack e2e; helpers such as overlap detection are not exercised in isolation. Bulk **Unavailability** and several assignment guard codes lack dedicated coverage.

## What to build

Introduce a deep **Scheduling** rules module behind a narrow **interface**:

- `intervalsOverlapHalfOpen(a0, a1, b0, b1)` — canonical **UTC** half-open semantics per `CONTEXT.md`
- `canAssignVolunteer(...)` — membership, **Unavailability**, cross-**Assignment** conflict, **Role** **Retired**, event window bounds
- Optional: shared instant parsing with consistent error codes

Keep the existing Nest service as an orchestration **adapter** over Prisma that calls the rules module.

## Acceptance criteria

- [ ] Overlap and “may assign” decisions are unit-testable without PostgreSQL.
- [ ] Existing e2e specs for assign, release, overlap, and **Unavailability** block remain green (no behavior change).
- [ ] Bulk **Unavailability** create path has unit or focused tests for multi-ministry validation failures.
- [ ] No new HTTP surface; internal refactor only.

## When to schedule

- **After** slice **36** (shell roster writes) ships, **or**
- **During** slice **38** if bulk mirror work exposes untested validation paths.

## Blocked by

- Slice **36** — Event roster writes (GitHub [#38](https://github.com/kairan/onda-volunteer/issues/38)) — recommended, not strict

## Out of scope

- Request-scoped auth (**49**)
- Moving **`POST /events/:id/assignments`** (**51**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/54
