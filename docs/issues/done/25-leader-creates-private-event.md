# 25 — Leader creates Private Event for led Ministry

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **15**, **28**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

**Leader** (or accredited **Admin**) creates a **Private event** owned by a **Ministry** they may steward: persisted **Event** with **PRIVATE** kind, visibility limited per `CONTEXT.md`, listed on scheduling surfaces for eligible viewers only.

## Acceptance criteria

- [ ] Only authorized **Leader**/**Admin** can create for the target **Ministry**.
- [ ] **Private event** does not appear to unrelated ministry members in list API tests.
- [ ] UI create entry point lives under scheduling/ministries flow inside the shell.
- [ ] Automated tests cover visibility and one happy create.

## Blocked by

- Slice **20** — Scheduling Event list (GitHub **#9**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/15
