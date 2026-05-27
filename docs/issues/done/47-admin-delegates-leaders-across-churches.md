# 47 — Admin delegates Leaders across Churches

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **14**, **9–12**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Allow **Admins** to delegate **Leader** stewardship for explicit **Ministries**, including **Ministries** in more than one **Church** when the **Admin** is accredited. The slice should make authority ministry-by-ministry, not an implicit **Church**-wide or network-wide role.

## Acceptance criteria

- [ ] Accredited **Admin** can grant **Leader** stewardship for an explicit **Ministry** in an accredited **Church**.
- [ ] **Admin** cannot delegate leadership for **Churches** where they are not accredited.
- [ ] **Leader** authority remains **Ministry**-scoped even when a person leads **Ministries** across multiple **Churches**.
- [ ] Delegated **Leaders** can use existing **Leader**-scoped **Scheduling** and **Availability** actions for those **Ministries**.
- [ ] Human review signs off cross-**Church** delegation copy and permission boundaries.

## Blocked by

- issue **#54** — Admin manages Ministry membership lifecycle (GitHub **#46**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/47
