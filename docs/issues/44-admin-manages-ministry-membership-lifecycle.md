# 44 — Admin manages Ministry membership lifecycle

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **9–12**, **21**, **24**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Give accredited **Admins** a **Church**-scoped way to add **Volunteers** to **Ministries**, move **Pending** memberships to **Active**, and deactivate memberships. Deactivation must void only future **Assignments** while preserving historical roster rows.

## Acceptance criteria

- [ ] Accredited **Admin** can add a **Volunteer** to a **Ministry** as **Pending** or **Active** within an accredited **Church**.
- [ ] Accredited **Admin** can move a **Pending** membership to **Active**.
- [ ] Accredited **Admin** can deactivate an **Active** membership within scope.
- [ ] Deactivation voids **Assignments** on **Events** whose scheduled end is still in the future and preserves past **Assignments**.
- [ ] Human review signs off lifecycle wording and support workflow expectations.

## Blocked by

None - can start immediately

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/46
