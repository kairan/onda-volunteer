# Event Edit / Reschedule — Design

**Spec**: `.specs/features/event-edit-reschedule/spec.md`  
**Status**: Design approved — all assumptions locked 2026-06-06 (user-confirmed). Ready for Execute.  
**Requirements**: EVENT-EDIT-01–16

---

## Architecture Overview

```mermaid
sequenceDiagram
  participant User as Admin / Leader
  participant Web as SchedulingEventDetailView
  participant API as PATCH /events/:id
  participant Svc as EventsService
  participant DB as Prisma

  User->>Web: Click Edit; update title/times; submit
  Web->>API: PATCH { title?, startsAtUtc?, endsAtUtc? }
  API->>Svc: editEvent({ eventId, title?, startsAtUtc?, endsAtUtc?, auth })
  Svc->>DB: Load event; auth checks; validate window
  alt reschedule — orphaned assignments
    Svc->>DB: findMany assignments outside new window
    Svc->>DB: update assignments set voidedAtUtc=now (transaction)
  end
  Svc->>DB: update event title / window
  Svc-->>Web: 200 { event DTO, voidedAssignmentCount }
  Web->>Web: router.invalidate() → roster + event header refresh
```

---

## Code Reuse Analysis

| Component | Location | How to reuse |
|-----------|----------|-------------|
| Auth: `assertAdminAccreditedForChurch` | `AuthenticatedRequestContext` | Admin guard for public + private events |
| Auth: `assertLeaderCanActOnMinistry` | `AuthenticatedRequestContext` | Leader guard for private events only |
| UTC parsing: `parseInstantOrThrow` | `apps/api/src/scheduling/scheduling-rules.ts` | Validate and parse `startsAtUtc`, `endsAtUtc` |
| `cancelEvent` void pattern | `apps/api/src/events/events.service.ts` | Mirror assignment void loop (find non-voided assignments; set `voidedAtUtc`) |
| `DestructiveConfirmDialog` | `apps/web/src/components/DestructiveConfirmDialog.tsx` | Reschedule confirm when assignments may be voided |
| `router.invalidate()` | TanStack Router | Refresh event data and roster after edit |
| `useToasts` | `apps/web/src/feedback/ToastHost.tsx` | Success toast with voided count |

---

## API Design

### Endpoint: Edit event

`PATCH /events/:id`

**Body** (at least one field required; all optional individually):

```json
{
  "title": "Sunday Service – updated",
  "startsAtUtc": "2026-06-15T14:00:00.000Z",
  "endsAtUtc": "2026-06-15T17:00:00.000Z"
}
```

**Response** `200`:

```json
{
  "id": "cuid",
  "title": "Sunday Service – updated",
  "kind": "PRIVATE",
  "window": {
    "startsAtUtc": "2026-06-15T14:00:00.000Z",
    "endsAtUtc": "2026-06-15T17:00:00.000Z"
  },
  "cancelledAtUtc": null,
  "voidedAssignmentCount": 2
}
```

**Error codes**:

| Code | HTTP | When |
|------|------|------|
| `EVENT_NOT_FOUND` | 404 | Event ID not found |
| `EVENT_ALREADY_CANCELLED` | 400 | Event is cancelled |
| `EVENT_EDIT_EMPTY` | 400 | No fields provided (title, startsAtUtc, endsAtUtc all absent) |
| `EVENT_TITLE_REQUIRED` | 400 | `title` provided but empty after trim |
| `EVENT_TITLE_TOO_LONG` | 400 | `title` exceeds 200 characters |
| `INVALID_EVENT_WINDOW` | 400 | `startsAtUtc >= endsAtUtc` after parse |
| `LEADER_CANNOT_EDIT_PUBLIC_EVENT` | 403 | Leader attempts to edit a Public event |
| `ADMIN_NOT_ACCREDITED` | 403 | Admin not accredited for the event's Church |

**Service**: `EventsService.editEvent(input: { eventId, title?, startsAtUtc?, endsAtUtc?, auth })`:

1. Load event with `ministryId`, `churchId`, `cancelledAtUtc`; 404 if missing.
2. If `cancelledAtUtc` set → throw `EVENT_ALREADY_CANCELLED`.
3. Validate at least one field provided → throw `EVENT_EDIT_EMPTY`.
4. **Auth check**:
   - If event is `PUBLIC`: `auth.assertAdminAccreditedForChurch(event.churchId)`.
   - If event is `PRIVATE` and caller is Admin: `auth.assertAdminAccreditedForChurch(event.ministry.churchId)`.
   - If event is `PRIVATE` and caller is Leader: `auth.assertLeaderCanActOnMinistry(event.ministryId)`. If this fails, check Admin — if Admin check also fails, return `LEADER_CANNOT_EDIT_PUBLIC_EVENT` for Public or re-throw ForbiddenException for Private.
5. Validate `title` (trim, non-empty, ≤200 chars) if provided.
6. Validate time window if `startsAtUtc` or `endsAtUtc` provided: parse both via `parseInstantOrThrow`; assert `start < end`.
7. **Orphan check** (only when at least one time boundary changes from stored values):
   - Find non-voided **Assignments** for this event where `assignment.startsAtUtc < newStart OR assignment.endsAtUtc > newEnd`.
   - In a transaction: void orphaned assignments; update event title/window.
8. Return updated event DTO with `voidedAssignmentCount`.

**Controller**: add to `EventsController`:

```typescript
@Patch(':id')
editEvent(
  @Param('id') id: string,
  @Body() body: { title?: string; startsAtUtc?: string; endsAtUtc?: string },
  @AuthContext() auth: AuthenticatedRequestContext,
) {
  return this.events.editEvent({ eventId: id, ...body, auth });
}
```

**Note**: System Admin scheduling access is read-only (locked decision 2026-05-31, see STATE.md). Add `assertSchedulingWriteAllowed` call at the start of `editEvent`, consistent with the `voidAssignment` pattern.

---

## Web Design

### Edit form placement

On the event detail page (`SchedulingEventDetailView`), below the event header and above the roster:

- An **"Edit event"** section, visible only to accredited **Admin** (any event) or eligible **Leader** (Private event for their ministry).
- Collapsed by default (toggle or "Edit" button); expands to inline form.
- Fields: title (text input, pre-filled), start datetime (text input, pre-filled UTC), end datetime (text input, pre-filled UTC) — consistent with existing UTC input style.
- "Save changes" button; on success: toast with updated title or "Rescheduled — N assignments voided".
- No routing change required; `router.invalidate()` refreshes the loader.

### Reschedule with voided assignments

When `voidedAssignmentCount > 0`:

- Show a **warning toast** or inline notice: "Event rescheduled. {N} assignment(s) were voided because they fell outside the new window. Please review and re-roster."
- Toast kind: `warning` if voidedCount > 0, else `success`.

### Edit form not shown for cancelled events

The existing `isCancelled` check already controls some UI; extend to hide the edit section as well.

---

## Client Module

**New file**: `apps/web/src/events/editEvent.ts`

```typescript
export async function editEvent(input: {
  eventId: string;
  title?: string;
  startsAtUtc?: string;
  endsAtUtc?: string;
  actingVolunteerId: string;
}): Promise<{
  id: string;
  title: string;
  window: { startsAtUtc: string; endsAtUtc: string };
  voidedAssignmentCount: number;
}>;
```

---

## Testing Strategy

| Layer | File | Covers |
|-------|------|--------|
| API e2e | `apps/api/test/event-edit-reschedule.e2e-spec.ts` | Admin title edit; leader edits own private event; leader cannot edit public event; cancelled event rejected; reschedule voids orphaned assignments; reschedule with no orphans returns count=0; window validation errors |
| Web behavior | `apps/web/src/routes/schedulingEventDetail.behavior.test.tsx` (extend) | Edit section visible for admin/leader; hidden for non-editor; submit patches event; voided count in toast; cancelled event hides edit |

Gate: `pnpm test` (API + web Vitest).

---

## Requirement Mapping

| ID | Design section |
|----|----------------|
| EVENT-EDIT-01, 02 | Auth: Admin / Leader check based on event kind |
| EVENT-EDIT-03, 11 | `LEADER_CANNOT_EDIT_PUBLIC_EVENT` error |
| EVENT-EDIT-04 | Title validation (trim, non-empty, ≤200 chars) |
| EVENT-EDIT-05 | Title-only: no assignment void loop runs |
| EVENT-EDIT-06 | Valid window — event updated |
| EVENT-EDIT-07 | `INVALID_EVENT_WINDOW` |
| EVENT-EDIT-08 | Orphan void loop in transaction |
| EVENT-EDIT-09 | Orphan loop returns 0 when all fit |
| EVENT-EDIT-10 | `voidedAssignmentCount` in response |
| EVENT-EDIT-12 | `EVENT_ALREADY_CANCELLED` |
| EVENT-EDIT-13, 14 | Web: edit section, inline form, `router.invalidate()` |
| EVENT-EDIT-15 | Warning toast with voided count |
| EVENT-EDIT-16 | Error mapping on edit form |
