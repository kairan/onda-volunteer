# Onda Dura regional campuses Validation

**Date**: 2026-08-12
**Spec**: `.specs/features/186-onda-dura-regional-campuses/spec.md`
**Diff range**: `main...HEAD` (`2aee2f1` → `a1613ab`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

Design/Tasks skipped (medium). Implicit Execute steps inferred from `git log main..HEAD`:

| Task | Status | Notes |
| ---- | ------ | ----- |
| Specify catalog + seed + e2e + serve-well | ✅ Done | `2aee2f1` |
| Catalog module + seed upsert/delete + ministries | ✅ Done | `86c189c` — seed ministries untested (see AC7) |
| web-onda e2e pins Joinville / Onda Brasil | ✅ Done | `c4b4fd4` |
| Serve-well regional campus picker | ✅ Done | `5a5f3de` |
| Mark requirements Implementing | ✅ Done | `a1613ab` |

---

## Spec-Anchored Acceptance Criteria

### P1: Seed real regional campuses

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN the campus catalog is read THEN it SHALL contain churches named **Onda Brasil**, **Onda USA**, **Onda Europa**, and **Onda Japão** | names exactly those four strings, in that order | `apps/api/prisma/ondaCampuses.test.ts:5-10` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.name)).toEqual(['Onda Brasil', 'Onda USA', 'Onda Europa', 'Onda Japão'])` | ✅ PASS |
| WHEN the catalog is read THEN campus counts SHALL be **18**, **2**, **4**, and **1** respectively | `[18, 2, 4, 1]` | `apps/api/prisma/ondaCampuses.test.ts:11-13` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.campuses.length)).toEqual([18, 2, 4, 1])` | ✅ PASS |
| WHEN the catalog is read THEN Brasil campus names SHALL be exactly: Joinville, Av. Paulista, Mooca, Guarulhos, Bauru, Belo Horizonte, Blumenau, Cabo Frio, Campinas, Caxias do Sul, Curitiba, Florianópolis, Itajaí, Jaraguá do Sul, Macapá, Machado, Porto Alegre, Recife | exact ordered name list (accents included) | `apps/api/prisma/ondaCampuses.test.ts:14-33` — `expect(ONDA_REGIONAL_CHURCHES[0]?.campuses.map((campus) => campus.name)).toEqual(['Joinville', …, 'Recife'])` | ✅ PASS |
| WHEN the catalog is read THEN USA campuses SHALL be Charlotte and Chicago; Europa SHALL be Porto, Sines, Mallorca, and Londres; Japão SHALL be Hamamatsu | exact ordered name lists | `apps/api/prisma/ondaCampuses.test.ts:34-37` — USA `toEqual(['Charlotte', 'Chicago'])`; `:38-43` — Europa `toEqual(['Porto', 'Sines', 'Mallorca', 'Londres'])`; `:44-46` — Japão `toEqual(['Hamamatsu'])` | ✅ PASS |
| WHEN the catalog is read THEN every campus id SHALL be unique across churches | set size equals array length | `apps/api/prisma/ondaCampuses.test.ts:49-53` — `expect(new Set(campusIds).size).toBe(campusIds.length)` | ✅ PASS |
| WHEN `prisma db seed` runs THEN it SHALL upsert those churches/campuses (Brasil id `seed-church-demo`, USA id `seed-church-norte`) and delete obsolete ids `seed-campus-central-sede`, `seed-campus-central-sul`, `seed-campus-norte-unico` | stable church ids + obsolete id list consumed by seed upsert/`deleteMany` | `apps/api/prisma/ondaCampuses.test.ts:57-62` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.id)).toEqual(['seed-church-demo', 'seed-church-norte', 'seed-church-europa', 'seed-church-japao'])`; `:66-70` — `expect([...OBSOLETE_SEED_CAMPUS_IDS]).toEqual(['seed-campus-central-sede', 'seed-campus-central-sul', 'seed-campus-norte-unico'])`. Seed consumes those constants: `seed.ts:20-22` `deleteMany`; `seed.ts:27-55` church/campus `upsert`. Independent Test is catalog unit test (not a seed-process test). | ✅ PASS |
| WHEN seed completes THEN Onda Brasil SHALL still own Hospitality + Band, the public event, and the demo greeter assignment; USA SHALL own Louvor; Europa SHALL own Mídia; Japão SHALL own Recepção; the demo volunteer SHALL have Active membership in each of those ministries | Hospitality+Band+`seed-event-public`+`seed-assignment-public-greeter` on Brasil; Louvor on USA; Mídia on Europa; Recepção on Japão; demo volunteer `status: 'ACTIVE'` on each | no test assertion — implementation only (`seed.ts:64-82` Hospitality/Band `churchId: churchBrasil.id`; `:84-92` Louvor/`churchUsa`; `:94-102` Mídia/`churchEuropa`; `:104-112` Recepção/`churchJapao`; `:188-276` ACTIVE memberships; `:323-360` public event + greeter assignment) | ❌ GAP |

### P1: web-onda e2e follows the new HQ campus

Independent Test: grep/read fixtures (not a runtime name assertion).

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN smoke mocks serve organization context THEN the church name SHALL be `Onda Brasil` and the campus SHALL be `{ id: 'seed-campus-joinville', name: 'Joinville' }` | church `Onda Brasil`; campus id+name as specified | `apps/web-onda/e2e/apiMocks.ts:6` — `name: 'Onda Brasil'`; `:11` — `{ id: 'seed-campus-joinville', name: 'Joinville', timezone: 'America/Sao_Paulo' }` (timezone is a superset of the spec object) | ✅ PASS |
| WHEN API-backed fixtures pin localStorage THEN `onda:activeCampusId` SHALL be `seed-campus-joinville` | localStorage key/value as specified when `pinSeedChurch` | `apps/web-onda/e2e/fixtures.ts:10` — `campusId: 'seed-campus-joinville'`; `:25` — `localStorage.setItem('onda:activeCampusId', campusId)` gated by `pinSeedChurch: usesRealApi` (`:4-5`, `:32`) | ✅ PASS |

### P2: Serve-well campus picker groups by region

Independent Test: inspect `campus.tsx` and AppShell grouping (no automated test in diff).

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN the campus switcher opens THEN campuses SHALL be grouped under **Onda Brasil**, **Onda USA**, **Onda Europa**, and **Onda Japão** | those four group labels, in that order | `design-reference/serve-well/src/lib/campus.tsx:105` — `CAMPUS_REGIONS = ["Onda Brasil", "Onda USA", "Onda Europa", "Onda Japão"]`; `AppShell.tsx:58-65` — `CAMPUS_REGIONS.map((region) => { const regionCampuses = campuses.filter((c) => c.region === region); … {region} })` | ✅ PASS |
| WHEN the Japão group renders THEN it SHALL include Hamamatsu | Hamamatsu present with region Onda Japão | `design-reference/serve-well/src/lib/campus.tsx:136` — `{ id: "hamamatsu", name: "Onda · Hamamatsu", city: "Hamamatsu, Japão", timezone: "Asia/Tokyo", region: "Onda Japão" }` | ✅ PASS |

**Status**: ❌ Gaps present — **10/11** ACs matched spec outcome; **1** uncovered (P1 seed AC7); **0** spec-precision gaps

---

## Discrimination Sensor

Scratch method: `git worktree add /tmp/onda-186-sensor HEAD`; symlink `apps/api/node_modules` from the real repo; mutate `ondaCampuses.ts`; run `jest --config ./test/jest-unit.json prisma/ondaCampuses.test.ts`; `git checkout` the file between mutations. Worktree removed (`git worktree remove --force`). Real working tree untouched (`git diff` empty on catalog file).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `apps/api/prisma/ondaCampuses.ts:71` | `'Onda Japão'` → `'Onda Japan'` | ✅ Killed — `ondaCampuses.test.ts:5` `toEqual([…, 'Onda Japão'])` (exit 1) |
| 2 | `apps/api/prisma/ondaCampuses.ts:73-75` | Removed Hamamatsu campus object (Japão `campuses: []`) | ✅ Killed — `ondaCampuses.test.ts:11` counts `toEqual([18, 2, 4, 1])` received `[18, 2, 4, 0]` (exit 1). Name list `:44-46` would also fail if reached. |
| 3 | `apps/api/prisma/ondaCampuses.ts:45` | Dropped Recife from Brasil campuses | ✅ Killed — `ondaCampuses.test.ts:11` counts received `[17, 2, 4, 1]` (exit 1). Name list `:14-33` would also fail if reached. |

**Sensor depth**: lightweight (3 behavior-level mutations on new catalog)
**Result**: 3/3 killed — PASS ✅

Note: catalog tests do not import `seed.ts`. A ministry-name fault in seed would survive this suite — that is the AC7 gap, not a catalog-sensor survivor.

---

## Interactive UAT Results (if performed)

Not performed. Seed/catalog is non-interactive; P2 Independent Test is inspect of the design-reference. No user-facing production UI in this diff (`apps/web-onda` changes are e2e pins only).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Catalog constant + seed loop over it; e2e pin updates; serve-well region field + grouped switcher |
| Surgical changes | ✅ Diff is spec, catalog/seed, e2e fixtures, serve-well picker, issue/README |
| No scope creep | ✅ Europa/Japão ministries are in AC7; no shared catalog package (out of scope) |
| Matches patterns | ✅ Prisma `upsert` by stable seed ids; e2e mock shape unchanged aside from names/ids |
| Spec-anchored outcome check (asserted values match spec) | ❌ AC7 has no assertion targeting ministry ownership / ACTIVE memberships |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ❌ Catalog ACs 1:1; seed ministry/event/assignment ownership (AC7) has no test layer |
| Every test maps to a spec requirement — no unclaimed tests | ✅ Four catalog tests map to ACs 1–6 + edge obsolete-id list |
| Documented guidelines followed: `AGENTS.md` (Jest unit via `test/jest-unit.json`; Playwright fixtures for e2e pins) | ✅ |

---

## Edge Cases

- [x] WHEN seed runs on a DB that still has fake campuses THEN those rows SHALL be deleted (`OBSOLETE_SEED_CAMPUS_IDS`): ids locked at `ondaCampuses.test.ts:66-70`; `seed.ts:20-22` `deleteMany({ where: { id: { in: [...OBSOLETE_SEED_CAMPUS_IDS] } } })`.
- [x] WHEN seed runs twice THEN church/campus rows SHALL upsert in place (stable ids), not duplicate: stable ids asserted `ondaCampuses.test.ts:57-62`; `seed.ts:27-55` `upsert` `where: { id }`.
- [x] WHEN a campus is missing from the catalog snapshot vs the public site THEN the unit test SHALL fail on the exact name list (not only counts): name lists at `ondaCampuses.test.ts:14-46` in addition to counts `:11-13`. Sensor mutation 3 was killed by counts first (same `it`); a rename-in-place is what the name-list asserts (mutation 1 killed on names).

---

## Gate Check

- **Gate command**: Tasks skipped — no `tasks.md` Gate Check Commands. Independent re-run: `pnpm --filter @onda/api exec jest --config ./test/jest-unit.json prisma/ondaCampuses.test.ts`. Full suite figures taken from Execute author report (not re-run here): API unit, API e2e, web-onda Vitest, `pnpm lint`, `pnpm typecheck:api` / `pnpm typecheck:web-onda`.
- **Result**: catalog unit **4 passed, 0 failed** (independent). Author-reported: API unit **11 passed**; API e2e **161 passed**; web-onda Vitest **132 passed**; lint **0 warnings**; typecheck api+web-onda **pass**. Combined tests **304 passed, 0 failed, 0 skipped**.
- **Test count before feature**: API unit **7** (`scheduling-rules.test.ts` 4 + `admin-invite-email.test.ts` 3 on `main`). Catalog file absent on `main`.
- **Test count after feature**: API unit **11** (+4 in `ondaCampuses.test.ts`). API e2e / Vitest file counts unchanged in this diff.
- **Delta**: +4 API unit tests
- **Skipped tests**: none
- **Failures**: none in gate. Coverage gap is missing assertions (AC7), not a red suite.

Grep (success criteria, not ACs): `apps/api/prisma/seed.ts` has no `Igreja Central` / `Comunidade Norte` / `Sede` / `Zona Sul` / `Único`. `apps/web-onda/e2e` has no `seed-campus-central-sede` / `Igreja Central`. PR #179 closed-as-superseded was not verified in this pass.

---

## Fix Plans (if issues found)

### Fix 1: No test for seed ministry / event / membership outcomes (P1 seed AC7)

- **Root cause**: Catalog unit tests lock church/campus names, counts, and ids. Ministry names, church ownership, public event, greeter assignment, and demo volunteer `ACTIVE` memberships are hardcoded in `seed.ts` and never asserted. A wrong ministry name or missing Japão membership would not fail `ondaCampuses.test.ts`.
- **Fix task**: Extract the seed ministry/event/membership contracts (or drive them from tested constants) and add assertions that match AC7: Brasil owns Hospitality + Band + `seed-event-public` + `seed-assignment-public-greeter`; USA owns Louvor; Europa owns Mídia; Japão owns Recepção; `seed-volunteer-demo` has `status: 'ACTIVE'` on each of those ministries. Prefer a unit test of extracted constants (same pattern as `ondaCampuses.test.ts`) or a seed integration test against Postgres.
- **Verify**: New test fails if `name: 'Recepção'` is renamed or Japão membership upsert is removed; then passes on restore.
- **Done when**: AC7 has `file:line` + assertion expressions targeting those exact names/ids/status values.
- **Priority**: Major

---

## Requirement Traceability Update

Do not edit `spec.md` in this verification pass (report-only).

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CAMPUS-01 | Implementing | ✅ Verified |
| CAMPUS-02 | Implementing | ❌ Needs Fix (AC7 untested) |
| CAMPUS-03 | Implementing | ✅ Verified |
| CAMPUS-04 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready

**Spec-anchored check**: 10/11 ACs matched spec outcome | 0 spec-precision gaps
**Sensor**: 3/3 mutations killed
**Gate**: 304 passed (author-reported full suite; catalog 4/4 independently confirmed)

**What works**: Regional catalog names, counts, exact campus lists (including Hamamatsu), unique campus ids, legacy church ids, obsolete campus id list; web-onda smoke mocks / API-backed `onda:activeCampusId` pins; serve-well `CAMPUS_REGIONS` grouping with Hamamatsu under Onda Japão. Catalog tests kill name/count mutants.

**Issues found**: P1 seed AC7 — ministry/event/assignment ownership and demo volunteer ACTIVE memberships have implementation in `seed.ts` but no test assertion.

**Next steps**: Implement Fix 1; re-verify (iteration 1 of max 3).
