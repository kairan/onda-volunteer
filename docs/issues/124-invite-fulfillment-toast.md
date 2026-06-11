# 124 — Invite fulfillment toast (ONBOARD-A5)

**Type:** Feature
**Label:** `ready-for-agent`
**Blocked by:** none (parent #116 shipped)
**TLC:** `.specs/features/invite-fulfillment-toast/` (spec, tasks)

## Problem

Volunteer invite fulfillment on first sign-in creates Pending memberships silently. ONBOARD-A5 requires a web shell toast per fulfilled invite.

## What to build

- Extend `GET /identity/me` with `newlyFulfilledInvites: { ministryId, ministryName }[]` when fulfillment occurs this request
- `AppShell` bootstrap pushes one success toast per entry
- i18n `en` + `pt-BR`

### Tasks

`T-TOAST-01 → T-TOAST-02 → T-TOAST-03 [P] T-TOAST-04`

## Acceptance criteria

- [x] First `GET /identity/me` after invite fulfillment returns non-empty `newlyFulfilledInvites` (TOAST-01)
- [x] Subsequent `GET /identity/me` returns empty array (TOAST-01)
- [x] Shell shows one toast per fulfilled ministry on bootstrap (TOAST-02)
- [x] i18n strings in both locales (TOAST-03)
- [x] API e2e + web behavior tests green (TOAST-04, TOAST-05)

## Specification links

- Spec: `.specs/features/invite-fulfillment-toast/spec.md`
- Tasks: `.specs/features/invite-fulfillment-toast/tasks.md`
- Parent: `.specs/features/volunteer-onboarding-invite/spec.md` (ONBOARD-A5)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/124
