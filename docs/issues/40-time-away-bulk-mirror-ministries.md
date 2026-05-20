# 40 — Bulk mirror Time away across Ministries

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **6**, **9–11**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Add a guided action that creates separate **Unavailability** records across the **Volunteer**’s member **Ministries** for the same date range. The UI should make clear that no **Church**-wide absence row is created and should report partial validation failures cleanly.

## Acceptance criteria

- [ ] **Volunteer** can select a date range and mirror it across eligible **Ministries**.
- [ ] The system stores one **Unavailability** record per **Ministry**, not a **Church**-wide record.
- [ ] The flow explains which **Ministries** will receive mirrored **Unavailability** before submission.
- [ ] Partial failures or ineligible **Ministries** are reported without implying successful rows failed.
- [ ] Automated tests cover successful multi-**Ministry** creation and at least one validation failure.

## Blocked by

- issue **#43** — Time away self-service: list/create Unavailability (GitHub **#39**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/40
