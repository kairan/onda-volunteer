# API request-scoped auth context

Every authenticated HTTP request resolves auth once via `AuthContextInterceptor` (registered globally in `IdentityModule`). Controllers inject `@AuthContext()` instead of reading raw headers.

## Shape

```typescript
type AuthHeaders = {
  authorization?: string;   // Bearer JWT
  volunteerId?: string;     // X-Volunteer-Id (dev only when AUTH_ALLOW_DEV_HEADERS=true)
  leaderMinistryId?: string; // X-Leader-Ministry-Id (dev leader scope)
};

type AuthenticatedRequestContext = {
  headers: AuthHeaders;
  requireVolunteer(options?: { attemptAutoLink?: boolean }): Promise<Volunteer>;
  assertAdminAccreditedForChurch(churchId: string): Promise<Volunteer>;
  assertLeaderCanActOnMinistry(ministryId: string): Promise<void>;
  assertSystemAdmin(): Promise<Volunteer>;
  isSystemAdmin(): Promise<boolean>;
};
```

## Usage in controllers

```typescript
@Get('example')
example(@AuthContext() auth: AuthenticatedRequestContext) {
  return this.service.doThing({ auth });
}
```

## Usage in services

Pass `auth: AuthenticatedRequestContext` through service boundaries. Call `await auth.requireVolunteer()` or the assert helpers — volunteer identity is memoized for the request.

## Identity adapter

`IdentityService` remains the sole adapter for JWT verification and dev-header volunteer lookup. Church/ministry stewardship checks delegate to `StewardshipService` (#56).

## Local development

With `AUTH_ALLOW_DEV_HEADERS=true`, send `X-Volunteer-Id` and/or `X-Leader-Ministry-Id` instead of Bearer tokens. Behavior is unchanged from pre-#55 flows.

## System Admin (platform operator)

ADR [0005](../adr/0005-system-admin-operator-role.md). Operator APIs live under **`/system-admin/*`** and call `auth.assertSystemAdmin()` first.

| Check | Behavior |
|-------|----------|
| `assertSystemAdmin()` | Resolves volunteer; loads `SystemAdministrator` for that `volunteerId`; **403** `NOT_SYSTEM_ADMIN` if missing |
| `isSystemAdmin()` | Same lookup; returns boolean (for scheduling read bypass) |
| Scheduling writes | Reject **System Admin** with **`SYSTEM_ADMIN_READ_ONLY`** before mutating |

### `GET /identity/me`

Response includes `isSystemAdmin: boolean` for web route guards (`/system-admin/*` vs `ProtectedAppShell`).

### Dev headers (operator)

When `AUTH_ALLOW_DEV_HEADERS=true`:

- Use **`X-Volunteer-Id: seed-volunteer-system-admin`** (after seed T-SYS-05) for operator API and e2e.
- **Do not** add `X-System-Admin: true` on arbitrary volunteers — elevation requires a seeded `SystemAdministrator` row tied to that volunteer id.

Church **Admin** invite fulfillment runs in **Identity** on JWT sign-in (email claim + pending `AdminInvite`); see [`supabase-auth-local.md`](supabase-auth-local.md) §8.

## Assignment route ownership

Assignment creation is owned by **Scheduling** at `POST /events/:eventId/assignments` (`AssignmentsController`), not `EventsController` (#57).
