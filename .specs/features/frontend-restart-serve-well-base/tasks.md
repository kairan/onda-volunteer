# Frontend restart — serve-well + API — Tasks

**Design**: [design.md](./design.md)  
**Status**: Phase 0–1 shipped ([#170](https://github.com/kairan/onda-volunteer/issues/170), PR [#171](https://github.com/kairan/onda-volunteer/pull/171)); Phase 2 shipped ([#172](https://github.com/kairan/onda-volunteer/issues/172), PR [#176](https://github.com/kairan/onda-volunteer/pull/176)); Phase 3 shipped ([#173](https://github.com/kairan/onda-volunteer/issues/173), PR [#177](https://github.com/kairan/onda-volunteer/pull/177)); Phase 4 in PR ([#174](https://github.com/kairan/onda-volunteer/issues/174), PR [#178](https://github.com/kairan/onda-volunteer/pull/178)); Phase 5 #175

## Execution plan

```
Phase 0:  T01 → T02 → T03
Phase 1:  T04 → T05 → T06 → T07
Phase 2:  T08 → T09 → T10 → T10.1
Phase 3:  T11 → T12 → T13
Phase 4:  T14 → T15
Phase 5:  T16 → T17
```

---

### T01: Create `apps/web-onda` package [P1]

**What**: Add `apps/web-onda` to pnpm workspace — `package.json`, `vite.config.ts` (port 5175), `tsconfig.json`, `index.html`, `main.tsx`, empty router, root `dev:web-onda` script.

**Reuses**: `apps/web-next` vite/tsconfig as template (not source copy)

**Done when**:
- [x] `pnpm --filter @onda/web-onda build` succeeds
- [x] `pnpm --filter @onda/web-onda typecheck` succeeds

---

### T02: Port serve-well theme + shadcn ui [P1]

**What**: Copy `design-reference/serve-well/src/styles.css` → `apps/web-onda/src/styles/globals.css`; self-host Space Grotesk + Right Grotesk; copy full `components/ui/*` from serve-well; add `lib/utils.ts` (`cn`).

**Reuses**: `design-reference/serve-well/`; `apps/web-next/src/theme/theme.contract.test.ts` (adapt package name)

**Done when**:
- [x] Theme contract test passes (Onda vars present, HOPE vars absent)
- [x] Button/Card/Sidebar render in smoke test

---

### T03: Graft data core from web-next [P1]

**What**: Copy `api/`, `auth/`, `query/`, `supabaseClient.ts`, `sessionToken.ts`, `i18n/` skeleton into `web-onda`; wire `QueryProvider` + `AuthSessionProvider` + `I18nProvider` in `main.tsx`.

**Reuses**: `apps/web-next/src/{api,auth,query,i18n}`

**Done when**:
- [x] `apiClient` unit tests pass
- [x] Auth session provider tests pass (port or minimal)

---

### T04: Working context module [P1]

**What**: Add `organization/workingContext.ts` + tests per [working-context-picker/design.md](../working-context-picker/design.md); extend storage for per-church context key.

**Reuses**: working-context-picker spec

**Done when**:
- [x] `buildWorkingContextOptions` + `resolveWorkingContext` tests green
- [x] Dual-role fixture covered

---

### T05: OrganizationProvider on web-onda [P1]

**What**: Port `organization/` from web-next; integrate `workingContext` + `onWorkingContextChange`; expose `useApiScope()`.

**Reuses**: `apps/web-next/src/organization/*`

**Done when**:
- [x] `OrganizationProvider.behavior.test.tsx` passes (adapted)

---

### T06: Shell from serve-well + real org [P1]

**What**: Port `components/onda/AppShell.tsx`, `AppSidebar.tsx`; add `shell/WorkingContextPicker.tsx`, `OrganizationContextControls` (Church/Campus only); implement `buildNavForWorkingContext`; auth gate on routes.

**Reuses**: serve-well `onda/*`; web-next `shell/shellRoute.tsx` patterns

**Done when**:
- [x] Signed-in shell matches serve-well layout at 1440px (manual — HITL 2026-07-04)
- [x] No role demo dropdown
- [x] Nav changes when working context changes (behavior test)

---

### T07: Router parity scaffold [P1]

**What**: File routes for all production paths with placeholders except `/auth`; `ProtectedAppShell` wrapper.

**Reuses**: `apps/web-next/src/router.tsx` route list

**Done when**:
- [x] All paths in design.md §6 resolve without 404 (including §6 parity notes: `/auth`, `/events/$eventId` redirect per ADR 0004, `/user-select` when dev headers enabled)
- [x] `router.test.ts` passes

---

### T08: Volunteer dashboard (live) [P1]

**What**: `/dashboard` using serve-well `VolunteerDashboard` layout — greeting, assignment count, time-away section; wire `volunteerAssignmentsQuery`, unavailability preview.

**Reuses**: serve-well `VolunteerDashboard.tsx`; web-next `routes/dashboard.tsx` data wiring

**Done when**:
- [x] RST-VOL-01 dashboard criteria met
- [x] `dashboard.behavior.test.tsx` passes

---

### T09: Volunteer My Assignments (live) [P1]

**What**: Volunteer branch of `/scheduling` — serve-well assignment card grid; `AssignmentCard` styled per serve-well; live assignments query.

**Reuses**: serve-well assignment cards; web-next `VolunteerMyAssignmentsPage` data

**Done when**:
- [x] RST-VOL-01 scheduling criteria met
- [x] Behavior tests pass

---

### T10: Time away route [P1]

**What**: `/time-away` — serve-well list + dialog patterns from `modals.tsx` wired to unavailability mutations.

**Reuses**: serve-well `TimeAwayDialog`; web-next `routes/timeAway.tsx`

**Done when**:
- [x] CRUD works pessimistically
- [x] Ministry pre-selected from working context (volunteer mode)

---

### T10.1: Time away optional description [P1]

**What**: Optional `description` on volunteer unavailability — API column + POST/PATCH; serve-well `TimeAwayDialog` parity ("Reason (optional)" as textarea in create/edit modals); show in list when set.

**Where**: `apps/api/prisma` (`Unavailability.description`); `scheduling.service.ts` + `assignments.controller.ts`; `apps/web-onda/src/routes/timeAway.tsx`, `volunteer/unavailabilityMutations.ts`, `volunteer/types.ts`; `i18n/locales/{en,pt-BR}/timeAway.json`

**Depends on**: T10

**Reuses**: serve-well `TimeAwayDialog` reason field (`design-reference/serve-well/src/components/onda/modals.tsx`)

**Done when**:
- [x] Migration `20260703120000_unavailability_description` applied; create/update persist trimmed optional text (max 500 chars)
- [x] Create + edit dialogs include description `Textarea` (en + pt-BR labels)
- [x] List row shows description under the date interval when present
- [x] `timeAway.behavior.test.tsx` asserts description in POST body; edit PATCH flow covered
- [x] `volunteerQueries.test.ts` + `apps/api/test/unavailability.e2e-spec.ts` cover description on create

**Verify**:
- `pnpm --filter @onda/web-onda test`
- `cd apps/api && pnpm exec jest --config ./test/jest-e2e.json --runInBand test/unavailability.e2e-spec.ts`

---

### T11: Leader scheduling (live) [P1]

**What**: Leader `/scheduling` — replace layout with serve-well `MinistryLeaderDashboard` structure; wire `leaderEventsQuery`, assign/release mutations, `RosterByEventSection` or equivalent rows.

**Reuses**: serve-well `MinistryLeaderDashboard.tsx`; web-next `LeaderSchedulingPage` data

**Done when**:
- [x] RST-LEAD-01 met
- [x] Leader behavior tests pass

---

### T12: Event detail + create flows [P1]

**What**: Port event detail, new event, new private event routes — serve-well tokens on forms; web-next query/mutation logic.

**Reuses**: web-next scheduling event routes

**Done when**:
- [x] Leader can open event detail and assign/release
- [x] E2E smoke path green

---

### T13: Leader volunteer time away [P2]

**What**: Port `/leader/volunteer-time-away` functionally.

**Reuses**: web-next route

**Done when**:
- [x] Behavior test passes

---

### T14: Org-admin routes [P2]

**What**: Port `/ministries`, `/volunteers`, `/ministry-leaders` — web-next logic, serve-well tokens only.

**Done when**:
- [x] RST-ADMIN-01 org-admin criteria met

---

### T15: System admin routes [P2]

**What**: Port `/system-admin/*` from web-next with `OperatorShell` pattern from serve-well (neutral).

**Done when**:
- [x] ADR 0005 guards preserved
- [x] system-admin behavior tests pass

---

### T16: CI wiring [P1]

**What**: Add `@onda/web-onda` to `ci.yml`, coverage floors, Playwright config.

**Done when**:
- [x] PR CI green for web-onda

---

### T17: Cutover + remove legacy packages [P1]

**What**: Switch production build/deploy to `web-onda`; document redirects; **delete `apps/web` and `apps/web-next`** from the monorepo; remove `@onda/web` / `@onda/web-next` from workspace, CI workflows, and root `package.json` scripts; archive `frontend-migration-web-next` TLC folder per AD-001.

**Done when**:
- [ ] RST-CUT-01 complete
- [ ] `apps/web` and `apps/web-next` directories **gone**; `pnpm install` and CI green with only `@onda/web-onda` (and `api`)
- [ ] No `pnpm --filter @onda/web` or `@onda/web-next` references remain in repo
- [ ] Visual sign-off checklist (design.md §9) signed
- [ ] STATE.md + ROADMAP updated

---

## Verify (feature closeout)

- [ ] All RST-* requirements traced to tasks
- [x] `docs/issues/done/` entry created (#170)
- [ ] `frontend-migration-web-next` archived with redirect stub
- [x] #148 closed as superseded or cancelled with link to this feature
