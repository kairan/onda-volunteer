# Organization Structure Administration — Tasks

**Design**: `.specs/features/organization-structure-administration/design.md`  
**Spec**: `.specs/features/organization-structure-administration/spec.md`  
**Status**: P2 campus approved for Execute (#107); ORG-STRUCT-06 (#108) — Tasks below (not started)

---

## Execution Plan

### Phase 1: Campus metadata API (sequential)

```text
T-CAMPUS-01 → T-CAMPUS-02
```

### Phase 2: Campus settings UI (sequential)

```text
T-CAMPUS-03 → T-CAMPUS-04 → T-CAMPUS-05 [P] i18n
```

### Phase 3: Tracker parity (optional, doc-only)

```text
T-ORG-P1-01
```

**Next:** ORG-STRUCT-06 Ministry archive — [#108](https://github.com/kairan/onda-volunteer/issues/108) (Specify/Design complete; product decisions locked 2026-06-06; Execute phases below).

**GitHub:** [#107](https://github.com/kairan/onda-volunteer/issues/107) (P2 Execute) · [#108](https://github.com/kairan/onda-volunteer/issues/108) (`ready-for-agent`) · [#109](https://github.com/kairan/onda-volunteer/issues/109) (P1 tracker doc)

---

## Validation tables

### Diagram ↔ Depends on

| Task | Stated depends | Matches phase diagram |
|------|----------------|----------------------|
| T-CAMPUS-01 | None | ✅ |
| T-CAMPUS-02 | T-CAMPUS-01 | ✅ |
| T-CAMPUS-03 | T-CAMPUS-01 | ✅ |
| T-CAMPUS-04 | T-CAMPUS-03 | ✅ |
| T-CAMPUS-05 | T-CAMPUS-03 | ✅ |
| T-ORG-P1-01 | None | ✅ |

### Test co-location

| Task | Tests in same task | Gate |
|------|-------------------|------|
| T-CAMPUS-01 | none (service + controller) | `pnpm --filter @onda/api typecheck` |
| T-CAMPUS-02 | `campus-metadata.e2e-spec.ts` | `pnpm test` (api) |
| T-CAMPUS-03–05 | `campusSettings.behavior.test.tsx` | `pnpm --filter @onda/web test` |
| T-ORG-P1-01 | none | doc review |

---

## Task breakdown

### T-CAMPUS-01: API — campus metadata PATCH

**What**: Add `CampusesController` + `OrganizationService.updateCampusMetadata` (`PATCH /campuses/:campusId`).  
**Where**: `apps/api/src/organization/`  
**Depends on**: None  
**Requirement**: ORG-STRUCT-05  
**Issue**: [#107](https://github.com/kairan/onda-volunteer/issues/107)

**Done when**:

- [ ] Accredited **Admin** can PATCH `name` and/or `timezone` for a campus in their church
- [ ] Stable codes: `CAMPUS_NOT_FOUND`, `CAMPUS_NAME_REQUIRED`, `CAMPUS_METADATA_EMPTY`, `INVALID_TIMEZONE`, `ADMIN_NOT_ACCREDITED`
- [ ] No mutation of UTC scheduling rows

**Tests**: none (covered in T-CAMPUS-02)  
**Gate**: API typecheck

**Verify:** `pnpm --filter @onda/api typecheck` passes; manual or e2e in T-CAMPUS-02 confirms `PATCH /campuses/:id` returns updated DTO for accredited Admin.

---

### T-CAMPUS-02: API e2e — campus metadata

**What**: Add `apps/api/test/campus-metadata.e2e-spec.ts` (mirror `church-metadata.e2e-spec.ts`).  
**Where**: `apps/api/test/`  
**Depends on**: T-CAMPUS-01  
**Requirement**: ORG-STRUCT-05  
**Issue**: [#107](https://github.com/kairan/onda-volunteer/issues/107)

**Done when**:

- [ ] Admin renames campus; organization context reflects new name
- [ ] Admin changes campus timezone; existing event `startsAtUtc` / `endsAtUtc` unchanged in DB
- [ ] Non-admin and invalid name/timezone/empty body rejected with stable codes

**Tests**: API Jest e2e (co-located)  
**Gate**: `export DATABASE_URL=... && pnpm test` (api campus spec)

**Verify:** `pnpm test` includes green `campus-metadata.e2e-spec.ts`; independent test from spec: change **Campus** TZ (not church `defaultTimezone`), assert UTC event unchanged and organization context reflects updated campus IANA zone for that campus.

---

### T-CAMPUS-03: Web client — campus metadata API helper

**What**: `campusMetadata.ts` + `CampusSettingsSection` on `/ministries` (active campus, admin-only).  
**Where**: `apps/web/src/organization/`, `apps/web/src/routes/ministries.tsx`  
**Depends on**: T-CAMPUS-01  
**Requirement**: ORG-STRUCT-05  
**Issue**: [#107](https://github.com/kairan/onda-volunteer/issues/107)

**Done when**:

- [ ] Form loads from `activeCampus`; save calls PATCH then `refresh()`
- [ ] Church/Campus shell selectors remain separate (no merged control)
- [ ] Errors map `ADMIN_NOT_ACCREDITED`, `INVALID_TIMEZONE`, `CAMPUS_NAME_REQUIRED`

**Tests**: none (T-CAMPUS-04)  
**Gate**: web `tsc --noEmit` if touched

**Verify:** Accredited Admin on `/ministries` edits **active Campus** name/timezone; shell campus label and timezone presentation update after save (church settings section does not substitute for per-campus TZ).

---

### T-CAMPUS-04: Web behavior — campus settings

**What**: `campusSettings.behavior.test.tsx` with `@testing-library/user-event`.  
**Where**: `apps/web/src/organization/`  
**Depends on**: T-CAMPUS-03  
**Requirement**: ORG-STRUCT-05  
**Issue**: [#107](https://github.com/kairan/onda-volunteer/issues/107)

**Done when**:

- [ ] Save name + timezone mocks API and asserts `refresh` / context update
- [ ] Timezone change shows confirm dialog before submit; name-only does not
- [ ] Non-admin does not render section

**Tests**: Vitest behavior (co-located)  
**Gate**: `pnpm --filter @onda/web test`

**Verify:** `pnpm --filter @onda/web test` passes `campusSettings.behavior.test.tsx`.

---

### T-CAMPUS-05: i18n — campus settings copy

**What**: `ministries.json` (`en`, `pt-BR`) for campus settings + timezone confirm dialog.  
**Where**: `apps/web/src/i18n/locales/`  
**Depends on**: T-CAMPUS-03  
**Requirement**: ORG-STRUCT-05  
**Issue**: [#107](https://github.com/kairan/onda-volunteer/issues/107)  
**Parallel**: `[P]` with T-CAMPUS-04 after T-CAMPUS-03

**Done when**:

- [ ] Title, labels, hints, confirm dialog, and error strings present in both locales

**Tests**: none  
**Gate**: lint spot-check

**Verify:** UI strings render in pt-BR default locale smoke on `/ministries`.

---

### T-ORG-P1-01: Tracker — P1 ministry structure doc

**What**: Add `docs/issues/done/109-org-structure-p1-ministry-admin.md`; link ORG-STRUCT-01–04; note shipped routes/tests from spec.  
**Where**: `docs/issues/done/`, `docs/issues/README.md` row  
**Depends on**: None  
**Requirement**: ORG-STRUCT-01–04 (tracker parity)  
**Issue**: [#109](https://github.com/kairan/onda-volunteer/issues/109)

**Done when**:

- [ ] README index lists #109 as shipped (after PR merge) or active doc issue closed
- [ ] Spec implementation notes cross-link issue #109

**Tests**: none  
**Gate**: doc review

**Verify:** `docs/issues/README.md` references #109; spec traceability table notes GitHub issue for P1.

---

## Phase 4: Ministry archive (ORG-STRUCT-06) — [#108](https://github.com/kairan/onda-volunteer/issues/108)

```text
T-ARCHIVE-01 → T-ARCHIVE-02 → T-ARCHIVE-03 → T-ARCHIVE-04 [P] T-ARCHIVE-05
```

### T-ARCHIVE-01: Schema + write guard

**What**: Add `Ministry.archivedAt`; create `ministry-write-guard.ts`; export from `OrganizationModule`.  
**Where**: `apps/api/prisma/`, `apps/api/src/organization/`  
**Depends on**: None  
**Requirement**: ORG-STRUCT-06

**Done when**:

- [ ] Migration adds nullable `archivedAt` on `Ministry`
- [ ] `assertMinistryAcceptsWrites` returns ministry or throws `MINISTRY_ARCHIVED`

**Gate**: `pnpm --filter @onda/api typecheck`

---

### T-ARCHIVE-02: API — archive endpoint + guard wiring

**What**: `archiveMinistry` + `POST /ministries/:id/archive` (archive-only — no unarchive endpoint); wire guard on write paths in design inventory.  
**Where**: `organization.service.ts`, `roles.service.ts`, `events.service.ts`, `scheduling.service.ts`  
**Depends on**: T-ARCHIVE-01  
**Requirement**: ORG-STRUCT-06

**Done when**:

- [ ] Archive voids future assignments in transaction
- [ ] Stable codes: `MINISTRY_ARCHIVED`, `MINISTRY_ALREADY_ARCHIVED`
- [ ] Guarded writes reject archived ministries (unavailability create/bulk only — update/delete unguarded for cleanup)
- [ ] E2e asserts unavailability update/delete succeed on archived ministry; create returns `MINISTRY_ARCHIVED`

**Tests**: `ministry-archive.e2e-spec.ts` (co-located in T-ARCHIVE-02)  
**Gate**: `pnpm test` (api archive spec)

---

### T-ARCHIVE-03: API — organization context `archivedAt`

**What**: Extend `getAccessibleOrganizationContext` DTO with `archivedAt` per ministry.  
**Where**: `organization.service.ts`, `stewardship.service.ts` selects  
**Depends on**: T-ARCHIVE-01  
**Requirement**: ORG-STRUCT-06

**Done when**:

- [ ] Context ministries include `archivedAt: string | null`

**Gate**: covered by T-ARCHIVE-02 e2e

---

### T-ARCHIVE-04: Web — archive UI + picker filters + shell switcher

**What**: `archiveMinistry` client; structure section archive + confirm; filter archived from write pickers; **add** shell ministry selector (`OrganizationContextControls.tsx` + `OrganizationContextProvider` `activeMinistryId` — shell has Church/Campus only today); admin/system-admin-only archived rows in switcher (with badge).  
**Where**: `apps/web/src/organization/`, `apps/web/src/shell/OrganizationContextControls.tsx`, routes listed in `design.md`  
**Depends on**: T-ARCHIVE-02  
**Requirement**: ORG-STRUCT-06

**Done when**:

- [ ] Admin can archive from `/ministries` with confirm dialog
- [ ] Write pickers exclude archived ministries
- [ ] Archived badge on structure list
- [ ] Non-admin shell switcher hides archived ministries; admin/system admin see them with badge

**Tests**: `ministryArchive.behavior.test.tsx` (T-ARCHIVE-05)  
**Gate**: web typecheck

---

### T-ARCHIVE-05: i18n + behavior tests

**What**: Agent-draft `ministries.json` archive strings (`en`, `pt-BR`, role-retire #44 pattern); `ministryArchive.behavior.test.tsx` with `userEvent`.  
**Where**: `apps/web/src/i18n/`, `apps/web/src/organization/`  
**Depends on**: T-ARCHIVE-04  
**Requirement**: ORG-STRUCT-06  
**Parallel**: `[P]` with final e2e polish after T-ARCHIVE-04

**Done when**:

- [ ] Archive confirm dialog, badge, and error strings in both locales
- [ ] Behavior tests cover confirm dialog, picker filter, and non-admin switcher hide

**Gate**: `pnpm --filter @onda/web test`

---

## Other backlog

| ID | Issue | Notes |
|----|-------|-------|
| ORG-STRUCT-07 | `system-admin-platform` | Already tracked #87–93 |
