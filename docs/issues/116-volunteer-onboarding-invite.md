# 116 — Volunteer discovery & onboarding invite

**Type:** Feature
**Label:** `ready-for-agent`
**Blocked by:** none
**TLC:** `.specs/features/volunteer-onboarding-invite/` (spec, design, tasks — Execute-ready)

## Problem

Leaders and Admins add volunteers to ministries by typing a raw `volunteerId` string. There is no way to look up existing volunteers by name/email, and no way to invite a net-new person. New Volunteers currently require System Admin provisioning or direct database seeding.

## What to build

Two flows closing the discovery and onboarding gaps:

1. **Email invite** — sends Supabase invite; creates `VolunteerInvite` record; on first sign-in, Volunteer + Pending membership created automatically.
2. **Volunteer search** — ILIKE search by name/email across the church's accessible volunteer pool; selection pre-fills add-membership form.

Replace raw `volunteerId` text input on `/volunteers` with these two flows.

### Tasks

`T-ONBOARD-01 → T-ONBOARD-02 [P] T-ONBOARD-03 → T-ONBOARD-04 → T-ONBOARD-05 → T-ONBOARD-06 [P] T-ONBOARD-07 → T-ONBOARD-08`

See `.specs/features/volunteer-onboarding-invite/tasks.md` for full task breakdown.

## Acceptance criteria

- [ ] Leader enters email → system checks existing Volunteer; if none, Supabase invite sent + `VolunteerInvite` row created (ONBOARD-01, ONBOARD-02)
- [ ] `VOLUNTEER_ALREADY_EXISTS` (200) → auto-populates search field instead of re-inviting (ONBOARD-03)
- [ ] Duplicate pending invite (same ministry+email before expiry) → resend resets TTL (ONBOARD-06)
- [ ] Search field (≥2 chars) shows volunteer dropdown; excludes ACTIVE/PENDING members of the selected ministry (ONBOARD-09, ONBOARD-11, ONBOARD-12)
- [ ] On first sign-in, pending `VolunteerInvite` → Volunteer record + Pending membership(s) created (ONBOARD-04, ONBOARD-05)
- [ ] Archived ministry at fulfillment time → invite EXPIRED, no membership created (ONBOARD-07)
- [ ] Raw `volunteerId` input no longer visible in normal flow (ONBOARD-14)
- [ ] `pnpm test` green (new `volunteer-invite.e2e-spec.ts`)
- [ ] `pnpm --filter @onda/web test` green (updated `volunteers.behavior.test.tsx`)

## Specification links

- Spec: `.specs/features/volunteer-onboarding-invite/spec.md` (ONBOARD-01–15)
- Design: `.specs/features/volunteer-onboarding-invite/design.md`
- Tasks: `.specs/features/volunteer-onboarding-invite/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/116
