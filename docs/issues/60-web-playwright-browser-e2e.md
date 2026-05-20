# 60 — Web: Playwright browser e2e foundation

**Type:** Platform / test infrastructure  
**Label:** `testing`, `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (automated tests in-scope); `docs/prd/web-client-design-system-shell-i18n.md` (optional Playwright smoke); `AGENTS.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Architecture index: `docs/issues/architecture-debt.md`

## Problem

API **e2e** (Jest + Supertest) covers HTTP contracts but not real browser behavior: routing, i18n, dev-header auth, TanStack Router loaders, and HOPE shell UX. Vitest + Testing Library covers components in isolation. We need a **browser e2e** seam that opens Chromium, drives the Vite app, and asserts user-visible outcomes.

## What to build

Establish Playwright in `apps/web` as the canonical **browser e2e** runner, wired to seeded Postgres + Nest API for integration flows.

## Acceptance criteria

### Foundation (started)

- [x] `@playwright/test` in `apps/web` with `playwright.config.ts` (Vite `webServer`, dev-header env, English locale fixture).
- [x] Smoke specs: home landing + dashboard navigation (`e2e/home.smoke.spec.ts`).
- [x] Integration specs: legacy demo **Event** read path (`e2e/demo-event.integration.spec.ts`) against seeded `seed-event-public`.
- [x] `scripts/e2e-api-server.sh` — migrate, seed, build, start API for Playwright.
- [x] CI workflow `.github/workflows/e2e-web.yml` (Postgres service + Playwright Chromium).
- [x] Root scripts: `pnpm test:e2e:web`, `pnpm --filter @onda/web test:e2e:integration`.

### Product slices (next — fold into vertical work)

- [ ] **#37** — Shell roster read at `/scheduling/events/$eventId` + Playwright authorized/unauthorized paths.
- [ ] **#38** — Assign / release / **Unavailability** offer flows in browser (happy path + one domain error).
- [ ] **#58** — After legacy retirement, Playwright targets shell routes only (no `/events/$eventId`).
- [ ] **#49** — Keyboard-only smoke for **Scheduling** and **Time away** (WCAG release gate).

### Conventions

- [ ] Tag `@smoke` for UI-only; `@integration` when Postgres seed + API required.
- [ ] Prefer `getByRole` / accessible names; set `onda.ui.locale` via `e2e/fixtures.ts` (default `en` for stable copy).
- [ ] Do not assert Tailwind class strings; assert landmarks, headings, and error/empty states.
- [ ] Agent skill: `playwright-best-practices` (installed globally).

## How to run

```bash
docker compose up -d
# smoke only (Vite only):
pnpm --filter @onda/web test:e2e

# full browser e2e (API + seed + Vite — same as CI):
pnpm test:e2e:web
```

## Blocked by

- Nothing for foundation. Product flows depend on issues **#37** / **#38** shipping.

## Out of scope

- Replacing API Jest e2e (keep both seams).
- Visual regression / Percy (later).
- Mobile device matrix (Chromium desktop is enough for MVP).

## Tracker

GitHub: [#60](https://github.com/kairan/onda-volunteer/issues/60)

## Related

- Issue **#37** — [Event roster read in shell](https://github.com/kairan/onda-volunteer/issues/37)
- Issue **#38** — [Event roster writes](https://github.com/kairan/onda-volunteer/issues/38)
- Issue **#58** — [Retire legacy event routes](https://github.com/kairan/onda-volunteer/issues/58)
- Issue **#49** — [HOPE polish / WCAG gate](https://github.com/kairan/onda-volunteer/issues/49)
