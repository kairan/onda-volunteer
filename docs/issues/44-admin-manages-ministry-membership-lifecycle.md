# 44 — Admin manages Ministry membership lifecycle

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **9–12**, **21**, **24**); `CONTEXT.md`  
**Architecture:** optional fold candidate **#5** — see `docs/issues/architecture-debt.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Give accredited **Admins** a **Church**-scoped way to add **Volunteers** to **Ministries**, move **Pending** memberships to **Active**, and deactivate memberships. Deactivation must void only future **Assignments** while preserving historical roster rows.

Backend voiding behavior is already implemented (`done/05`); this slice is primarily **Admin** UI and HITL review of lifecycle copy.

## Acceptance criteria

- [ ] Accredited **Admin** can add a **Volunteer** to a **Ministry** as **Pending** or **Active** within an accredited **Church**.
- [ ] Accredited **Admin** can move a **Pending** membership to **Active**.
- [ ] Accredited **Admin** can deactivate an **Active** membership within scope.
- [ ] Deactivation voids **Assignments** on **Events** whose scheduled end is still in the future and preserves past **Assignments**.
- [ ] Human review signs off lifecycle wording and support workflow expectations.

## Architecture hygiene (optional — fold #5)

Only if this slice touches the deactivate transaction implementation:

- [ ] Future **Assignment** voiding is invoked through **Scheduling** (service or shared domain operation), not ad-hoc Prisma updates duplicated in **Organization** — **or** document in the PR why the existing **Organization** implementation remains.

If the slice is UI-only over the current API, skip this criterion.

## Blocked by

None - can start immediately

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/46
