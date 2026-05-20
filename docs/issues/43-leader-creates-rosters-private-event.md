# 43 — Leader creates and rosters Private Event

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **15**, **28**, **13**, **27**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Allow a **Leader** to create a **Private event** for a **Ministry** they lead and roster that **Event** through **Scheduling**. This removes the current **Public**-only assignment limitation while preserving **Private event** visibility for **Ministry** participants plus accredited **Admin**.

## Acceptance criteria

- [ ] **Leader** can create a **Private event** only for a **Ministry** they lead.
- [ ] Accredited **Admin** can support **Private events** within accredited **Churches**.
- [ ] **Private event** rosters accept **Assignments** through the same **Scheduling** invariants as **Public events**.
- [ ] **Private event** visibility is limited to **Ministry** participants and accredited **Admin**.
- [ ] Human review confirms the **Private event** creation and roster UX is clear.

## Blocked by

- issue **#36** — Scheduling hub: Church-scoped Event list + read visibility (GitHub **#36**)
- issue **#37** — Event roster read inside the shell (GitHub **#37**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/43
