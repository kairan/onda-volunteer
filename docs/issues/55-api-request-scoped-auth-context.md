# 55 — API: request-scoped auth context (tech debt)

**Type:** Tech debt (post-MVP hardening)  
**Bounded context:** **Identity** (HTTP **seam**)  
**Index:** `docs/issues/architecture-debt.md` (candidate **#3**)

## Problem

Every controller forwards `Authorization`, `X-Volunteer-Id`, and `X-Leader-Ministry-Id` into service input bags. Domain **interfaces** are as wide as the auth plumbing. Changing dev-header or JWT resolution requires touching many call sites — low **leverage**, poor **locality**.

## What to build

Resolve the authenticated **Volunteer** (and optional **Leader** ministry scope) once per HTTP request:

- Nest guard, middleware, or interceptor establishes a request-scoped context
- Domain services accept a typed context (e.g. `AuthenticatedRequestContext`) instead of raw header fields
- **Identity** remains the single **adapter** for JWT and dev-header verification

## Acceptance criteria

- [ ] No controller manually passes `authorizationHeader` / `devVolunteerIdHeader` into services for new code paths; existing paths migrated or wrapped.
- [ ] Dev-header and Bearer JWT flows behave as today (e2e green).
- [ ] `AUTH_ALLOW_DEV_HEADERS` behavior unchanged for local development.
- [ ] Document the request context shape for future slices in `docs/runbooks/` or `AGENTS.md` (one short section).

## When to schedule

- **After** slice **55** (HOPE release gate) **or** when HITL issues **#44–47** repeatedly duplicate header forwarding.

## Blocked by

None — but avoid running in parallel with AFK slices **#39–43** to reduce merge conflict risk.

## Out of scope

- Supabase RLS or new auth providers
- Web client auth (**30** already shipped)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/55
