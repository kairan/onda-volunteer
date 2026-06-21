# Onda brand UI refresh — Specification

## Status

- **Phase:** Specify complete (2026-06-20)
- **Design:** [design.md](./design.md)
- **Decisions:** [context.md](./context.md)
- **Prototype:** [design-reference/serve-well/README.md](../../../design-reference/serve-well/README.md)

## Problem Statement

The signed-in web app uses the **HOPE** brutalist visual layer (ADR 0003): heavy black borders, zero radius, offset stamp shadows, and Montserrat uppercase display type. That reads as a single-church brand statement, not a neutral multi-tenant scheduling product. Stakeholders want a **provisional Igreja Onda** identity (Space Grotesk, brand blues) and **Lovable-validated** Volunteer / Leader UX patterns before the official BrandBook ships.

## Goals

- [ ] Replace HOPE tokens with **Onda brand palette** and **Space Grotesk** UI typography across church-role shell and in-scope routes.
- [ ] **Volunteer** dashboard matches Lovable information architecture: greeting, assignment cards, time-away preview.
- [ ] **Ministry Leader** dashboard / roster views match Lovable patterns: ministry hero, fill ratio, unfilled slots, Assign/Release actions (wired to existing APIs).
- [ ] Preserve ADR 0001 shell behavior (sidebar, i18n, WCAG, pessimistic scheduling, Church/Campus context).
- [ ] pt-BR + en strings for all new/changed copy.

## Out of Scope

| Item | Reason |
|------|--------|
| Church Admin dashboard redesign | Future phase — user lock |
| System Admin operator shell redesign | Future phase — ADR 0005 UX unchanged in v1 |
| Assignment Accept/Decline inbox flow | No API/domain model — see context.md |
| Event venue / location field | Not in **Event** model |
| Global search | Not in product v1 |
| Admin KPI / fill-rate reporting cards | No reporting API |
| Marketing `/` landing redesign | Deferred by ADR 0001 |
| Role-switcher demo dropdown | Production uses composed grants + context switchers |

---

## Requirements — Brand & shell (shared)

### UI-BRAND-01 ⭐ MVP — Design tokens

**User Story**: As any church-role user, I want the app to reflect the provisional Onda brand so the product feels trustworthy and on-brand without HOPE brutalism.

**Acceptance Criteria**:

1. WHEN the signed-in shell loads THEN primary actions SHALL use `#2034D6` with hover `#151BB6`.
2. WHEN inspecting theme variables THEN page background SHALL use `#FAFAFA` (warm white), cards SHALL use `#FFFFFF` with 1px `#A1C1DB` borders, `--shadow-card`, and 8px radius (`--radius: 0.5rem`).
3. WHEN text renders in UI chrome THEN body/nav SHALL use **Space Grotesk** (not Inter/Montserrat as primary).
4. WHEN a display headline appears THEN it MAY use **Right Grotesk** (max 1–2 per screen).
5. WHEN focus moves via keyboard THEN focus ring SHALL be visible and use brand primary (`#2034D6`) with WCAG 2.2 AA contrast.

### UI-BRAND-02 ⭐ MVP — Shell navigation styling

**Acceptance Criteria**:

1. WHEN a nav item is active THEN it SHALL show `#2034D6` left border or `#E4F1FA` background tint.
2. WHEN the sidebar header renders THEN it SHALL show **Onda** wordmark and active **Church** name (tenant), not a generic icon.
3. WHEN the user is on mobile THEN shell behavior SHALL match ADR 0001 (top bar + drawer); styling SHALL use new tokens only.

---

## Requirements — Volunteer

### UI-VOL-01 ⭐ MVP — Personal dashboard header

**User Story**: As a **Volunteer**, I want a personal greeting and assignment summary so I immediately see what’s coming up.

**Acceptance Criteria**:

1. WHEN a **Volunteer** opens `/dashboard` THEN the page SHALL greet them by display name (e.g. “Hi {name}”).
2. WHEN assignments exist for the active **Church** THEN a summary line SHALL show the count of upcoming assignments (e.g. “3 upcoming assignments”).
3. WHEN no assignments exist THEN the summary SHALL state zero upcoming assignments without error.

### UI-VOL-02 ⭐ MVP — Assignment cards

**User Story**: As a **Volunteer**, I want upcoming assignments as scannable cards so I can see event, ministry, role, and time at a glance.

**Acceptance Criteria**:

1. WHEN upcoming assignments load THEN each card SHALL show **Event** title, **Ministry** · **Role**, and localized date/time (campus-authoritative per SCHED-01).
2. WHEN a card is activated THEN navigation SHALL go to `/scheduling/events/$eventId`.
3. WHEN an assignment is rostered THEN a “confirmed” status badge SHALL appear (brand semantic styling — no Accept/Decline in v1).
4. WHEN data is loading THEN skeleton placeholders SHALL appear (layout-stable, brand-muted).

### UI-VOL-03 ⭐ MVP — Time away on dashboard

**User Story**: As a **Volunteer**, I want to see and manage recent **Unavailability** from the dashboard so I don’t hunt through nav for **Time away**.

**Acceptance Criteria**:

1. WHEN the dashboard renders THEN a **Time away** section SHALL list upcoming **Unavailability** rows (date range + optional note) for the signed-in **Volunteer**.
2. WHEN the volunteer clicks **Add period** THEN the flow SHALL open the same create UX as `/time-away` (inline expand or navigate — implementer choice documented in PR).
3. WHEN the volunteer clicks **Edit** or **Delete** on a row THEN the system SHALL reuse existing self-service **Unavailability** API behavior (AVAIL-02).
4. WHEN more periods exist than the preview limit (e.g. 3) THEN a link SHALL navigate to full `/time-away`.

### UI-VOL-04 ⭐ MVP — Volunteer sidebar

**Acceptance Criteria**:

1. WHEN a user has only **Volunteer** grants (no Leader/Admin nav) THEN sidebar SHALL show: **Dashboard**, **My Assignments**, **Time Away**.
2. WHEN **My Assignments** is selected THEN the user SHALL see the full assignment list at `/scheduling` (same `AssignmentCard` component as UI-VOL-02; dashboard shows count summary only).

### UI-VOL-05 P2 — Empty states

1. WHEN there are no upcoming assignments THEN an empty state SHALL use display typography + thin icon (no raster hero), with copy in i18n.

---

## Requirements — Ministry Leader

### UI-LEAD-01 ⭐ MVP — Ministry-scoped leader landing

**User Story**: As a **Leader**, I want a ministry-focused dashboard so I see roster health for the team I steward.

**Acceptance Criteria**:

1. WHEN a **Leader** opens the dashboard with an active **Ministry** context THEN the hero SHALL show the **Ministry** name.
2. WHEN events exist in the next 7 days for that **Ministry** THEN a summary SHALL show event count and count of unfilled **Role** slots across those events.
3. WHEN no events exist THEN copy SHALL explain no upcoming events (empty state).

### UI-LEAD-02 ⭐ MVP — Roster grouped by event with fill ratio

**User Story**: As a **Leader**, I want rosters grouped by **Event** with fill progress so I know where to assign people.

**Acceptance Criteria**:

1. WHEN roster data loads THEN each **Event** SHALL appear as a card/section with title, localized start time, and fill badge (e.g. `3/5 filled`).
2. WHEN a slot has an **Assignment** THEN the row SHALL show **Role**, volunteer display name, and initials avatar derived from name.
3. WHEN a catalog **Role** has no **Assignment** for that **Event** THEN the row SHALL show “Unfilled” and an **Assign** action.

### UI-LEAD-03 ⭐ MVP — Assign and Release actions

**Acceptance Criteria**:

1. WHEN a **Leader** clicks **Assign** on an unfilled slot THEN the system SHALL open the production assign flow (volunteer + role + window) without demo env vars (per #115).
2. WHEN a **Leader** clicks **Release** on another volunteer’s **Assignment** THEN the system SHALL void/remove via leader stewardship API (not volunteer self-release only).
3. WHEN the API rejects an action THEN inline error feedback SHALL appear near the row (ADR 0001 hybrid feedback).

### UI-LEAD-04 ⭐ MVP — Leader header actions

**Acceptance Criteria**:

1. WHEN on the leader dashboard THEN **New event** SHALL navigate to existing private **Event** creation for the active **Ministry**.
2. WHEN **Assign volunteer** is clicked THEN the user SHALL be guided to the next sensible assign surface (next event with open slots or event list — document choice in PR).

### UI-LEAD-05 ⭐ MVP — Leader sidebar

**Acceptance Criteria**:

1. WHEN a user has **Leader** grants THEN sidebar SHALL include: **Dashboard**, **Events**, **Roster**, **Volunteers**, **Time Away** (own unavailability).
2. WHEN a nav item is not applicable to the user’s grants THEN it SHALL not appear (composed permissions, not demo role switcher).

### UI-LEAD-06 P2 — Leader volunteer list entry

1. WHEN **Volunteers** nav is selected THEN the **Leader** SHALL see searchable list of **Active** members in accredited **Ministries** (reuse existing org/volunteer routes where possible).

---

## Requirements — Engineering & quality

### UI-ENG-01 ⭐ MVP — Supersede HOPE

1. WHEN the refresh ships THEN `DESIGN_SYSTEM.md` and theme contract tests SHALL document Onda brand tokens; ADR 0006 SHALL supersede ADR 0003 visually.
2. WHEN HOPE-specific classes remain THEN they SHALL be removed from in-scope routes (offset shadows, 2px black borders, forced uppercase display).

### UI-ENG-02 ⭐ MVP — Tests & CI

1. WHEN PR merges THEN `pnpm lint`, `pnpm typecheck:web`, `pnpm test`, and relevant Playwright smoke SHALL pass.
2. WHEN behavior tests cover dashboard/roster THEN they SHALL use `@testing-library/user-event` (AGENTS.md).

---

## Traceability

| ID | Priority | Primary surfaces |
|----|----------|------------------|
| UI-BRAND-01 | P1 | `theme/`, `styles/`, `components/ui/` |
| UI-BRAND-02 | P1 | `shell/` |
| UI-VOL-01–04 | P1 | `routes/dashboard.tsx`, `routes/timeAway.tsx` |
| UI-VOL-05 | P2 | dashboard empty state |
| UI-LEAD-01–05 | P1 | `routes/dashboard.tsx`, `scheduling*.tsx`, `schedulingEventDetail.tsx` |
| UI-LEAD-06 | P2 | `routes/volunteers.tsx` |
| UI-ENG-01–02 | P1 | repo-wide gates |

## References

- Domain: `CONTEXT.md`
- ADR 0001 (shell, a11y, i18n), ADR 0006 (this refresh)
- Shipped roster UI: `docs/issues/done/115-leader-roster-assignment-ui.md`
- Lovable prototype: https://serve-well.lovable.app/
