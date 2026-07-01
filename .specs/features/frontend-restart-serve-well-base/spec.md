# Frontend restart — serve-well + API — Specification

**Status:** Specify complete (2026-07-01)  
**Design:** [design.md](./design.md)  
**Decisions:** [context.md](./context.md)  
**Supersedes:** `frontend-migration-web-next` cutover (#148) — frozen

---

## Problem statement

`apps/web-next` successfully ported **API behavior** (TanStack Query, auth, org context, volunteer/leader/admin routes) but the **visual layer** was built by cherry-picking Onda tokens onto patterns from `apps/web`. The result does not match the **serve-well** Lovable prototype the team validated. Continuing to #148 cutover would ship a UI the product owner does not want.

**New approach:** Create a frontend whose **source tree starts from serve-well presentation** (`components/onda`, `styles.css`, shadcn `ui/`) and attaches the **existing data layer** as a thin integration boundary — not another visual port on top of `web-next`.

---

## Goals

- [ ] Stand up **`apps/web-onda`** (or agreed package name) with serve-well visual structure on monorepo stack (Vite, pnpm, TanStack Router).
- [ ] Wire **real API** (NestJS + Supabase auth) — no mock arrays in shipped routes.
- [ ] Shell includes **working context** (ministério · chapéu) from Foundation.
- [ ] Volunteer + Leader screens **visually match** serve-well at 1440px (side-by-side checklist).
- [ ] Port org-admin + system-admin **functionally** (neutral tokens).
- [ ] Single production cutover: `apps/web` → new package; **delete** `apps/web` and **`apps/web-next`** from the monorepo after parity.

## Non-goals

| Item | Reason |
|------|--------|
| Fix `web-next` visual in place | Rejected approach |
| Import TanStack Start / Lovable vite config | Monorepo uses Vite SPA |
| Change API contracts | Domain stable in `CONTEXT.md` |
| URL cleanup / marketing landing | Post-cutover slice |

---

## Salvage matrix

### Copy from `design-reference/serve-well/` (visual — primary)

| Source | Use |
|--------|-----|
| `src/styles.css` | Theme / globals (self-host fonts; drop Lovable CDN URLs) |
| `src/components/onda/AppShell.tsx` | Layout — remove demo role switcher & search |
| `src/components/onda/AppSidebar.tsx` | Nav structure — wire to working-context nav |
| `src/components/onda/dashboards/VolunteerDashboard.tsx` | Volunteer layout reference |
| `src/components/onda/dashboards/MinistryLeaderDashboard.tsx` | Leader layout reference |
| `src/components/onda/WeekTimeline.tsx` | Shared component (wire later) |
| `src/components/onda/modals.tsx` | Dialog patterns — wire to mutations |
| `src/components/ui/*` | Full shadcn set from prototype |

### Copy from `apps/web-next/` (data — secondary)

| Source | Use |
|--------|-----|
| `src/api/*` | apiClient, apiError |
| `src/auth/*`, `sessionToken.ts`, `supabaseClient.ts` | Auth session |
| `src/query/*` | QueryClient, queryKeys |
| `src/organization/*` | Org fetch, storage, mutations, types |
| `src/leader/*`, `src/volunteer/*` | Queries & mutations |
| `src/i18n/*` | Locales + controller |
| `src/system-admin/*` | Operator pages (functional) |
| `src/settings/LocalTimeProvider*` | Campus time display |
| `*.behavior.test.tsx` (API behavior) | Port or adapt — not layout tests |

### Do not copy

| Source | Reason |
|--------|--------|
| `web-next/src/shell/*` | Rejected visual |
| `web-next/src/styles/globals.css` | Replaced by serve-well tokens |
| `web-next/src/__preview__/*` | Throwaway mocks |
| `serve-well` `useRole`, mock providers | Demo only |
| Lovable `server.ts`, error plugins | Out of monorepo stack |

---

## Requirements

### RST-FND-01 ⭐ MVP — Package scaffold

1. WHEN `apps/web-onda` is created THEN it SHALL use React 19, Vite 6, TanStack Router, Tailwind 4, pnpm workspace, distinct dev port.
2. WHEN built THEN it SHALL NOT depend on `@lovable.dev/*` or TanStack Start.
3. WHEN dev runs THEN root script `dev:web-onda` SHALL start the package.

### RST-FND-02 ⭐ MVP — serve-well visual foundation

1. WHEN theme loads THEN CSS variables SHALL match serve-well / ADR 0006 (`#2034D6`, `#FAFAFA`, `--shadow-card`, radius `0.5rem`, Space Grotesk).
2. WHEN fonts load THEN Right Grotesk SHALL be self-hosted (not Lovable CDN).
3. WHEN shadcn primitives render THEN they SHALL come from serve-well `components/ui` (not `web-next` subset).

### RST-FND-03 ⭐ MVP — Data layer graft

1. WHEN any route fetches THEN it SHALL use ported `apiClient` + TanStack Query from `web-next` (same headers contract).
2. WHEN auth runs THEN Supabase session + dev-header behavior SHALL match `apps/web`.
3. WHEN i18n loads THEN pt-BR default + en namespaces from `web-next` SHALL be preserved.

### RST-SHELL-01 ⭐ MVP — Shell from serve-well + real org

1. WHEN signed-in shell renders THEN layout SHALL match serve-well `AppShell` / `AppSidebar` (sidebar ~260px, sticky top bar, `shadow-card`).
2. WHEN org controls render THEN Church + Campus switchers SHALL behave per ADR 0001.
3. WHEN user has multiple ministry grants THEN **working context** picker SHALL show `{{ministry}} · Líder` / `{{ministry}} · Voluntário` (see working-context rules in [design.md](./design.md)).
4. WHEN demo role dropdown would appear in serve-well THEN it SHALL NOT exist in production.

### RST-VOL-01 ⭐ MVP — Volunteer screens (serve-well layout + API)

1. WHEN `/dashboard` renders THEN layout SHALL match serve-well `VolunteerDashboard` (greeting, assignment summary, time-away section) with live data.
2. WHEN volunteer `/scheduling` renders THEN layout SHALL match serve-well assignment card grid (`VolunteerDashboard` assignments section / `/assignments` route).
3. WHEN empty/loading THEN skeleton/empty states SHALL follow ui-refresh UI-VOL-05 patterns.
4. **Omit:** Accept/Decline, location rows, pending badges (unchanged deferrals).

### RST-LEAD-01 ⭐ MVP — Leader screens (serve-well layout + API)

1. WHEN leader `/scheduling` renders THEN layout SHALL match serve-well `MinistryLeaderDashboard` (ministry hero, roster by event, fill badge, Assign/Release).
2. WHEN actions run THEN pessimistic mutations + cache invalidation from `web-next` SHALL be reused.
3. WHEN scope is leader THEN `X-Leader-Ministry-Id` SHALL come from active working context.

### RST-ADMIN-01 — Org-admin + System Admin functional port

1. WHEN admin routes render THEN behavior SHALL match `web-next` / `web` with serve-well inherited tokens only.
2. WHEN operator routes render THEN ADR 0005 guards preserved.

### RST-CUT-01 ⭐ MVP — Cutover

1. WHEN route parity reached and CI green THEN deploy target SHALL switch from `apps/web` to `apps/web-onda`.
2. WHEN cutover completes THEN **`apps/web` and `apps/web-next` packages SHALL be removed** from the monorepo (delete directories, drop from `pnpm-workspace.yaml`, remove CI jobs and root scripts referencing `@onda/web` / `@onda/web-next`).
3. WHEN `apps/web-next` is removed THEN required modules SHALL already live under `apps/web-onda` (no remaining imports from deleted paths).
4. WHEN TLC artifacts for the frozen migration are preserved THEN `frontend-migration-web-next` spec SHALL be archived per AD-001 (history only — not a runnable package).
5. WHEN URLs differ from legacy THEN server redirects documented in cutover PR.

### RST-ENG-01 ⭐ MVP — Quality gates

1. `pnpm --filter @onda/web-onda` lint, typecheck, vitest, coverage floors, Playwright smoke — same bar as `web-next`.
2. Manual: side-by-side serve-well vs `web-onda` at 1440px for Volunteer + Leader before cutover sign-off.

---

## Phases (Execute order)

| Phase | Deliverable | Exit criteria |
|-------|-------------|---------------|
| **0** | Package + serve-well assets + auth gate | Build green, login works |
| **1** | Shell + working context + data graft | Nav switches with context |
| **2** | Volunteer vertical slice | `/dashboard` + volunteer `/scheduling` live |
| **3** | Leader vertical slice | Leader `/scheduling` + event detail |
| **4** | Admin + system-admin port | Functional parity |
| **5** | Cutover | Production on `web-onda` |

---

## Traceability

| ID | Priority | Surfaces |
|----|----------|----------|
| RST-FND-01..03 | P1 | `apps/web-onda` package, theme, api/query/auth |
| RST-SHELL-01 | P1 | `shell/`, working context |
| RST-VOL-01 | P1 | `routes/dashboard`, volunteer scheduling |
| RST-LEAD-01 | P1 | leader scheduling, roster components |
| RST-ADMIN-01 | P2 | admin routes |
| RST-CUT-01 | P1 | CI, deploy, redirects |
| RST-ENG-01 | P1 | tests, visual sign-off |

---

## References

- ADR index: [docs/adr/README.md](../../../docs/adr/README.md)
- Frontend restart ADR: [0007](../../../docs/adr/0007-frontend-serve-well-plus-api.md)
- Visual authority: [`design-reference/serve-well/`](../../../design-reference/serve-well/)
- Brand: [ui-refresh-onda-brand](../ui-refresh-onda-brand/), ADR [0006](../../../docs/adr/0006-onda-brand-visual-system.md)
- Working context detail: [working-context-picker](../working-context-picker/)
- Frozen migration (salvage only): [frontend-migration-web-next](../frontend-migration-web-next/)
