# Volunteer Discovery & Onboarding Invite — Design

**Spec**: `.specs/archive/features/volunteer-onboarding-invite/spec.md`  
**Status**: Design approved — all assumptions locked 2026-06-06 (user-confirmed). Ready for Execute.  
**Requirements**: ONBOARD-01–15

---

## Architecture Overview

Two independent sub-flows compose this feature:

```
Sub-flow A: Invite (net-new person)
  Leader → /volunteers UI → POST /ministries/:id/invites
    → Supabase invite email sent
    → VolunteerInvite row created
  → Person clicks email link → Supabase sign-in
    → JWT validation hook → VolunteerInvite lookup
    → Volunteer record created (if new)
    → Ministry membership PENDING created
    → Volunteer sees acceptance screen

Sub-flow B: Search (existing person)
  Leader → /volunteers UI → GET /churches/:churchId/volunteers/search?q=…&ministryId=…
    → Volunteer selector populated
  → Leader selects → existing addMinistryMembership flow unchanged
```

---

## Data Model

### New model: `VolunteerInvite`

```prisma
model VolunteerInvite {
  id                  String              @id @default(cuid())
  ministryId          String
  ministry            Ministry            @relation(...)
  email               String
  invitedByVolunteerId String
  invitedBy           Volunteer           @relation(...)
  sentAtUtc           DateTime            @db.Timestamptz
  acceptedAtUtc       DateTime?           @db.Timestamptz
  expiresAtUtc        DateTime            @db.Timestamptz   // sentAt + 7 days (ONBOARD-A3, locked)
  status              VolunteerInviteStatus @default(PENDING)

  @@unique([ministryId, email])  // no duplicate pending invite per ministry+email
}

enum VolunteerInviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
}
```

**Migration**: new model; no changes to existing tables.

**Bounded context**: Organization module (`apps/api/src/organization/`) — same home as MinistryMembership. Decision locked 2026-06-06 (ONBOARD-A4, user-confirmed).

---

## API Design

### A1: Send volunteer invite

`POST /ministries/:ministryId/invites`

**Auth**: `assertLeaderCanActOnMinistry(ministryId)` OR `assertAdminAccreditedForChurch(ministry.churchId)`  
**Body**: `{ email: string }`  
**Guard**: `assertMinistryAcceptsWrites(ministryId)` — archived ministries cannot accept new invites

**Service**: `OrganizationService.sendVolunteerInvite`:

1. Load ministry (404 if missing); `assertMinistryAcceptsWrites`.
2. Auth check (leader or admin).
3. Normalize email (lowercase trim).
4. Check if email matches existing Volunteer:
   - If match: return `{ existingVolunteerId, displayName }` with HTTP `200` + code `VOLUNTEER_ALREADY_EXISTS` so caller can route to direct add.
5. Check for existing `VolunteerInvite` for same `(ministryId, email)`:
   - If status `PENDING` and **not expired**: this is a resend — reset `sentAtUtc = now`, `expiresAtUtc = now + 7d`, re-call Supabase invite. Return updated row (no error). Decision locked 2026-06-06 (ONBOARD-A3).
   - If status `EXPIRED`: treat as new invite (step 6).
6. Call Supabase Admin SDK `inviteUserByEmail(email)` (reuse pattern from AdminInvite in system-admin-platform, ONBOARD-A1).
7. Upsert `VolunteerInvite` row with `sentAtUtc = now`, `expiresAtUtc = now + 7d`, `status = PENDING`.
8. Return `{ id, email, sentAtUtc, expiresAtUtc }`.

**Error codes**: `MINISTRY_ARCHIVED` (400), `ADMIN_NOT_ACCREDITED` / `LEADER_NOT_ASSIGNED` (403), `VOLUNTEER_ALREADY_EXISTS` (200 with payload). Note: `INVITE_ALREADY_SENT` is no longer an error — resend before expiry is allowed (ONBOARD-A3).

---

### A2: List pending invites for a ministry

`GET /ministries/:ministryId/invites`

**Auth**: leader or admin (same guard as above)  
**Response**: `{ invites: Array<{ id, email, sentAtUtc, expiresAtUtc, status }> }`

---

### B1: Volunteer search

`GET /churches/:churchId/volunteers/search?q=<query>&ministryId=<id>`

**Auth**: `assertLeaderCanActOnMinistry(ministryId)` OR `assertAdminAccreditedForChurch(churchId)`  
**Query**: `q` — min 2 chars; `ministryId` — optional, used to exclude existing members  
**Implementation**: `prisma.volunteer.findMany` with `ILIKE` on `displayName` and `email`; joined via Ministry memberships for the Church scope; limit 20.  
**Exclude**: Volunteers with `ACTIVE` or `PENDING` membership in the requested `ministryId` (when provided).  
**Response**: `{ volunteers: Array<{ id, displayName, email }> }` (no private PII beyond display name + email — both already accessible to Leaders).

**Decision (ONBOARD-A2, locked 2026-06-06)**: Leaders can read volunteer display names and emails within their accredited Church scope. Church-scoped search is sufficient for v1.

---

### A3: Invite fulfillment on sign-in

**Where**: JWT validation / auth context resolution in `apps/api/src/identity/` — extends existing `AdminInvite` fulfillment pattern.

**Logic** (runs once per sign-in when a new Volunteer record is being created):

1. After Supabase user verified, check `VolunteerInvite` where `email = user.email` AND `status = PENDING` AND `expiresAtUtc > now`.
2. For each match:
   - Create `MinistryMembership { ministryId, volunteerId: newVolunteer.id, status: PENDING }` (only if ministry not archived).
   - Update `VolunteerInvite.status = ACCEPTED`, `acceptedAtUtc = now`.
3. If ministry is archived at fulfillment time: mark invite as `EXPIRED` instead of creating membership.
4. Return matching invites in the auth context so the web shell can show the acceptance screen.

**Decision (ONBOARD-A5, locked 2026-06-06)**: All matching invites fulfilled simultaneously on sign-in. No selection screen. Each fulfilled invite creates a `MinistryMembership` with `status: PENDING`.

---

## Web Design

### `/volunteers` page changes

**Search field** (replaces raw `volunteerId` text input):

- Debounced (300ms) `GET /churches/:churchId/volunteers/search?q=…&ministryId=…` as user types ≥2 chars.
- Dropdown shows results: `{displayName} · {email}`.
- On select: pre-fills an internal state `{ volunteerId, displayName }`.
- On submit: calls existing `addMinistryMembership`.

**Invite by email** (new section below search):

- Shown when the search either finds no results or the user explicitly clicks "Can't find them? Invite by email".
- Email input + submit → `POST /ministries/:ministryId/invites`.
- On `VOLUNTEER_ALREADY_EXISTS` response: auto-populate the search field with the returned volunteer and prompt Leader to use the normal add flow.
- On success: show pending invite in the invite list.

**Invite list** (new section for leaders):

- `GET /ministries/:ministryId/invites` → display pending and accepted invites per ministry.
- Shows email, sent date, status badge, expiry date (if PENDING).

### Invite acceptance screen

After first sign-in, if auth context returns fulfilled invites:

- Show a toast or inline banner: "You've been added to {Ministry name} as a pending member."
- Link to `/volunteers` or a new `/welcome` route — toast is sufficient; no dedicated route needed for v1.

---

## Testing Strategy

| Layer | File | Covers |
|-------|------|--------|
| API e2e | `apps/api/test/volunteer-invite.e2e-spec.ts` | Invite sent; duplicate invite rejected; existing volunteer detected; search with/without filters; fulfillment on sign-in (mocked Supabase) |
| Web behavior | `apps/web/src/routes/volunteers.behavior.test.tsx` (extend) | Search field debounce; result selection pre-fills form; invite form; pending invite list |

Gate: `pnpm test` (API + web Vitest).

