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

## Assignment route ownership

Assignment creation is owned by **Scheduling** at `POST /events/:eventId/assignments` (`AssignmentsController`), not `EventsController` (#57).
