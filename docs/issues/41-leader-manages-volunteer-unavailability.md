# 41 — Leader manages Volunteer Unavailability

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **17**, **32**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Let a **Leader** create, edit, or remove **Unavailability** for **Volunteers** in **Ministries** they lead. The slice should verify **Ministry** stewardship checks end-to-end and make pastoral coordination possible without granting broader **Admin** powers.

## Acceptance criteria

- [ ] **Leader** can create **Unavailability** for a **Volunteer** with membership in a led **Ministry**.
- [ ] **Leader** can edit or remove **Unavailability** only within **Ministries** they lead.
- [ ] **Leader** cannot manage **Unavailability** for unrelated **Ministries** or **Churches**.
- [ ] The UI distinguishes **Leader**-managed support actions from **Volunteer** self-service actions.
- [ ] Automated tests cover authorized and unauthorized **Leader** paths.

## Blocked by

- Issue **#39** — Time away self-service: list/create **Unavailability** (shipped)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/41
