# ADR 0004: Retire legacy `/events/$eventId` detail route

**Status:** Accepted  
**Date:** 2026-05-31  
**Supersedes (partially):** Web PRD story 42 (legacy event detail only) — see [0001](./0001-visual-system-shell-and-i18n-baseline.md)

## Context

The signed-in shell ships roster read/write on **`/scheduling/events/$eventId`**. A parallel legacy demo page at **`/events/$eventId`** duplicated event detail UX outside the shell and kept scheduling links ambiguous (issue **#58**).

ADR **0001** and the web PRD intentionally preserved legacy **`/`** and **`/events/$eventId`** during tracer-bullet work. Shell-native scheduling is now the product path.

## Decision

1. **`/scheduling/events/$eventId`** is the canonical event-detail route for all product flows.
2. **`/events/$eventId`** issues a **client redirect** to the shell route (same `eventId` param). No standalone legacy detail UI remains.
3. Legacy **`/`** demo landing **stays** until a separate product decision replaces it (ADR 0001 short-term dual entry unchanged).

## Consequences

- Agents and runbooks must use shell scheduling URLs for event detail.
- Playwright/Vitest navigation tests target **`/scheduling/events/...`**; legacy URLs may be used only to assert redirect behavior.
- Removing **`/`** is out of scope for this ADR.
