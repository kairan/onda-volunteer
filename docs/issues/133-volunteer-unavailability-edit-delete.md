# 133 — Volunteer self-service: edit and delete own Unavailability

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `CONTEXT.md`; shipped #39, #41

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (AVAIL-02)

## What to build

Extend **Time away** beyond list/create (#39): **Volunteers** may PATCH/DELETE own **Unavailability**; **Leader** / **Admin** stewardship unchanged (#41). Web UI on `/time-away` for edit/remove.

## Acceptance criteria

- [ ] Volunteer can update own **Unavailability** window.
- [ ] Volunteer can delete own **Unavailability**.
- [ ] Cross-volunteer update/delete forbidden.
- [ ] **Leader** ministry-scoped manage behavior preserved.
- [ ] Web **Time away** edit/remove for own rows.
- [ ] API e2e + web behavior tests.

## Blocked by

None

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/133
