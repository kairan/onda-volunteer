# Design: Admin creates Public Event (#42)

## Scope

Define the end-to-end creation path for Public events under accredited Admin authority, preserving single-church ownership and UTC persistence with church/campus-local presentation.

## Key design decisions

- Use existing accreditation checks as the authorization gate at command entry.
- Keep event persistence model unchanged (UTC instants + church ownership foreign key).
- Validate church ownership and accreditation before any event write.
- Reuse current timezone presentation helpers in web shell forms and previews.
- Keep API error contract stable for out-of-scope accreditation attempts.

## API/application shape

- Command input: church id, optional campus id, event metadata, start/end instants.
- Pre-write guards: church accreditation, single-church scope, time window validity.
- Persistence: write UTC event interval and ownership context.
- Output: event read model used by scheduling hub.

## Risks and mitigations

- Risk: timezone confusion in form UX.
  - Mitigation: explicit church/campus timezone labels and preview copy.
- Risk: accidental cross-church creation.
  - Mitigation: hard server-side accreditation + ownership checks.
- Risk: copy ambiguity for accreditation failures.
  - Mitigation: HITL review with exact error and helper copy.
