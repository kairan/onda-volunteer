# Architecture debt (tracked separately from product slices)

Product vertical slices live in `docs/issues/` and on GitHub. This document indexes **deepening opportunities** from the [architecture review](https://github.com/kairan/onda-volunteer) (May 2026): refactors that improve **locality** and test **leverage** without changing domain behavior.

**Normative domain language:** `CONTEXT.md`  
**Vocabulary for seams/depth:** `.cursor/skills/improve-codebase-architecture/LANGUAGE.md`

## Status vs product backlog

| Product slice | GitHub | Status |
|---------------|--------|--------|
| 34 — Scheduling hub | [#36](https://github.com/kairan/onda-volunteer/issues/36) | Shipped |
| 37 — Time away self-service | [#39](https://github.com/kairan/onda-volunteer/issues/39) | Shipped |
| 35 — Event roster read in shell | [#37](https://github.com/kairan/onda-volunteer/issues/37) | **Next** (`ready-for-agent`) |
| 36 — Event roster writes | [#38](https://github.com/kairan/onda-volunteer/issues/38) | Blocked on 35 |

## Candidate map

| ID | Topic | Timing | Spec | GitHub |
|----|--------|--------|------|--------|
| 7 | Web API client + volunteer scope | **Fold into 35, 36** | (in slice specs) | — |
| 5 | Deactivate voiding via **Scheduling** | **Optional in 44** | (in slice 44 spec) | — |
| 2 | **Scheduling** invariants module (API) | New issue after 36 | `48-api-scheduling-invariants-module.md` | [#54](https://github.com/kairan/onda-volunteer/issues/54) |
| 3 | Request-scoped auth (API) | New issue after 47 | `49-api-request-scoped-auth-context.md` | [#55](https://github.com/kairan/onda-volunteer/issues/55) |
| 1 | Church stewardship access (API) | Defer until 40–43 | `50-api-church-stewardship-access-module.md` | [#56](https://github.com/kairan/onda-volunteer/issues/56) |
| 4 | **Assignment** route under **Scheduling** (API) | Defer after 36 | `51-api-assignment-route-under-scheduling.md` | [#57](https://github.com/kairan/onda-volunteer/issues/57) |
| 6 | Retire legacy **Event** routes (Web) | Defer; contradicts PRD until amended | `52-web-retire-legacy-event-routes.md` | [#58](https://github.com/kairan/onda-volunteer/issues/58) |

## Execution order (documentation only)

1. **35** — shell roster read + navigation from `/scheduling` (architecture fold **#7**).
2. **36** — shell roster writes (architecture fold **#7**).
3. Parallel product work: **38–39**, **40–45** (no architecture blockers).
4. After **47**: file or schedule **48–52** if maintenance cost warrants.

## Browser e2e (slice 53)

Playwright in `apps/web/e2e` complements API Jest e2e and Vitest unit tests. Foundation is **in progress** — see `53-web-playwright-browser-e2e.md`. Product slices **35**, **36**, **47**, and **52** should add or extend Playwright specs as they ship UI flows (shell roster read/write, WCAG keyboard smoke, legacy route retirement).

## PRD constraints (do not re-litigate in slice work)

- **Web PRD story 42:** legacy `/` and `/events/$eventId` remain until an explicit follow-up (**52**). Playwright integration tests currently cover this legacy path until **52** migrates assertions to `/scheduling/events/$eventId`.
- **Platform PRD:** tracer-bullet **e2e** is the default test seam; API Jest e2e + Playwright browser e2e + unit extraction (**48**) are complementary.

## Slice ID vs GitHub issue number

Local specs use slice IDs **48–52**. GitHub issue numbers are sequential repo-wide (**#54–#58** as of May 2026). Cross-reference by title (`48 — API: Scheduling invariants…`) not by assuming slice ID equals GH number.

## Canvas

Visual roadmap: `~/.cursor/projects/Users-kairan-workspace-onda-volunteer/canvases/architecture-debt-roadmap.canvas.tsx`
