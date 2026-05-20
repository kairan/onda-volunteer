# Issue: Lifecycle path — deactivate **Ministry membership** voids **future** **Assignments** (visible in UI)

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

**HITL** (sensitive data operation — requires quick manual review of voiding behavior before finalizing, even if automated tests pass)

## What to build

Implement membership deactivation (moving a **Volunteer** away from **Active** for a **Ministry**) such that **future** roster commitments are voided according to the **`scheduled end` / UTC** rules captured in `CONTEXT.md`, while preserving historical rows for **Events** that have fully ended by **scheduled end**.

End-to-end: Prisma state transitions, Nest endpoint or application workflow invoked from UI, UI reflects removed upcoming **Assignments**, and **automated tests** specifically cover the voiding decision boundary (including an **Event** still underway vs ended).

## Acceptance criteria

- [x] Deactivating membership voids **Assignments** on **Events** whose **scheduled end** instant is still in the future, and does not rewrite historical rows for ended **Events**.
- [x] Behavior matches the glossary intent for an **Event** still underway (not treated as “past” for preservation).
- [x] UI shows upcoming serves disappearing (or marked voided) in a way volunteers and leaders can trust.
- [x] Automated tests cover voiding logic with fixtures spanning boundary cases.
- [x] **Manual review checklist completed** (HITL): reviewer signs off on voiding outcomes using realistic church-week scenarios (same person, multiple **Ministries**, overlapping windows, and at least one in-progress **Event** edge case).

## Blocked by

`docs/issues/done/legacy-02-leader-first-assignment-public-event.md`
