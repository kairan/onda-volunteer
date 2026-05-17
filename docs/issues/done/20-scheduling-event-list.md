# 20 — Scheduling hub: Church-scoped Event list

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **28**, **29**, **30**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Replace the **`/scheduling`** placeholder with a real **Event** index for the active **Church**: list API enforcing **Public** vs **Private** visibility (`CONTEXT.md`), shell page with list/table patterns, skeleton loading, empty state, and navigation into event detail. Times use active **Church** timezone framing.

## Acceptance criteria

- [ ] List endpoint respects visibility: **Private** only for ministry participants + accredited **Admin**; **Public** for coordinating ministries within the **Church**.
- [ ] **`/scheduling`** shows events for the shell’s active **Church** only.
- [ ] Each row links to an event detail route inside the shell.
- [ ] Automated tests cover at least one **Public** and one **Private** visibility scenario.

## Blocked by

- Slice **15** — Organization context reads (GitHub **#5**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/9
