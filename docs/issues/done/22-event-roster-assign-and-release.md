# 22 — Event roster write: Leader assign and Volunteer release

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **7**, **8**, **13**, **16**, **27**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **19–21**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

On the shell event roster page, wire write flows end-to-end: **Leader** creates **Assignment** on **Public** (and eligible) **Events** via **Scheduling** (pessimistic mutation + refetch + success toast); **Volunteer** **release** with optional **Unavailability** offer (non-forcing). Surface domain errors inline near the roster/form per ADR—not silent failures.

Reuses APIs proven in slices **02** and **06**; this slice is about product UX in the shell, not re-proving invariants.

## Acceptance criteria

- [ ] Authorized **Leader** can assign from the shell roster; unauthorized users cannot.
- [ ] **Volunteer** can release own **Assignment** only; optional **Unavailability** offer requires explicit confirmation.
- [ ] Successful assign/release refetches authoritative roster before success toast.
- [ ] Automated tests cover authorization and primary happy paths at API boundary; UI test for error display optional if scope threatens slice size.

## Blocked by

- Slice **21** — Event roster read in shell (GitHub **#12**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/16
