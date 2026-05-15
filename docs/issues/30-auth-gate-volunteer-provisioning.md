# 30 — Auth gate + Volunteer provisioning (full sign-in cycle)

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **1**, **38**); `docs/issues/done/07-supabase-auth-identity-mapping.md`; `CONTEXT.md` (**Identity**, **Volunteer**)

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Prior auth slice: `docs/issues/done/07-supabase-auth-identity-mapping.md`

## What to build

Close the gap between **Supabase sign-in** and a working signed-in app so local and staging users do not rely on `pnpm link:volunteer-auth`, stale Bearer tokens, or `X-Volunteer-Id` dev headers for normal shell flows.

**API**

- On first authenticated request (or a dedicated bootstrap endpoint), resolve JWT `sub` to a **Volunteer**: find by `authSubjectId`, or **provision** a minimal profile when policy allows (local/staging: link to seeded demo volunteer by email allowlist **or** create a new row with display name from Supabase user metadata; document production policy — default: no auto-create in production without explicit env flag).
- Expose `GET /identity/me` (or equivalent) returning volunteer id, display name, and auth linkage status for the web bootstrap.
- Stable error codes: `PROFILE_NOT_LINKED` with actionable message when provisioning is disabled; never fall through to anonymous reads on protected routes.

**Web**

- **Protected shell layout**: authenticated routes wait for Supabase session initialization before calling protected APIs (organization context, dashboard, etc.).
- **Auth gate**: unauthenticated users see sign-in (existing `AuthPanel`) instead of shell chrome that immediately 401s; optional `/sign-in` route.
- **Session-aware headers**: use refreshed Bearer token via `getUser()`; on `401` / `AUTH_INVALID`, sign out locally and return to sign-in (dev-header fallback remains behind `VITE_AUTH_USE_DEV_HEADERS` for explicit local-only bypass, not the default happy path).
- After sign-in, call identity bootstrap then load organization context — no `VITE_DEMO_VOLUNTEER_ID` required when JWT + linked/provisioned volunteer is present.
- Clear UX for `PROFILE_NOT_LINKED` (instructions or admin contact), not a raw JSON error in the shell.

**Docs / ops**

- Update `docs/runbooks/supabase-auth-local.md`: happy path is sign-in → app works; `link:volunteer-auth` is optional override for mapping to a specific seed volunteer.
- Document env flags: e.g. `AUTH_AUTO_LINK_DEMO_SUBJECT`, `VITE_AUTH_USE_DEV_HEADERS` (default false in example production `.env.example` when added).

## Acceptance criteria

- [x] Signed-in user with linked `authSubjectId` loads shell and organization context using Bearer only (no dev headers).
- [x] Signed-in user without a linked profile sees a dedicated blocked state (not `AUTH_INVALID` in org switcher).
- [x] Local dev: documented one-step path (sign in with seeded Supabase user **or** auto-link policy) works without manual `link:volunteer-auth` for the default demo volunteer.
- [x] Expired/invalid JWT clears session client-side and prompts re-sign-in instead of silent failure.
- [x] Protected layout does not fire organization (or other protected) fetches until session is resolved.
- [x] Automated tests: API identity bootstrap (linked + not linked + provision when enabled); web test for gate/boundary (session mock or integration-style).

## Blocked by

- `docs/issues/15-organization-context-reads.md` (shell must call authenticated org reads — merge or complete first).

## Blocks

- `docs/issues/16-identity-persisted-ui-locale.md` — locale persistence should load after a stable authenticated identity bootstrap, not before.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/22
