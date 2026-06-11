# Event Edit / Reschedule — Tasks

**Design**: `.specs/features/event-edit-reschedule/design.md`  
**Spec**: `.specs/features/event-edit-reschedule/spec.md`  
**Status**: Shipped — validated 2026-06-11 (#117).

---

## Execution Plan

```text
T-EDIT-01 → T-EDIT-02 → T-EDIT-03 [P] T-EDIT-04 → T-EDIT-05
```

**Chain rationale**:

- T-EDIT-01 (API service + controller) is the foundation; no pre-existing API hook to reuse.
- T-EDIT-02 (API e2e) validates the contract including orphan void behavior before web integration.
- T-EDIT-03 (web client helper) can run after T-EDIT-01 (endpoint contract known); T-EDIT-04 (web UI) depends on T-EDIT-03.
- T-EDIT-04 (web UI) and parallel i18n can run together once T-EDIT-03 ships.
- T-EDIT-05 (web behavior tests) depends on T-EDIT-04.

---

## Validation tables

### Diagram ↔ Depends on

| Task | Stated depends | Matches diagram |
|------|----------------|-----------------|
| T-EDIT-01 | None | ✅ |
| T-EDIT-02 | T-EDIT-01 | ✅ |
| T-EDIT-03 | T-EDIT-01 | ✅ |
| T-EDIT-04 | T-EDIT-03 | ✅ |
| T-EDIT-05 | T-EDIT-04 | ✅ |

### Test co-location

| Task | Tests | Gate |
|------|-------|------|
| T-EDIT-01 | none (covered T-EDIT-02) | `pnpm --filter @onda/api typecheck` |
| T-EDIT-02 | `event-edit-reschedule.e2e-spec.ts` | `pnpm test` (api) |
| T-EDIT-03 | none (covered T-EDIT-05) | `pnpm --filter @onda/web exec tsc --noEmit` |
| T-EDIT-04 | none (covered T-EDIT-05) | web typecheck |
| T-EDIT-05 | behavior tests | `pnpm --filter @onda/web test` |

---

## Task breakdown

### T-EDIT-01: API — `editEvent` service method + `PATCH /events/:id`

**What**: Add `EventsService.editEvent` + `PATCH /events/:id` to `EventsController`.  
**Where**: `apps/api/src/events/events.service.ts`, `apps/api/src/events/events.controller.ts`  
**Depends on**: None  
**Requirement**: EVENT-EDIT-01–12

**Done when**:

- [x] `editEvent` validates at least one field provided (`EVENT_EDIT_EMPTY`)
- [x] Auth check: Admin for Public or Private; Leader for Private only; `LEADER_CANNOT_EDIT_PUBLIC_EVENT` for Public
- [x] Cancelled event rejected: `EVENT_ALREADY_CANCELLED`
- [x] Title validated (non-empty after trim, ≤200 chars): `EVENT_TITLE_REQUIRED`, `EVENT_TITLE_TOO_LONG`
- [x] Time window validated (`startsAtUtc < endsAtUtc`): `INVALID_EVENT_WINDOW`
- [x] Orphan void loop: in transaction, void assignments outside new window; return `voidedAssignmentCount`
- [x] Title-only edit skips orphan check entirely
- [x] `PATCH /events/:id` route registered on `EventsController`

**Gate**: `pnpm --filter @onda/api typecheck`

**Verify**: Typecheck passes; `PATCH /events/fake-id` with missing auth returns 403; missing body fields return appropriate 400 codes.

---

### T-EDIT-02: API e2e — event edit and reschedule

**What**: Add `apps/api/test/event-edit-reschedule.e2e-spec.ts`.  
**Where**: `apps/api/test/`  
**Depends on**: T-EDIT-01  
**Requirement**: EVENT-EDIT-01–12

**Done when**:

- [x] Admin title edit — 200 with updated title; `voidedAssignmentCount: 0`
- [x] Leader edits own Private event title — 200
- [x] Leader attempts Public event edit — 403 `LEADER_CANNOT_EDIT_PUBLIC_EVENT`
- [x] Reschedule narrows window — orphaned assignment voided; `voidedAssignmentCount: 1`
- [x] Reschedule keeps assignments in window — `voidedAssignmentCount: 0`; assignments intact
- [x] Cancelled event edit — 400 `EVENT_ALREADY_CANCELLED`
- [x] Empty body — 400 `EVENT_EDIT_EMPTY`
- [x] `startsAtUtc >= endsAtUtc` — 400 `INVALID_EVENT_WINDOW`

**Tests**: API Jest e2e (co-located)  
**Gate**: `export DATABASE_URL=... && pnpm test` (api — event-edit spec green)

**Verify**: `pnpm test` includes green `event-edit-reschedule.e2e-spec.ts`; orphan void and no-void cases both pass.

---

### T-EDIT-03: Web client — `editEvent` helper

**What**: Add `apps/web/src/events/editEvent.ts`.  
**Where**: `apps/web/src/events/`  
**Depends on**: T-EDIT-01  
**Requirement**: EVENT-EDIT-13

**Done when**:

- [x] `editEvent({ eventId, title?, startsAtUtc?, endsAtUtc?, actingVolunteerId })` calls `PATCH /events/:id`
- [x] Returns `{ id, title, window, voidedAssignmentCount }`
- [x] Throws `ApiRequestError` on non-2xx (matching existing helper pattern)

**Gate**: `pnpm --filter @onda/web exec tsc --noEmit`

---

### T-EDIT-04: Web UI — event edit section on detail page

**What**: Add edit section to `SchedulingEventDetailView` with title/window inputs; wire `editEvent`; show voided-count toast; i18n strings.  
**Where**: `apps/web/src/routes/schedulingEventDetail.tsx`, `apps/web/src/i18n/locales/`  
**Depends on**: T-EDIT-03  
**Requirement**: EVENT-EDIT-13–16

**Done when**:

- [x] Edit section visible for accredited Admin and eligible Leader; hidden for others and for cancelled events
- [x] Form pre-fills title, `startsAtUtc`, `endsAtUtc` from loaded event data
- [x] Submit calls `editEvent`; `router.invalidate()` on success
- [x] `voidedAssignmentCount > 0` → warning toast with count; `0` → success toast
- [x] Error codes mapped to user-readable messages in both locales
- [x] `en` + `pt-BR` i18n strings for edit section labels, confirm, and voided-count notice

**Gate**: web typecheck

**Verify**: Admin account on Private event detail sees edit section; title update reflects immediately after save; reschedule with orphan shows warning toast.

---

### T-EDIT-05: Web behavior tests

**What**: Extend `apps/web/src/routes/schedulingEventDetail.behavior.test.tsx` with edit section cases.  
**Where**: `apps/web/src/routes/schedulingEventDetail.behavior.test.tsx`  
**Depends on**: T-EDIT-04  
**Requirement**: EVENT-EDIT-13–16

**Done when**:

- [x] Edit section not rendered for non-editor role
- [x] Edit section rendered for admin; form pre-filled
- [x] Submit dispatches `editEvent` with correct payload
- [x] `voidedAssignmentCount: 2` response triggers warning toast with count
- [x] Cancelled event — edit section absent
- [x] Error response surfaces error message in form

**Gate**: `pnpm --filter @onda/web test`

**Verify**: `pnpm --filter @onda/web test` passes all new `schedulingEventDetail` behavior cases.
