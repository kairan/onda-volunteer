# 29 — Optional personal-local time presentation

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **4**); `CONTEXT.md`; ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Viewer toggle (account or settings) to present schedule times in the viewer’s personal local timezone **in addition to** active **Church** framing—without mutating persisted **UTC** instants. Applies to **Dashboard** and shell scheduling surfaces delivered in this batch.

## Acceptance criteria

- [ ] Toggle persists for the session (client persistence acceptable until **Identity** preference exists).
- [ ] **Church** default framing remains visible when personal-local is on (not a silent replacement).
- [ ] API payloads remain **UTC**; conversion is presentation-only.
- [ ] Automated test asserts formatted output changes when toggle flips for a fixed instant.

## Blocked by

- Slice **17** — Dashboard upcoming assignments (GitHub **#7**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/19
