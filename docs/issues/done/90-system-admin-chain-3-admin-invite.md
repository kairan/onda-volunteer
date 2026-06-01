# 90 — System Admin chain 3: admin invite by email (P3)

**Type:** Feature  
**Label:** `ready-for-agent`  
**Blocked by:** #88, #89 (church list/detail read endpoints shipped for invite UI; full church create remains #89)  
**TLC:** `.specs/features/system-admin-platform/`

## What to build

`AdminInvite` table, Supabase `inviteUserByEmail`, fulfillment on sign-in, invite UI.

## Tasks

T-SYS-14–18

## Acceptance criteria

- [x] Invite email sent; pending row recorded
- [x] First sign-in links **Volunteer** + **Admin** accreditation
- [x] Existing volunteer gets additional church accreditation

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/90
