# Frontend rebuild — `web-next` — Tasks

**Design**: [./design.md](./design.md)  
**Status**: Slices 1–5 shipped — validated 2026-06-24 ([#143](https://github.com/kairan/onda-volunteer/issues/143)–[#147](https://github.com/kairan/onda-volunteer/issues/147)); Slice 6 Execute continues ([#148](https://github.com/kairan/onda-volunteer/issues/148); T28 shipped via [#157](https://github.com/kairan/onda-volunteer/pull/157))

## GitHub issue map

| Issue | Tasks | Summary | Status |
|------:|-------|---------|--------|
| [#143](https://github.com/kairan/onda-volunteer/issues/143) | T01–T13.5 | Foundation, data core, shell, brand preview | ✅ Shipped (PRs [#151](https://github.com/kairan/onda-volunteer/pull/151), [#150](https://github.com/kairan/onda-volunteer/pull/150), [#152](https://github.com/kairan/onda-volunteer/pull/152), [#153](https://github.com/kairan/onda-volunteer/pull/153)) |
| [#144](https://github.com/kairan/onda-volunteer/issues/144) | T14–T16.5–T17 | Volunteer screens | ✅ Shipped ([#156](https://github.com/kairan/onda-volunteer/pull/156), [#157](https://github.com/kairan/onda-volunteer/pull/157)) |
| [#145](https://github.com/kairan/onda-volunteer/issues/145) | T18–T23 | Ministry Leader screens | ✅ Shipped ([#158](https://github.com/kairan/onda-volunteer/pull/158)) |
| [#146](https://github.com/kairan/onda-volunteer/issues/146) | T24 | Org-admin routes functional port | ✅ Shipped ([#159](https://github.com/kairan/onda-volunteer/pull/159)) |
| [#147](https://github.com/kairan/onda-volunteer/issues/147) | T25–T26 | System Admin functional port | ✅ Shipped ([#160](https://github.com/kairan/onda-volunteer/pull/160)) |
| [#148](https://github.com/kairan/onda-volunteer/issues/148) | T27–T30 | CI parity & cutover | Open — **ready for agent** (T28 ✅; T27 partial; T29–T30 pending) |

## Verify (Slice 1 closeout — #143)

- [x] T01–T13.5 `Done when` gates validated (`pnpm --filter @onda/web-next build`, typecheck, test — 66 tests)
- [x] Issue spec archived to `docs/issues/done/143-web-next-migration-slice-1-foundation.md`
- [x] `docs/issues/README.md` index updated
- [x] `.specs/project/ROADMAP.md` Slice 1 row marked shipped
- [x] `.specs/project/STATE.md` closeout note added

## Verify (Slice 2 closeout — #144)

- [x] T14–T17 `Done when` gates validated (`pnpm --filter @onda/web-next test` — 105 tests incl. volunteer behavior)
- [x] Issue spec archived to `docs/issues/done/144-web-next-migration-slice-2-volunteer.md`
- [x] `docs/issues/README.md` index updated

## Verify (Slice 3 closeout — #145)

- [x] T18–T23 `Done when` gates validated (leader scheduling + event detail behavior tests + Playwright smoke)
- [x] Issue spec archived to `docs/issues/done/145-web-next-migration-slice-3-leader.md`
- [x] `docs/issues/README.md` index updated

## Verify (Slice 4 closeout — #146)

- [x] T24 `Done when` gates validated (ministries, volunteers, ministryLeaders behavior tests)
- [x] Issue spec archived to `docs/issues/done/146-web-next-migration-slice-4-org-admin.md`
- [x] `docs/issues/README.md` index updated

## Verify (Slice 5 closeout — #147)

- [x] T25–T26 `Done when` gates validated (system-admin shell + pages behavior tests)
- [x] Issue spec archived to `docs/issues/done/147-web-next-migration-slice-5-system-admin.md`
- [x] `docs/issues/README.md` index updated

---

## Execution Plan

### Phase 1: Foundation (Sequential)

Package scaffold → CSS tokens → shadcn primitives. No routes, no runtime deps. Builds green at end.

```
T01 → T02 → T03
```

### Phase 2: Data Core (Sequential with intra-phase parallel)

Bottom-up: auth primitives → API client → query infrastructure → i18n → Organization. T07 (queryKeys) and T09 (i18n) are independent of the auth/fetch chain and may be started from T01.

```
T01 → T04 → T05 → T06 → T08 → T10
           ↑
T01 → T07 [P]
T01 → T09 [P]
```

### Phase 3: Shell (Sequential)

Nav manifest → AppShell → router → mock-data look-and-feel preview. All depend on data core being complete. T13.5 is a throwaway brand checkpoint that closes Slice 1 (#143) before the live data-backed slices begin.

```
T10 → T11 → T12 → T13 → T13.5
```

### Phase 4: Vertical Slices (Parallel after Phase 3)

Four workstreams that may run in parallel once T13 (router) is green. T13.5 closes Slice 1 (#143) and runs after T13 before Phase 4 begins; Phase 4 prep tasks (T14, T18) may start from T06/T07 without waiting for T13.5. Each workstream is internally sequential.

```
T13 ─┬─ T14 → T15 → T16 [P] ─┐
     │         └─────→ T16.5 [P] ┤
     │         └─────→ T17 [P] ┤
     │                          │
     ├─ T18 → T19 → T20 [P] ─┤
     │              T18 → T21 [P] ┤
     │              T13 → T22 [P] ┤
     │              T18 → T23 [P] ┤
     │                              │
     ├─ T10/T13 → T24 [P] ────────┤
     │                              │
     ├─ T05/T13 → T25 [P] ─┐       │
     │            T25 → T26  ┘      │
     └──────────────────────────────┘
                             │
                          Phase 5
```

### Phase 5: Cutover (Sequential)

CI parity → Playwright CI wiring → deploy repoint → retire.

```
T26 + T17 + T23 → T27 → T28 → T29 → T30
```

---

## Task Breakdown

---

### T01: apps/web-next package scaffold

**What**: Create `apps/web-next` as a new pnpm workspace package on the same stack (React 19, Vite 6, TanStack Router, TanStack Query v5, Tailwind 4, i18next); add `dev:web-next` root script on a distinct port from `apps/web`; no routes yet — just `main.tsx` stub that renders `<div>web-next</div>`.
**Where**: `apps/web-next/` — `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, root `package.json` (`dev:web-next` script), `pnpm-workspace.yaml` (if needed)
**Depends on**: None
**Reuses**: `apps/web/package.json` and `apps/web/vite.config.ts` as structural reference (same stack)
**Requirement**: MIG-FND-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `pnpm --filter @onda/web-next build` exits 0 with the stub
- [x] `pnpm dev:web-next` starts on a port distinct from 5173 (e.g. 5174) without error
- [x] No HOPE imports (`--border-weight`, Montserrat, `--shadow-offset-*`) in any file
- [x] Gate check passes: `pnpm --filter @onda/web-next build`
- [x] Test count: N/A (scaffold only — no behavior code)

**Tests**: none
**Gate**: build

**Commit**: `feat(web-next): scaffold parallel app package (React 19 + Vite + TanStack Router + Query)`

---

### T02: Onda globals.css + theme contract test

**What**: Write `src/styles/globals.css` by porting token structure from `design-reference/serve-well/src/styles.css` (oklch shadcn vars, `--shadow-card`, `--sidebar-*`, Space Grotesk via `@fontsource`); primary `#2034D6`, hover `#151BB6`, page bg `#FAFAFA`, card `#FFFFFF`, border `#A1C1DB`, radius `0.5rem`; write `src/theme/tokens.ts` listing `REQUIRED_THEME_CSS_VARIABLES` for Onda (drops `--border-weight`, `--shadow-offset-*`); write `src/theme/theme.contract.test.ts` asserting Onda vars present and HOPE vars absent.
**Where**: `apps/web-next/src/styles/globals.css`, `apps/web-next/src/theme/tokens.ts`, `apps/web-next/src/theme/theme.contract.test.ts`
**Depends on**: T01
**Reuses**: `design-reference/serve-well/src/styles.css` (token source), `apps/web/src/theme/tokens.ts` (test structure to invert), `apps/web/src/theme/theme.contract.test.ts` (test pattern)
**Requirement**: MIG-FND-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `globals.css` defines `--primary` ≈ `#2034D6`, `--background` ≈ `#FAFAFA`, `--shadow-card`, `--border` ≈ `#A1C1DB`, `--radius: 0.5rem`, Space Grotesk stack present
- [x] `tokens.ts` lists `REQUIRED_THEME_CSS_VARIABLES` without `--border-weight`, `--shadow-offset-sm`, `--shadow-offset-md`, Montserrat
- [x] Contract test asserts: all Onda vars present, no HOPE vars present
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 tests pass (presence assertions + absence assertions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): Onda CSS variables, Space Grotesk font, theme contract test`

---

### T03: shadcn primitive components [P]

**What**: Install shadcn primitives button, card, input, badge, dialog, sheet, skeleton, avatar, **sidebar** (+ separator if required by sidebar) re-themed to Onda CSS variables from T02; card styling SHALL use `shadow-card` pattern from reference. Each component uses Onda `--primary`, `--border`, `--radius` vars — not hardcoded HOPE values.
**Where**: `apps/web-next/src/components/ui/` (button.tsx, card.tsx, input.tsx, badge.tsx, dialog.tsx, sheet.tsx, skeleton.tsx, avatar.tsx, **sidebar.tsx**), `apps/web-next/src/lib/utils.ts` (`cn` helper)
**Depends on**: T02
**Reuses**: shadcn registry (plugin-shadcn-shadcn); `design-reference/serve-well/src/components/ui/sidebar.tsx` + card/badge/button patterns; NOT `apps/web/src/components/ui/` (HOPE-styled)
**Requirement**: MIG-FND-02

**Tools**:
- MCP: `plugin-shadcn-shadcn` (shadcn component installation)
- Skill: NONE

**Done when**:
- [x] All **9+** component files exist under `src/components/ui/` (includes `sidebar.tsx`)
- [x] `cn()` utility exported from `src/lib/utils.ts`
- [x] No hardcoded `border: 2px solid black`, `border-radius: 0`, or Montserrat in any component
- [x] Button `data-testid` renders at `--primary` bg; avatar initials derive from display name
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit behavior tests pass (button renders, card renders, badge renders, avatar initials)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): shadcn primitive components on Onda tokens (button, card, input, badge, dialog, sheet, skeleton, avatar)`

---

### T04: Auth primitives port

**What**: Port `sessionToken.ts`, `supabaseClient.ts`, `auth/authSession.ts`, and `auth/devVolunteerStorage.ts` verbatim-equivalent to `apps/web-next/src/auth/`; behavior-preserving (same `getAccessToken`, `shouldForceDevHeadersForApi`, `demoVolunteerId`, `devUserSelectAvailable` contracts); add unit tests for `authSession.ts` branch logic.
**Where**: `apps/web-next/src/auth/authSession.ts`, `apps/web-next/src/auth/devVolunteerStorage.ts`, `apps/web-next/src/sessionToken.ts`, `apps/web-next/src/supabaseClient.ts`
**Depends on**: T01
**Reuses**: `apps/web/src/auth/authSession.ts`, `apps/web/src/auth/devVolunteerStorage.ts`, `apps/web/src/sessionToken.ts`, `apps/web/src/supabaseClient.ts`
**Requirement**: MIG-DATA-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `shouldForceDevHeadersForApi()` returns true when `VITE_AUTH_USE_DEV_HEADERS` not set to `'false'`
- [x] `getAccessToken()` returns `null` in unit tests (no real Supabase client)
- [x] `demoVolunteerId()` returns null when env var unset
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit tests pass (authSession flag branches)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): port auth primitives (sessionToken, supabaseClient, authSession, devVolunteerStorage)`

---

### T05: AuthSessionProvider.tsx port

**What**: Port `auth/AuthSessionProvider.tsx` to `apps/web-next/src/auth/AuthSessionProvider.tsx`; exposes `useAuthSession()` hook returning `{ status, volunteerId, isSystemAdmin, newlyFulfilledInvites }`; wires Supabase `onAuthStateChange` and `fetchIdentityMe`; add `src/identity/fetchIdentityMe.ts` port.
**Where**: `apps/web-next/src/auth/AuthSessionProvider.tsx`, `apps/web-next/src/identity/fetchIdentityMe.ts`
**Depends on**: T04
**Reuses**: `apps/web/src/auth/AuthSessionProvider.tsx`, `apps/web/src/identity/fetchIdentityMe.ts`
**Requirement**: MIG-DATA-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `useAuthSession()` throws when called outside provider
- [x] `status: 'loading'` initial state, resolves to `'authenticated'` or `'dev-bypass'` in tests
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 unit behavior tests pass (initial loading state, dev-bypass branch)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): port AuthSessionProvider + fetchIdentityMe`

---

### T06: apiClient.ts (protected fetch + error map)

**What**: Write `apps/web-next/src/api/apiClient.ts` as a thin wrapper around `buildProtectedHeaders` / `fetchJsonWithProtectedHeaders` logic (port from `apps/web/src/apiAuthHeaders.ts`); expose `getJson<T>()` and `mutateJson<T>()`; port `apiError.ts` error contract; preserve 401→dev-header retry behavior.
**Where**: `apps/web-next/src/api/apiClient.ts`, `apps/web-next/src/api/apiError.ts`
**Depends on**: T04
**Reuses**: `apps/web/src/apiAuthHeaders.ts`, `apps/web/src/apiError.ts`
**Requirement**: MIG-DATA-01, MIG-DATA-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `getJson()` throws `ApiError` on non-2xx (same shape as existing `apiError`)
- [x] `mutateJson()` sets `Content-Type: application/json`
- [x] 401 retry with dev headers triggered when `scope.volunteerId` set + `VITE_AUTH_USE_DEV_HEADERS` truthy
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit tests pass (happy path, 4xx error, 401 retry, json mutation header)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): apiClient with protected-headers fetch and 401→dev retry`

---

### T07: queryKeys.ts (typed key factory) [P]

**What**: Write `apps/web-next/src/query/queryKeys.ts` with all domain key factories (`organizationContext`, `events`, `eventDetail`, `unavailability`, `ministryMemberships`, `assignments`, `systemAdmin.*`); keys are `as const` tuples matching design.md Data Models §query-key contract; add unit test asserting key shapes.
**Where**: `apps/web-next/src/query/queryKeys.ts`
**Depends on**: T01
**Reuses**: `apps/web/src/organization/types.ts` and `apps/web/src/identity/types.ts` (domain type shapes for scope parameter)
**Requirement**: MIG-DATA-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Each factory returns a stable `as const` tuple
- [x] `queryKeys.events({ churchId: 'a', ministryId: 'b' })` equals `['events', 'a', 'b'] as const`
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥5 unit tests pass (one per key factory)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): queryKeys typed factory for all domain queries`

---

### T08: QueryClient + QueryClientProvider

**What**: Write `apps/web-next/src/query/queryClient.ts` (singleton `QueryClient` with staleTime, retry policy, pessimistic mutation defaults per ADR 0001); write `apps/web-next/src/query/QueryProvider.tsx` wrapping children in `QueryClientProvider`; add unit test for retry policy.
**Where**: `apps/web-next/src/query/queryClient.ts`, `apps/web-next/src/query/QueryProvider.tsx`
**Depends on**: T06, T07
**Reuses**: NONE (TanStack Query v5 is new; no equivalent in apps/web)
**Requirement**: MIG-DATA-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `QueryClient` has `defaultOptions.mutations.onError` wired to toast via `toastOrchestrator` (or stub)
- [x] `staleTime: 30_000` (30 s) default or per-query override documented in file comment
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 unit tests pass (client instantiation, provider renders children)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): QueryClient singleton + QueryClientProvider with pessimistic defaults`

---

### T09: i18n port [P]

**What**: Port `i18n/resources.ts`, `i18n/controller.ts`, `i18n/I18nProvider.tsx`, `i18n/localePersistence.ts`, `i18n/resolveInitialLocale.ts`, and `i18n/intlFormat.ts` verbatim-equivalent; add `settings/LocalTimeProvider.tsx` + `settings/formatSchedulingTime.ts` port; keep pt-BR default.
**Where**: `apps/web-next/src/i18n/` (all files above), `apps/web-next/src/settings/LocalTimeProvider.tsx`, `apps/web-next/src/settings/formatSchedulingTime.ts`
**Depends on**: T01
**Reuses**: `apps/web/src/i18n/resources.ts`, `apps/web/src/i18n/controller.ts`, `apps/web/src/i18n/I18nProvider.tsx`, `apps/web/src/i18n/localePersistence.ts`, `apps/web/src/i18n/resolveInitialLocale.ts`, `apps/web/src/settings/LocalTimeProvider.tsx`, `apps/web/src/settings/formatSchedulingTime.ts`
**Requirement**: MIG-DATA-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `resolveInitialLocale()` returns `'pt-BR'` when localStorage empty
- [x] `localePersistence` read/write round-trips correctly
- [x] Campus-authoritative `buildDualInterval` produces correct UTC↔local string in pt-BR locale
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥5 unit tests pass (locale resolution, persistence, intlFormat, dual interval)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): port i18n controller, resources, locale persistence, LocalTimeProvider`

---

### T10: OrganizationProvider rebuilt on TanStack Query

**What**: Write `apps/web-next/src/organization/OrganizationProvider.tsx` re-expressing `OrganizationContextProvider` on `useQuery` (server fetch via `queryKeys.organizationContext`) + a selection store backed by `organizationContextStorage` helpers; expose same `useOrganization()` surface (`activeChurch`, `activeCampus`, `activeMinistry`, `onChurchChange`, `onCampusChange`, `onMinistryChange`, `refresh → queryClient.invalidateQueries`); port `fetchOrganizationContext.ts`, `organizationContextStorage.ts`, `ministryArchive.ts`, `organization/types.ts`.
**Where**: `apps/web-next/src/organization/OrganizationProvider.tsx`, `apps/web-next/src/organization/fetchOrganizationContext.ts`, `apps/web-next/src/organization/organizationContextStorage.ts`, `apps/web-next/src/organization/ministryArchive.ts`, `apps/web-next/src/organization/types.ts`
**Depends on**: T06, T07, T08
**Reuses**: `apps/web/src/organization/OrganizationContextProvider.tsx`, `apps/web/src/organization/fetchOrganizationContext.ts`, `apps/web/src/organization/organizationContextStorage.ts`, `apps/web/src/organization/ministryArchive.ts`, `apps/web/src/organization/types.ts`
**Requirement**: MIG-DATA-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `useOrganization()` throws outside provider
- [x] `refresh()` calls `queryClient.invalidateQueries({ queryKey: queryKeys.organizationContext() })`
- [x] `onChurchChange` updates selection store + re-resolves campus/ministry
- [x] `ministriesForShellSwitcher` honors archived visibility rules (admins see archived, others don't)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit behavior tests pass (initial load, church change, ministry resolution, archived visibility)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): OrganizationProvider rebuilt on TanStack Query (useQuery + selection store)`

---

### T11: Nav manifest with grant gating

**What**: Write `apps/web-next/src/navigation/manifest.ts` defining per-role nav manifests — `VOLUNTEER_NAV` (Dashboard, My Assignments, Time Away), `LEADER_NAV` (Dashboard, Events/Scheduling, Roster, Volunteers, Time Away), `ADMIN_NAV` (Ministries, Volunteers, Leaders) — and a `buildNavForGrants(grants)` helper that returns the correct items; add unit tests for each role combination.
**Where**: `apps/web-next/src/navigation/manifest.ts`
**Depends on**: T01
**Reuses**: `apps/web/src/navigation/manifest.ts` (item shapes and path conventions)
**Requirement**: MIG-FND-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Volunteer-only user gets Dashboard + My Assignments + Time Away (3 items)
- [x] Leader user additionally gets Scheduling + Roster + Volunteers items
- [x] Admin-only user gets Ministries + Volunteers + Leaders items
- [x] No placeholder routes carried forward unless still needed
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit tests pass (volunteer nav, leader nav, admin nav, combined grants)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): grant-gated nav manifest (volunteer / leader / admin)`

---

### T12: AppShell.tsx + shellRoute() helper

**What**: Write `apps/web-next/src/shell/AppShell.tsx` — signed-in shell using **shadcn `SidebarProvider` + `Sidebar`** layout ported from `design-reference/serve-well/src/components/onda/AppShell.tsx` / `AppSidebar.tsx`, adapted to ADR 0001 behavior: grant-gated nav from `buildNavForGrants`, Church/Campus context controls in top bar (no demo role dropdown, no global search); sticky top bar + mobile drawer via `SidebarTrigger`; includes `RouteErrorPanel`, `ToastHost`, `toastOrchestrator`, and `shellRoute()` helper.
**Where**: `apps/web-next/src/shell/AppShell.tsx`, `apps/web-next/src/shell/shellRoute.tsx`, `apps/web-next/src/shell/RouteErrorPanel.tsx`, `apps/web-next/src/shell/OrganizationContextControls.tsx`, `apps/web-next/src/feedback/ToastHost.tsx`, `apps/web-next/src/feedback/toastOrchestrator.ts`
**Depends on**: T03, T10, T11
**Reuses**: `design-reference/serve-well/src/components/onda/AppShell.tsx`, `AppSidebar.tsx`; `apps/web/src/shell/OrganizationContextControls.tsx`, `apps/web/src/feedback/ToastHost.tsx`, `apps/web/src/feedback/toastOrchestrator.ts`, `apps/web/src/shell/RouteErrorPanel.tsx`
**Requirement**: MIG-FND-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Shell renders Onda wordmark (text or SVG) + active church name from `useOrganization()`
- [x] Sidebar nav items derive from `buildNavForGrants`; no HOPE border-weight or offset-shadow classes
- [x] Mobile: top bar + drawer behavior (menu button toggles sidebar); desktop: fixed sidebar
- [x] `shellRoute(MyPage)` produces a component that renders `<AppShell><MyPage/></AppShell>`
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (shell renders wordmark, nav items for role, mobile drawer toggle)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): AppShell on Onda tokens (ADR 0001 layout, grant-gated nav, shellRoute helper)`

---

### T13: router.tsx (route tree + auth guard)

**What**: Write `apps/web-next/src/router.tsx` creating the full TanStack Router route tree: root route, shell-wrapped routes (`/dashboard`, `/scheduling`, `/scheduling/events/$eventId`, `/scheduling/events/new`, `/scheduling/events/new-private`, `/time-away`, `/leader/volunteer-time-away`, `/ministries`, `/volunteers`, `/ministry-leaders`), system-admin routes (`/system-admin/*`), auth guard via `beforeLoad`, and stub placeholder components for unbuilt routes; wire `QueryProvider`, `AuthSessionProvider`, `I18nProvider`, `LocalTimeProvider` in `main.tsx`. Route strings must match `apps/web/src/router.tsx` exactly (route parity — MIG-CUT-01).
**Where**: `apps/web-next/src/router.tsx`, `apps/web-next/src/main.tsx`
**Depends on**: T05, T09, T12
**Reuses**: `apps/web/src/router.tsx` (route tree structure, beforeLoad patterns)
**Requirement**: MIG-FND-01, MIG-FND-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `pnpm --filter @onda/web-next build` exits 0 with all route stubs
- [x] Unauthenticated access to `/dashboard` redirects to `/` with `auth=required` (landing auth panel)
- [x] All known routes (`/scheduling`, `/time-away`, `/ministries`, `/volunteers`, `/ministry-leaders`, `/system-admin/*`) present in route tree (stub components OK)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 unit tests pass (auth guard redirect, route tree renders without crash)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): TanStack Router route tree with auth guard and shell integration`

---

### T13.5: Mock-data look-and-feel preview (Volunteer + Leader, throwaway)

**What**: Replace the `/dashboard` (Volunteer) and `/scheduling` route **stubs** with mock-data previews that **mirror layout** from `design-reference/serve-well/src/components/onda/dashboards/VolunteerDashboard.tsx` and `MinistryLeaderDashboard.tsx` — **no** `apiClient` / TanStack Query. **Volunteer nav IA split** (per `VOLUNTEER_NAV`): `/dashboard` = greeting + assignment-count summary + **Time away** section + empty/skeleton variants; volunteer `/scheduling` ("My assignments") = 2-col assignment cards (`shadow-card`) via `VolunteerMyAssignmentsPreview`. **Leader** `/scheduling` = ministry hero + header CTAs, roster event card with fill badge and per-row Assign/Release (non-functional OK). **Omit** Lovable-only elements: Accept/Decline, location rows, pending badges. Fixtures in `src/__preview__/`, deleted/replaced by T16/T20/T21.
**Where**: `apps/web-next/src/routes/dashboard.tsx` + `apps/web-next/src/routes/scheduling.tsx` (preview bodies), `apps/web-next/src/__preview__/fixtures.ts`, `apps/web-next/src/__preview__/VolunteerMyAssignmentsPreview.tsx`
**Depends on**: T13
**Reuses**: T03 shadcn primitives, T12 `AppShell`; `design-reference/serve-well/src/components/onda/dashboards/*`; fixture shapes mirror `apps/web/src/identity/types.ts` / event+roster DTOs
**Requirement**: MIG-FND-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `/dashboard` (volunteer): greeting + assignment-count summary, **Time away** list + Add period CTA, empty/skeleton variants (no network); assignment cards live on volunteer `/scheduling` per nav IA (not one combined Lovable screen)
- [x] `/scheduling` (volunteer): 2-col assignment cards (`shadow-card`) via `VolunteerMyAssignmentsPreview` (no network)
- [x] `/scheduling` (leader): ministry hero + summary line + header CTAs, roster event card with `X/Y filled` badge and Assign/Release row actions (no network)
- [x] Side-by-side manual check vs `design-reference/serve-well` dashboards at 1440px before closing #143
- [x] No `apiClient` / `useQuery` import in the preview bodies; fixtures isolated under `src/__preview__/`
- [x] No HOPE classes; only Onda tokens/components
- [x] A `// TODO(MIG-FND-04): throwaway preview — remove when T16/T20/T21 land` marker is present in each preview body and in `fixtures.ts`
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥1 render smoke per preview (dashboard renders greeting; scheduling renders fill badge)

**Tests**: unit (render smoke only)
**Gate**: quick

**Commit**: `feat(web-next): mock-data look-and-feel preview for Volunteer + Leader (throwaway, MIG-FND-04)`

---

### T14: volunteerAssignmentsQuery + volunteerUnavailabilityQuery [P]

**What**: Write `apps/web-next/src/volunteer/volunteerAssignmentsQuery.ts` and `apps/web-next/src/volunteer/volunteerUnavailabilityQuery.ts` as `queryOptions` factories (TanStack Query v5); add corresponding `createVolunteerUnavailability`, `updateVolunteerUnavailability`, `deleteVolunteerUnavailability` mutation functions in `apps/web-next/src/volunteer/unavailabilityMutations.ts`; unit tests mock `apiClient`.
**Where**: `apps/web-next/src/volunteer/volunteerAssignmentsQuery.ts`, `apps/web-next/src/volunteer/volunteerUnavailabilityQuery.ts`, `apps/web-next/src/volunteer/unavailabilityMutations.ts`
**Depends on**: T06, T07
**Reuses**: `apps/web/src/identity/fetchVolunteerAssignments.ts`, `apps/web/src/identity/fetchVolunteerUnavailability.ts`, `apps/web/src/identity/createVolunteerUnavailability.ts`, `apps/web/src/identity/updateVolunteerUnavailability.ts`, `apps/web/src/identity/deleteVolunteerUnavailability.ts`
**Requirement**: MIG-DATA-01, MIG-VOL-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `volunteerAssignmentsQuery({ volunteerId, churchId })` returns `queryOptions` with correct key from `queryKeys.assignments()`
- [x] `volunteerUnavailabilityQuery({ volunteerId })` returns `queryOptions` with correct key
- [x] Mutation fns accept same payloads as current identity fetchers; call `apiClient.mutateJson`
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥5 unit tests pass (assignments query options, unavailability query options, create/update/delete mutation fns call apiClient correctly)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): volunteer assignments + unavailability queryOptions and mutation fns`

---

### T15: AssignmentCard.tsx component [P]

**What**: Write `apps/web-next/src/components/AssignmentCard.tsx` — displays Event title, Ministry · Role, localized date/time (campus-authoritative via `SchedulingTimeDisplay`), "confirmed" status badge (Onda semantic colors); skeleton placeholder variant; navigates to `/scheduling/events/$eventId` on activation.
**Where**: `apps/web-next/src/components/AssignmentCard.tsx`
**Depends on**: T03, T09
**Reuses**: `apps/web/src/routes/dashboard.tsx` (assignment row pattern), `apps/web/src/settings/SchedulingTimeDisplay.tsx`
**Requirement**: MIG-VOL-01, UI-VOL-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Card renders event title, "Ministry · Role" label, localized date/time
- [x] Status badge shows "confirmed" when `assignment.status === 'ROSTERED'`
- [x] Skeleton variant renders layout-stable placeholders (no layout shift)
- [x] No HOPE classes (`border-2 border-black`, `rounded-none`, `shadow-[4px_4px_0_black]`)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (renders card data, shows badge, skeleton renders)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): AssignmentCard component (Onda tokens, skeleton, localized time)`

---

### T16: VolunteerDashboardPage.tsx + e2e [P]

**What**: Write `apps/web-next/src/routes/dashboard.tsx` — `VolunteerDashboardPage` with greeting header ("Hi {name}", upcoming assignment count from `volunteerAssignmentsQuery`), Time Away preview section (first 3 unavailability rows from `volunteerUnavailabilityQuery` + Add/Edit/Delete + "View all" link), empty states with i18n copy; route loader calls `queryClient.ensureQueryData` for both queries; add Playwright e2e smoke test. **No assignment cards on this route** — cards live on volunteer `/scheduling` (T16.5) per nav IA locked in #143. **Supersedes the T13.5 mock-data preview — remove the volunteer fixtures/`__preview__` usage for `/dashboard` only.**
**Where**: `apps/web-next/src/routes/dashboard.tsx`, `apps/web-next/e2e/volunteer-dashboard.spec.ts`
**Depends on**: T12, T13, T14, T15
**Reuses**: `apps/web/src/routes/dashboard.tsx` (loading/error patterns — count + preview only), `apps/web/src/routes/timeAway.tsx` (unavailability row patterns); design ref `design-reference/serve-well/src/components/onda/dashboards/VolunteerDashboard.tsx` (home sections only)
**Requirement**: MIG-VOL-01, UI-VOL-01, UI-VOL-03, UI-VOL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Page greets by display name; assignment count summary shows correct number (including 0)
- [x] Time Away preview shows ≤3 rows; "View all" navigates to `/time-away`
- [x] Skeletons appear while loading; no error crash on empty data
- [x] No assignment card grid on `/dashboard` (cards are T16.5 on `/scheduling`)
- [x] Playwright smoke: volunteer dashboard loads, greeting visible, time-away section or empty state visible
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit behavior tests (greeting renders, assignment count, time-away preview, empty state); Playwright e2e smoke green

**Tests**: unit + e2e
**Gate**: full

**Commit**: `feat(web-next): VolunteerDashboardPage (greeting, assignment count, time-away preview, Onda design)`

---

### T16.5: VolunteerMyAssignmentsPage at `/scheduling` [P]

**What**: Replace the volunteer branch of `apps/web-next/src/routes/scheduling.tsx` — when the signed-in user has volunteer nav (and is not viewing leader roster), render a **My Assignments** page: 2-col `AssignmentCard` grid from `volunteerAssignmentsQuery`, empty state (UI-VOL-05), skeletons while loading. Grant-based role branch (same pattern as T13.5 `VolunteerMyAssignmentsPreview`); **do not** break leader branch (T20 replaces leader preview separately). **Supersedes `VolunteerMyAssignmentsPreview` and volunteer fixtures on `/scheduling`.**
**Where**: `apps/web-next/src/routes/scheduling.tsx` (volunteer branch), optionally extract `VolunteerMyAssignmentsPage.tsx`
**Depends on**: T12, T13, T14, T15
**Reuses**: T13.5 `VolunteerMyAssignmentsPreview` layout; `design-reference/serve-well` assignments grid; `AssignmentCard` from T15
**Requirement**: MIG-VOL-01, UI-VOL-02, UI-VOL-04, UI-VOL-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Volunteer `/scheduling` renders `AssignmentCard` list in 2-col grid at md+ breakpoints
- [x] Cards link to `/scheduling/events/$eventId` on activation
- [x] Empty state when no assignments; skeletons while loading
- [x] Leader grant still routes to leader preview until T20 lands (no regression)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests (grid renders, empty state, card navigation)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): volunteer My Assignments at /scheduling (AssignmentCard grid, nav IA)`

---

### T17: TimeAwayPage.tsx [P]

**What**: Write `apps/web-next/src/routes/timeAway.tsx` — full `/time-away` route with paginated `Unavailability` list, Add/Edit/Delete CRUD (inline expand or dialog — document choice in PR), `useMutation` with pessimistic semantics + explicit `queryClient.invalidateQueries({ queryKey: queryKeys.unavailability() })`; i18n pt-BR + en strings.
**Where**: `apps/web-next/src/routes/timeAway.tsx`
**Depends on**: T12, T13, T14
**Reuses**: `apps/web/src/routes/timeAway.tsx` (CRUD flow patterns)
**Requirement**: MIG-VOL-01, UI-VOL-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] List renders all unavailability rows for signed-in volunteer
- [x] Create/Edit form submits via `useMutation`; on success invalidates `queryKeys.unavailability(volunteerId)`
- [x] Delete shows confirm dialog before `deleteVolunteerUnavailability`
- [x] Inline error appears near form on API rejection (ADR 0001 hybrid feedback)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (list renders, add form submits, delete confirm)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): TimeAwayPage (unavailability CRUD, pessimistic mutations, cache invalidation)`

---

### T18: Leader query options + mutations [P]

**What**: Write `apps/web-next/src/leader/leaderEventsQuery.ts` (queryOptions for events by ministry scope), `apps/web-next/src/leader/eventDetailQuery.ts` (queryOptions for single event with roster), `apps/web-next/src/leader/assignMutation.ts`, and `apps/web-next/src/leader/releaseMutation.ts` with pessimistic semantics (no optimistic apply) and invalidation map: assign/release → `queryKeys.eventDetail(eventId)` + `queryKeys.events(scope)`.
**Where**: `apps/web-next/src/leader/leaderEventsQuery.ts`, `apps/web-next/src/leader/eventDetailQuery.ts`, `apps/web-next/src/leader/assignMutation.ts`, `apps/web-next/src/leader/releaseMutation.ts`
**Depends on**: T06, T07
**Reuses**: `apps/web/src/events/fetchEvents.ts`, `apps/web/src/events/fetchEventDetail.ts`, `apps/web/src/events/createAssignment.ts`, `apps/web/src/events/voidAssignment.ts`, `apps/web/src/events/releaseAssignment.ts`
**Requirement**: MIG-DATA-01, MIG-LEAD-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `leaderEventsQuery(scope)` produces stable key via `queryKeys.events(scope)` and fetches via `apiClient.getJson`
- [x] `eventDetailQuery(eventId)` key matches `queryKeys.eventDetail(eventId)`
- [x] `assignMutation` invalidates `eventDetail` + `events` on success; throws `ApiError` on rejection
- [x] `releaseMutation` (leader void, not volunteer self-release) invalidates same keys
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥5 unit tests pass (query key shapes, assign mutation invalidation, release mutation invalidation, error propagation)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): leader event/detail queryOptions and assign/release mutations (pessimistic)`

---

### T19: RosterByEventSection.tsx [P]

**What**: Write `apps/web-next/src/components/RosterByEventSection.tsx` — renders one event as a card/section with title, localized start time, fill badge (e.g. `3/5 filled`); each roster row shows Role + volunteer display name + initials avatar if assigned, or "Unfilled" + Assign button if empty; Release button on assigned rows; Assign/Release call parent-supplied mutation handlers.
**Where**: `apps/web-next/src/components/RosterByEventSection.tsx`
**Depends on**: T03, T09
**Reuses**: `apps/web/src/routes/schedulingEventDetail.tsx` (roster row patterns)
**Requirement**: MIG-LEAD-01, UI-LEAD-02, UI-LEAD-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Fill badge shows `X/Y filled` in brand semantic color (e.g. green when full, amber when partial)
- [x] Assigned row shows role label + display name + `<avatar initials>`
- [x] Unfilled row shows "Unfilled" + "Assign" button (Onda primary)
- [x] Release button visible on assigned rows; triggers handler prop
- [x] No HOPE classes
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit behavior tests (fill badge, assigned row, unfilled row with assign button, release button)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): RosterByEventSection component (fill ratio, assign/release, Onda tokens)`

---

### T20: LeaderSchedulingPage.tsx + e2e [P]

**What**: Write `apps/web-next/src/routes/scheduling.tsx` — `LeaderSchedulingPage` with ministry hero header (Ministry name, event count + unfilled slots for next 7 days per UI-LEAD-01), event list rendered as `RosterByEventSection` tiles (roster by event with fill ratio per UI-LEAD-02), Assign/Release wired to `assignMutation`/`releaseMutation` with inline error feedback (ADR 0001), "New event" + "Assign volunteer" header CTAs (UI-LEAD-04); route loader prefetches via `ensureQueryData`; add Playwright e2e smoke. **Supersedes the T13.5 mock-data preview — remove the leader fixtures/`__preview__` usage for the leader branch of `/scheduling` only** (volunteer branch is T16.5).
**Where**: `apps/web-next/src/routes/scheduling.tsx`, `apps/web-next/e2e/leader-scheduling.spec.ts`
**Depends on**: T12, T13, T18, T19
**Reuses**: `apps/web/src/routes/scheduling.tsx` (event-list fetch pattern), `apps/web/src/routes/schedulingEventDetail.tsx` (assign/release patterns)
**Requirement**: MIG-LEAD-01, UI-LEAD-01, UI-LEAD-02, UI-LEAD-03, UI-LEAD-04, UI-LEAD-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Ministry name hero visible when active ministry context set
- [x] Event summary shows count + unfilled slot count for next 7 days
- [x] Empty state renders with i18n copy when no events
- [x] Assign action opens assign flow; inline error appears on API rejection
- [x] Release action calls void mutation (leader stewardship, not volunteer self-release)
- [x] Playwright smoke: leader scheduling page loads, ministry hero visible, roster section renders
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥4 unit behavior tests (hero renders, event count summary, empty state, inline error on rejection); Playwright e2e smoke green

**Tests**: unit + e2e
**Gate**: full

**Commit**: `feat(web-next): LeaderSchedulingPage (ministry hero, roster-by-event, assign/release, Onda design)`

---

### T21: SchedulingEventDetailPage.tsx + e2e [P]

**What**: Write `apps/web-next/src/routes/schedulingEventDetail.tsx` — event detail view with event title/time/status, full roster (all roles + assignments), assign/release actions (Onda tokens), inline error feedback per ADR 0001; route loader calls `queryClient.ensureQueryData(eventDetailQuery(eventId))`; add Playwright e2e smoke (view event detail, verify roster).
**Where**: `apps/web-next/src/routes/schedulingEventDetail.tsx`, `apps/web-next/e2e/scheduling-event-detail.spec.ts`
**Depends on**: T12, T13, T18, T19
**Reuses**: `apps/web/src/routes/schedulingEventDetail.tsx` (layout, pending/confirmed states)
**Requirement**: MIG-LEAD-01, UI-LEAD-02, UI-LEAD-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Event title, localized time, and status badge render on load
- [x] Full roster list renders with `RosterByEventSection`
- [x] Assign / Release actions fire mutations; page re-fetches via `queryClient.invalidateQueries` after success
- [x] Inline error shown near relevant row on API rejection
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests (event detail renders, assign action, release action); Playwright e2e smoke green

**Tests**: unit + e2e
**Gate**: full

**Commit**: `feat(web-next): SchedulingEventDetailPage (roster, assign/release, pessimistic mutations)`

---

### T22: SchedulingCreatePrivateEventPage.tsx [P]

**What**: Write `apps/web-next/src/routes/schedulingCreatePrivateEvent.tsx` — private event creation form (title, date/time fields with campus-authoritative timezone display, ministry auto-populated from active context); `useMutation` for `POST /events` with pessimistic semantics; on success navigate to new event detail + invalidate `queryKeys.events(scope)`; i18n strings.
**Where**: `apps/web-next/src/routes/schedulingCreatePrivateEvent.tsx`
**Depends on**: T12, T13
**Reuses**: `apps/web/src/routes/schedulingCreatePrivateEvent.tsx`, `apps/web/src/events/createPrivateEvent.ts`, `apps/web/src/settings/datetimeLocalUtc.ts`
**Requirement**: MIG-LEAD-01, MIG-ADMIN-01, UI-LEAD-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Form validates required fields; submit button disabled until valid
- [x] On success: `queryKeys.events(scope)` invalidated; user navigated to new event detail route
- [x] UTC↔local datetime conversion uses `datetimeLocalUtc` helpers (campus timezone)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (form renders, validation, submit mutation called)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): SchedulingCreatePrivateEventPage (private event form, campus datetime, pessimistic mutation)`

---

### T23: LeaderVolunteerTimeAwayPage.tsx [P]

**What**: Write `apps/web-next/src/routes/leaderVolunteerTimeAway.tsx` — leader picks ministry + volunteer in-form (matching current `apps/web` page; no `$volunteerId` URL segment), then views/creates/deletes that volunteer's unavailability on their behalf via existing API; same `volunteerUnavailabilityQuery` + mutations; route guarded by leader grant.
**Where**: `apps/web-next/src/routes/leaderVolunteerTimeAway.tsx`
**Depends on**: T12, T13, T14
**Reuses**: `apps/web/src/routes/leaderVolunteerTimeAway.tsx`
**Requirement**: MIG-LEAD-01, UI-LEAD-05, UI-LEAD-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Route at `/leader/volunteer-time-away` (parity with `apps/web`) renders the in-form ministry + volunteer picker and the selected volunteer's unavailability list
- [x] Leader can add/delete unavailability rows; mutations invalidate `queryKeys.unavailability(volunteerId)`
- [x] Access denied for non-leader grants (route guard in `beforeLoad`)
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 unit behavior tests pass (list renders, access guard)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): LeaderVolunteerTimeAwayPage (leader manages volunteer unavailability)`

---

### T24: Org-admin routes — ministries, volunteers, ministryLeaders [P]

**What**: Port `apps/web-next/src/routes/ministries.tsx`, `apps/web-next/src/routes/volunteers.tsx`, and `apps/web-next/src/routes/ministryLeaders.tsx` functionally equivalent to `apps/web`; use Onda shell tokens (no HOPE); replace ad-hoc `useEffect` fetches with `useQuery` + `queryOptions` factories in `apps/web-next/src/organization/ministryStructureQueries.ts` (fetch memberships, roles, ministry leaders); include `useMutation` for create/invite/delete operations; flag pages for future Onda redesign in PR description.
**Where**: `apps/web-next/src/routes/ministries.tsx`, `apps/web-next/src/routes/volunteers.tsx`, `apps/web-next/src/routes/ministryLeaders.tsx`, `apps/web-next/src/organization/ministryStructureQueries.ts`
**Depends on**: T10, T12, T13
**Reuses**: `apps/web/src/routes/ministries.tsx`, `apps/web/src/routes/volunteers.tsx`, `apps/web/src/routes/ministryLeaders.tsx`, `apps/web/src/organization/fetchMinistryRoles.ts`, `apps/web/src/organization/fetchMinistryMemberships.ts`, `apps/web/src/organization/membershipLifecycle.ts`
**Requirement**: MIG-ADMIN-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] All three pages render data from live API via `useQuery`
- [x] CRUD mutations use `useMutation` with invalidation of relevant org-context keys
- [x] No HOPE visual classes; shell token defaults applied
- [x] Each page has a `// TODO: Onda design phase — port with neutral tokens for now` comment
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (one per page: renders, key data visible)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): org-admin routes port (ministries, volunteers, ministryLeaders, neutral tokens)`

---

### T25: System-admin shell + route guards [P]

**What**: Write `apps/web-next/src/system-admin/SystemAdminShell.tsx` (system-admin layout with own nav; uses Onda shell tokens), port `ensureSystemAdminRouteAccess.ts` (beforeLoad guard checking `isSystemAdmin` from auth session); add system-admin routes to router (parent + child routes under `/system-admin/*`).
**Where**: `apps/web-next/src/system-admin/SystemAdminShell.tsx`, `apps/web-next/src/system-admin/ensureSystemAdminRouteAccess.ts`
**Depends on**: T05, T12, T13
**Reuses**: `apps/web/src/system-admin/SystemAdminShell.tsx`, `apps/web/src/system-admin/ensureSystemAdminRouteAccess.ts`
**Requirement**: MIG-ADMIN-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Non-system-admin accessing `/system-admin/*` is redirected (or shown access-denied)
- [x] `SystemAdminShell` renders system-admin nav with Onda tokens
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥2 unit behavior tests pass (access guard redirects, shell renders)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): system-admin shell + route guard (ADR 0005, Onda tokens)`

---

### T26: System-admin content pages

**What**: Port all system-admin content pages to `apps/web-next/src/system-admin/`: `SystemAdminDashboardPage.tsx`, `SystemAdminChurchesPage.tsx`, `SystemAdminChurchDetailPage.tsx`, `SystemAdminUsersPage.tsx`, `SystemAdminUserDetailPage.tsx`, `SystemAdminSchedulingPage.tsx`, `SystemAdminSchedulingEventDetailPage.tsx`; replace useEffect fetches with `useQuery` + queryOptions in `systemAdminQueries.ts`; neutral Onda tokens; flag for future design.
**Where**: `apps/web-next/src/system-admin/` (7 page files + `systemAdminQueries.ts`)
**Depends on**: T25
**Reuses**: `apps/web/src/system-admin/SystemAdminDashboardPage.tsx`, `apps/web/src/system-admin/SystemAdminChurchesPage.tsx`, `apps/web/src/system-admin/SystemAdminChurchDetailPage.tsx`, `apps/web/src/system-admin/SystemAdminUsersPage.tsx`, `apps/web/src/system-admin/SystemAdminUserDetailPage.tsx`, `apps/web/src/system-admin/SystemAdminSchedulingPage.tsx`, `apps/web/src/system-admin/SystemAdminSchedulingEventDetailPage.tsx`
**Requirement**: MIG-ADMIN-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] All 7 pages render data from live API via `useQuery`
- [x] System-admin church create mutation invalidates `queryKeys.systemAdmin.churches()`
- [x] Read-only scheduling guard respected (system admin cannot mutate scheduling, ADR 0005)
- [x] No HOPE classes; neutral token defaults
- [x] Gate check passes: `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test`
- [x] Test count: ≥3 unit behavior tests pass (dashboard renders, churches list renders, access guard on scheduling)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(web-next): system-admin content pages port (7 pages, useQuery, neutral tokens)`

---

### T27: CI parity scripts + typecheck/test/coverage CI jobs

**What**: Add `typecheck:web-next` script to root `package.json`; add `test:web-next` and `test:coverage:web-next` scripts (or extend existing coverage script to include `@onda/web-next`); add `typecheck-web-next` job to `.github/workflows/ci.yml` mirroring the `typecheck-web` job; extend `test`/`coverage` CI jobs to include `@onda/web-next`; configure Vitest coverage config in `apps/web-next/vitest.config.ts` meeting global floors (#129).
**Where**: root `package.json`, `.github/workflows/ci.yml`, `apps/web-next/vitest.config.ts`
**Depends on**: T26, T17, T23
**Reuses**: `.github/workflows/ci.yml` (typecheck-web job as template), `apps/web/vitest.config.ts` (coverage config pattern)
**Requirement**: MIG-ENG-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `pnpm typecheck:web-next` exits 0 on current codebase
- [x] `pnpm --filter @onda/web-next test` runs Vitest and exits 0
- [x] CI `typecheck-web-next` job present in `ci.yml`
- [x] CI `coverage` job includes `@onda/web-next` filter
- [x] Coverage config enforces global floors aligned with #129 (`61/60/49/60` — functions ratcheted 1pp for new surface; stubs/e2e-only excluded per `vitest.config.ts`)
- [x] Gate check passes: `pnpm lint && pnpm --filter @onda/web-next build`
- [ ] Test count: N/A (this task is CI infrastructure; verify via CI run)

**Tests**: none
**Gate**: build

**Commit**: `feat(web-next): CI parity — typecheck/test/coverage scripts and CI jobs`

---

### T28: Playwright smoke CI wiring

**What**: Add `web-next` Playwright config in `apps/web-next/playwright.config.ts`; add `test:e2e:web-next` script to root `package.json`; extend `.github/workflows/e2e-web.yml` with a `e2e-web-next` job (or sibling file) that runs `pnpm test:e2e:web-next` against Postgres + `pnpm dev:api`; smoke tests from T16 and T21 must pass in CI.
**Where**: `apps/web-next/playwright.config.ts`, root `package.json` (`test:e2e:web-next` script), `.github/workflows/e2e-web.yml`
**Depends on**: T16, T21, T27
**Reuses**: `apps/web/playwright.config.ts` (config structure), `.github/workflows/e2e-web.yml` (job template)
**Requirement**: MIG-ENG-01, MIG-CUT-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `pnpm --filter @onda/web-next exec playwright install chromium` installs without error
- [x] `PLAYWRIGHT_WITH_API=true pnpm --filter @onda/web-next test:e2e` runs the volunteer dashboard and leader scheduling smoke tests green (requires Postgres + `pnpm dev:api`)
- [x] `e2e-web-next` CI job exists in `e2e-web.yml`
- [x] Gate check passes: `pnpm lint && pnpm --filter @onda/web-next build`
- [x] Test count: N/A (CI job verification)

**Tests**: none
**Gate**: build

**Commit**: `feat(web-next): Playwright config + e2e CI job for web-next smoke tests`

---

### T29: Cutover PR 1 — deploy repoint to web-next

**What**: Single dedicated PR that repoints the build/deploy target from `apps/web-legacy` to `apps/web-next`; update any deploy scripts, `Dockerfile` (if present), or CI build step that references the legacy app as the build artifact; verify `pnpm build` produces the correct `dist/` from `apps/web-next`; all existing CI gates green on the PR.
**Where**: CI build config, deploy scripts, root `package.json` (if `build` script references `apps/web` explicitly)
**Depends on**: T27, T28
**Reuses**: NONE (config change only)
**Requirement**: MIG-CUT-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `pnpm build` artifact comes from `apps/web-next`
- [ ] All CI jobs (`lint`, `typecheck-web-next`, `test`, `coverage`, `e2e-web-next`) green on the PR
- [ ] `apps/web-legacy` CI jobs still green (legacy app untouched until T30)
- [ ] Gate check passes: `pnpm lint && pnpm --filter @onda/web-next build`
- [ ] Test count: N/A (deploy config only)

**Tests**: none
**Gate**: build

**Commit**: `feat(cutover): repoint build/deploy to apps/web-next`

---

### T30a: Legacy app rename (`apps/web` → `apps/web-legacy`)

**What**: Dedicated prep PR (before T30): rename `apps/web/` → `apps/web-legacy/`; package `@onda/web` → `@onda/web-legacy`; update root scripts (`dev:web-legacy`, `typecheck:web-legacy`, `test:e2e:web-legacy`), CI job names (`typecheck-web-legacy`, `playwright-web-legacy`), and active runbooks. **Does not** rename `web-next` → `web` or retire legacy source.
**Where**: `apps/web-legacy/`, root `package.json`, `.github/workflows/ci.yml`, `.github/workflows/e2e-web.yml`, `AGENTS.md`, `README.md`, runbooks
**Depends on**: T28 (both apps in CI)
**Reuses**: NONE (rename + reference sweep)
**Requirement**: MIG-CUT-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `apps/web/` no longer exists; `apps/web-legacy/` is the HOPE-era app
- [x] `@onda/web-legacy` package name; root scripts and CI filters updated
- [x] `apps/web-next` unchanged (still `@onda/web-next`, port 5174)
- [x] Gate check passes: `pnpm typecheck:web-legacy && pnpm --filter @onda/web-legacy test && pnpm lint`
- [x] Test count: 144 Vitest tests green on `@onda/web-legacy`

**Tests**: none (rename)
**Gate**: quick

**Commit**: `chore: rename apps/web to apps/web-legacy`

---

### T30: Cutover PR 2 — rename + retire + DESIGN_SYSTEM.md + ADR 0006

**What**: Follow-up PR: rename `apps/web-next/` → `apps/web/`; delete or archive `apps/web-legacy/`; update all internal references (`@onda/web-next` → `@onda/web`); replace `DESIGN_SYSTEM.md` root file with Onda brand content (HOPE docs archived to `docs/archive/` or deleted); update ADR 0006 status to "Accepted + Shipped"; remove `@onda/web-legacy` CI jobs; verify all CI green. **Prerequisite:** T30a shipped (legacy already at `apps/web-legacy`).
**Where**: `apps/web-next/` → `apps/web/` (rename), `apps/web-legacy/` (retire), root `DESIGN_SYSTEM.md`, `docs/adr/0006-onda-brand-visual-system.md`, `.github/workflows/ci.yml` (remove legacy web jobs)
**Depends on**: T29
**Reuses**: NONE (rename + doc swap)
**Requirement**: MIG-CUT-01, MIG-ENG-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `apps/web-next/` no longer exists; `apps/web/` is the rebuilt app
- [ ] `DESIGN_SYSTEM.md` documents Onda tokens, Space Grotesk, ADR 0006 (no HOPE content)
- [ ] ADR 0006 status field reads `Accepted — Shipped (web-next cutover)`
- [ ] Old `@onda/web-legacy` CI jobs removed from `ci.yml` and `e2e-web.yml`
- [ ] `apps/web-legacy/` retired (deleted or archived)
- [ ] `pnpm build` and all CI jobs green post-rename
- [ ] Gate check passes: `pnpm lint && pnpm build`
- [ ] Test count: N/A (rename + docs)

**Tests**: none
**Gate**: build

**Commit**: `feat(cutover): rename web-next→web, replace DESIGN_SYSTEM.md (Onda), retire apps/web-legacy, ADR 0006 shipped`

---

## Parallel Execution Map

```
Phase 1 — Foundation (Sequential):
  T01 ──→ T02 ──→ T03

Phase 2 — Data Core:
  T01 → T04 → T05 → T06 → T08 → T10
  T01 → T07 [P] ─────────────→ T08
  T01 → T09 [P] (independent of auth/fetch chain)

Phase 3 — Shell (Sequential):
  T10 → T11 → T12 → T13 → T13.5  (T13.5 = throwaway mock-data brand checkpoint; closes Slice 1 / #143)

Phase 4 — Vertical Slices (after T13.5 closes Slice 1; slices run in parallel):

  Volunteer slice:
    T13 → T14 [P start from T06/T07]
    T03 → T15 [P start from T03]
    T14 + T15 + T12 + T13 → T16 [P]
    T14 + T15 + T12 + T13 → T16.5 [P]
    T14 + T12 + T13       → T17 [P]

  Leader slice:
    T18 [P start from T06/T07] → T20 [P] (after T12+T13)
    T03 → T19 [P]               → T21 [P] (after T12+T13)
                                  T22 [P] (after T12+T13, no T19 dep)
                                  T23 [P] (after T12+T13+T18)

  Admin slice:
    T10 + T12 + T13 → T24 [P]
    T05 + T12 + T13 → T25 [P]
    T25             → T26

Phase 5 — Cutover (Sequential):
  T26 + T17 + T23 → T27 → T28 → T30a → T29 → T30
```

**Parallelism constraints:**
- T16 and T16.5 and T17 may run in parallel (T16.5 shares `scheduling.tsx` with T20 — coordinate role branches)
- T20, T21, T22, T23 may run in parallel (separate route files)
- T24, T25 may run in parallel with the volunteer/leader slices; T26 must wait for T25
- T07 (queryKeys) and T09 (i18n) may start from T01 (no auth/fetch dependency)

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T01: Package scaffold | 1 config bundle (package.json + vite + tsconfig + stub) | ✅ Granular |
| T02: Onda globals.css + theme contract test | 1 CSS file + 1 tokens file + 1 test file (cohesive) | ✅ Granular |
| T03: shadcn primitives | 8 UI primitives via plugin (cohesive bundle) | ✅ Granular |
| T04: Auth primitives | 4 auth files (sessionToken, supabaseClient, authSession, devVolunteerStorage — cohesive) | ✅ Granular |
| T05: AuthSessionProvider | 1 provider component + 1 identity fetcher | ✅ Granular |
| T06: apiClient + apiError | 2 files (one is the error contract supporting the other — cohesive) | ✅ Granular |
| T07: queryKeys.ts | 1 file (all query keys in one factory — cohesive) | ✅ Granular |
| T08: QueryClient + QueryProvider | 2 files (client config + React provider wrapper — cohesive) | ✅ Granular |
| T09: i18n port | 6 i18n files + 2 settings files (cohesive i18n+time layer) | ⚠️ Large but cohesive language layer — OK |
| T10: OrganizationProvider | 1 provider + 4 supporting helpers (org context is one domain boundary) | ✅ Granular |
| T11: Nav manifest | 1 file | ✅ Granular |
| T12: AppShell + shellRoute | AppShell + shellRoute + RouteErrorPanel + OrgContextControls + ToastHost + toastOrchestrator (cohesive shell bundle) | ⚠️ 6 files but all are shell infrastructure — cohesive |
| T13: router.tsx | 1 router file + main.tsx wiring (cohesive entry point) | ✅ Granular |
| T13.5: Mock-data preview | 2 route bodies + 1 fixtures file (throwaway brand checkpoint) | ✅ Granular |
| T14: Volunteer query options | 2 query files + 1 mutation file (cohesive volunteer data layer) | ✅ Granular |
| T15: AssignmentCard | 1 component | ✅ Granular |
| T16: VolunteerDashboardPage + e2e | 1 route + 1 e2e spec (co-located test) | ✅ Granular |
| T16.5: Volunteer My Assignments | Volunteer branch of scheduling route | ✅ Granular |
| T17: TimeAwayPage | 1 route | ✅ Granular |
| T18: Leader queries + mutations | 4 files (leaderEventsQuery, eventDetailQuery, assignMutation, releaseMutation — cohesive leader data layer) | ✅ Granular |
| T19: RosterByEventSection | 1 component | ✅ Granular |
| T20: LeaderSchedulingPage + e2e | 1 route + 1 e2e spec (co-located test) | ✅ Granular |
| T21: SchedulingEventDetailPage + e2e | 1 route + 1 e2e spec (co-located test) | ✅ Granular |
| T22: SchedulingCreatePrivateEventPage | 1 route | ✅ Granular |
| T23: LeaderVolunteerTimeAwayPage | 1 route | ✅ Granular |
| T24: Org-admin routes | 3 routes + 1 query file (cohesive org-admin functional port) | ⚠️ 3 routes but same pattern/design — cohesive functional port |
| T25: System-admin shell + guards | 2 files (shell + guard — cohesive access boundary) | ✅ Granular |
| T26: System-admin content pages | 7 pages + 1 queries file (cohesive functional port; same template) | ⚠️ Large but mechanically uniform port — OK |
| T27: CI scripts + jobs | 3 config locations (package.json, ci.yml, vitest.config.ts — cohesive CI parity) | ✅ Granular |
| T28: Playwright CI wiring | playwright.config.ts + e2e-web.yml job (cohesive e2e CI) | ✅ Granular |
| T29: Deploy repoint | Config change only (1 PR) | ✅ Granular |
| T30a: Legacy rename | Rename `apps/web` → `apps/web-legacy` (prep PR) | ✅ Granular |
| T30: Rename + retire + docs | 1 final cleanup PR | ✅ Granular |

**Notes on ⚠️ cases:** T09, T12, T24, T26 each bundle multiple closely-related files under one domain concern. Per the template ("2–3 related things in same file = OK if cohesive"), these are acceptable — each bundle is a single architectural layer with a single verifiable outcome. Splitting them further would produce tasks that cannot be independently compiled or tested.

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|------------------------|---------------|--------|
| T01 | None | Start node | ✅ Match |
| T02 | T01 | T01 → T02 | ✅ Match |
| T03 | T02 | T02 → T03 | ✅ Match |
| T04 | T01 | T01 → T04 | ✅ Match |
| T05 | T04 | T04 → T05 | ✅ Match |
| T06 | T04 | T05 → T06 (via T04→T05→T06 chain) | ✅ Match |
| T07 | T01 (parallel) | T01 → T07 [P] | ✅ Match |
| T08 | T06, T07 | T06 → T08; T07 → T08 | ✅ Match |
| T09 | T01 (parallel) | T01 → T09 [P] | ✅ Match |
| T10 | T06, T07, T08 | T08 → T10 (T06/T07 upstream of T08) | ✅ Match |
| T11 | T01 | T10 → T11 (T01 upstream) | ✅ Match |
| T12 | T03, T10, T11 | T11 → T12 (T10 → T11 → T12; T03 unlocked before T12) | ✅ Match |
| T13 | T05, T09, T12 | T12 → T13 (T05/T09 upstream) | ✅ Match |
| T13.5 | T13 | T13 → T13.5 (closes Slice 1) | ✅ Match |
| T14 | T06, T07 | T13 → T14 [P] (T06/T07 upstream) | ✅ Match |
| T15 | T03, T09 | T03 → T15 [P] (T09 upstream) | ✅ Match |
| T16 | T12, T13, T14, T15 | T14 + T15 → T16 [P] (T12/T13 upstream) | ✅ Match |
| T16.5 | T12, T13, T14, T15 | T14 + T15 → T16.5 [P] (T12/T13 upstream) | ✅ Match |
| T17 | T12, T13, T14 | T14 → T17 [P] (T12/T13 upstream) | ✅ Match |
| T18 | T06, T07 | T13 → T18 [P] (T06/T07 upstream) | ✅ Match |
| T19 | T03, T09 | T03 → T19 [P] | ✅ Match |
| T20 | T12, T13, T18, T19 | T18 + T19 → T20 [P] (T12/T13 upstream) | ✅ Match |
| T21 | T12, T13, T18, T19 | T18 + T19 → T21 [P] (T12/T13 upstream) | ✅ Match |
| T22 | T12, T13 | T22 [P] after T13 | ✅ Match |
| T23 | T12, T13, T14 | T18 → T23 [P] (T14/T12/T13 upstream) | ✅ Match |
| T24 | T10, T12, T13 | T10/T13 → T24 [P] | ✅ Match |
| T25 | T05, T12, T13 | T05/T13 → T25 [P] | ✅ Match |
| T26 | T25 | T25 → T26 | ✅ Match |
| T27 | T26, T17, T23 | T26 + T17 + T23 → T27 | ✅ Match |
| T28 | T16, T21, T27 | T27 → T28 (T16/T21 upstream) | ✅ Match |
| T29 | T27, T28, T30a | T28 → T30a → T29 | ✅ Match |
| T30a | T28 | T28 → T30a (prep; may land before T29) | ✅ Match |
| T30 | T29, T30a | T29 → T30 | ✅ Match |

All dependency arrows consistent. No `[P]` task depends on another `[P]` task in the same parallel phase.

---

## Test Co-location Validation

**Applied test matrix (brownfield — no `.specs/codebase/TESTING.md`; derived from `AGENTS.md` and `design.md` §Testing Strategy):**

| Code Layer | Test Type | Command |
|------------|-----------|---------|
| Config / scaffold / CI / doc | none | `pnpm --filter @onda/web-next build` (smoke) |
| CSS / design tokens | unit (Vitest contract test) | `pnpm --filter @onda/web-next typecheck && pnpm --filter @onda/web-next test` (quick) |
| Auth, i18n, query utils, mutation fns | unit (Vitest) | quick |
| UI components (shadcn, AssignmentCard, RosterByEventSection) | unit (Vitest RTL + `@testing-library/user-event`) | quick |
| Route components (no live API needed) | unit (Vitest RTL + `@testing-library/user-event`) | quick |
| Volunteer/Leader routes with API-backed flows | unit + e2e (Playwright; `PLAYWRIGHT_WITH_API=true`) | full |
| `Tests: none` allowed only for: scaffold, CI config, deploy config, rename/retire doc tasks | — | — |

**Validation table:**

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
|------|-----------------------------|-----------------|-----------|--------|
| T01: Scaffold | Config only (package.json, vite.config, tsconfig) | none | none | ✅ OK |
| T02: globals.css + contract test | CSS tokens + test file | unit | unit | ✅ OK |
| T03: shadcn primitives | UI components | unit | unit | ✅ OK |
| T04: Auth primitives | Auth utility functions | unit | unit | ✅ OK |
| T05: AuthSessionProvider | React auth context component | unit | unit | ✅ OK |
| T06: apiClient + apiError | Fetch utility + error contract | unit | unit | ✅ OK |
| T07: queryKeys | Query key factory (pure util) | unit | unit | ✅ OK |
| T08: QueryClient + QueryProvider | Query client config + React provider | unit | unit | ✅ OK |
| T09: i18n + LocalTimeProvider | i18n utilities + time context | unit | unit | ✅ OK |
| T10: OrganizationProvider | React org context (Query-backed) | unit | unit | ✅ OK |
| T11: Nav manifest | Pure utility (key factory for nav items) | unit | unit | ✅ OK |
| T12: AppShell + shellRoute | Shell layout component | unit | unit | ✅ OK |
| T13: router.tsx + main.tsx | Route tree + providers wiring | unit | unit | ✅ OK |
| T13.5: Mock-data preview | Route bodies (fixtures, no API) | unit (render smoke) | unit | ✅ OK |
| T14: Volunteer query options + mutations | Query options + mutation fns | unit | unit | ✅ OK |
| T15: AssignmentCard | UI component | unit | unit | ✅ OK |
| T16: VolunteerDashboardPage + e2e | Route (dashboard home; no API cards on page) | unit + e2e | unit + e2e | ✅ OK |
| T16.5: Volunteer My Assignments | Route (volunteer scheduling branch) | unit | unit | ✅ OK |
| T17: TimeAwayPage | Route component (CRUD; no live API in unit) | unit | unit | ✅ OK |
| T18: Leader query options + mutations | Query options + mutation fns | unit | unit | ✅ OK |
| T19: RosterByEventSection | UI component | unit | unit | ✅ OK |
| T20: LeaderSchedulingPage + e2e | Route + API-backed leader flow | unit + e2e | unit + e2e | ✅ OK |
| T21: SchedulingEventDetailPage + e2e | Route + API-backed leader flow | unit + e2e | unit + e2e | ✅ OK |
| T22: SchedulingCreatePrivateEventPage | Route component (form; no live API in unit) | unit | unit | ✅ OK |
| T23: LeaderVolunteerTimeAwayPage | Route component | unit | unit | ✅ OK |
| T24: Org-admin routes | Route components (functional port) | unit | unit | ✅ OK |
| T25: System-admin shell + guards | Shell layout + auth guard | unit | unit | ✅ OK |
| T26: System-admin content pages | Route components (functional port) | unit | unit | ✅ OK |
| T27: CI scripts + jobs | CI config only | none | none | ✅ OK |
| T28: Playwright CI wiring | CI config + playwright config | none | none | ✅ OK |
| T29: Deploy repoint | Deploy config only | none | none | ✅ OK |
| T30a: Legacy rename | Directory + package rename | none | none | ✅ OK |
| T30: Rename + retire + docs | Rename + doc files | none | none | ✅ OK |

All 31 tasks pass test co-location validation. No `Tests: none` violations (config/scaffold/CI tasks are the only `none` entries, which is permitted per matrix).

---

*Assumptions made during task authoring (explicit):*

1. **Route mapping**: `/dashboard` is the volunteer **home** (greeting, assignment count, time-away preview). `/scheduling` is **role-aware**: volunteers see **My Assignments** (2-col `AssignmentCard` grid, T16.5); leaders see ministry roster (T20). URL strings match `apps/web` for cutover parity (MIG-CUT-01); nav IA follows serve-well / `VOLUNTEER_NAV`, not the combined Lovable single-screen layout.
2. **`assignMutation` uses void semantics**: The leader "Release" mutation calls `POST /assignments/:id/void` (locked as ROSTER-A1 in STATE.md), not the volunteer self-release endpoint.
3. **Right Grotesk**: Tasks do not block on Right Grotesk licensing. Space Grotesk is used throughout per the ADR 0006 fallback decision. Right Grotesk may be added in T02 if licensed at Execute time.
4. **`apps/web-legacy/e2e/`** and **`apps/web-next/e2e/`**: Playwright spec files are co-located per app (mirroring pre-rename layout). T16 and T20/T21 create the smoke specs; T28 wires web-next into CI.
5. **`systemAdminQueries.ts` key prefix**: System-admin query keys use a nested `queryKeys.systemAdmin.*` namespace (added to T07 factory) to avoid collision with church-scoped keys.
6. **T09 `LocalTimeProvider` scope**: `src/settings/` files are included in T09 (i18n port) because `LocalTimeProvider` depends on i18next locale state and is part of the same portability layer. If a task executor prefers splitting it, T09 may emit `LocalTimeProvider` + `SchedulingTimeDisplay` as a separate commit within the same PR.
7. **T27 dependency ordering**: T27 (CI scripts) formally depends on T26 (last code task), T17 (last volunteer route), and T23 (last leader route). In practice it depends on all code tasks being merged; the formal dependency captures the serial gate at end of Phase 4.
