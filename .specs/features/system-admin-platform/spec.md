# System Admin Platform Specification

## Status

**Tasks** — Specify and Design complete (2026-05-31). Ready for Execute. See `design.md`, `tasks.md`, and [`parallel-execution.md`](parallel-execution.md) (GitHub chains [#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93)).

## Source references

- Decision log: [`.specs/project/STATE.md`](../../project/STATE.md)
- Adjacent org slices: [organization-structure-administration](../organization-structure-administration/spec.md) (P1 ministry structure; P2 campus/ministry archive)
- Domain glossary: [`CONTEXT.md`](../../../CONTEXT.md) — **System Admin** (ADR [0005](../../../docs/adr/0005-system-admin-operator-role.md))
- Identity: Supabase JWT + **Volunteer** linking (`apps/api/src/identity/`)
- Platform PRD: `docs/prd/volunteer-management-platform.md` (update out-of-scope note for operator role)

## Problem Statement

New **Churches** and their first **Admin** users are provisioned via Prisma seed and runbooks. There is no in-product path for platform operators to onboard churches, invite church **Admins**, or manage users across the network. Church-scoped **Admin** flows assume structure and accreditation already exist.

## Goals

- [ ] **System Admin** accounts exist (many allowed); initial grant via **seed** only (no in-app bootstrap of the first System Admin).
- [ ] **System Admin** dashboard (separate from volunteer/leader shell) to create **Churches** and manage users.
- [ ] **System Admin** invites a new church **Admin** by email (Supabase invite); on accept, user links to **Volunteer** + church **Admin** accreditation.
- [ ] **System Admin** has **read-only** access to scheduling data (support visibility; no roster/assignment mutations).
- [ ] Church-scoped **Admin** may edit their accredited **Church** name and default timezone (separate slice — see Related work).

## Out of Scope

| Feature | Reason |
|---------|--------|
| In-app promotion to first **System Admin** | Bootstrap via seed/env only |
| **System Admin** mutating **Assignments**, **Events**, or **Unavailability** | Read-only scheduling support |
| Impersonation / “act as user” | Not requested |
| Bulk CSV import, billing, white-label | Platform PRD deferred |
| Network-wide multi-church **Public events** | Still deferred per `CONTEXT.md` |

---

## Product decisions (Specify)

| Question | Decision |
|----------|----------|
| One vs many **System Admin**? | **Many**; membership in a seed-defined allowlist (or `SystemAdmin` table populated by seed/migration) |
| First **System Admin** bootstrap | **Seed only** — no self-service elevation in v1 |
| User creation for church **Admin** | **System Admin** sends **invite email** (Supabase); invite creates/links auth; accreditation applied on successful provisioning |
| **System Admin** vs scheduling | **Read-only** — list/detail views for support; no create/update/delete on scheduling writes |
| Church **Admin** edits **Church** name/timezone? | **Yes** — church-scoped **Admin** self-service (not System Admin–exclusive); implement as related slice |

---

## User Stories

### P1: System Admin identity and dashboard shell

**User Story**: As a **System Admin**, I want to sign in and reach a dedicated operator dashboard, so that platform tasks are separated from volunteer and church **Admin** workflows.

**Acceptance Criteria**:

1. WHEN a signed-in user is not a **System Admin** THEN System Admin routes and APIs SHALL return stable authorization errors.
2. WHEN a user is granted **System Admin** via seed THEN they SHALL access the System Admin dashboard after normal Supabase sign-in.
3. WHEN a **Volunteer** without System Admin opens System Admin URLs THEN the app SHALL redirect or deny without exposing operator actions.

**Independent Test**: Seed two users (one System Admin, one not); verify route/API guard behavior.

---

### P2: System Admin creates Churches

**User Story**: As a **System Admin**, I want to create a **Church** with required bootstrap structure, so that onboarding does not require database access.

**Acceptance Criteria**:

1. WHEN a **System Admin** creates a **Church** THEN the system SHALL persist the **Church** and minimum structure (at least one **Campus**, default IANA timezone per product rules).
2. WHEN create validation fails (empty name, invalid timezone) THEN the system SHALL return field-level errors.
3. WHEN the **Church** exists THEN existing organization context reads SHALL include it for appropriately accredited users (no seed script).

**Independent Test**: System Admin creates a church; church appears in organization context API for a subsequently accredited **Admin**.

---

### P3: System Admin invites church Admin by email

**User Story**: As a **System Admin**, I want to invite a person by email to become an **Admin** for a specific **Church**, so that the first church operator can sign in without manual `authSubjectId` linking.

**Acceptance Criteria**:

1. WHEN a **System Admin** submits an invite for `(email, churchId)` THEN the system SHALL trigger Supabase invite (or equivalent documented invite API) and record pending provisioning state.
2. WHEN the invitee completes sign-up / first sign-in THEN the system SHALL link **Identity** to a **Volunteer** profile and grant **Admin** accreditation for that **Church** (idempotent if invite retried).
3. WHEN invite fails (invalid email, Supabase error) THEN the system SHALL surface a stable, actionable error without partial accreditation.
4. WHEN the new **Admin** signs in THEN they SHALL use the existing church **Admin** shell (not the System Admin dashboard) for day-to-day work.

**Independent Test**: System Admin invites test email → accept invite → `GET /identity/me` + organization context shows accreditation for target **Church**.

---

### P4: System Admin user and role stewardship

**User Story**: As a **System Admin**, I want to find users and adjust their **Organization** grants, so that support can fix accreditation, **Leader** assignments, and **Ministry** membership without SQL.

**Acceptance Criteria**:

1. WHEN a **System Admin** searches or lists users THEN results SHALL include linked **Volunteer** identity and summary of church accreditations, leaderships, and memberships.
2. WHEN a **System Admin** grants or revokes church **Admin** accreditation THEN changes SHALL apply only to the named **Church**(s).
3. WHEN a **System Admin** assigns or removes **Leader** for a **Ministry** THEN rules SHALL match existing ministry-scoped delegation semantics (#47).
4. WHEN a **System Admin** adjusts **Ministry** membership THEN lifecycle rules (#46) SHALL apply (e.g. pending/active, voiding future **Assignments** on deactivate).
5. WHEN a non–System Admin attempts these APIs THEN authorization SHALL fail.

**Independent Test**: System Admin grants **Leader** on a ministry; existing leader scheduling path still works; volunteer without grant cannot access leader APIs.

---

### P5: System Admin read-only scheduling support

**User Story**: As a **System Admin**, I want to view **Events** and rosters across churches for support, so that I can diagnose issues without changing schedules.

**Acceptance Criteria**:

1. WHEN a **System Admin** requests scheduling read APIs or dashboard views THEN the system SHALL return data for any **Church** (subject to future pagination/filter UX).
2. WHEN a **System Admin** attempts scheduling **writes** (create **Event**, **Assignment**, release, cancel, etc.) THEN the system SHALL reject with a stable error (e.g. `SYSTEM_ADMIN_READ_ONLY`).
3. WHEN audit/logging is added in Design THEN sensitive reads SHOULD be traceable for operator accountability.

**Independent Test**: System Admin `GET` event roster succeeds; `POST` assign returns read-only error.

---

## Related work (not System Admin dashboard)

### Church Admin: edit Church name and default timezone

**User Story**: As a church-scoped **Admin**, I want to edit my accredited **Church**’s display name and default timezone, so that presentation stays correct without a **System Admin**.

**Acceptance Criteria** (draft):

1. WHEN an accredited **Admin** updates **Church** name THEN organization context labels SHALL refresh; canonical UTC records unchanged.
2. WHEN an accredited **Admin** updates default **Church** timezone THEN UTC instants unchanged; presentation rules align with campus timezone semantics in org-structure P2.
3. WHEN a non-accredited user attempts edit THEN authorization SHALL fail.

**Tracking:** Implement as a separate vertical slice (extend org-structure or `church-admin-metadata`). Not blocked on System Admin P1–P3.

---

## Edge Cases

- WHEN seed has no System Admin rows THEN no operator dashboard access (document seed/runbook).
- WHEN invite email already has a **Volunteer** linked to another church THEN Design SHALL define merge vs new accreditation rules.
- WHEN **System Admin** revokes last **Admin** for a **Church** THEN warn or block per Design (avoid orphan church).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| SYSADM-01 | P1: Identity + dashboard shell | Tasks | T-SYS-01–10 |
| SYSADM-02 | P2: Create Church | Tasks | T-SYS-11–13 |
| SYSADM-03 | P3: Invite church Admin by email | Tasks | T-SYS-14–18 |
| SYSADM-04 | P4: User/role stewardship | Tasks | T-SYS-19–23 |
| SYSADM-05 | P5: Read-only scheduling | Tasks | T-SYS-24–26 |
| CHURCH-META-01 | Church Admin name/timezone edit | Tasks | T-CHURCH-01–03 (parallel) |

---

## Open Questions (Design)

**Resolved in `design.md`:**

1. Supabase **`inviteUserByEmail`** + service role; redirect URLs in runbook (T-SYS-03).
2. **`AdminInvite`** Prisma table for pending state.
3. Paginated volunteer search (`?q=&limit=&cursor=`); PII policy in runbook.
4. P5 **reuses** existing scheduling GET routes with system-admin visibility bypass; writes blocked with `SYSTEM_ADMIN_READ_ONLY`.

---

## Success Criteria

- [ ] New **Church** + first **Admin** can be onboarded without `prisma:seed` for that church.
- [ ] **System Admin** cannot mutate schedules; church **Admin** retains full stewardship within accreditation.
- [x] `CONTEXT.md`, Platform PRD, and ADR document **System Admin** vs church **Admin** boundaries.
