# Leader Production Roster Assignment UI — Tasks

**Design**: `.specs/features/leader-roster-assignment-ui/design.md`  
**Spec**: `.specs/features/leader-roster-assignment-ui/spec.md`  
**Status**: Shipped — validated 2026-06-11 (#115).

---

## Execution Plan

```text
T-ROSTER-01 → T-ROSTER-02 → T-ROSTER-03 → T-ROSTER-04 [P] T-ROSTER-05 → T-ROSTER-06
```

**Chain rationale**:

- T-ROSTER-01 (API `voidAssignment`) must ship before web can call the new endpoint.
- T-ROSTER-02 (API e2e) validates the API contract before web integration.
- T-ROSTER-03 (Web client helpers) can run after T-ROSTER-01 (API contract is known).
- T-ROSTER-04 (Web form + remove UI) can run after T-ROSTER-03; T-ROSTER-05 (i18n) is parallel to T-ROSTER-04 after T-ROSTER-03.
- T-ROSTER-06 (web behavior tests) runs after T-ROSTER-04.

---

## Validation tables

### Diagram ↔ Depends on

| Task | Stated depends | Matches diagram |
|------|----------------|-----------------|
| T-ROSTER-01 | None | ✅ |
| T-ROSTER-02 | T-ROSTER-01 | ✅ |
| T-ROSTER-03 | T-ROSTER-01 | ✅ |
| T-ROSTER-04 | T-ROSTER-03 | ✅ |
| T-ROSTER-05 | T-ROSTER-03 | ✅ (parallel with T-ROSTER-04) |
| T-ROSTER-06 | T-ROSTER-04 | ✅ |

### Test co-location

| Task | Tests | Gate |
|------|-------|------|
| T-ROSTER-01 | none (covered in T-ROSTER-02) | `pnpm --filter @onda/api typecheck` |
| T-ROSTER-02 | `leader-roster-assignment.e2e-spec.ts` | `pnpm test` (api) |
| T-ROSTER-03 | none (covered in T-ROSTER-06) | `pnpm --filter @onda/web exec tsc --noEmit` |
| T-ROSTER-04 | none (covered in T-ROSTER-06) | web typecheck |
| T-ROSTER-05 | none | lint spot-check |
| T-ROSTER-06 | behavior + role-fetch behavior tests | `pnpm --filter @onda/web test` |

---

## Task breakdown

### T-ROSTER-01: API — `voidAssignment` service method + controller route

**What**: Add `SchedulingService.voidAssignment` + `POST /assignments/:assignmentId/void` to `AssignmentsController`.  
**Where**: `apps/api/src/scheduling/scheduling.service.ts`, `apps/api/src/scheduling/assignments.controller.ts`  
**Depends on**: None  
**Requirement**: ROSTER-10, ROSTER-11

**Done when**:

- [x] `voidAssignment` calls `assertSchedulingWriteAllowed`, loads assignment, asserts Leader or Admin auth, rejects if already voided, sets `voidedAtUtc`
- [x] Stable error codes: `ASSIGNMENT_NOT_FOUND` (404), `ASSIGNMENT_ALREADY_VOIDED` (400), `LEADER_NOT_ASSIGNED` (403), `SYSTEM_ADMIN_READ_ONLY` (403)
- [x] Controller route `POST /assignments/:id/void` registered

**Gate**: `pnpm --filter @onda/api typecheck`

**Verify**: API typecheck passes; manual `curl POST /assignments/fake-id/void` with wrong credentials returns 403.

---

### T-ROSTER-02: API e2e — leader roster assignment

**What**: Add `apps/api/test/leader-roster-assignment.e2e-spec.ts` covering void and create-assignment with real auth.  
**Where**: `apps/api/test/`  
**Depends on**: T-ROSTER-01  
**Requirement**: ROSTER-05, ROSTER-06, ROSTER-10, ROSTER-11, ROSTER-12

**Done when**:

- [x] Leader creates assignment for their ministry member — 201
- [x] Leader voids another volunteer's assignment in their ministry — 200 with `voidedAtUtc`
- [x] Leader cannot void assignment for a ministry they do not lead — 403 `LEADER_NOT_ASSIGNED`
- [x] System Admin cannot void (write blocked) — 403 `SYSTEM_ADMIN_READ_ONLY`
- [x] Double-void returns `ASSIGNMENT_ALREADY_VOIDED` — 400
- [x] Unavailability block returns `UNAVAILABILITY_BLOCKS_ASSIGN` on create — 409

**Tests**: API Jest e2e (co-located)  
**Gate**: `export DATABASE_URL=... && pnpm test` (api — new spec file passes)

**Verify**: `pnpm test` includes green `leader-roster-assignment.e2e-spec.ts`; leader void flow and auth rejection cases all pass.

---

### T-ROSTER-03: Web client — `voidAssignment` + `fetchMinistryRoles` helpers

**What**: Add `apps/web/src/events/voidAssignment.ts` and `apps/web/src/organization/fetchMinistryRoles.ts`.  
**Where**: `apps/web/src/events/`, `apps/web/src/organization/`  
**Depends on**: T-ROSTER-01  
**Requirement**: ROSTER-02, ROSTER-04, ROSTER-10

**Done when**:

- [x] `voidAssignment({ assignmentId, actingVolunteerId })` calls `POST /assignments/:id/void` and returns `{ id, voidedAtUtc }`
- [x] `fetchMinistryRoles({ ministryId, actingVolunteerId })` calls `GET /ministries/:id/roles` and returns `{ id, name, retiredAt }`
- [x] Both functions throw `ApiRequestError` on non-2xx responses (matching existing helper pattern)

**Tests**: none (covered in T-ROSTER-06)  
**Gate**: `pnpm --filter @onda/web exec tsc --noEmit`

**Verify**: TypeScript compiles without errors; helpers importable in `schedulingEventDetail.tsx`.

---

### T-ROSTER-04: Web UI — replace demo form with production roster controls

**What**: Replace the `canAssign` / `VITE_DEMO_*` gate in `SchedulingEventDetailView` with production assignment form (ministry picker for Public events, volunteer picker, role picker, window inputs) and add Remove button to roster rows for Leaders/Admins.  
**Where**: `apps/web/src/routes/schedulingEventDetail.tsx`  
**Depends on**: T-ROSTER-03  
**Requirement**: ROSTER-01, ROSTER-02, ROSTER-03, ROSTER-04, ROSTER-05, ROSTER-07, ROSTER-08, ROSTER-09, ROSTER-12, ROSTER-13, ROSTER-14

**Done when**:

- [x] `canAssign` block and all `VITE_DEMO_*` references removed from `schedulingEventDetail.tsx`
- [x] Assignment form visible when `isLeader` on ≥1 accessible ministry AND event not cancelled
- [x] Volunteer picker lists `fetchMinistryMemberships` (ACTIVE only) for selected ministry
- [x] Role picker lists `fetchMinistryRoles` (non-retired) for selected ministry
- [x] Ministry picker shown for Public events when leader stewards >1 ministry; auto-bound for exactly 1
- [x] Remove button appears on active assignment rows for leader's ministry (or accredited admin); opens confirm dialog; calls `voidAssignment`; roster refreshes
- [x] No functional regression for volunteers and non-leaders (they see only the read-only roster table)

**Tests**: none (covered in T-ROSTER-06)  
**Gate**: web typecheck

**Verify**: Leader account views an event → sees form with real volunteer/role dropdowns; non-leader account sees read-only table. Demo env vars can be removed from `.env` without breaking any page.

---

### T-ROSTER-05: i18n — roster form + remove dialog strings

**What**: Add `scheduling.json` strings (`en`, `pt-BR`) for the production assignment form (ministry select label, volunteer label, role label), the Remove confirm dialog, and new error codes.  
**Where**: `apps/web/src/i18n/locales/` — `en/scheduling.json`, `pt-BR/scheduling.json`  
**Depends on**: T-ROSTER-03  
**Requirement**: ROSTER-06  
**Parallel**: `[P]` with T-ROSTER-04 after T-ROSTER-03

**Done when**:

- [x] Form labels, placeholders, and confirm dialog strings present in both locales
- [x] Error code messages for `ASSIGNMENT_OVERLAP`, `OUTSIDE_EVENT_WINDOW`, `MINISTRY_ARCHIVED`, `LEADER_NOT_ASSIGNED`, `ASSIGNMENT_ALREADY_VOIDED` present in both locales

**Gate**: lint spot-check

**Verify**: UI in pt-BR default locale renders all new strings on `/scheduling/:eventId`.

---

### T-ROSTER-06: Web behavior tests

**What**: Extend `schedulingEventDetail.behavior.test.tsx` for production form; add `fetchMinistryRoles.behavior.test.tsx`.  
**Where**: `apps/web/src/routes/schedulingEventDetail.behavior.test.tsx`, `apps/web/src/organization/fetchMinistryRoles.behavior.test.tsx`  
**Depends on**: T-ROSTER-04  
**Requirement**: ROSTER-01, ROSTER-02, ROSTER-04, ROSTER-07, ROSTER-08, ROSTER-09, ROSTER-13

**Done when**:

- [x] Non-leader: assignment form is not rendered
- [x] Leader: form renders with ministry/volunteer/role pickers (mocked data)
- [x] Active-only filter: volunteer picker shows Active members; Pending/Inactive absent
- [x] Non-retired filter: role picker excludes `retiredAt !== null` entries
- [x] Remove button on leader's ministry assignment row; confirm dialog visible on click; `voidAssignment` called on confirm; roster updates
- [x] Demo env var gate: no reference to `VITE_DEMO_*` in component or tests

**Tests**: Vitest + `@testing-library/user-event` (co-located)  
**Gate**: `pnpm --filter @onda/web test`

**Verify**: `pnpm --filter @onda/web test` passes all behavior tests including new leader-roster cases.
