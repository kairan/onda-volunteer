# 133 — Volunteer self-service: edit and delete own Unavailability

**Type:** AFK  
**Status:** Shipped (validated 2026-06-18, PR [#139](https://github.com/kairan/onda-volunteer/pull/139))  
**TLC:** `.specs/features/ubiquitous-language-drift/` (AVAIL-02)

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (AVAIL-02)

## What was built

Extended **Time away** beyond list/create (#39): **Volunteers** may PATCH/DELETE own **Unavailability**; **Leader** / **Admin** stewardship unchanged (#41). Web UI on `/time-away` for edit/remove.

## Acceptance criteria

- [x] Volunteer can update own **Unavailability** window.
- [x] Volunteer can delete own **Unavailability**.
- [x] Cross-volunteer update/delete forbidden.
- [x] **Leader** ministry-scoped manage behavior preserved.
- [x] Web **Time away** edit/remove for own rows.
- [x] API e2e + web behavior tests.

## Specification links

- Spec: `.specs/features/ubiquitous-language-drift/spec.md`
- Tasks: `.specs/features/ubiquitous-language-drift/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/133
