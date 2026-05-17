# 37 — Time away self-service: list/create Unavailability

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **5**, **11**, **32**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **25**, **55**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Replace the **`/time-away`** placeholder with a **Volunteer**-facing list and create flow for **Ministry**-scoped **Unavailability**. Support **Pending** memberships for pre-entry, show field-level validation, and keep public copy as **Time away** while model-precise surfaces use **Unavailability**.

## Acceptance criteria

- [ ] **`/time-away`** lists the signed-in **Volunteer**’s **Unavailability** grouped or filtered by **Ministry**.
- [ ] **Volunteers** can create **Unavailability** for **Ministries** where they have membership, including **Pending** memberships.
- [ ] The UI explains **Pending** members cannot be rostered until **Active** while still allowing calendar truth.
- [ ] Validation errors appear at the relevant field, with a top summary only for global or multi-field failures.
- [ ] Automated tests cover list, create, and **Pending** membership behavior.

## Blocked by

None - can start immediately

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/39
