# 19 — Time away: bulk mirror across Ministries

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **6**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

One guided action on **Time away** applies the same date range as separate **Unavailability** records—one per **Ministry** where the **Volunteer** has membership—without inventing church-wide rows. End-to-end: **Availability** orchestration, API, UI confirmation, and tests proving N memberships produce N rows.

## Acceptance criteria

- [ ] Bulk action creates one **Unavailability** per eligible **Ministry** for the same **UTC** window.
- [ ] UI explains scope before commit; success confirms count created.
- [ ] Automated tests assert row count and ministry scoping for a multi-ministry **Volunteer**.

## Blocked by

- Slice **18** — Time away list/create (GitHub **#8**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/11
