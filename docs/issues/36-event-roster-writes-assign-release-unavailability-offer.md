# 36 — Event roster writes: assign, release, optional Unavailability offer

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **7–8**, **13**, **16**, **27**, **32–33**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **19**, **25**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Wire shell-native write flows for **Leader** **Assignment** creation and **Volunteer** **release**. Mutations stay pessimistic, refetch server truth before success toasts, and surface inactive membership, conflict, retired **Role**, and **Unavailability** errors near the relevant roster form.

## Acceptance criteria

- [ ] Authorized **Leaders** can create **Assignments** from the shell roster page.
- [ ] **Volunteers** can release their own **Assignments** from the shell roster page.
- [ ] Release flow offers matching **Unavailability** without forcing creation.
- [ ] Successful writes refetch authoritative roster data before showing success feedback.
- [ ] Domain errors render near the relevant roster form or row.

## Blocked by

- Slice **35** — Event roster read inside the shell (GitHub **#37**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/38
