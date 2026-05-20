# 45 — Admin cancels Event and voids Assignments

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **23**); `docs/prd/web-client-design-system-shell-i18n.md` (story **17**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Add a cancellation flow that marks an **Event** as not running and voids all **Assignments** for that occurrence. Human review is needed for destructive copy, confirmation behavior, and edge cases around already-started or recently-ended **Events**.

## Acceptance criteria

- [ ] Accredited **Admin** can cancel an **Event** in an accredited **Church**.
- [ ] Cancelling an **Event** voids all **Assignments** for that occurrence.
- [ ] Cancelled **Events** do not leave **Volunteers** presented as actively rostered for the occurrence.
- [ ] Historical reporting remains able to explain that the **Event** was cancelled rather than silently deleted.
- [ ] Human review signs off confirmation copy and edge-case behavior.

## Blocked by

- issue **#38** — Event roster writes: assign, release, optional Unavailability offer (GitHub **#38**)
- issue **#46** — Admin creates Public Event (GitHub **#42**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/45
