# 37 — Time away self-service: list/create Unavailability

**Status:** Shipped  
**GitHub:** [#39](https://github.com/kairan/onda-volunteer/issues/39) (closed)

**Type:** AFK  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **5**, **11**, **32**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **25**, **55**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Replace the **`/time-away`** placeholder with a **Volunteer**-facing list and create flow for **Ministry**-scoped **Unavailability**. Support **Pending** memberships for pre-entry, show field-level validation, and keep public copy as **Time away** while model-precise surfaces use **Unavailability**.

## Acceptance criteria

- [x] **`/time-away`** lists the signed-in **Volunteer**’s **Unavailability** grouped or filtered by **Ministry**.
- [x] **Volunteers** can create **Unavailability** for **Ministries** where they have membership, including **Pending** memberships.
- [x] The UI explains **Pending** members cannot be rostered until **Active** while still allowing calendar truth.
- [x] Validation errors appear at the relevant field, with a top summary only for global or multi-field failures.
- [x] Automated tests cover list, create, and **Pending** membership behavior.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/39
