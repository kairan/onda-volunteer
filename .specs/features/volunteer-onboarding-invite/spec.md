# Volunteer Discovery & Onboarding Invite — Specification

## Status

- **All requirements**: Specified. Design phase complete. All assumptions locked 2026-06-06 (user-confirmed). Ready for Execute.

## Source references

- Domain glossary: `CONTEXT.md` (**Volunteer**, **Ministry membership**, **Pending**, **Active**, **Identity**, **Leader**, **Admin**)
- Platform PRD: `docs/prd/volunteer-management-platform.md` (stories 5, 6 — volunteer onboarding)
- System Admin invite pattern: `.specs/features/system-admin-platform/spec.md` (SYSADM-07: Admin invite-by-email via Supabase)
- Current volunteers page: `apps/web/src/routes/volunteers.tsx` (volunteers added by raw `volunteerId` text input)
- Supabase auth model: `docs/runbooks/api-auth-context.md`
- ADR 0001 (pessimistic mutation posture)
- Shipped adjacent: membership lifecycle (`done/46-admin-manages-ministry-membership-lifecycle.md`), leader delegation (`done/47-admin-delegates-leaders-across-churches.md`)

## Problem Statement

The current volunteer roster management page (`/volunteers`) lets Leaders and Admins add members to a Ministry by typing a raw `volunteerId` string. This requires the volunteer to already have a Supabase account and for the Leader to know their internal ID — a workflow that is impractical for real church operations.

Two gaps exist:

1. **Discovery gap**: No way to look up existing **Volunteers** by name or email. Leaders must know the `volunteerId` out of band.
2. **Onboarding gap**: If a person does not yet have an account, there is no way for a Leader or Admin to invite them into the system. New **Volunteers** currently require **System Admin** provisioning or direct database seeding.

This feature closes both gaps with:
- An **email invite** flow for net-new people (sends Supabase invite; on sign-in, volunteer is prompted to accept pending ministry membership).
- A **volunteer search** flow for existing users (lookup by name/email within the Church's accessible volunteer pool).

## Goals

- [ ] Leader can invite a person to join their **Ministry** by email; if the person has no account, they receive a Supabase invite link.
- [ ] Leader can search existing **Volunteers** in their accessible scope (church) by display name or email, then add them to a Ministry with Pending or Active status — replacing the raw `volunteerId` input.
- [ ] On first sign-in after receiving an invite, the new **Volunteer** is shown a pending ministry membership and can accept it (or an Admin confirms the transition to Active).
- [ ] Existing `volunteerId` raw input on the volunteers page is replaced or augmented with search/invite UX.
- [ ] Existing add-membership API contract (`POST /ministries/:ministryId/members`) remains unchanged; invite flow is additive.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Household / non-sign-in volunteers | Explicitly deferred in CONTEXT.md |
| Bulk CSV import | Not in Platform PRD v1 |
| Volunteer profile editing by Leader | Leader manages membership status, not volunteer identity data |
| Removing a Supabase user account | System Admin responsibility; out of leader scope |
| Push notification or SMS invite | Platform PRD production-hardening item — defer |

---

## User Stories

### Story 1: Leader invites a net-new person by email

**User Story**: As a **Leader**, I want to invite someone by email to join my **Ministry**, so that a new person can create an Onda account and appear on my ministry roster without requiring **System Admin** or database access.

**Acceptance Criteria**:

1. WHEN a **Leader** enters a valid email on the invite form THEN the system SHALL check whether a **Volunteer** with that email already exists.
   - If the email matches an existing **Volunteer**: flow transitions to Story 2 (direct add by search result, skipping Supabase invite).
   - If no match: a Supabase invite email is sent; a **VolunteerInvite** record is created with `{ ministryId, email, status: PENDING }`.
2. WHEN the invite email is sent THEN the system SHALL NOT create a **Volunteer** record or **Ministry membership** row yet (deferred until sign-in).
3. WHEN the invited person clicks the invite link and signs in for the first time THEN the system SHALL:
   - Create their **Volunteer** record (linked to the new Supabase user).
   - Create a **Ministry membership** row with `status: PENDING` for the invited **Ministry**.
   - Show the volunteer a "You've been invited to {Ministry name}" confirmation screen.
4. WHEN a **Leader** views the invite list THEN pending invites for their **Ministry** SHALL be visible with email and status (`PENDING` / `ACCEPTED`).
5. WHEN a **Leader** or **Admin** activates the pending membership THEN the membership transitions from `PENDING` to `ACTIVE` per the existing membership lifecycle.
6. WHEN an invite is sent to an already-invited email for the same **Ministry** with a PENDING non-expired invite THEN the system SHALL **resend** (reset TTL, re-dispatch Supabase invite) rather than reject. A single active invite per `(ministryId, email)` is maintained. (Decision ONBOARD-A3, locked 2026-06-06.)
7. WHEN the invited person's email domain does not match any whitelisting rule THEN the system SHALL send the invite anyway (no email domain restriction in v1).

### Story 2: Leader searches existing Volunteers to add to a Ministry

**User Story**: As a **Leader**, I want to search for existing **Volunteers** by name or email within my accessible scope, so that I can add them to my **Ministry** without knowing their internal ID.

**Acceptance Criteria**:

8. WHEN a **Leader** types ≥2 characters in the volunteer search field THEN the system SHALL return matching **Volunteers** (by display name prefix or email prefix) within the **Church** scope the **Leader** is operating in.
9. WHEN a **Leader** selects a search result THEN the system SHALL pre-fill the add-membership form with the `volunteerId` and display name.
10. WHEN the **Leader** submits THEN the system SHALL call the existing `addMinistryMembership` API with the selected `volunteerId`.
11. WHEN the **Leader** performs a search THEN the results SHALL NOT include **Volunteers** who already have an `ACTIVE` or `PENDING` membership in the selected **Ministry**.
12. WHEN no results are found THEN the system SHALL offer the "Invite by email" path (Story 1).

### Story 3: Volunteers page raw-ID input replaced

**User Story**: As a **Leader**, I want the raw `volunteerId` text input on `/volunteers` replaced with the search/invite flow, so that I do not need out-of-band knowledge of internal IDs to add members.

**Acceptance Criteria**:

13. WHEN the production search/invite UI ships THEN the raw `volunteerId` text input on `VolunteersPage` SHALL be replaced with the search field and invite option.
14. WHEN the search/invite UI is unavailable (e.g. API down) THEN a clear error SHALL be surfaced; no silent fallback to raw ID input.

---

## Edge Cases

- If a **VolunteerInvite** record exists but the person never signs in, the invite should not block a fresh re-invite after a configurable TTL. TTL is **7 days** (ONBOARD-A3, locked 2026-06-06). Leaders may also resend before expiry — resend resets `sentAtUtc` and `expiresAtUtc`, replacing any existing PENDING record for the same `(ministryId, email)` pair.
- If a **Leader**'s Ministry is archived before the invited person signs in, the on-sign-in membership creation should be blocked; the invite acceptance page should explain the ministry is no longer active.
- A single email address cannot have two pending invites for the same **Ministry** simultaneously (`INVITE_ALREADY_SENT`).
- If a **Volunteer** with a matching email exists but has an `INACTIVE` membership in the target **Ministry**, the search flow should allow the Leader to reactivate them directly (not re-invite).

---

## Requirement Traceability

| Requirement ID | Story | Status |
|----------------|-------|--------|
| ONBOARD-01 | S1: Email check — existing vs new volunteer | Specified |
| ONBOARD-02 | S1: Supabase invite sent; VolunteerInvite record created | Specified |
| ONBOARD-03 | S1: No Volunteer/membership row created until sign-in | Specified |
| ONBOARD-04 | S1: On sign-in — Volunteer + Pending membership created | Specified |
| ONBOARD-05 | S1: Volunteer invite acceptance screen | Specified |
| ONBOARD-06 | S1: Pending invite list visible to Leader | Specified |
| ONBOARD-07 | S1: Activate via existing membership lifecycle | Specified |
| ONBOARD-08 | S1: Resend before expiry resets TTL; expired invite treated as new | Specified |
| ONBOARD-09 | S2: Volunteer search ≥2 chars — name/email prefix | Specified |
| ONBOARD-10 | S2: Search result pre-fills add-membership form | Specified |
| ONBOARD-11 | S2: Existing `addMinistryMembership` API called unchanged | Specified |
| ONBOARD-12 | S2: Results exclude already-Active/Pending members | Specified |
| ONBOARD-13 | S2: No results → invite by email path | Specified |
| ONBOARD-14 | S3: Raw volunteerId input replaced by search/invite | Specified |
| ONBOARD-15 | S3: Error shown if API unavailable | Specified |

**Design / Tasks**: `.specs/features/volunteer-onboarding-invite/design.md`, `tasks.md`.

---

## Decisions (locked 2026-06-06, user-confirmed)

**ONBOARD-A1** (confirmed): The invite mechanism reuses the Supabase Admin SDK invite-by-email path already scaffolded in the System Admin platform (`system-admin-platform/spec.md` SYSADM-07, `apps/api/src/identity/`). A new `POST /ministries/:ministryId/invites` endpoint lives in the **Organization** module; the invite-fulfillment hook (on JWT sign-in) is extended to detect and fulfill **VolunteerInvite** records alongside existing **AdminInvite** fulfillment.

**ONBOARD-A2** (confirmed): Leaders can read volunteer display names and emails within their accredited **Church** scope for the search endpoint. Church-scoped search is sufficient. No cross-church search required in v1. Endpoint: `GET /churches/:churchId/volunteers/search?q=<query>&ministryId=<id>` — case-insensitive `ILIKE` on `displayName` and `email`, cap 20 results, no index service.

**ONBOARD-A3** (confirmed): Invite TTL is **7 days**. After TTL, `VolunteerInvite.status` becomes `EXPIRED`; Supabase invite link is also expired by Supabase's own policy. Leaders may **resend before expiry** — resend resets `sentAtUtc` and `expiresAtUtc` on the existing PENDING record, replacing it in place.

**ONBOARD-A4** (confirmed): `VolunteerInvite` model lives in the **Organization** bounded context (`apps/api/src/organization/`), co-located with `MinistryMembership` and `Ministry`. Not in Identity.

**ONBOARD-A5** (confirmed): All pending `VolunteerInvite` records matching the signed-in email are fulfilled simultaneously on first sign-in — no selection screen. Each match creates a `MinistryMembership` with `status: PENDING`. The web shell shows a toast for each fulfilled invite.
