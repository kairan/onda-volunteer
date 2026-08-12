# Onda Dura regional campuses — Specification

## Status

- **Phase:** Specify + Execute (medium; Design/Tasks skipped)
- **GitHub:** [#186](https://github.com/kairan/onda-volunteer/issues/186)
- **Supersedes:** PR [#179](https://github.com/kairan/onda-volunteer/pull/179) (stale vs #175 cutover)
- **Related:** [`CONTEXT.md`](../../../CONTEXT.md) Church / Campus; ADR 0001 selectors

## Problem Statement

Demo seed still uses fictional churches (`Igreja Central`, `Comunidade Norte`) and three fake campuses. Local and Playwright API-backed flows should look like Igreja Onda Dura. PR #179 did this against `apps/web` / `apps/web-next`, which were deleted at the #175 cutover. Restart on current `main` (`apps/api` seed + `apps/web-onda` e2e + serve-well reference) and refresh the catalog from [ondadura.com.br/campus](https://www.ondadura.com.br/campus) (verified 2026-08-12), which now includes **Hamamatsu (Japão)**.

## Goals

- [x] Seed regional demo **Churches** whose campus names match the public Onda Dura campus page.
- [x] Re-seed is idempotent and removes obsolete fake campus rows.
- [x] web-onda smoke/API e2e pin Joinville as HQ campus under **Onda Brasil**.
- [x] Serve-well campus picker groups campuses by region, including Japão.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Shared monorepo package for the catalog | Follow-up from #179 review; comment-only sync is enough |
| Single-Church production model (all campuses under one Onda Dura tenant) | Seed keeps multiple **Church** rows so the church selector has tenants to switch; CONTEXT.md still describes production Church = Onda Dura |
| `apps/web` / `apps/web-next` | Removed at #175 |
| Production data migration | Seed/demo only |
| Live scrape of ondadura.com.br at seed time | Catalog is a checked-in snapshot with a verification date |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Regional groups as separate **Church** tenants | Onda Brasil / USA / Europa / Japão | Same demo UX as #179; product is multi-church | y (restart of #179) |
| Japan grouping | Fourth church **Onda Japão**, campus **Hamamatsu** | Public page added Japão–Hamamatsu after #179; not Brasil/USA/Europa | y (live page 2026-08-12) |
| Legacy seed ids | Keep `seed-church-demo` (Brasil) and `seed-church-norte` (USA) | Existing fixtures and local DBs | y (#179 review) |
| HQ campus for e2e | `seed-campus-joinville` | CONTEXT.md: sede is Joinville | y |
| Catalog source | Snapshot from ondadura.com.br/campus, not a runtime fetch | Seed must be deterministic in CI | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Seed real regional campuses ⭐ MVP

**User Story**: As a developer, I want seed data to use real Onda Dura campus names grouped by region so local and API-backed e2e look like the church.

**Why P1**: This is the whole feature.

**Acceptance Criteria**:

1. WHEN the campus catalog is read THEN it SHALL contain churches named **Onda Brasil**, **Onda USA**, **Onda Europa**, and **Onda Japão**.
2. WHEN the catalog is read THEN campus counts SHALL be **18**, **2**, **4**, and **1** respectively.
3. WHEN the catalog is read THEN Brasil campus names SHALL be exactly: Joinville, Av. Paulista, Mooca, Guarulhos, Bauru, Belo Horizonte, Blumenau, Cabo Frio, Campinas, Caxias do Sul, Curitiba, Florianópolis, Itajaí, Jaraguá do Sul, Macapá, Machado, Porto Alegre, Recife.
4. WHEN the catalog is read THEN USA campuses SHALL be Charlotte and Chicago; Europa SHALL be Porto, Sines, Mallorca, and Londres; Japão SHALL be Hamamatsu.
5. WHEN the catalog is read THEN every campus id SHALL be unique across churches.
6. WHEN `prisma db seed` runs THEN it SHALL upsert those churches/campuses (Brasil id `seed-church-demo`, USA id `seed-church-norte`) and delete obsolete ids `seed-campus-central-sede`, `seed-campus-central-sul`, `seed-campus-norte-unico`.
7. WHEN seed completes THEN Onda Brasil SHALL still own Hospitality + Band, the public event, and the demo greeter assignment; USA SHALL own Louvor; Europa SHALL own Mídia; Japão SHALL own Recepção; the demo volunteer SHALL have Active membership in each of those ministries.

**Independent Test**: Unit test on the catalog; re-seed and confirm church names and Joinville campus id.

---

### P1: web-onda e2e follows the new HQ campus

**User Story**: As CI, I want Playwright smoke mocks and API-backed fixtures to use **Onda Brasil** / Joinville so tests do not pin deleted campus ids.

**Why P1**: Stale fixtures would fail API-backed e2e after re-seed.

**Acceptance Criteria**:

1. WHEN smoke mocks serve organization context THEN the church name SHALL be `Onda Brasil` and the campus SHALL be `{ id: 'seed-campus-joinville', name: 'Joinville' }`.
2. WHEN API-backed fixtures pin localStorage THEN `onda:activeCampusId` SHALL be `seed-campus-joinville`.

**Independent Test**: Grep/read e2e fixtures; smoke tests still load dashboard.

---

### P2: Serve-well campus picker groups by region

**User Story**: As someone browsing the serve-well reference, I want campuses grouped by Onda Brasil / USA / Europa / Japão.

**Why P2**: Design-reference only; web-onda reads campuses from the API.

**Acceptance Criteria**:

1. WHEN the campus switcher opens THEN campuses SHALL be grouped under **Onda Brasil**, **Onda USA**, **Onda Europa**, and **Onda Japão**.
2. WHEN the Japão group renders THEN it SHALL include Hamamatsu.

**Independent Test**: Inspect `design-reference/serve-well/src/lib/campus.tsx` and AppShell grouping.

---

## Edge Cases

- WHEN seed runs on a DB that still has fake campuses THEN those rows SHALL be deleted (`OBSOLETE_SEED_CAMPUS_IDS`).
- WHEN seed runs twice THEN church/campus rows SHALL upsert in place (stable ids), not duplicate.
- WHEN a campus is missing from the catalog snapshot vs the public site THEN the unit test SHALL fail on the exact name list (not only counts).

---

## Implicit-requirement dimensions (medium)

| Dimension | Resolution |
| --------- | ---------- |
| Idempotency / retry | Seed upserts by stable ids; safe to re-run |
| Data lifecycle | Obsolete fake campus ids deleted on seed |
| Remaining dimensions | N/A for this scope (no auth, concurrency, payments, or runtime external calls) |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| CAMPUS-01 | P1: catalog names + counts + unique ids | Execute | Verified |
| CAMPUS-02 | P1: seed upsert + obsolete delete + ministries | Execute | Verified |
| CAMPUS-03 | P1: web-onda e2e mocks/fixtures | Execute | Verified |
| CAMPUS-04 | P2: serve-well regional picker | Execute | Verified |

**Coverage:** 4 total, 0 mapped to formal tasks (inline Execute), 0 unmapped.

---

## Success Criteria

- [x] Catalog unit test encodes the 2026-08-12 public campus list (including Hamamatsu).
- [x] Seed no longer creates Igreja Central / Comunidade Norte / Sede / Zona Sul / Único.
- [x] web-onda e2e does not reference `seed-campus-central-sede` or `Igreja Central`.
- [x] Stale PR #179 is closed as superseded.
