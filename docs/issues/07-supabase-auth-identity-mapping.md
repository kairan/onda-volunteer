# Issue: **Supabase Auth** + production **Identity** mapping (JWT → **Volunteer**)

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

**HITL** (environment configuration and security-sensitive)

## What to build

Replace any temporary “dev identity” mechanism with **Supabase**-verified authentication, mapping the authenticated subject to the **Volunteer** record and enforcing **Admin** accreditation and **Leader** ministry stewardship based on real credentials.

This slice should land after the core flows exist so auth is integrating reality, not blocking the tracer bullets—start once slice 2 is stable enough to attach real auth gates.

## Acceptance criteria

- [ ] API verifies **Supabase** JWTs using configuration appropriate for local/staging/production (no secrets committed).
- [ ] Request identity resolves to at most one **Volunteer** profile per the current glossary scope.
- [ ] Authorization paths for **Leader**/**Admin** actions use authenticated identity rather than spoofable headers.
- [ ] Web obtains session/token in the supported **Supabase** client pattern and attaches it to API calls for protected routes.
- [ ] Runbook documents local setup, token refresh behavior (if applicable), and failure modes.

## Blocked by

`docs/issues/02-leader-first-assignment-public-event.md` (recommended).  
May optionally wait until slices **03–06** are underway if you prefer stabilizing domain endpoints first—update this field in your tracker if you choose that ordering.
