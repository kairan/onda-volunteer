# Design: Admin manages Ministry membership lifecycle (#46)

## Scope

Support admin lifecycle operations (add pending/active, activate pending, deactivate active) with church-scoped authorization and future-assignment voiding semantics.

## Key design decisions

- Keep membership statuses constrained to Pending and Active for this slice.
- Reuse existing deactivation transaction behavior (future-only voiding) unless transaction internals are explicitly changed.
- Apply accreditation and ministry scope checks before lifecycle mutations.
- Maintain historical assignment records for events already ended by scheduled end.
- Route optional architecture fold (#5) only if deactivation implementation is touched.

## API/application shape

- Commands: add membership, activate membership, deactivate membership.
- Authorization seam: admin accreditation + church/ministry scope check.
- Deactivation side effect: void assignments where related event scheduled end is future relative to command time.
- Read model updates: membership status visible in admin workflow screens.

## Risks and mitigations

- Risk: over-voiding assignments for already-ended events.
  - Mitigation: explicit scheduled-end comparison tests.
- Risk: duplicated voiding logic between Organization and Scheduling.
  - Mitigation: if touched, delegate through Scheduling seam or document exception.
- Risk: operator confusion around pending vs active transitions.
  - Mitigation: HITL review for lifecycle copy and support guidance.
