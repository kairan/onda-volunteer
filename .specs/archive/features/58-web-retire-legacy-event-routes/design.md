# Design: Web retire legacy Event routes (#58)

## Scope

Plan retirement of legacy event detail routing once shell-native scheduling detail is canonical and product governance gates are satisfied.

## Key design decisions

- Treat route retirement as a gated migration, not immediate execution.
- Require PRD/ADR amendment before removing legacy paths due current PRD story 42 constraint.
- Migrate navigation/link generation to shell canonical route first, then retire legacy route handlers.
- Keep root `/` decision separate unless a signed-in home replacement is explicitly approved.
- Update runbooks/tests concurrently with route retirement to prevent onboarding drift.

## Migration shape

- Phase A: ensure all primary links and CTA targets use `/scheduling/events/$eventId`.
- Phase B: update tests and docs to shell-native assumptions.
- Phase C: remove or hard-redirect legacy event detail route.
- Phase D: validate no regressions in scheduling detail navigation.

## Risks and mitigations

- Risk: conflict with existing PRD commitments.
  - Mitigation: explicit governance gate requiring PRD/ADR update.
- Risk: hidden legacy links remain.
  - Mitigation: route-link audit and test coverage before retirement.
- Risk: contributor confusion during transition.
  - Mitigation: synchronize runbook and routing docs in same release unit.
