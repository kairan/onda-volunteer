# Feature Spec: API request-scoped auth context (#55)

## Problem statement

Controllers currently pass raw auth headers through many service boundaries, widening interfaces and increasing coupling between HTTP transport details and domain operations.

## Requirements

- REQ-55-01: Resolve authenticated volunteer identity and optional leader ministry scope once per request via guard/middleware/interceptor.
- REQ-55-02: Domain services accept a typed authenticated context object rather than raw auth header fields.
- REQ-55-03: Identity remains the single adapter for Bearer JWT and dev-header verification behavior.
- REQ-55-04: Existing `AUTH_ALLOW_DEV_HEADERS` behavior remains unchanged.
- REQ-55-05: Existing JWT and dev-header paths remain behaviorally equivalent in e2e flows.
- REQ-55-06: Request context shape is documented in runbook-grade project docs.

## Non-goals

- New auth provider integrations.
- Supabase RLS redesign.
- Web client auth flow redesign.

## Dependencies and blockers

- No hard blocker listed; issue recommends sequencing after #49 to reduce churn.
- Depends on stable Identity adapter semantics.
- Should avoid parallel execution with high-conflict feature slices touching many controllers.

## Verification approach

- API integration/e2e checks for both JWT and dev-header request paths.
- Tests proving controller/service boundaries no longer require raw header forwarding on migrated paths.
- Documentation validation for request context contract publication.
- Regression checks for unchanged authorization outcomes.
