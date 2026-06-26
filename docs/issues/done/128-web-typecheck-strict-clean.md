# 128 — Web typecheck strict clean

**Type:** Tech debt / CI hygiene  
**Status:** Shipped (validated 2026-06-11)  
**TLC:** `.specs/archive/features/web-typecheck-strict-clean/` (spec, tasks)

## Problem

Web `tsc --noEmit` reported 59 strict errors across 27 files, blocking #61 promotion criterion for full monorepo typecheck gating.

## What was built

- Shared test fixtures (`identityMeFixture`, `authSessionContextFixture` usage)
- Explicit shell route registration in `router.tsx` for TanStack typed paths
- DTO mock alignment (`cancelledAtUtc`, `Church.ministries`, `EventDetailPayload.church.id`)
- Supabase null guards in `AuthPanel.tsx`
- Exported `AuthSessionContextValue`; fixed `adminInvites.ts` `ProtectedScope` args
- `pnpm typecheck:web` script + CI `typecheck-web` job
- Branch protection runbook documents `CI / typecheck-web` (HITL enable after merge)

## Acceptance criteria

- [x] TC-01: `pnpm typecheck:web` exits 0
- [x] TC-02: Root `typecheck:web` script
- [x] TC-03: CI `typecheck-web` job
- [x] TC-04: Branch protection runbook updated
- [x] TC-05: `pnpm lint` + `pnpm test` green

## Specification links

- Spec: `.specs/archive/features/web-typecheck-strict-clean/spec.md`
- Tasks: `.specs/archive/features/web-typecheck-strict-clean/tasks.md`
- Extends: `docs/issues/done/61-ci-lint-and-coverage.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/128
