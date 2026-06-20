# Frontend rebuild — `web-next` (parallel strangler migration) — Specification

## Status

- **Phase:** Specify + Design complete (2026-06-20)
- **Design:** [design.md](./design.md)
- **Decisions:** [context.md](./context.md)
- **Design source (do not duplicate):** [`ui-refresh-onda-brand`](../ui-refresh-onda-brand/) — Onda tokens, typography, Volunteer/Leader layouts (ADR [0006](../../../docs/adr/0006-onda-brand-visual-system.md))
- **Preserves:** ADR [0001](../../../docs/adr/0001-visual-system-shell-and-i18n-baseline.md) shell behavior / i18n / a11y; ADR [0005](../../../docs/adr/0005-system-admin-operator-role.md) operator role

## Problem Statement

The current `apps/web` is a working React 19 + Vite + TanStack Router + Tailwind 4 app, but its **visual layer is HOPE brutalism** (ADR 0003) and its **data layer is hand-rolled fetch helpers** with no shared cache/state library. Rather than re-skin in place (the `ui-refresh-onda-brand` refresh), we will **rebuild the frontend from scratch in a parallel app** (`apps/web-next`) on the **same stack**, adopting the **provisional Onda brand** and a **modern data layer (TanStack Query)**, then **cut over route-by-route** while the existing app stays green.

This is a **migration**, not a redesign of behavior: API contracts, domain model (`CONTEXT.md`), routes, and pessimistic scheduling semantics are preserved.

## Goals

- [ ] Stand up `apps/web-next` (new package, same stack) building clean with **Onda brand tokens** (consumes `ui-refresh-onda-brand` design + ADR 0006).
- [ ] Rebuild the **data layer** on **TanStack Query** (queries/mutations/cache) replacing ad-hoc fetch helpers, preserving the API auth-header / dev-header contract.
- [ ] Achieve **route parity** with `apps/web` and cut over per route via strangler (old app green until each route lands).
- [ ] Volunteer + Leader screens built fresh to **Onda design** (per `ui-refresh-onda-brand`).
- [ ] System Admin + org-admin routes **ported functionally** with neutral inherited tokens (redesign deferred).
- [ ] CI gates (lint, typecheck, test, coverage, Playwright) green for `web-next` before cutover; retire `apps/web` only when parity verified.

## Out of Scope

| Item | Reason |
|------|--------|
| New backend APIs / domain changes | Migration preserves existing contracts |
| Redesign of System Admin / Church Admin visuals | Deferred — port functionally now (context.md) |
| Onda visual spec for Volunteer/Leader | Already owned by `ui-refresh-onda-brand` — reference, don't re-spec |
| Stack swap (Next.js, alternate router) | Decision locked: same stack (React/Vite/TanStack Router) |
| Marketing `/` landing redesign | Deferred (ADR 0001); legacy landing not carried into `web-next` shell |
| Assignment Accept/Decline, event venue, global search | Deferred by ADR 0006 / `CONTEXT.md` |

---

## Requirements — Foundation

### MIG-FND-01 ⭐ MVP — Parallel app scaffold

**User Story**: As a maintainer, I want a clean `apps/web-next` package on the same stack so the rebuild starts from a brand-correct foundation without HOPE baggage.

**Acceptance Criteria**:

1. WHEN `apps/web-next` is created THEN it SHALL use React 19, Vite 6, TanStack Router, Tailwind 4, i18next (workspace versions), and build via `pnpm --filter @onda/web-next build`.
2. WHEN the app boots THEN it SHALL NOT import HOPE artifacts (`--border-weight`, `--shadow-offset-*`, zero-radius rule, Montserrat display) from `apps/web`.
3. WHEN dev runs THEN a root `dev:web-next` script SHALL start it on a distinct port from `apps/web`.

### MIG-FND-02 ⭐ MVP — Onda brand tokens & typography

**Acceptance Criteria**:

1. WHEN the theme loads THEN CSS variables SHALL match ADR 0006 tokens (`#2034D6` primary, `#E4F1FA`/`#FBFBDE` bg, `#A1C1DB` border, 6–8px radius, subtle shadow) — values locked by a **theme contract test** ported from `apps/web/src/theme`.
2. WHEN UI text renders THEN it SHALL use **Space Grotesk** (self-hosted), display headings optionally **Right Grotesk** (1–2 per screen), per `ui-refresh-onda-brand/design.md` §2.
3. WHEN focus moves by keyboard THEN focus ring SHALL be `#2034D6` with WCAG 2.2 AA contrast.

### MIG-FND-03 ⭐ MVP — Shell rebuilt on Onda tokens

**Acceptance Criteria**:

1. WHEN the signed-in shell renders THEN behavior SHALL match ADR 0001 (≈260px sidebar + top bar desktop; sticky top bar + drawer mobile) with Onda styling only.
2. WHEN the shell header renders THEN it SHALL show the **Onda** wordmark + active **Church** name (tenant) and Church/Campus context switchers (not a demo role dropdown).
3. WHEN nav renders THEN it SHALL derive from a nav manifest gated by composed grants (no placeholder routes carried over unless still needed).

---

## Requirements — Data layer

### MIG-DATA-01 ⭐ MVP — TanStack Query adoption

**User Story**: As a developer, I want a single data-fetching/caching layer so route loaders, mutations, and invalidation are consistent and testable.

**Acceptance Criteria**:

1. WHEN a route reads server data THEN it SHALL use TanStack Query (`useQuery`/`queryOptions`) over a shared query client, replacing ad-hoc fetch-in-loader helpers.
2. WHEN a mutation runs (assign, release, create event, unavailability CRUD) THEN it SHALL use `useMutation` with **pessimistic** semantics (ADR 0001) and explicit cache invalidation — no optimistic roster mutation.
3. WHEN an API error returns THEN error mapping SHALL reuse the existing error contract (`apiError`-equivalent) and surface ADR 0001 hybrid feedback.

### MIG-DATA-02 ⭐ MVP — Port API/auth/context primitives

**Acceptance Criteria**:

1. WHEN the app calls the API THEN it SHALL send the same auth/dev headers contract (`X-Leader-Ministry-Id`, `X-Volunteer-Id`, Supabase token) as `apps/web` (`apiAuthHeaders`, `sessionToken`, `auth/`).
2. WHEN org context is needed THEN Church/Campus/grants resolution SHALL be ported (behavior-equivalent to `organization/OrganizationContextProvider`), adapted onto the Query layer.
3. WHEN i18n loads THEN pt-BR (default) + en resources and the locale controller SHALL be ported; new copy added under existing namespaces.

---

## Requirements — Screen parity

### MIG-VOL-01 ⭐ MVP — Volunteer screens (Onda design)

1. WHEN Volunteer routes are built in `web-next` THEN they SHALL satisfy `ui-refresh-onda-brand` UI-VOL-01..05 (greeting, assignment cards, time-away preview, sidebar, empty states) against live APIs.

### MIG-LEAD-01 ⭐ MVP — Ministry Leader screens (Onda design)

1. WHEN Leader routes are built THEN they SHALL satisfy `ui-refresh-onda-brand` UI-LEAD-01..06 (ministry hero, roster by event + fill ratio, Assign/Release, header CTAs, sidebar, volunteer list).

### MIG-ADMIN-01 ⭐ MVP — System Admin + org-admin functional port

**User Story**: As an operator/admin, I want my existing screens to work in `web-next` so the cutover loses no capability, even before they are redesigned.

**Acceptance Criteria**:

1. WHEN System Admin routes (`/system-admin/*`, ADR 0005) are ported THEN behavior and access guards SHALL match `apps/web` using **neutral inherited Onda tokens** (no bespoke redesign).
2. WHEN org-admin routes (`/ministries`, `/volunteers`, `/ministry-leaders`, event create flows) are ported THEN they SHALL be functionally equivalent on the new data + token layer.
3. WHEN a ported screen lacks an Onda design THEN it SHALL use shell/token defaults and be flagged for a future design phase (no HOPE styling reintroduced).

---

## Requirements — Cutover & quality

### MIG-CUT-01 ⭐ MVP — Strangler route parity & cutover

**Acceptance Criteria**:

1. WHEN a route is migrated THEN `web-next` SHALL serve it at the same path; the old app remains the source of truth until all in-scope routes reach parity.
2. WHEN all routes reach parity and CI is green THEN cutover SHALL repoint the deploy/build to `web-next` (or rename `web-next` → `web`), and the old `apps/web` source SHALL be retired in a dedicated PR.
3. WHEN cutover completes THEN `DESIGN_SYSTEM.md` SHALL be replaced with Onda content and HOPE docs archived; ADR 0006 marked shipped.

### MIG-ENG-01 ⭐ MVP — Tests & CI parity

**Acceptance Criteria**:

1. WHEN `web-next` PRs run THEN `pnpm lint` (`--max-warnings 0`), `pnpm typecheck`, Vitest, coverage floors, and Playwright smoke SHALL pass for the package.
2. WHEN behavior tests are written THEN they SHALL use `@testing-library/user-event` (AGENTS.md), not `fireEvent`.
3. WHEN CI workflows run THEN `web-next` SHALL be wired into `.github/workflows/ci.yml` and `e2e-web.yml` (or successors) before cutover.

---

## Traceability

| ID | Priority | Primary surfaces |
|----|----------|------------------|
| MIG-FND-01..03 | P1 | `apps/web-next` scaffold, `theme/`, `styles/`, `shell/` |
| MIG-DATA-01..02 | P1 | query client, ported `api`/`auth`/`organization`/`i18n` |
| MIG-VOL-01 | P1 | `web-next` dashboard / time-away (ref UI-VOL) |
| MIG-LEAD-01 | P1 | `web-next` dashboard / scheduling / roster (ref UI-LEAD) |
| MIG-ADMIN-01 | P1 | `web-next` system-admin + org-admin routes |
| MIG-CUT-01 | P1 | build/deploy swap, `DESIGN_SYSTEM.md`, retire `apps/web` |
| MIG-ENG-01 | P1 | CI workflows, package gates |

## References

- Design source: `.specs/features/ui-refresh-onda-brand/` (spec + design + ADR 0006)
- Shell / i18n / a11y baseline: ADR 0001 · Operator role: ADR 0005 · Superseded visual: ADR 0003 (HOPE)
- Domain: `CONTEXT.md` · Current app: `apps/web/src` (router, shell, domain modules)
- Shipped roster UI to preserve: `docs/issues/done/115-leader-roster-assignment-ui.md`
