# System Admin Platform Tasks

**Design**: `.specs/features/system-admin-platform/design.md`  
**Spec**: `.specs/features/system-admin-platform/spec.md`  
**Parallel plan**: [`parallel-execution.md`](parallel-execution.md) (chains ↔ GitHub issues)  
**Status**: Approved — ready for Execute

---

## Execution Plan

### Phase 0: Documentation foundation (sequential)

```text
T-SYS-01 → T-SYS-02 → T-SYS-03
```

### Phase 1: Identity + operator shell (sequential)

```text
T-SYS-04 → T-SYS-05 → T-SYS-06 → T-SYS-07 → T-SYS-08 → T-SYS-09
         └→ T-SYS-10 [P] (web shell, after T-SYS-07)
```

### Phase 2: Church provisioning (sequential)

```text
T-SYS-11 → T-SYS-12 → T-SYS-13 [P] web
```

### Phase 3: Admin invite by email (sequential)

```text
T-SYS-14 → T-SYS-15 → T-SYS-16 → T-SYS-17 → T-SYS-18 [P] web
```

### Phase 4: User / role stewardship (sequential core, parallel web)

```text
T-SYS-19 → T-SYS-20 → T-SYS-21 → T-SYS-22
                              └→ T-SYS-23 [P] web
```

### Phase 5: Read-only scheduling (sequential)

```text
T-SYS-24 → T-SYS-25 → T-SYS-26 [P] web
```

### Phase 6: Church Admin metadata (optional parallel track)

```text
T-CHURCH-01 → T-CHURCH-02 → T-CHURCH-03 [P]
```

**GitHub issues (one per chain):** see [`parallel-execution.md`](parallel-execution.md#tracker-links).

---

## Validation tables

### Diagram ↔ Depends on

| Task | Stated depends | Matches phase diagram |
|------|----------------|----------------------|
| T-SYS-01–03 | sequential chain | ✅ |
| T-SYS-04–09 | 04→…→09 | ✅ |
| T-SYS-10 | T-SYS-07 | ✅ |
| T-SYS-11–13 | 11→12→13 | ✅ |
| T-SYS-14–18 | 14→…→18 | ✅ |
| T-SYS-19–23 | 19→20→21→22; 23∥22 | ✅ |
| T-SYS-24–26 | 24→25→26 | ✅ |
| T-CHURCH-* | independent | ✅ |

### Test co-location

| Task | Tests in same task | Gate |
|------|-------------------|------|
| API implementation tasks | API Jest e2e additions | `pnpm test` (api) |
| Web UI tasks | Vitest behavior tests | `pnpm --filter @onda/web test` |
| Doc-only T-SYS-01–03 | none | review |

---

## Task breakdown

### T-SYS-01: ADR 0005 — System Admin operator role

**What**: Add `docs/adr/0005-system-admin-operator-role.md` (boundaries, seed-only, read-only scheduling, service role).  
**Where**: `docs/adr/`  
**Depends on**: None  
**Requirement**: SYSADM-01 (governance)

**Done when**:

- [x] ADR accepted and linked from design.md
- [x] Contrasts church-scoped **Admin** vs **System Admin**

**Tests**: none  
**Gate**: doc review

---

### T-SYS-02: Update CONTEXT.md and Platform PRD

**What**: Add **System Admin** glossary entry; update PRD out-of-scope for operator role.  
**Where**: `CONTEXT.md`, `docs/prd/volunteer-management-platform.md`  
**Depends on**: T-SYS-01  
**Requirement**: SYSADM-01

**Done when**:

- [x] Terminology matches ADR 0005

**Tests**: none  
**Gate**: doc review

---

### T-SYS-03: Extend Supabase and auth runbooks

**What**: Document `SUPABASE_SERVICE_ROLE_KEY`, invite redirect URLs, invite fulfillment, seeded system admin volunteer.  
**Where**: `docs/runbooks/supabase-auth-local.md`, `docs/runbooks/api-auth-context.md`  
**Depends on**: T-SYS-01  
**Requirement**: SYSADM-03

**Done when**:

- [x] Local happy path documented for operator + invite

**Tests**: none  
**Gate**: doc review

---

### T-SYS-04: Prisma `SystemAdministrator` + migration

**What**: Add model; migration; regenerate client.  
**Where**: `apps/api/prisma/schema.prisma`, `prisma/migrations/`  
**Depends on**: T-SYS-02  
**Requirement**: SYSADM-01

**Done when**:

- [x] `prisma migrate deploy` succeeds on clean DB

**Tests**: none (schema)  
**Gate**: migrate

---

### T-SYS-05: Seed `seed-volunteer-system-admin`

**What**: Seed volunteer + `SystemAdministrator` row; document id in runbook.  
**Where**: `apps/api/prisma/seed.ts`  
**Depends on**: T-SYS-04  
**Requirement**: SYSADM-01

**Done when**:

- [x] `pnpm prisma:seed` creates operator volunteer

**Tests**: none  
**Gate**: seed

---

### T-SYS-06: Extend auth context with `assertSystemAdmin` / `isSystemAdmin`

**What**: Update `AuthenticatedRequestContext`, resolver, and tests for `NOT_SYSTEM_ADMIN`.  
**Where**: `apps/api/src/identity/authenticated-request-context.ts`, `auth-context-resolver.service.ts`  
**Depends on**: T-SYS-04  
**Reuses**: Prisma lookup pattern from stewardship  
**Requirement**: SYSADM-01

**Done when**:

- [x] Seeded system admin passes; demo volunteer fails assert

**Tests**: e2e (auth guard)  
**Gate**: `pnpm --filter @onda/api test` (new spec file started)

---

### T-SYS-07: `GET /identity/me` returns `isSystemAdmin`

**What**: Expose flag to web guard.  
**Where**: `identity.service.ts`, `identity.controller.ts`  
**Depends on**: T-SYS-06  
**Requirement**: SYSADM-01

**Done when**:

- [x] Response shape documented in runbook

**Tests**: e2e in `identity` or `system-admin-auth` spec  
**Gate**: api test

---

### T-SYS-08: `SystemAdminModule` + route prefix scaffold

**What**: Nest module, empty controller with guard wiring.  
**Where**: `apps/api/src/system-admin/`  
**Depends on**: T-SYS-06  
**Requirement**: SYSADM-01

**Done when**:

- [x] Module registered in `app.module.ts`

**Tests**: e2e smoke `GET /system-admin/health` or churches stub 401/403  
**Gate**: api test

---

### T-SYS-09: API e2e — system admin authorization matrix

**What**: `apps/api/test/system-admin-auth.e2e-spec.ts` — system admin vs volunteer vs anonymous.  
**Where**: `apps/api/test/`  
**Depends on**: T-SYS-08  
**Requirement**: SYSADM-01

**Done when**:

- [x] All cases green

**Tests**: e2e  
**Gate**: `pnpm test`

---

### T-SYS-10: Web `/system-admin` route tree + guard [P]

**What**: `SystemAdminShell`, router entries, redirect non-operators; i18n skeleton.  
**Where**: `apps/web/src/router.tsx`, `apps/web/src/system-admin/`, locales  
**Depends on**: T-SYS-07  
**Requirement**: SYSADM-01

**Done when**:

- [x] Seeded system admin reaches dashboard; demo volunteer redirected

**Tests**: Vitest `systemAdminShell.behavior.test.tsx`  
**Gate**: web unit test

---

### T-SYS-11: `SystemAdminChurchesService.create`

**What**: Transaction create `Church` + default `Campus`; IANA timezone validation.  
**Where**: `apps/api/src/system-admin/`  
**Depends on**: T-SYS-08  
**Reuses**: validation patterns from `organization.service`  
**Requirement**: SYSADM-02

**Done when**:

- [x] Church appears in organization context for later-accredited admin

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-12: `POST/GET /system-admin/churches`

**What**: Controller + list pagination.  
**Where**: `system-admin-churches.controller.ts`  
**Depends on**: T-SYS-11  
**Requirement**: SYSADM-02

**Done when**:

- [x] Stable validation errors for bad timezone/name

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-13: Web churches list + create form [P]

**What**: Pages under `/system-admin/churches`.  
**Where**: `apps/web/src/system-admin/`  
**Depends on**: T-SYS-12, T-SYS-10  
**Requirement**: SYSADM-02

**Done when**:

- [x] Create church refreshes list from server truth

**Tests**: Vitest behavior test with mocked API  
**Gate**: web unit test

---

### T-SYS-14: Prisma `AdminInvite` + migration

**What**: Model + enum status.  
**Where**: `schema.prisma`, migration  
**Depends on**: T-SYS-12  
**Requirement**: SYSADM-03

**Done when**:

- [x] Migrate deploy green

**Tests**: none  
**Gate**: migrate

---

### T-SYS-15: `SupabaseAdminService` (invite + test mock)

**What**: Wrapper for `inviteUserByEmail`; injectable mock for e2e.  
**Where**: `apps/api/src/identity/` or `system-admin/`  
**Depends on**: T-SYS-03  
**Requirement**: SYSADM-03

**Done when**:

- [x] Missing service role → clear startup warning or controlled error code

**Tests**: unit or e2e with mock  
**Gate**: api test

---

### T-SYS-16: `AdminInviteService` create + fulfill

**What**: Create pending invite; `fulfillPendingInvites` from identity resolve; JWT `email` claim.  
**Where**: `apps/api/src/system-admin/`, `identity.service.ts`, `supabase-jwt-verifier.ts`  
**Depends on**: T-SYS-14, T-SYS-15  
**Requirement**: SYSADM-03

**Done when**:

- [x] Pending invite → sign-in → accreditation + FULFILLED
- [x] Existing volunteer gets additional church accreditation

**Tests**: e2e with mock Supabase  
**Gate**: api test

---

### T-SYS-17: `POST /system-admin/churches/:churchId/admin-invites`

**What**: Controller + duplicate-pending guard.  
**Where**: `system-admin-invites.controller.ts`  
**Depends on**: T-SYS-16  
**Requirement**: SYSADM-03

**Done when**:

- [x] Invalid email returns `ADMIN_INVITE_INVALID`

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-18: Web invite Admin form [P]

**What**: Church detail page invite by email.  
**Where**: `apps/web/src/system-admin/`  
**Depends on**: T-SYS-17, T-SYS-13  
**Requirement**: SYSADM-03

**Done when**:

- [x] Success and error copy in en + pt-BR

**Tests**: Vitest behavior  
**Gate**: web unit test

---

### T-SYS-19: `GET /system-admin/volunteers` search

**What**: Paginated search with accreditation/leadership summary.  
**Where**: `system-admin-volunteers.controller.ts`  
**Depends on**: T-SYS-08  
**Requirement**: SYSADM-04

**Done when**:

- [x] Non–system-admin denied

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-20: Admin accreditation grant/revoke endpoints

**What**: PUT/DELETE with `LAST_ADMIN_ACCREDITATION` guard.  
**Where**: `system-admin/`  
**Depends on**: T-SYS-19  
**Reuses**: `AdminAccreditation` prisma patterns  
**Requirement**: SYSADM-04

**Done when**:

- [x] Revoke last admin blocked

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-21: System-admin wrappers for leader + membership mutations

**What**: Delegate to `OrganizationService` with system-admin actor bypass.  
**Where**: `system-admin-organization.controller.ts`, `organization.service.ts`  
**Depends on**: T-SYS-20  
**Reuses**: #46, #47 behavior  
**Requirement**: SYSADM-04

**Done when**:

- [x] Leader assign and membership deactivate e2e paths green

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-22: API e2e stewardship regression pack

**What**: Consolidated spec for grant leader + membership lifecycle under system admin.  
**Where**: `apps/api/test/system-admin-stewardship.e2e-spec.ts`  
**Depends on**: T-SYS-21  
**Requirement**: SYSADM-04

**Done when**:

- [x] Full `pnpm test` green

**Tests**: e2e  
**Gate**: `pnpm test`

---

### T-SYS-23: Web user search + grants editor [P]

**What**: `/system-admin/users` and detail page.  
**Where**: `apps/web/src/system-admin/`  
**Depends on**: T-SYS-22, T-SYS-10  
**Requirement**: SYSADM-04

**Done when**:

- [x] Grant/revoke admin reflected after refetch

**Tests**: Vitest behavior  
**Gate**: web unit test

---

### T-SYS-24: Scheduling read bypass for system admin

**What**: Extend `EventsService` / stewardship visibility for `isSystemAdmin()`.  
**Where**: `apps/api/src/events/`  
**Depends on**: T-SYS-06  
**Requirement**: SYSADM-05

**Done when**:

- [x] System admin lists events across churches

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-25: `SYSTEM_ADMIN_READ_ONLY` on scheduling writes

**What**: `assertSchedulingWriteAllowed` on all mutation entry points.  
**Where**: `events.service.ts`, `scheduling` controllers  
**Depends on**: T-SYS-24  
**Requirement**: SYSADM-05

**Done when**:

- [x] POST assign returns read-only error for system admin

**Tests**: e2e  
**Gate**: api test

---

### T-SYS-26: Web read-only scheduling support views [P]

**What**: `/system-admin/scheduling` list + link to existing read-only detail (reuse loader).  
**Where**: `apps/web/src/system-admin/`  
**Depends on**: T-SYS-25, T-SYS-10  
**Requirement**: SYSADM-05

**Done when**:

- [x] No write actions rendered for operator

**Tests**: Vitest behavior  
**Gate**: web unit test

---

### T-CHURCH-01: `PATCH /churches/:churchId` for accredited Admin

**What**: Update `name`, `defaultTimezone`; UTC invariant preserved.  
**Where**: `apps/api/src/organization/`  
**Depends on**: None (parallel track)  
**Requirement**: CHURCH-META-01

**Done when**:

- [x] Non-accredited admin denied

**Tests**: e2e  
**Gate**: api test

---

### T-CHURCH-02: API e2e church metadata self-service

**What**: `church-metadata.e2e-spec.ts`.  
**Where**: `apps/api/test/`  
**Depends on**: T-CHURCH-01  
**Requirement**: CHURCH-META-01

**Done when**:

- [x] Rename + timezone change cases green

**Tests**: e2e  
**Gate**: api test

---

### T-CHURCH-03: Web church settings UI (accredited Admin) [P]

**What**: Settings section in shell for church name/timezone edit.  
**Where**: `apps/web/src/` (e.g. ministries or new settings route)  
**Depends on**: T-CHURCH-01  
**Requirement**: CHURCH-META-01

**Done when**:

- [x] Organization context refreshes after save

**Tests**: Vitest behavior  
**Gate**: web unit test

---

## Execute checklist (per task)

1. Implement smallest diff per task.  
2. Run gate from task row.  
3. Atomic commit referencing task id (e.g. `feat(system-admin): T-SYS-11 create church service`).  
4. Update requirement row in `spec.md` when phase completes.  
5. On full feature done: `docs/issues/<#>-system-admin-platform.md` + `docs/issues/README.md` row + `gh issue create`.
