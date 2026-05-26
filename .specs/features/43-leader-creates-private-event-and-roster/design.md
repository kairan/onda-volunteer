# Design: Leader creates and rosters Private Event (#43)

## Scope

Add private-event creation and roster management for leader-scoped ministries while preserving existing scheduling invariants and private visibility boundaries.

## Key design decisions

- Reuse event aggregate shape with event kind flag (`Private`) rather than parallel model.
- Authorize creation by leader ministry stewardship or accredited admin support scope.
- Reuse existing scheduling assignment command path/invariants for private rosters.
- Add visibility guard on private event reads to ministry participants + accredited admins.
- Keep shell UX parallel with public flow but with private-scope labeling.

## Risks and mitigations

- Risk: private event visibility leakage.
  - Mitigation: server-side read filters and negative visibility tests.
- Risk: divergent assignment rule paths by event type.
  - Mitigation: enforce shared scheduling invariant service for public/private.
- Risk: confusing private vs public UX.
  - Mitigation: HITL copy/label review before release.
