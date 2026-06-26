# Invite fulfillment toast — Specification

## Status

Specified — audit 2026-06-11 (closes ONBOARD-A5 gap from `volunteer-onboarding-invite`).

## Problem Statement

When a net-new person accepts a **VolunteerInvite** and signs in for the first time, the API creates **Volunteer** + **Pending** `MinistryMembership` rows silently. Leaders see pending invites on `/volunteers`; the invited person has no immediate feedback that onboarding succeeded beyond eventual dashboard pending-membership copy.

**ONBOARD-A5** (locked 2026-06-06) requires the web shell to show a toast per fulfilled invite on first sign-in.

## Goals

- [x] After first sign-in with fulfilled `VolunteerInvite` records, the shell shows one success toast per ministry added (pending membership).
- [x] Toasts appear once per fulfilled invite batch (API returns metadata only on fulfillment request).
- [x] Copy available in `en` and `pt-BR`.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dedicated `/welcome` route | Design doc: toast sufficient for v1 |
| Re-show toasts on every `GET /identity/me` | Only newly fulfilled this auth resolution |
| Leader-side invite status change UI | Ships in #116 |

## Source references

- Parent spec: `.specs/features/volunteer-onboarding-invite/spec.md` (ONBOARD-A5)
- Fulfillment: `apps/api/src/organization/volunteer-invite-fulfillment.service.ts`
- Shell toasts: `apps/web/src/shell/AppShell.tsx`, `apps/web/src/feedback/ToastHost.tsx`

---

## User Stories

### Story 1: Volunteer sees invite acceptance feedback

**User Story**: As a newly invited **Volunteer**, I want a clear message when my invite is fulfilled on first sign-in, so that I know I was added to the ministry as a pending member.

**Acceptance Criteria**:

1. WHEN `VolunteerInvite` records are fulfilled during JWT sign-in resolution THEN `GET /identity/me` SHALL include `newlyFulfilledInvites` with `{ ministryId, ministryName }` for each accepted invite.
2. WHEN `newlyFulfilledInvites` is non-empty on shell bootstrap THEN the web shell SHALL push one success toast per entry.
3. WHEN the same volunteer calls `GET /identity/me` again without new fulfillments THEN `newlyFulfilledInvites` SHALL be empty.
4. WHEN dev-header auth is used (no JWT fulfillment path) THEN no fulfillment toasts are required.

---

## Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| TOAST-01 | API returns `newlyFulfilledInvites` on `GET /identity/me` when fulfillment occurs | P1 |
| TOAST-02 | Web `AppShell` shows per-ministry success toast on bootstrap | P1 |
| TOAST-03 | i18n strings `en` + `pt-BR` for toast message | P1 |
| TOAST-04 | API e2e covers fulfilled invite payload on first `GET /identity/me` | P1 |
| TOAST-05 | Web behavior test: mock `fetchIdentityMe` with fulfilled invites → toast rendered | P2 |
