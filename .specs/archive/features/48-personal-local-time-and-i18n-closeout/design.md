# Design: Personal-local time and i18n closeout (#48)

## Scope

Finish presentation-layer work for dual-time display, local-time preference persistence, and complete i18n key usage across shell/dashboard/scheduling surfaces.

## Key design decisions

- Keep canonical UTC persistence and server contracts unchanged.
- Present dual framing: church/campus default context plus optional personal-local rendering.
- Persist personal-local preference in the currently accepted local/session boundary.
- Enforce `pt-BR -> en` fallback and eliminate user-facing hardcoded literals in scoped surfaces.
- Reuse existing route-shaped i18n namespaces and shell formatting conventions from ADR 0001.

## UI/system shape

- Time display components receive canonical instant + framing mode.
- User toggle selects canonical framing only vs canonical + personal-local companion display.
- i18n audit targets shell/dashboard/scheduling surfaces with missing-key fallback safety.
- Preference adapter remains local until identity-backed storage is prioritized.

## Risks and mitigations

- Risk: conflating canonical and personal-local meaning.
  - Mitigation: explicit labels and persistent church/campus context cues.
- Risk: incomplete i18n migration leaves mixed literals.
  - Mitigation: namespace audit checklist and key-coverage tests.
- Risk: timezone bugs in toggle rendering.
  - Mitigation: integration tests with fixed UTC fixtures across locale/timezone variants.
