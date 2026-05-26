# Feature Spec: Personal-local time and i18n closeout (#48)

## Problem statement

Remaining shell and scheduling presentation gaps can still confuse users about canonical church framing versus personal-local display, and some product copy is not fully routed through i18n keys.

## Requirements

- REQ-48-01: Event and Assignment views support personal-local time display without replacing canonical Church/Campus framing.
- REQ-48-02: Personal-local display preference persists for the approved local/session boundary.
- REQ-48-03: Remaining shell, dashboard, and scheduling copy is delivered via i18n keys for `pt-BR` and `en`.
- REQ-48-04: Locale fallback behavior remains `pt-BR -> en`.
- REQ-48-05: UTC persistence for scheduling records remains unchanged.
- REQ-48-06: At least one dual-time display path is covered by automated tests.

## Non-goals

- Redesigning core scheduling data model or persistence semantics.
- Adding additional locales beyond current `pt-BR` and `en`.
- Legacy route retirement (handled under #58).

## Dependencies and blockers

- Blocked by #37 per issue dependency (listed as shipped in architecture tracker).
- Must align with ADR 0001 time/locale posture and PRD timezone rules.
- Depends on existing shell i18n namespace structure.

## Verification approach

- UI/integration tests for local-time toggle and persistence behavior.
- Tests for locale fallback and dual-time rendering.
- Regression tests confirming UTC server payload semantics unchanged.
- Smoke checks for shell/dashboard translation key coverage.
