# 108 — Backlog: ministry archive / retirement (ORG-STRUCT-06)

**Type:** Feature (backlog — not ready for agent)  
**Label:** _(none — do not apply `ready-for-agent` until Design/Tasks complete)_  
**Blocked by:** schema + cross-module guard design  
**TLC:** `.specs/features/organization-structure-administration/` (deferred P2 story)

## What to build (future)

Accredited **Admin** archives a **Ministry** so new scheduling/membership writes are blocked while history remains readable. Requires `Ministry` archive field + write guards across Organization, Scheduling, Availability.

## Why deferred

P2 Execute focuses on **Campus** metadata ([#107](https://github.com/kairan/onda-volunteer/issues/107)). Archive semantics are a separate slice (no `archived` on `Ministry` today).

## Acceptance criteria (from spec — for future Specify/Design)

- [ ] Archive blocks new **Events**, **Assignments**, memberships, role changes, **Unavailability**
- [ ] Historical rows still show **Ministry** name
- [ ] Archived **Ministries** hidden from active scheduling selectors

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/108
