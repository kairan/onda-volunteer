# Official BrandBook → web-onda — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: [design.md](./design.md)  
**Spec**: [spec.md](./spec.md)  
**Issue**: [#180](https://github.com/kairan/onda-volunteer/issues/180)  
**Blocks**: [#175](https://github.com/kairan/onda-volunteer/issues/175)  
**Status**: Approved for Tasks — assets vendored for CI/cloud (T01 prep)

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: `AGENTS.md` (Vitest + RTL `user-event` for behavior tests; Playwright e2e), `apps/web-onda/src/theme/theme.contract.test.ts`, `*.behavior.test.tsx` patterns.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Theme tokens / CSS contract | unit | Lock official hex→oklch anchors; no HOPE; no SF Pro; brand asset files exist | `apps/web-onda/src/theme/*.test.ts` | `pnpm --filter @onda/web-onda test` |
| Brand components (Wordmark, Grafismo) | unit / behavior | Renders correct variant; accessible name; `onError` fallback `igreja onda` | `apps/web-onda/src/components/brand/*.test.tsx` | `pnpm --filter @onda/web-onda test` |
| Shell / auth chrome | behavior (RTL) | Logo present (not sole “Onda” text mark); church name still shown | `apps/web-onda/src/shell/*.behavior.test.tsx`, related route tests | `pnpm --filter @onda/web-onda test` |
| Empty-state flourishes | behavior | Grafismo present on targeted empty UIs; decorative `aria-hidden` | co-located `*.behavior.test.tsx` | `pnpm --filter @onda/web-onda test` |
| Docs / ADR | none | Build/docs review only | `docs/adr/0006-*.md`, `DESIGN_SYSTEM.md` | build gate / PR review |
| Browser e2e | smoke (optional reinforce) | Shell still loads; no new e2e required unless smoke breaks | `apps/web-onda/e2e/*.spec.ts` | `pnpm test:e2e:web-onda` |

## Parallelism Assessment

> Generated from codebase — confirm before Execute.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --------- | -------------- | --------------- | -------- |
| Vitest unit / behavior | Yes | JSDOM, mocked providers; no shared DB | `apps/web-onda` vitest config; existing parallel suite |
| Playwright e2e | No (default sequential) | Shared local API/DB when API-backed | `AGENTS.md`; CI `playwright-web-onda` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After theme/component/shell tasks | `pnpm --filter @onda/web-onda test` |
| Full | After shell + empty-state wiring | `pnpm --filter @onda/web-onda test && pnpm typecheck:web-onda` |
| Build | Phase end / docs task | `pnpm --filter @onda/web-onda test && pnpm typecheck:web-onda && pnpm --filter @onda/web-onda build && pnpm lint` |
| E2E smoke | Optional before merge | `pnpm test:e2e:web-onda` |

---

## Execution Plan

### Phase 1: Assets + tokens (sequential)

```
T01 → T02 → T03
```

### Phase 2: Wordmark (sequential)

```
T04 → T05
```

### Phase 3: Balanced flourishes (T06 then parallel T07/T08)

```
T05 complete, then:
  T06 → ┬→ T07 [P]
        └→ T08 [P]
```

### Phase 4: Docs + cutover blocker note (sequential)

```
T07 + T08 complete → T09
```

---

## Task Breakdown

### T01: Vendor BrandBook assets into `web-onda`

**What**: Ensure Logo 1 PNG (preto/branco) and two grafismos exist under `apps/web-onda/src/assets/brand/` with stable filenames from [design.md](./design.md).  
**Where**: `apps/web-onda/src/assets/brand/*`  
**Depends on**: None  
**Reuses**: Canonical in-repo files (see [`docs/runbooks/brand-assets.md`](../../../docs/runbooks/brand-assets.md)). Optional local marketing kit may refresh copies; **cloud/CI must use committed paths only** — never require a machine-local `branding/` folder.  
**Requirement**: BB-LOGO-01, BB-FLR-01  

**Tools**: filesystem  
**Skill**: `tlc-spec-driven`  

**Done when**:

- [x] Four named assets exist under `src/assets/brand/` (logo preto/branco + grafismo filled/line) — vendored in planning PR for AFK/cloud Execute
- [x] No SF Pro (or other BrandBook font) binaries added
- [x] Gate: files present on disk (`ls` / later contract test in T02)
- [x] Runbook [`docs/runbooks/brand-assets.md`](../../../docs/runbooks/brand-assets.md) documents mapping

**Tests**: none (binaries — existence asserted in T02 contract)  
**Gate**: build (file presence)  
**Commit**: `chore(web-onda): vendor igreja onda brand assets`

---

### T02: Remap light theme tokens + contract tests

**What**: Update `:root` in `globals.css` to official BrandBook mapping; rewrite `theme.contract.test.ts` anchors; assert no SF Pro imports/paths and brand asset files exist.  
**Where**: `apps/web-onda/src/styles/globals.css`, `apps/web-onda/src/theme/theme.contract.test.ts`  
**Depends on**: T01  
**Reuses**: Existing oklch variable names in `tokens.ts`  
**Requirement**: BB-TOK-01, BB-TYPE-01  

**Done when**:

- [x] `--background` matches `#eeeee7`; `--primary` `#2537de`; `--primary-hover` `#1f2bc8` (oklch locked in tests)
- [x] Borders/muted use secondary cool blues per design table
- [x] Contract test fails if SF Pro path appears or logo/grafismo files missing
- [x] Gate: `pnpm --filter @onda/web-onda test` (theme suite green)

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(web-onda): lock official BrandBook light tokens`

---

### T03: Retune `.dark` brand family

**What**: Adjust `.dark` primary/ring/accent toward BrandBook blues so dark mode is not provisional leftover hues.  
**Where**: `apps/web-onda/src/styles/globals.css`, `theme.contract.test.ts` (dark assertions if practical)  
**Depends on**: T02  
**Reuses**: Existing `.dark` block structure  
**Requirement**: BB-DARK-01  

**Done when**:

- [x] `.dark` `--primary` / `--ring` are BrandBook blue-family (documented hex in commit/PR)
- [x] Critical chrome remains AA-reasonable on dark surfaces (spot-check)
- [x] Gate: `pnpm --filter @onda/web-onda test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(web-onda): retune dark theme to BrandBook blues`

---

### T04: Add `IgrejaOndaWordmark` component

**What**: Create wordmark component with `preto`/`branco` variants, accessible name, and `onError` text fallback `igreja onda`.  
**Where**: `apps/web-onda/src/components/brand/IgrejaOndaWordmark.tsx` + `IgrejaOndaWordmark.test.tsx`  
**Depends on**: T01  
**Reuses**: `cn` from `lib/utils.ts`  
**Requirement**: BB-LOGO-01  

**Done when**:

- [x] Renders `<img>` with alt/accessible name including `igreja onda`
- [x] Fallback text on error is `igreja onda` (not `Onda`)
- [x] Unit/behavior tests cover variants + fallback
- [x] Gate: `pnpm --filter @onda/web-onda test`

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(web-onda): add IgrejaOndaWordmark component`

---

### T05: Wire wordmark into shells + auth chrome

**What**: Replace typed “Onda” brand marks with `IgrejaOndaWordmark` in AppSidebar, AppShell, AuthGateLayout, `/auth`, SystemAdminShell; update shell behavior tests.  
**Where**: `components/onda/AppSidebar.tsx`, `components/onda/AppShell.tsx`, `shell/ProtectedAppShell.tsx`, `routes/auth.tsx`, `system-admin/SystemAdminShell.tsx`, `shell/AppShell.behavior.test.tsx`  
**Depends on**: T04, T02  
**Reuses**: Church name under/ beside mark (existing org context)  
**Requirement**: BB-LOGO-01  

**Done when**:

- [x] No shell header uses sole text “Onda” as the brand mark
- [x] Light surfaces use preto; dark/primary tiles use branco where applicable
- [x] `AppShell.behavior.test.tsx` asserts logo / `igreja onda`, not `findAllByText('Onda')` as brand proof
- [x] Collapsed sidebar remains recognizable (compact crop per design)
- [x] Gate: `pnpm --filter @onda/web-onda test && pnpm typecheck:web-onda`

**Tests**: behavior  
**Gate**: full  
**Commit**: `feat(web-onda): use official logo in app shells`

---

### T06: Auth gradient + wordmark layout

**What**: Apply Balanced BrandBook gradient to auth / signed-out entry (`AuthGateLayout` and `/auth`); keep form card non-glass.  
**Where**: `shell/ProtectedAppShell.tsx`, `routes/auth.tsx`, styles as needed  
**Depends on**: T05  
**Reuses**: T04 wordmark  
**Requirement**: BB-FLR-01  

**Done when**:

- [x] Auth surfaces show soft blue gradient (not flat `bg-background` only)
- [x] Logo 1 present with adequate contrast
- [x] Form/card stays solid surface (no glass fill)
- [x] Gate: `pnpm --filter @onda/web-onda test`

**Tests**: behavior (auth layout smoke via existing shell/auth tests or new focused test)  
**Gate**: quick  
**Commit**: `feat(web-onda): brand gradient on auth surfaces`

---

### T07: Empty-state grafismo [P]

**What**: Add `BrandGrafismo` and show on major empty states (volunteer assignments, leader scheduling empty, time-away empty).  
**Where**: `components/brand/BrandGrafismo.tsx` (+ test), `VolunteerMyAssignmentsPage.tsx`, `LeaderSchedulingPage.tsx`, `timeAway.tsx` (and behavior tests as needed)  
**Depends on**: T01, T06  
**Reuses**: Existing empty copy/i18n  
**Requirement**: BB-FLR-01  

**Done when**:

- [ ] Grafismo is decorative (`aria-hidden`) and does not replace wordmark
- [ ] At least the three major empty surfaces include it
- [ ] Behavior/unit tests assert presence
- [ ] Gate: `pnpm --filter @onda/web-onda test`

**Tests**: behavior  
**Gate**: quick  
**Commit**: `feat(web-onda): grafismo on major empty states`

---

### T08: Sidebar watermark + header glass tune [P]

**What**: Optional low-opacity line grafismo watermark behind sidebar nav; tune sticky header blur only; ensure cards/tables remain non-glass; hide decorative flourishes in `@media print` if needed.  
**Where**: `components/onda/AppSidebar.tsx`, header in `AppShell.tsx`, `globals.css` print rules as needed  
**Depends on**: T01, T06  
**Reuses**: `BrandGrafismo` from T07 or inline img — if T07 not merged yet, import asset directly and refactor when both land  
**Requirement**: BB-FLR-01  

**Done when**:

- [ ] Watermark opacity does not break nav AA / hit targets
- [ ] No glass classes on `AssignmentCard` / roster tables
- [ ] Print CSS may hide watermark/gradient
- [ ] Gate: `pnpm --filter @onda/web-onda test`

**Tests**: behavior (sidebar still interactive; optional class assertion)  
**Gate**: quick  
**Commit**: `feat(web-onda): sidebar watermark and header glass tune`

**Note on T07/T08 parallel:** Prefer finishing T07 first if both edit shared brand components; `[P]` allowed when T08 uses assets directly and T07 adds `BrandGrafismo` without conflicting file ownership — if conflict, run T07 then T08 sequentially.

---

### T09: Amend ADR 0006 + docs; note #175 blocker cleared path

**What**: Amend ADR 0006 with official palette, Logo 1 PNG rule, Balanced flourishes, SF Pro exclusion; update `DESIGN_SYSTEM.md` banner; note in `#175` / ROADMAP / STATE that BrandBook alignment must land before cutover (or is shipped).  
**Where**: `docs/adr/0006-onda-brand-visual-system.md`, `DESIGN_SYSTEM.md`, `.specs/project/ROADMAP.md`, `.specs/project/STATE.md`, `docs/issues/175-*.md` (blocker note)  
**Depends on**: T07, T08  
**Reuses**: Existing ADR structure  
**Requirement**: BB-DOC-01, BB-TYPE-01 (docs clause)  

**Done when**:

- [ ] ADR 0006 no longer presents `#2034D6` / `#FAFAFA` as current truth
- [ ] SF Pro = print/marketing only documented
- [ ] #175 docs mention this feature as prerequisite or completed
- [ ] Spec status + traceability updated to Verified/Implementing as appropriate
- [ ] Gate: `pnpm lint` (docs-only OK) + build gate if desired

**Tests**: none  
**Gate**: build  
**Commit**: `docs(brand): amend ADR 0006 for Brandbook 2027`

---

## Parallel Execution Map

```
Phase 1 (Sequential):
  T01 ──→ T02 ──→ T03

Phase 2 (Sequential):
  T01+T02 ──→ T04 ──→ T05
  (T04 only needs T01; T05 needs T04+T02)

Phase 3:
  T05 ──→ T06 ──┬→ T07 [P]
                └→ T08 [P]
  (If file conflict on BrandGrafismo, run T07 → T08)

Phase 4 (Sequential):
  T07+T08 ──→ T09
```

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T01 Vendor assets | Asset folder | ✅ |
| T02 Light tokens + contract | Theme + tests | ✅ cohesive |
| T03 Dark retune | `.dark` block | ✅ |
| T04 Wordmark component | 1 component + tests | ✅ |
| T05 Wire shells | Multiple call sites, one concern | ✅ cohesive |
| T06 Auth gradient | Auth layout | ✅ |
| T07 Empty grafismo | Component + 3 call sites | ✅ cohesive |
| T08 Watermark / glass | Sidebar + header | ✅ |
| T09 Docs / ADR | Docs only | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
|------|-------------------|---------------|--------|
| T01 | None | Phase 1 start | ✅ |
| T02 | T01 | T01 → T02 | ✅ |
| T03 | T02 | T02 → T03 | ✅ |
| T04 | T01 | T01 → T04 | ✅ |
| T05 | T04, T02 | T04 → T05 (after tokens) | ✅ |
| T06 | T05 | T05 → T06 | ✅ |
| T07 | T01, T06 | T06 → T07 | ✅ |
| T08 | T01, T06 | T06 → T08 | ✅ |
| T09 | T07, T08 | T07+T08 → T09 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
|------|------------|----------------|-----------|--------|
| T01 | assets | none | none | ✅ |
| T02 | theme contract | unit | unit | ✅ |
| T03 | theme contract | unit | unit | ✅ |
| T04 | brand component | unit | unit | ✅ |
| T05 | shell | behavior | behavior | ✅ |
| T06 | auth chrome | behavior | behavior | ✅ |
| T07 | empty states | behavior | behavior | ✅ |
| T08 | shell flourish | behavior | behavior | ✅ |
| T09 | docs | none | none | ✅ |

---

## Requirement → task map

| ID | Tasks |
|----|-------|
| BB-TOK-01 | T02 |
| BB-LOGO-01 | T01, T04, T05 |
| BB-TYPE-01 | T02, T09 |
| BB-FLR-01 | T01, T06, T07, T08 |
| BB-DOC-01 | T09 |
| BB-DARK-01 | T03 |

**Coverage:** 6 requirements, 6 mapped, 0 unmapped ✅
