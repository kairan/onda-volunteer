# 23 — Leader manages Volunteer Unavailability in led Ministry

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **17**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

**Leader**-scoped **Availability** writes: create or update **Unavailability** for **Volunteers** who have membership in a **Ministry** the **Leader** stewards. Minimal UI entry point (e.g. from **`/ministries`** or event roster) with permission checks server-side.

## Acceptance criteria

- [ ] **Leader** can write only for ministries they lead; **Admin** path unchanged or explicitly deferred with doc note.
- [ ] Target **Volunteer** must have membership in that **Ministry**.
- [ ] UI shows success/error feedback per ADR patterns.
- [ ] Automated tests cover authorization denial and one happy write.

## Blocked by

- Slice **18** — Time away list/create (GitHub **#8**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/13
