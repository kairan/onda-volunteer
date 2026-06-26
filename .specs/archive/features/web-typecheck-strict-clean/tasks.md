# Tasks: Web typecheck strict clean (#128)

**Spec:** `.specs/archive/features/web-typecheck-strict-clean/spec.md`

## Task list

- [x] T-TC-01: Add shared test fixtures (`identityMeFixture`, use `authSessionContextFixture`); fix behavior tests missing `newlyFulfilledInvites` / `selectDevVolunteer`
  - Verify: `tsc` error count drops; affected `*.behavior.test.tsx` pass
- [x] T-TC-02: Register shell nav routes explicitly in `router.tsx` (fix TanStack `Link`/`navigate` typing for `/dashboard`, `/scheduling`, `/time-away`)
  - Verify: `tsc` clean for shell and system-admin route files
- [x] T-TC-03: Align domain DTO mocks (`cancelledAtUtc`, `Church.ministries`, `EventDetailPayload.church.id`)
  - Verify: `schedulingEventDetail*.tsx` tests pass
- [x] T-TC-04: Supabase null guards in `AuthPanel.tsx` auth handlers
  - Verify: `AuthPanel.tsx` typecheck clean
- [x] T-TC-05: Export `AuthSessionContextValue`; fix `adminInvites.ts` `ProtectedScope` args
  - Verify: zero `tsc` errors
- [x] T-TC-06: Add `typecheck:web` script + CI job; update branch protection runbook
  - Verify: CI green; local `pnpm typecheck:web` passes
- [x] T-TC-07: TLC closeout — `docs/issues/done/128-web-typecheck-strict-clean.md`, README, ROADMAP, STATE, HANDOFF
  - Verify: ONDA tracking stack complete

## Gates

- `pnpm typecheck:web`
- `pnpm --filter @onda/web test`
- `pnpm lint`
- `pnpm test`
