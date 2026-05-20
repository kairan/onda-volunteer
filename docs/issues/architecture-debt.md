# Architecture debt (tracked separately from product slices)

Product vertical slices live in `docs/issues/` and on GitHub. This document indexes **deepening opportunities** from the [architecture review](https://github.com/kairan/onda-volunteer) (May 2026): refactors that improve **locality** and test **leverage** without changing domain behavior.

**Normative domain language:** `CONTEXT.md`  
**Vocabulary for seams/depth:** `.cursor/skills/improve-codebase-architecture/LANGUAGE.md`

**Naming:** Active spec files use the **GitHub issue number** as prefix (`37-event-roster-read-inside-shell.md` ↔ [#37](https://github.com/kairan/onda-volunteer/issues/37)). Archived specs use `done/legacy-NN-*` where **NN** is the old tracer-bullet id.

## Status vs product backlog

| GitHub | Status |
|--------|--------|
| [#36](https://github.com/kairan/onda-volunteer/issues/36) — Scheduling hub | Shipped |
| [#39](https://github.com/kairan/onda-volunteer/issues/39) — Time away self-service | Shipped |
| [#37](https://github.com/kairan/onda-volunteer/issues/37) — Event roster read in shell | **Next** (`ready-for-agent`) |
| [#38](https://github.com/kairan/onda-volunteer/issues/38) — Event roster writes | Blocked on #37 |

## Candidate map

| ID | Topic | Timing | Spec | GitHub |
|----|--------|--------|------|--------|
| 7 | Web API client + volunteer scope | **Fold into #37, #38** | (in slice specs) | — |
| 5 | Deactivate voiding via **Scheduling** | **Optional in #46** | (in slice #46 spec) | — |
| 2 | **Scheduling** invariants module (API) | After #38 | `54-api-scheduling-invariants-module.md` | [#54](https://github.com/kairan/onda-volunteer/issues/54) |
| 3 | Request-scoped auth (API) | After #49 | `55-api-request-scoped-auth-context.md` | [#55](https://github.com/kairan/onda-volunteer/issues/55) |
| 1 | Church stewardship access (API) | Defer until #42–#45 | `56-api-church-stewardship-access-module.md` | [#56](https://github.com/kairan/onda-volunteer/issues/56) |
| 4 | **Assignment** route under **Scheduling** (API) | After #38 | `57-api-assignment-route-under-scheduling.md` | [#57](https://github.com/kairan/onda-volunteer/issues/57) |
| 6 | Retire legacy **Event** routes (Web) | Defer; contradicts PRD until amended | `58-web-retire-legacy-event-routes.md` | [#58](https://github.com/kairan/onda-volunteer/issues/58) |

## Execution order (documentation only)

1. **#37** — shell roster read + navigation from `/scheduling` (architecture fold **#7**).
2. **#38** — shell roster writes (architecture fold **#7**).
3. Parallel product work: **#40–#41**, **#42–#47** (no architecture blockers).
4. After **#49**: schedule **#54–#58** if maintenance cost warrants.

## Browser e2e ([#60](https://github.com/kairan/onda-volunteer/issues/60))

Playwright in `apps/web/e2e` complements API Jest e2e and Vitest unit tests. Foundation is **in progress** — see `60-web-playwright-browser-e2e.md`. Product issues **#37**, **#38**, **#49**, and **#58** should add or extend Playwright specs as they ship UI flows.

## PRD constraints (do not re-litigate in slice work)

- **Web PRD story 42:** legacy `/` and `/events/$eventId` remain until **#58**. Playwright integration tests currently cover this legacy path until shell routes are canonical.
- **Platform PRD:** tracer-bullet **e2e** is the default test seam; API Jest e2e + Playwright browser e2e + unit extraction (**#54**) are complementary.

## Canvas

Visual roadmap: `~/.cursor/projects/Users-kairan-workspace-onda-volunteer/canvases/architecture-debt-roadmap.canvas.tsx`
