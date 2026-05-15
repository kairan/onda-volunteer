# 15 — Real Organization context reads (Church + Campus)

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **3**, **10**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **13–16**); `CONTEXT.md`; ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Web PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Replace static **Church** / **Campus** demo data in the shell with authenticated **Organization** reads end-to-end.

Add optional **Campus** persistence (per **Church**) if not yet in Prisma. Expose a read API that returns the **Churches**, **Campuses**, and **Ministries** the signed-in **Volunteer** may access (membership, **Leader** stewardship, and **Admin** accreditation). Wire the shell **Church** dropdown and **Campus** secondary selector to that API, preserving ADR **0001** timezone cue behavior. Seed data must exercise multi-**Church** and multi-**Campus** cases for local demos.

## Acceptance criteria

- [ ] Prisma includes **Campus** (when used) linked to **Church** with **IANA** timezone fields consistent with `CONTEXT.md`.
- [ ] Authenticated read endpoint returns only **Churches** / **Ministries** in scope for the caller; unauthorized access is rejected.
- [ ] Shell context switchers load from the API (no `DEMO_CHURCHES` in production paths); selection persists for the session as today.
- [ ] Timezone cue still shows short label + full **IANA** on demand.
- [ ] Automated tests cover API contract and at least one multi-**Church** fixture.

## Blocked by

None — can start immediately.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/5
