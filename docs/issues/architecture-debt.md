# Architecture debt — completed index

Product vertical slices live in `docs/issues/` and on GitHub. This document indexes **deepening refactors** from the May 2026 architecture review. **All waves are shipped** as of 2026-06.

**Normative domain language:** [`CONTEXT.md`](../../CONTEXT.md)  
**Vocabulary for seams/depth:** [`.cursor/skills/_legacy/improve-codebase-architecture/LANGUAGE.md`](../../.cursor/skills/_legacy/improve-codebase-architecture/LANGUAGE.md)

## Shipped architecture-debt waves

| GitHub | Topic | Spec |
|--------|-------|------|
| [#54](https://github.com/kairan/onda-volunteer/issues/54) | **Scheduling** invariants module (API) | `done/54-api-scheduling-invariants-module.md` |
| [#55](https://github.com/kairan/onda-volunteer/issues/55) | Request-scoped auth (API) | `done/55-api-request-scoped-auth-context.md` |
| [#56](https://github.com/kairan/onda-volunteer/issues/56) | Church stewardship access (API) | `done/56-api-church-stewardship-access-module.md` |
| [#57](https://github.com/kairan/onda-volunteer/issues/57) | **Assignment** route under **Scheduling** (API) | `done/57-api-assignment-route-under-scheduling.md` |
| [#58](https://github.com/kairan/onda-volunteer/issues/58) | Retire legacy **Event** routes (Web) — ADR 0004 | `done/58-web-retire-legacy-event-routes.md` |
| [#61](https://github.com/kairan/onda-volunteer/issues/61) / PR [#83](https://github.com/kairan/onda-volunteer/pull/83) | CI ESLint + coverage reporting | `done/61-ci-lint-and-coverage.md` |

Related product slices that delivered overlapping seams: [#36](https://github.com/kairan/onda-volunteer/issues/36)–[#40](https://github.com/kairan/onda-volunteer/issues/40), [#46](https://github.com/kairan/onda-volunteer/issues/46) (deactivate voiding), [#37](https://github.com/kairan/onda-volunteer/issues/37)–[#38](https://github.com/kairan/onda-volunteer/issues/38) (web API client + roster).

## Browser e2e ([#60](https://github.com/kairan/onda-volunteer/issues/60))

Playwright in `apps/web/e2e` complements API Jest e2e and Vitest unit tests. **Shipped** — see `done/60-web-playwright-browser-e2e.md`. Product slice **#49** adds keyboard/WCAG smoke coverage; HITL sign-off in `.specs/archive/features/49-hope-polish-and-wcag-release-gate/hitl-signoff.md`. Legacy `/events/$eventId` redirects to shell per ADR 0004 (**#58**).

## PRD constraints (do not re-litigate in slice work)

- **Web PRD story 42:** legacy `/` demo landing remains; **`/events/$eventId`** redirects to **`/scheduling/events/$eventId`** per ADR 0004.
- **Platform PRD:** tracer-bullet **e2e** is the default test seam; API Jest e2e, Playwright browser e2e, and the Scheduling unit seam (**#54**) are complementary.
