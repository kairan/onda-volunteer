# Design: API request-scoped auth context (#55)

## Scope

Move transport-level auth header resolution to a per-request context seam so domain services consume typed identity context instead of raw HTTP header fields.

## Key design decisions

- Resolve auth context once in HTTP pipeline (guard/middleware/interceptor).
- Define typed `AuthenticatedRequestContext` consumed by controller/service boundaries.
- Keep Identity module as sole adapter for JWT + dev-header behavior.
- Migrate paths incrementally with compatibility wrappers where needed.
- Publish context contract in runbook documentation for future slices.

## API/application shape

- HTTP layer populates request context with volunteer id and optional leader ministry scope.
- Controllers pass context object, not raw auth strings.
- Services depend on context abstraction and remain transport-agnostic.
- Error mapping and auth outcomes remain unchanged.

## Risks and mitigations

- Risk: migration churn across many controllers.
  - Mitigation: staged migration plan with compatibility adapters.
- Risk: regressions in dev-header mode.
  - Mitigation: explicit e2e paths for `AUTH_ALLOW_DEV_HEADERS`.
- Risk: duplicated context schemas across modules.
  - Mitigation: central typed contract exported from identity/auth boundary.
