# 36 — Event roster writes: assign, release, optional Unavailability offer

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **7–8**, **13**, **16**, **27**, **32–33**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **19**, **25**); `CONTEXT.md`  
**Architecture:** fold candidate **#7** — see `docs/issues/architecture-debt.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Wire shell-native write flows on **`/scheduling/events/$eventId`** for **Leader** **Assignment** creation and **Volunteer** **release**. Mutations stay pessimistic, refetch server truth before success toasts, and surface inactive membership, conflict, retired **Role**, and **Unavailability** errors near the relevant roster form.

## Acceptance criteria

### Product

- [ ] Authorized **Leaders** can create **Assignments** from the shell roster page.
- [ ] **Volunteers** can release their own **Assignments** from the shell roster page.
- [ ] Release flow offers matching **Unavailability** without forcing creation.
- [ ] Successful writes refetch authoritative roster data before showing success feedback.
- [ ] Domain errors render near the relevant roster form or row.
- [ ] Playwright covers at least one assign happy path and one release + optional **Unavailability** offer path (`apps/web/e2e/` — slice **53**).

### Architecture hygiene (fold #7 — web API seam)

- [ ] All roster mutations live in **`fetch*` / `create*`** modules under `apps/web/src/` (e.g. events or scheduling area), not inline in `router.tsx`.
- [ ] Mutations use **`apiErrorFromResponse`**; remove or stop extending duplicate **`errorMessageFromResponse`** in `router.tsx` for roster flows.
- [ ] No new inline `fetch` blocks in `router.tsx` for assign, release, or post-release **Unavailability** offer.

### Out of scope

- Moving API **`POST /events/:id/assignments`** to a **Scheduling**-owned route (tech-debt **51**).
- Extracting **Scheduling** rules into a pure module (tech-debt **48**).

## Blocked by

- Slice **35** — Event roster read inside the shell (GitHub [#37](https://github.com/kairan/onda-volunteer/issues/37))

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/38
