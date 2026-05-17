# 26 — Pending membership UX (cannot roster yet)

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **11**, **12**); `CONTEXT.md` (**Pending**, **Active**)

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

When **Ministry membership** is **Pending**, **Time away** still allows **Unavailability** entry, but scheduling surfaces (**Dashboard**, assign affordances) communicate clearly that the person cannot be rostered until **Active**. Seed at least one **Pending** membership for demo; copy via i18n.

## Acceptance criteria

- [ ] **Pending** member can create **Unavailability** (regression on slice **18**).
- [ ] **Dashboard** and assign UI do not imply active rostering for **Pending** membership (clear messaging, no silent assign success).
- [ ] Automated test uses **Pending** fixture to assert assign rejection with stable error code.

## Blocked by

- Slice **17** — Dashboard upcoming assignments (GitHub **#7**)
- Slice **18** — Time away list/create (GitHub **#8**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/17
