# 116 — Volunteer discovery & onboarding invite

**Type:** Feature
**Status:** Shipped (validated 2026-06-11)
**TLC:** `.specs/archive/features/volunteer-onboarding-invite/` (spec, design, tasks)

## Problem

Leaders and Admins added volunteers to ministries by typing a raw `volunteerId` string. There was no way to look up existing volunteers by name/email, and no way to invite a net-new person.

## What was built

1. **Email invite** — Supabase invite; `VolunteerInvite` record; on first sign-in, Volunteer + Pending membership created automatically.
2. **Volunteer search** — ILIKE search by name/email across the church's accessible volunteer pool; selection pre-fills add-membership form.

Raw `volunteerId` text input on `/volunteers` replaced with these flows.

**Follow-up:** ONBOARD-A5 web shell toast shipped via [#124](https://github.com/kairan/onda-volunteer/issues/124) — see `.specs/archive/features/invite-fulfillment-toast/spec.md`.

## Acceptance criteria

- [x] Leader enters email → system checks existing Volunteer; if none, Supabase invite sent + `VolunteerInvite` row created (ONBOARD-01, ONBOARD-02)
- [x] `VOLUNTEER_ALREADY_EXISTS` (200) → auto-populates search field instead of re-inviting (ONBOARD-03)
- [x] Duplicate pending invite (same ministry+email before expiry) → resend resets TTL (ONBOARD-06)
- [x] Search field (≥2 chars) shows volunteer dropdown; excludes ACTIVE/PENDING members of the selected ministry (ONBOARD-09, ONBOARD-11, ONBOARD-12)
- [x] On first sign-in, pending `VolunteerInvite` → Volunteer record + Pending membership(s) created (ONBOARD-04, ONBOARD-05)
- [x] Archived ministry at fulfillment time → invite EXPIRED, no membership created (ONBOARD-07)
- [x] Raw `volunteerId` input no longer visible in normal flow (ONBOARD-14)
- [x] `pnpm test` green (`volunteer-invite.e2e-spec.ts`)
- [x] `pnpm --filter @onda/web test` green (`volunteers.behavior.test.tsx`)

## Specification links

- Spec: `.specs/archive/features/volunteer-onboarding-invite/spec.md` (ONBOARD-01–15)
- Design: `.specs/archive/features/volunteer-onboarding-invite/design.md`
- Tasks: `.specs/archive/features/volunteer-onboarding-invite/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/116
