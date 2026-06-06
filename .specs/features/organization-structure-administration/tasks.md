# Organization Structure Administration — Tasks

**Design**: `.specs/features/organization-structure-administration/design.md`  
**Spec**: `.specs/features/organization-structure-administration/spec.md`  
**Status**: Execute complete (P2 campus slice + P1 tracker doc)

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

**Deferred:** ORG-STRUCT-06 Ministry archive — [#108](https://github.com/kairan/onda-volunteer/issues/108) (Specify/Design later).

**GitHub:** [#107](https://github.com/kairan/onda-volunteer/issues/107) (P2 Execute) · [#108](https://github.com/kairan/onda-volunteer/issues/108) (backlog) · [#109](https://github.com/kairan/onda-volunteer/issues/109) (P1 tracker doc)

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

- [x] Accredited **Admin** can PATCH `name` and/or `timezone` for a campus in their church
- [x] Stable codes: `CAMPUS_NOT_FOUND`, `CAMPUS_NAME_REQUIRED`, `CAMPUS_METADATA_EMPTY`, `INVALID_TIMEZONE`, `ADMIN_NOT_ACCREDITED`
- [x] No mutation of UTC scheduling rows

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

- [x] Admin renames campus; organization context reflects new name
- [x] Admin changes campus timezone; existing event `startsAtUtc` / `endsAtUtc` unchanged in DB
- [x] Non-admin and invalid name/timezone/empty body rejected with stable codes

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

- [x] Form loads from `activeCampus`; save calls PATCH then `refresh()`
- [x] Church/Campus shell selectors remain separate (no merged control)
- [x] Errors map `ADMIN_NOT_ACCREDITED`, `INVALID_TIMEZONE`, `CAMPUS_NAME_REQUIRED`

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

- [x] Save name + timezone mocks API and asserts `refresh` / context update
- [x] Timezone change shows confirm dialog before submit; name-only does not
- [x] Non-admin does not render section

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

- [x] Title, labels, hints, confirm dialog, and error strings present in both locales

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

- [x] README index lists #109 as shipped (after PR merge) or active doc issue closed
- [x] Spec implementation notes cross-link issue #109

**Tests**: none  
**Gate**: doc review

**Verify:** `docs/issues/README.md` references #109; spec traceability table notes GitHub issue for P1.

---

## Deferred backlog (not in Execute above)

| ID | Issue | Notes |
|----|-------|-------|
| ORG-STRUCT-06 | [#108](https://github.com/kairan/onda-volunteer/issues/108) | Ministry archive — needs schema + guards; separate Design/Tasks |
| ORG-STRUCT-07 | `system-admin-platform` | Already tracked #87–93 |
