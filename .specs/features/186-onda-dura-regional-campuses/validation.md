# Onda Dura regional campuses Validation

**Date**: 2026-08-12
**Spec**: `.specs/features/186-onda-dura-regional-campuses/spec.md`
**Diff range**: `main...HEAD` (`2aee2f1` → `8a23c79`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Pass**: re-verify iteration 1 of 3 (prior FAIL: P1 seed AC7 had no assertions)

---

## Task Completion

Design/Tasks skipped (medium). Implicit Execute steps inferred from `git log main..HEAD`:

| Task | Status | Notes |
| ---- | ------ | ----- |
| Specify catalog + seed + e2e + serve-well | ✅ Done | `2aee2f1` |
| Catalog module + seed upsert/delete + ministries | ✅ Done | `86c189c` |
| web-onda e2e pins Joinville / Onda Brasil | ✅ Done | `c4b4fd4` |
| Serve-well regional campus picker | ✅ Done | `5a5f3de` |
| Mark requirements Implementing | ✅ Done | `a1613ab` |
| Prior Verifier FAIL (AC7 untested) | ✅ Done | `a5c3d64` |
| Extract seed ministry/event/membership constants + AC7 tests | ✅ Done | `8a23c79` |

---

## Spec-Anchored Acceptance Criteria

Re-derived from `spec.md` against `main...HEAD`. Prior report citations were not reused.

### P1: Seed real regional campuses

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN the campus catalog is read THEN it SHALL contain churches named **Onda Brasil**, **Onda USA**, **Onda Europa**, and **Onda Japão** | names exactly those four strings, in that order | `apps/api/prisma/ondaCampuses.test.ts:14-19` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.name)).toEqual(['Onda Brasil', 'Onda USA', 'Onda Europa', 'Onda Japão'])` | ✅ PASS |
| WHEN the catalog is read THEN campus counts SHALL be **18**, **2**, **4**, and **1** respectively | `[18, 2, 4, 1]` | `apps/api/prisma/ondaCampuses.test.ts:20-22` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.campuses.length)).toEqual([18, 2, 4, 1])` | ✅ PASS |
| WHEN the catalog is read THEN Brasil campus names SHALL be exactly: Joinville, Av. Paulista, Mooca, Guarulhos, Bauru, Belo Horizonte, Blumenau, Cabo Frio, Campinas, Caxias do Sul, Curitiba, Florianópolis, Itajaí, Jaraguá do Sul, Macapá, Machado, Porto Alegre, Recife | exact ordered name list (accents included) | `apps/api/prisma/ondaCampuses.test.ts:23-42` — `expect(ONDA_REGIONAL_CHURCHES[0]?.campuses.map((campus) => campus.name)).toEqual(['Joinville', 'Av. Paulista', …, 'Recife'])` | ✅ PASS |
| WHEN the catalog is read THEN USA campuses SHALL be Charlotte and Chicago; Europa SHALL be Porto, Sines, Mallorca, and Londres; Japão SHALL be Hamamatsu | exact ordered name lists | `apps/api/prisma/ondaCampuses.test.ts:43-46` — USA `toEqual(['Charlotte', 'Chicago'])`; `:47-52` — Europa `toEqual(['Porto', 'Sines', 'Mallorca', 'Londres'])`; `:53-55` — Japão `toEqual(['Hamamatsu'])` | ✅ PASS |
| WHEN the catalog is read THEN every campus id SHALL be unique across churches | set size equals array length | `apps/api/prisma/ondaCampuses.test.ts:59-62` — `expect(new Set(campusIds).size).toBe(campusIds.length)` | ✅ PASS |
| WHEN `prisma db seed` runs THEN it SHALL upsert those churches/campuses (Brasil id `seed-church-demo`, USA id `seed-church-norte`) and delete obsolete ids `seed-campus-central-sede`, `seed-campus-central-sul`, `seed-campus-norte-unico` | stable church ids + obsolete id list consumed by seed upsert/`deleteMany` | `apps/api/prisma/ondaCampuses.test.ts:66-71` — `expect(ONDA_REGIONAL_CHURCHES.map((church) => church.id)).toEqual(['seed-church-demo', 'seed-church-norte', 'seed-church-europa', 'seed-church-japao'])`; `:75-79` — `expect([...OBSOLETE_SEED_CAMPUS_IDS]).toEqual(['seed-campus-central-sede', 'seed-campus-central-sul', 'seed-campus-norte-unico'])`. Seed consumes those constants: `seed.ts:26-28` `deleteMany`; `seed.ts:30-60` church/campus `upsert`. Independent Test is catalog unit test (not a seed-process test). | ✅ PASS |
| WHEN seed completes THEN Onda Brasil SHALL still own Hospitality + Band, the public event, and the demo greeter assignment; USA SHALL own Louvor; Europa SHALL own Mídia; Japão SHALL own Recepção; the demo volunteer SHALL have Active membership in each of those ministries | Hospitality+Band on Brasil (`seed-church-demo`); Louvor on USA (`seed-church-norte`); Mídia on Europa; Recepção on Japão; public event `seed-event-public` on Brasil; greeter assignment `seed-assignment-public-greeter` on Brasil Hospitality; demo volunteer `seed-volunteer-demo` with `status: 'ACTIVE'` on each of those five ministries | `apps/api/prisma/ondaCampuses.test.ts:85-91` — `expect(ONDA_SEED_MINISTRIES).toEqual([{ id: 'seed-ministry-demo', name: 'Hospitality', churchId: 'seed-church-demo' }, { id: 'seed-ministry-band', name: 'Band', churchId: 'seed-church-demo' }, { id: 'seed-ministry-norte', name: 'Louvor', churchId: 'seed-church-norte' }, { id: 'seed-ministry-europa', name: 'Mídia', churchId: 'seed-church-europa' }, { id: 'seed-ministry-japao', name: 'Recepção', churchId: 'seed-church-japao' }])`; `:95-98` — `expect(ONDA_SEED_PUBLIC_EVENT).toEqual({ id: 'seed-event-public', churchId: 'seed-church-demo' })`; `:99-105` — `expect(ONDA_SEED_GREETER_ASSIGNMENT).toEqual({ id: 'seed-assignment-public-greeter', eventId: 'seed-event-public', ministryId: 'seed-ministry-demo', volunteerId: 'seed-volunteer-demo', roleId: 'seed-role-greeter' })`; `:109` — `expect(ONDA_SEED_DEMO_VOLUNTEER_ID).toBe('seed-volunteer-demo')`; `:110` — `expect(ONDA_SEED_DEMO_MEMBERSHIP_STATUS).toBe('ACTIVE')`; `:111-117` — `expect([...ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS]).toEqual(['seed-ministry-demo', 'seed-ministry-band', 'seed-ministry-norte', 'seed-ministry-europa', 'seed-ministry-japao'])`. Seed consumes those constants (not constants-only): `seed.ts:62-75` `for (const ministrySeed of ONDA_SEED_MINISTRIES)` ministry `upsert`; `:77-84` volunteer `upsert` `ONDA_SEED_DEMO_VOLUNTEER_ID`; `:151-166` `for (const ministryId of ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS)` membership `upsert` with `status: ONDA_SEED_DEMO_MEMBERSHIP_STATUS`; `:228-243` event `upsert` `ONDA_SEED_PUBLIC_EVENT`; `:245-265` assignment `upsert` `ONDA_SEED_GREETER_ASSIGNMENT`. | ✅ PASS |

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

**Status**: ✅ All ACs covered — **11/11** ACs matched spec outcome; **0** spec-precision gaps; **0** uncovered

---

## Discrimination Sensor

Scratch method: `git worktree add /tmp/onda-186-sensor-r1 HEAD`; symlink `apps/api/node_modules` from the real repo; mutate `ondaCampuses.ts`; run `./node_modules/.bin/jest --config ./test/jest-unit.json prisma/ondaCampuses.test.ts` from `apps/api`; `git checkout` the file between mutations. Worktree removed (`git worktree remove --force`). Real working tree untouched.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `apps/api/prisma/ondaCampuses.ts:98` | `'Recepção'` → `'Reception'` in `ONDA_SEED_MINISTRIES` | ✅ Killed — `ondaCampuses.test.ts:85` `expect(ONDA_SEED_MINISTRIES).toEqual([… name: 'Recepção' …])` received `'Reception'` (exit 1) |
| 2 | `apps/api/prisma/ondaCampuses.ts:110` | Removed `'seed-ministry-japao'` from `ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS` | ✅ Killed — `ondaCampuses.test.ts:111` `toEqual([…, 'seed-ministry-japao'])` missing last id (exit 1) |
| 3 | `apps/api/prisma/ondaCampuses.ts:103` | `ONDA_SEED_DEMO_MEMBERSHIP_STATUS` `'ACTIVE'` → `'INACTIVE'` | ✅ Killed — `ondaCampuses.test.ts:110` `expect(ONDA_SEED_DEMO_MEMBERSHIP_STATUS).toBe('ACTIVE')` received `'INACTIVE'` (exit 1) |

**Sensor depth**: lightweight (3 behavior-level mutations; all on AC7 constants that previously had no assertions)
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results (if performed)

Not performed. Seed/catalog is non-interactive; P2 Independent Test is inspect of the design-reference. No user-facing production UI in this diff (`apps/web-onda` changes are e2e pins only).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Catalog constant + seed loop over it; extracted ministry/event/membership constants consumed by seed upserts; e2e pin updates; serve-well region field + grouped switcher |
| Surgical changes | ✅ Diff is spec, catalog/seed, e2e fixtures, serve-well picker, issue/README, AC7 tests |
| No scope creep | ✅ Europa/Japão ministries are in AC7; no shared catalog package (out of scope) |
| Matches patterns | ✅ Prisma `upsert` by stable seed ids; AC7 follows the same extracted-constant + unit-test pattern as the catalog |
| Spec-anchored outcome check (asserted values match spec) | ✅ AC7 assertions target Hospitality/Band/Louvor/Mídia/Recepção, Brasil public event + greeter assignment, and `ACTIVE` memberships on those ministry ids |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ Catalog ACs 1:1; seed ministry/event/assignment/membership (AC7) now has a unit layer; e2e Independent Test is fixture inspect; P2 Independent Test is inspect |
| Every test maps to a spec requirement — no unclaimed tests | ✅ Four catalog tests map to ACs 1–6 + edge obsolete-id list; three seed-contract tests map to AC7 |
| Documented guidelines followed: `AGENTS.md` (Jest unit via `test/jest-unit.json`; Playwright fixtures for e2e pins) | ✅ |

---

## Edge Cases

- [x] WHEN seed runs on a DB that still has fake campuses THEN those rows SHALL be deleted (`OBSOLETE_SEED_CAMPUS_IDS`): ids locked at `ondaCampuses.test.ts:75-79`; `seed.ts:26-28` `deleteMany({ where: { id: { in: [...OBSOLETE_SEED_CAMPUS_IDS] } } })`.
- [x] WHEN seed runs twice THEN church/campus rows SHALL upsert in place (stable ids), not duplicate: stable ids asserted `ondaCampuses.test.ts:66-71`; `seed.ts:30-60` `upsert` `where: { id }`.
- [x] WHEN a campus is missing from the catalog snapshot vs the public site THEN the unit test SHALL fail on the exact name list (not only counts): name lists at `ondaCampuses.test.ts:23-55` in addition to counts `:20-22`.

---

## Gate Check

- **Gate command**: Tasks skipped — no `tasks.md` Gate Check Commands. This re-verify ran catalog + seed unit tests only (orchestrator: do not re-run full e2e): `pnpm --filter @onda/api exec jest --config ./test/jest-unit.json prisma/ondaCampuses.test.ts`.
- **Result**: **7 passed, 0 failed, 0 skipped** (4 catalog + 3 AC7 seed-contract).
- **Test count before feature**: API unit **7** (`scheduling-rules.test.ts` 4 + `admin-invite-email.test.ts` 3 on `main`). Catalog file absent on `main`.
- **Test count after feature**: API unit **14** (`ondaCampuses.test.ts` 7). Prior FAIL had 4 tests in that file.
- **Delta**: +7 API unit tests vs `main`; +3 vs prior FAIL (AC7 coverage).
- **Skipped tests**: none
- **Failures**: none

Grep (success criteria, not ACs): `apps/api/prisma/seed.ts` has no `Igreja Central` / `Comunidade Norte` / `Sede` / `Zona Sul` / `Único`. `apps/web-onda/e2e` has no `seed-campus-central-sede` / `Igreja Central`. PR #179 closed-as-superseded was not verified in this pass.

---

## Fix Plans (if issues found)

None. Prior Fix 1 (P1 seed AC7 untested) is closed: assertions now target spec-defined ministry names, church ids, public event, greeter assignment, and `ACTIVE` memberships; `seed.ts` upserts from those constants.

---

## Requirement Traceability Update

Do not edit `spec.md` in this verification pass (report-only).

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CAMPUS-01 | Implementing | ✅ Verified |
| CAMPUS-02 | Implementing (prior re-verify: Needs Fix AC7) | ✅ Verified |
| CAMPUS-03 | Implementing | ✅ Verified |
| CAMPUS-04 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 11/11 ACs matched spec outcome | 0 spec-precision gaps
**Sensor**: 3/3 mutations killed (all AC7)
**Gate**: 7 passed (catalog + seed unit; full e2e not re-run)

**What works**: Regional catalog names, counts, exact campus lists (including Hamamatsu), unique campus ids, legacy church ids, obsolete campus id list; seed ministry ownership (Hospitality+Band Brasil, Louvor USA, Mídia Europa, Recepção Japão), public event + greeter assignment on Brasil, demo volunteer `ACTIVE` on those ministries with `seed.ts` consuming the tested constants; web-onda smoke mocks / API-backed `onda:activeCampusId` pins; serve-well `CAMPUS_REGIONS` grouping with Hamamatsu under Onda Japão.

**Issues found**: none

**Next steps**: none — re-verify iteration 1 PASS. L-009 already records the prior AC7 gap; no new lesson (clean PASS, no remaining signal).
