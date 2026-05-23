# Architecture debt (tracked separately from product slices)

Product vertical slices live in `docs/issues/` and on GitHub. This document indexes **deepening opportunities** from the [architecture review](https://github.com/kairan/onda-volunteer) (May 2026): refactors that improve **locality** and test **leverage** without changing domain behavior.

**Normative domain language:** `CONTEXT.md`  
**Vocabulary for seams/depth:** `.cursor/skills/improve-codebase-architecture/LANGUAGE.md`

**Naming:** Active spec files use the **GitHub issue number** as prefix (`40-time-away-bulk-mirror-ministries.md` ↔ [#40](https://github.com/kairan/onda-volunteer/issues/40)). Archived specs use `done/NN-*` or `done/legacy-NN-*` where **NN** is the GitHub issue number or old tracer-bullet id.

## Status vs product backlog

| GitHub | Status |
|--------|--------|
| [#36](https://github.com/kairan/onda-volunteer/issues/36) — Scheduling hub | Shipped |
| [#39](https://github.com/kairan/onda-volunteer/issues/39) — Time away self-service | Shipped |
| [#37](https://github.com/kairan/onda-volunteer/issues/37) — Event roster read in shell | Shipped |
| [#38](https://github.com/kairan/onda-volunteer/issues/38) — Event roster writes | Shipped |
| [#60](https://github.com/kairan/onda-volunteer/issues/60) — Playwright browser e2e | Shipped |
| [#40](https://github.com/kairan/onda-volunteer/issues/40) — Bulk mirror time away | **Next** (`ready-for-agent`) |

## Candidate map

| ID | Topic | Timing | Spec | GitHub |
|----|--------|--------|------|--------|
| 7 | Web API client + volunteer scope | **Shipped in #37, #38** | `done/37-*`, `done/38-*` | — |
| 5 | Deactivate voiding via **Scheduling** | **Optional in #46** | (in slice #46 spec) | — |
| 2 | **Scheduling** invariants module (API) | After #38 (shipped) | `54-api-scheduling-invariants-module.md` | [#54](https://github.com/kairan/onda-volunteer/issues/54) |
| 3 | Request-scoped auth (API) | After #49 | `55-api-request-scoped-auth-context.md` | [#55](https://github.com/kairan/onda-volunteer/issues/55) |
| 1 | Church stewardship access (API) | Defer until #42–#45 | `56-api-church-stewardship-access-module.md` | [#56](https://github.com/kairan/onda-volunteer/issues/56) |
| 4 | **Assignment** route under **Scheduling** (API) | After #38 (shipped) | `57-api-assignment-route-under-scheduling.md` | [#57](https://github.com/kairan/onda-volunteer/issues/57) |
| 6 | Retire legacy **Event** routes (Web) | Defer; contradicts PRD until amended | `58-web-retire-legacy-event-routes.md` | [#58](https://github.com/kairan/onda-volunteer/issues/58) |

## Execution order (documentation only)

1. **#40–#41** — time away bulk mirror + leader **Unavailability** writes (no architecture blockers).
2. Parallel product work: **#42–#47** (no architecture blockers).
3. After **#49**: schedule **#54–#58** if maintenance cost warrants.

## Browser e2e ([#60](https://github.com/kairan/onda-volunteer/issues/60))

Playwright in `apps/web/e2e` complements API Jest e2e and Vitest unit tests. **Shipped** — see `done/60-web-playwright-browser-e2e.md`. Shell roster integration coverage lives in `scheduling-event-roster.integration.spec.ts`. Remaining browser work is owned by product slices **#49** (keyboard/WCAG smoke) and **#58** (retire legacy `/events/$eventId` tests).

## PRD constraints (do not re-litigate in slice work)

- **Web PRD story 42:** legacy `/` and `/events/$eventId` remain until **#58**. Playwright integration tests still cover the legacy demo path via `demo-event.integration.spec.ts` until shell routes are canonical.
- **Platform PRD:** tracer-bullet **e2e** is the default test seam; API Jest e2e + Playwright browser e2e + unit extraction (**#54**) are complementary.

## Canvas

Visual roadmap: `~/.cursor/projects/Users-kairan-workspace-onda-volunteer/canvases/architecture-debt-roadmap.canvas.tsx`
