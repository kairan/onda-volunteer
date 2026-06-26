# Invite fulfillment toast — Tasks

**Spec**: `.specs/archive/features/invite-fulfillment-toast/spec.md`  
**Status**: Shipped — validated 2026-06-11 (#124).

## Execution Plan

```text
T-TOAST-01 → T-TOAST-02 → T-TOAST-03 [P] T-TOAST-04
```

---

## Task breakdown

### T-TOAST-01: API — return `newlyFulfilledInvites` from fulfillment + `GET /identity/me`

**What**: Extend `VolunteerInviteFulfillmentService.fulfillPendingInvites` to return fulfilled ministry metadata; thread through `IdentityService.getMe`.  
**Where**: `apps/api/src/organization/volunteer-invite-fulfillment.service.ts`, `apps/api/src/identity/identity.service.ts`  
**Depends on**: None  
**Requirement**: TOAST-01

**Done when**:

- [x] `fulfillPendingInvites` returns `{ volunteer, newlyFulfilledInvites: { ministryId, ministryName }[] }`
- [x] `getMe` response includes `newlyFulfilledInvites` (empty array when none)
- [x] Archived-ministry invites excluded from `newlyFulfilledInvites`

**Gate**: `pnpm --filter @onda/api typecheck`

---

### T-TOAST-02: API e2e — identity/me after invite fulfillment

**What**: Extend or add test covering `GET /identity/me` returns `newlyFulfilledInvites` after mocked JWT sign-in with pending invite.  
**Where**: `apps/api/test/volunteer-invite.e2e-spec.ts` or `identity-me.e2e-spec.ts`  
**Depends on**: T-TOAST-01  
**Requirement**: TOAST-04

**Done when**:

- [x] Test creates pending `VolunteerInvite`, simulates fulfillment path, asserts `newlyFulfilledInvites` on first `GET /identity/me`
- [x] Second `GET /identity/me` returns empty `newlyFulfilledInvites`

**Gate**: `export DATABASE_URL=... && pnpm test` (api)

---

### T-TOAST-03: Web — shell toasts + i18n

**What**: Extend `IdentityMePayload`; on `AppShell` bootstrap, push success toast per `newlyFulfilledInvites` entry.  
**Where**: `apps/web/src/identity/types.ts`, `apps/web/src/shell/AppShell.tsx`, `apps/web/src/i18n/locales/`  
**Depends on**: T-TOAST-01  
**Requirement**: TOAST-02, TOAST-03

**Done when**:

- [x] `fetchIdentityMe` typed payload includes `newlyFulfilledInvites`
- [x] `AppShell` shows one toast per fulfilled ministry after sign-in bootstrap
- [x] `en` + `pt-BR` strings in `shell.json` (or `organization.json`)

**Gate**: `pnpm --filter @onda/web test`

---

### T-TOAST-04: Web behavior test

**What**: Test `AppShell` renders toast when `fetchIdentityMe` returns `newlyFulfilledInvites`.  
**Where**: `apps/web/src/shell/AppShell.behavior.test.tsx` (extend)  
**Depends on**: T-TOAST-03  
**Requirement**: TOAST-05

**Done when**:

- [x] Mock identity me with one fulfilled invite → toast message visible with ministry name

**Gate**: `pnpm --filter @onda/web test`
