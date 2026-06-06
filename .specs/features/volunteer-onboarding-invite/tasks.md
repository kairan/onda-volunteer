# Volunteer Discovery & Onboarding Invite — Tasks

**Design**: `.specs/features/volunteer-onboarding-invite/design.md`  
**Spec**: `.specs/features/volunteer-onboarding-invite/spec.md`  
**Status**: Ready for Execute — all assumptions locked 2026-06-06 (user-confirmed: ONBOARD-A1 through ONBOARD-A5). See `spec.md` Decisions section.

---

## Execution Plan

```text
T-ONBOARD-01 → T-ONBOARD-02 [P] T-ONBOARD-03 → T-ONBOARD-04 → T-ONBOARD-05 → T-ONBOARD-06 [P] T-ONBOARD-07 → T-ONBOARD-08
```

---

## Task breakdown

### T-ONBOARD-01: Schema — `VolunteerInvite` model

**What**: Add `VolunteerInvite` model + `VolunteerInviteStatus` enum; Prisma migration.  
**Where**: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/`  
**Depends on**: None  
**Requirement**: ONBOARD-02, ONBOARD-08

**Done when**:

- [ ] Migration adds `VolunteerInvite` table with `(ministryId, email)` unique index
- [ ] `VolunteerInviteStatus` enum: PENDING, ACCEPTED, EXPIRED
- [ ] No changes to existing Volunteer or MinistryMembership tables

**Gate**: `pnpm --filter @onda/api exec prisma migrate dev` succeeds; `pnpm --filter @onda/api typecheck`

---

### T-ONBOARD-02: API — invite endpoint (send + list)

**What**: `OrganizationService.sendVolunteerInvite` + `POST /ministries/:id/invites`; `GET /ministries/:id/invites`.  
**Where**: `apps/api/src/organization/`  
**Depends on**: T-ONBOARD-01  
**Requirement**: ONBOARD-01, ONBOARD-02, ONBOARD-03, ONBOARD-06, ONBOARD-08  
**Parallel**: `[P]` with T-ONBOARD-03

**Done when**:

- [ ] Leader/Admin can send invite; Supabase invite dispatched; `VolunteerInvite` row created
- [ ] Email match returns `VOLUNTEER_ALREADY_EXISTS` (200 with payload) instead of invite
- [ ] Duplicate pending invite (same ministry+email, not expired) resends Supabase invite and resets `sentAtUtc`/`expiresAtUtc` (200)
- [ ] Archived ministry returns `MINISTRY_ARCHIVED` (400)
- [ ] `GET /ministries/:id/invites` returns pending/accepted invites for the ministry

**Tests**: none (covered in T-ONBOARD-05)  
**Gate**: `pnpm --filter @onda/api typecheck`

---

### T-ONBOARD-03: API — volunteer search endpoint

**What**: `GET /churches/:churchId/volunteers/search?q=&ministryId=` — ILIKE search scoped to Church, excludes existing Active/Pending members.  
**Where**: `apps/api/src/organization/` (add to `OrganizationController` or new `VolunteersController`)  
**Depends on**: T-ONBOARD-01  
**Requirement**: ONBOARD-09, ONBOARD-11, ONBOARD-12  
**Parallel**: `[P]` with T-ONBOARD-02

**Done when**:

- [ ] `q` ≥2 chars required; returns ≤20 results; case-insensitive match on displayName and email
- [ ] Results exclude Volunteers with ACTIVE or PENDING membership in provided `ministryId`
- [ ] Leader auth scoped to their Church; Admin auth scoped to accredited Church

**Tests**: none (covered in T-ONBOARD-05)  
**Gate**: `pnpm --filter @onda/api typecheck`

---

### T-ONBOARD-04: API — invite fulfillment on sign-in

**What**: Extend JWT/auth resolution to detect pending `VolunteerInvite` for the sign-in email; create Volunteer + Pending membership on first sign-in.  
**Where**: `apps/api/src/identity/` — extend existing AdminInvite fulfillment pattern  
**Depends on**: T-ONBOARD-02  
**Requirement**: ONBOARD-04, ONBOARD-05

**Done when**:

- [ ] On first sign-in, `VolunteerInvite` rows matching email fulfilled: Volunteer record created, Pending memberships created
- [ ] Archived ministry at fulfillment time: invite marked EXPIRED, no membership created
- [ ] Fulfilled invites returned in auth context for web acceptance screen

**Tests**: none (covered in T-ONBOARD-05)  
**Gate**: `pnpm --filter @onda/api typecheck`

---

### T-ONBOARD-05: API e2e — invite flow

**What**: `apps/api/test/volunteer-invite.e2e-spec.ts` covering invite, search, and fulfillment.  
**Where**: `apps/api/test/`  
**Depends on**: T-ONBOARD-02, T-ONBOARD-03, T-ONBOARD-04  
**Requirement**: ONBOARD-01 through ONBOARD-13

**Done when**:

- [ ] Invite sent to new email → `VolunteerInvite` row created; Supabase call mocked
- [ ] Resend to same ministry+email before expiry → resets TTL, re-dispatches Supabase invite (no error)
- [ ] Email matches existing Volunteer → `VOLUNTEER_ALREADY_EXISTS` with payload
- [ ] Search returns matching volunteers excluding already-members
- [ ] Fulfillment on sign-in creates Pending membership; archived ministry produces EXPIRED invite

**Gate**: `export DATABASE_URL=... && pnpm test` (api — volunteer-invite spec green)

---

### T-ONBOARD-06: Web client — invite + search helpers

**What**: Add `sendVolunteerInvite.ts`, `listVolunteerInvites.ts`, `searchVolunteers.ts` in `apps/web/src/organization/`.  
**Where**: `apps/web/src/organization/`  
**Depends on**: T-ONBOARD-02, T-ONBOARD-03  
**Requirement**: ONBOARD-09, ONBOARD-10, ONBOARD-14  
**Parallel**: `[P]` with T-ONBOARD-07

**Done when**:

- [ ] `searchVolunteers` debounced fetch wrapping `GET /churches/:id/volunteers/search`
- [ ] `sendVolunteerInvite` calls `POST /ministries/:id/invites`; handles `VOLUNTEER_ALREADY_EXISTS`
- [ ] `listVolunteerInvites` calls `GET /ministries/:id/invites`

**Gate**: `pnpm --filter @onda/web exec tsc --noEmit`

---

### T-ONBOARD-07: Web UI — `/volunteers` search + invite

**What**: Replace raw `volunteerId` input on `VolunteersPage` with search field + invite section + invite list.  
**Where**: `apps/web/src/routes/volunteers.tsx`  
**Depends on**: T-ONBOARD-06  
**Requirement**: ONBOARD-10, ONBOARD-13, ONBOARD-14, ONBOARD-15  
**Parallel**: `[P]` with T-ONBOARD-06 (i18n)

**Done when**:

- [ ] Search field (≥2 chars) shows volunteer dropdown; selection pre-fills add-membership
- [ ] "Can't find them? Invite by email" section with email input
- [ ] `VOLUNTEER_ALREADY_EXISTS` response auto-populates search field
- [ ] Pending invite list visible per selected ministry
- [ ] No raw `volunteerId` input visible in normal flow
- [ ] Error state shown when API unavailable

**Gate**: web typecheck

---

### T-ONBOARD-08: Web behavior tests + i18n

**What**: Extend `volunteers.behavior.test.tsx`; add `en`/`pt-BR` strings for search/invite UI.  
**Where**: `apps/web/src/routes/volunteers.behavior.test.tsx`, `apps/web/src/i18n/locales/`  
**Depends on**: T-ONBOARD-07  
**Requirement**: ONBOARD-09, ONBOARD-14, ONBOARD-15

**Done when**:

- [ ] Search field debounce test (mock API returns results)
- [ ] Result selection pre-fills form; submit calls `addMinistryMembership`
- [ ] No-results state shows invite by email option
- [ ] Invite form submit calls `sendVolunteerInvite`; success shows invite in list
- [ ] i18n strings for search/invite in both locales

**Gate**: `pnpm --filter @onda/web test`
