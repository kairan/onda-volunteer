# HITL visual sign-off — web-next Slice 1 (#143)

Manual brand checkpoint for T13.5 mock-data previews. **Do not mark items complete until a human has compared side-by-side at 1440px viewport width.**

## Setup

1. Start web-next: `pnpm dev:web-next` (default port 5174).
2. Use dev-header auth or existing dev bypass so shell routes load.
3. Set browser viewport to **1440×900** (or equivalent 1440px-wide layout).
4. Reference north star (read-only): `design-reference/serve-well/` — run separately if needed for side-by-side.

### Scheduling role previews (same URL, different views)

| View | URL |
|------|-----|
| Volunteer — My assignments | `/scheduling?previewRole=volunteer` |
| Leader — ministry roster | `/scheduling` or `/scheduling?previewRole=leader` |

Volunteer dashboard home: `/dashboard`

## Checklist

### `/dashboard` (volunteer home)

- [ ] Greeting + assignment-count summary matches `design-reference/serve-well/src/components/onda/dashboards/VolunteerDashboard.tsx` intent (time-away section present; assignment cards live on `/scheduling` per nav IA)
- [ ] Time away list + Add period CTA layout and spacing
- [ ] Empty/skeleton sample variants visible in dashed preview section
- [ ] Card shadow (`--shadow-card`), border radius, and border tokens match Onda reference
- [ ] Primary color and typography (Space Grotesk) feel consistent with reference

### `/scheduling?previewRole=volunteer` (My assignments)

- [ ] 2-column assignment card grid at 1440px
- [ ] Assignment cards use `shadow-card`, confirmed badge, event/ministry/role hierarchy
- [ ] Heading copy and spacing vs volunteer assignment section in Lovable reference
- [ ] No leader-only elements (roster fill badge, Assign/Release row actions)

### `/scheduling` or `?previewRole=leader` (leader roster)

- [ ] Ministry hero + summary line + header CTAs vs `design-reference/serve-well/src/components/onda/dashboards/MinistryLeaderDashboard.tsx`
- [ ] Roster event cards with `X/Y filled` badge
- [ ] Per-row Assign / Release actions (non-functional OK)
- [ ] Avatar initials and unfilled row styling

### Onda tokens (all routes above)

- [ ] Primary (`--primary`) matches brand intent
- [ ] Card shadow (`--shadow-card`) — no HOPE offset shadows
- [ ] Border radius (`--radius` / `rounded-lg` on cards) consistent
- [ ] Space Grotesk loaded; no Montserrat / HOPE typography

## Sign-off

| Reviewer | Date | Notes |
|----------|------|-------|
| | | |

**#143 closed 2026-06-21** after automated gates (build, typecheck, Vitest). Checklist rows below remain for optional human brand review before Slice 2 Execute ([#144](https://github.com/kairan/onda-volunteer/issues/144)); they do not block the migration tracker.
