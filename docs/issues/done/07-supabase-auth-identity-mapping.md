# Issue: **Supabase Auth** + production **Identity** mapping (JWT → **Volunteer**)

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

**HITL** (environment configuration and security-sensitive)

## What to build

Replace any temporary “dev identity” mechanism with **Supabase**-verified authentication, mapping the authenticated subject to the **Volunteer** record and enforcing **Admin** accreditation and **Leader** ministry stewardship based on real credentials.

This slice should land after the core flows exist so auth is integrating reality, not blocking the tracer bullets—start once slice 2 is stable enough to attach real auth gates.

## Acceptance criteria

- [x] API verifies **Supabase** JWTs using configuration appropriate for local/staging/production (no secrets committed).
- [x] Request identity resolves to at most one **Volunteer** profile per the current glossary scope.
- [x] Authorization paths for **Leader**/**Admin** actions use authenticated identity rather than spoofable headers.
- [x] Web obtains session/token in the supported **Supabase** client pattern and attaches it to API calls for protected routes.
- [x] Runbook documents local setup, token refresh behavior (if applicable), and failure modes.

## Blocked by

`docs/issues/done/02-leader-first-assignment-public-event.md` (recommended).  
May optionally wait until slices **03–06** are underway if you prefer stabilizing domain endpoints first—update this field in your tracker if you choose that ordering.

## Notes (implementation)

- **API:** `IdentityModule` verifies Bearer JWTs (HS256 via `SUPABASE_JWT_SECRET` / Legacy JWT Secret). `AUTH_ALLOW_DEV_HEADERS` gates legacy `X-*` headers for local use only.
- **Web:** `@supabase/supabase-js`, `AuthPanel` (email OTP), `buildProtectedHeaders()` sends Bearer when a session exists.
- **Linking:** `pnpm link:volunteer-auth <supabase-user-uuid>` sets `Volunteer.authSubjectId`.
- **Stewardship:** `MinistryLeader` or `AdminAccreditation` for the ministry’s church authorizes leader-scoped mutations.
- **Runbook:** `docs/runbooks/supabase-auth-local.md` — use legacy **anon** key (`eyJ…`) in the browser, not `sb_secret_…`.
