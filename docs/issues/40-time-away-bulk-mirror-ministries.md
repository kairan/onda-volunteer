# 40 — Bulk mirror Time away across Ministries

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **6**, **9–11**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Add a guided action that creates separate **Unavailability** records across the **Volunteer**’s member **Ministries** for the same date range. The UI should make clear that no **Church**-wide absence row is created and should report partial validation failures cleanly.

## Acceptance criteria

- [x] **Volunteer** can select a date range and mirror it across eligible **Ministries**.
- [x] The system stores one **Unavailability** record per **Ministry**, not a **Church**-wide record.
- [x] The flow explains which **Ministries** will receive mirrored **Unavailability** before submission.
- [x] Partial failures or ineligible **Ministries** are reported without implying successful rows failed.
- [x] Automated tests cover successful multi-**Ministry** creation and at least one validation failure.

## Blocked by

- Issue **#39** — Time away self-service: list/create **Unavailability** (shipped)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/40
