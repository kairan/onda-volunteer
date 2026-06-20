# UI refresh — context & decisions

Captured during Specify (2026-06-20). Resolves gray areas for the Onda brand visual refresh.

## Brand source

- **Provisional Igreja Onda identity** until the official BrandBook ships.
- Palette and typography values come from the brand guide (eyedropper extraction), **not** generic SaaS defaults (no `#6366F1` indigo, no Inter as primary UI font).
- Reference prototype: [serve-well.lovable.app](https://serve-well.lovable.app/) — layout inspiration only.

## Scope lock (user decision)

| In scope (this feature) | Out of scope (later phases) |
|-------------------------|-----------------------------|
| Volunteer screens | Church Admin dashboard redesign |
| Ministry Leader screens | System Admin operator shell redesign |
| Shared shell tokens (sidebar + top bar) for church roles | New backend APIs unless noted below |
| Replace HOPE visual layer (ADR 0003) | Marketing `/` landing redesign |

Church Admin and System Admin **may** inherit updated tokens passively when shell CSS variables change, but **no new Admin/operator layouts** are required for this deliverable.

## Lovable UX — adopt vs defer

| Lovable pattern | Decision | Requirement ID |
|-----------------|----------|----------------|
| Personal greeting + assignment count summary | **Adopt** | UI-VOL-01 |
| Assignment cards (event, ministry·role, date/time) | **Adopt** | UI-VOL-02 |
| Time away preview on dashboard + full route | **Adopt** (preview on dashboard; keep `/time-away`) | UI-VOL-03 |
| Sidebar: Dashboard · My Assignments · Time Away | **Adopt** | UI-VOL-04 |
| Ministry hero + weekly summary (events, open slots) | **Adopt** | UI-LEAD-01 |
| Roster grouped by event with fill ratio (e.g. 3/5) | **Adopt** | UI-LEAD-02 |
| Per-slot rows: role, volunteer name, Release / Assign | **Adopt** (maps to shipped roster APIs) | UI-LEAD-03 |
| Explicit “Unfilled” slots + Assign CTA | **Adopt** | UI-LEAD-04 |
| Header CTAs: New event · Assign volunteer | **Adopt** (wire to existing flows) | UI-LEAD-05 |
| Volunteer initials avatar on roster rows | **Adopt** (derived from `displayName`, no upload) | UI-LEAD-06 |
| Accept / Decline pending assignment on dashboard | **Defer** — no assignment-confirmation workflow in API/`CONTEXT.md` | — |
| “1 awaiting your response” summary line | **Defer** with Accept/Decline | — |
| Event venue / location on cards | **Defer** — no **Event** venue field | — |
| Global search | **Defer** | — |
| Role switcher dropdown | **Reject for production** — use Church/Campus + account menu | — |
| Admin stat cards & fill-rate KPIs | **Defer** — Church Admin phase | — |

## Typography licensing note

Space Grotesk and Right Grotesk families must be **self-hosted** (same pattern as current `@fontsource/*`). Confirm Right Grotesk license before Execute if files are not already in repo assets.

## ADR impact

- Supersedes **ADR 0003** (HOPE) for visual direction.
- **ADR 0001** shell structure, i18n, WCAG, pessimistic scheduling mutations, and Church/Campus switchers **remain in force** — only visual tokens and component styling change.
