# UI refresh — context & decisions

Captured during Specify (2026-06-20). Resolves gray areas for the Onda brand visual refresh.

## Brand source

- **Provisional Igreja Onda identity** until the official BrandBook ships.
- Palette and typography values come from the brand guide (eyedropper extraction), **not** generic SaaS defaults (no `#6366F1` indigo, no Inter as primary UI font).
- Reference prototype: [serve-well.lovable.app](https://serve-well.lovable.app/) — layout inspiration only.
- **Local clone (2026-06-21):** full Lovable export at [`design-reference/serve-well/`](../../../design-reference/serve-well/) — authoritative for tokens, shell, and dashboard layout during Execute.

## Visual lock from local clone (2026-06-21)

Decisions refined after comparing Slice 1 (#143) preview with the checked-in Lovable export:

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Page background | **`#FAFAFA`** warm white (Lovable `--background`) | Cards read cleaner on neutral wash; `#E4F1FA` kept for **active nav tint** and muted panels |
| Shell implementation | **shadcn `Sidebar` + `SidebarProvider`** (see `AppShell.tsx` in reference) | Matches Lovable; do not keep custom drawer-only shell from early #143 branch |
| Card elevation | **`--shadow-card`** utility from reference `styles.css` | Flat CardHeader-only layout was visually off-spec |
| Volunteer dashboard | **Split nav IA** (locked #143): `/dashboard` = greeting + count + **Time away** preview; `/scheduling` = **2-col assignment card grid** (My Assignments) | See `VolunteerDashboard.tsx` in reference — do not combine on one screen |
| Leader roster | **Event card** with header bar, fill badge, row **Assign/Release** | See `MinistryLeaderDashboard.tsx` in reference |
| Port strategy | **Cherry-pick presentational components** into `apps/web-next` | Keep auth/Query/org/routes from migration spec — do not replace `web-next` with this package |

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
| shadcn Sidebar shell + sticky top bar | **Adopt** (from reference `AppShell`) | UI-BRAND-02 |
| `--shadow-card` on assignment/roster cards | **Adopt** | UI-BRAND-01 |
| 2-col assignment card grid (md+) | **Adopt** | UI-VOL-02 |
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
