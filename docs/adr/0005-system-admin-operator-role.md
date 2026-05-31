# ADR 0005: System Admin operator role

**Status:** Accepted  
**Date:** 2026-05-31  
**Feature spec:** [`.specs/features/system-admin-platform/spec.md`](../../.specs/features/system-admin-platform/spec.md)

## Context

Church onboarding today depends on Prisma seed and manual runbooks. Church-scoped **Admin** accreditation assumes a **Church** and structure already exist. The product needs a **platform operator** role that can create **Churches**, invite the first church **Admin** by email, steward users across the network, and view scheduling data for support — without conflating that power with day-to-day church **Admin** work inside `ProtectedAppShell`.

Prior PRD language deferred a “network-wide super **Admin**” ([`docs/prd/volunteer-management-platform.md`](../prd/volunteer-management-platform.md)). This ADR adopts the term **System Admin** (not “super Admin”) and documents boundaries before implementation (chains [#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93)).

## Decision

### Terminology

- **System Admin** — platform operator grant on an existing **Volunteer**; many operators allowed; used for `/system-admin/*` APIs and web routes.
- **Admin** — church-scoped accreditation in **Organization** for one or more named **Churches**; unchanged semantics (#56 stewardship).

Do not overload “super Admin,” “network Admin,” or **Admin** to mean the operator role.

### Grant and bootstrap (v1)

1. **System Admin** membership is stored in a `SystemAdministrator` table keyed by `volunteerId` (see feature `design.md`).
2. Rows are created **only** via seed (and test fixtures) — **no** in-app API to grant or revoke **System Admin** in v1.
3. Local seed volunteer id: **`seed-volunteer-system-admin`** (added in implementation task T-SYS-05).
4. If no `SystemAdministrator` rows exist, operator routes and APIs deny access; document seed/runbook for operators.

### Operator vs church **Admin**

| Concern | **System Admin** | Church-scoped **Admin** |
|--------|------------------|-------------------------|
| Scope | All **Churches** (network) | Only accredited **Churches** |
| Primary UI | `/system-admin/*` (sibling to shell, not inside `ProtectedAppShell`) | `ProtectedAppShell` / dashboard |
| Create **Church** + default **Campus** | Yes | No |
| Invite church **Admin** by email | Yes (Supabase invite + `AdminInvite` fulfillment) | No |
| Grant/revoke church **Admin** accreditation | Yes | No (within own church stewardship rules only) |
| **Leader** / **Ministry** membership stewardship | Yes (delegates to existing org commands) | Within accredited scope |
| Edit accredited **Church** name / default timezone | No (separate **Admin** self-service slice `CHURCH-META-01`) | Yes, when accredited |
| **Scheduling** writes | **No** — read-only | Full stewardship within accreditation |
| **Scheduling** reads | Cross-church support reads | Within accredited **Churches** |

A person may hold **System Admin** and church **Admin** / **Leader** / **Volunteer** grants on the same sign-in; grants compose independently.

### Scheduling: read-only operator access

1. **System Admin** may call existing scheduling **GET** handlers (events, rosters) with a visibility bypass across **Churches** (optional `?churchId=` filter in UX).
2. All scheduling **writes** (`POST`/`PATCH`/`DELETE` on events, assignments, release, cancel, etc.) call a shared guard that rejects **System Admin** callers with stable code **`SYSTEM_ADMIN_READ_ONLY`**.
3. Do not duplicate read DTOs or parallel read-only API trees for operator support.

### Church **Admin** onboarding (invite)

1. **System Admin** triggers Supabase **`auth.admin.inviteUserByEmail`** from the API using **`SUPABASE_SERVICE_ROLE_KEY`** (server-only; never in the browser).
2. Pending state is recorded in **`AdminInvite`** (Prisma) for audit and idempotent fulfillment on first JWT sign-in.
3. On successful sign-in, **Identity** links auth to **Volunteer** (create if needed), grants **Admin** accreditation for the target **Church**, marks invite **FULFILLED**.
4. Invited users use the normal church **Admin** shell — not the operator dashboard.

### Authorization surface

- Nest: `AuthenticatedRequestContext.assertSystemAdmin()` / `isSystemAdmin()`; operator module prefix **`/system-admin`**.
- Web: route guard uses `GET /identity/me` → `isSystemAdmin`.
- Stable errors include **`NOT_SYSTEM_ADMIN`**, **`SYSTEM_ADMIN_READ_ONLY`**, **`LAST_ADMIN_ACCREDITATION`** (revoke last church **Admin** blocked).

### Dev and test

- With `AUTH_ALLOW_DEV_HEADERS=true`, operator tests use **`X-Volunteer-Id: seed-volunteer-system-admin`** — there is **no** `X-System-Admin` header that elevates an arbitrary volunteer.
- When `SUPABASE_SERVICE_ROLE_KEY` is unset, invite API may no-op or fail with documented runbook path; tests mock Supabase admin client.

### Explicitly out of scope (operator v1)

- In-app promotion to first **System Admin**
- Impersonation / “act as user”
- **System Admin** mutating **Assignments**, **Events**, or **Unavailability**
- Bulk CSV import, billing, multi-church **Public events**

## Consequences

- `CONTEXT.md` and the Platform PRD must use **System Admin** per this ADR; remove “super Admin” deferral wording.
- Runbooks document service role key, invite redirect URLs, fulfillment, and seeded operator volunteer id.
- Implementation chains [#88](https://github.com/kairan/onda-volunteer/issues/88)+ depend on this terminology; church **Admin** flows remain unchanged unless explicitly extended (`CHURCH-META-01`).
- Agents implementing scheduling features must call **`assertSchedulingWriteAllowed`** (or equivalent) so operator read access cannot regress into writes.

## References

- Design: [`.specs/features/system-admin-platform/design.md`](../../.specs/features/system-admin-platform/design.md)
- Auth context runbook: [`docs/runbooks/api-auth-context.md`](../runbooks/api-auth-context.md)
- Supabase local runbook: [`docs/runbooks/supabase-auth-local.md`](../runbooks/supabase-auth-local.md)
