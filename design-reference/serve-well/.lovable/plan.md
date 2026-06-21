
## Church Volunteer Scheduling Dashboard

A single-page dashboard styled as a modern minimal SaaS app: white background, Inter font, indigo accent, subtle card shadows, 6px border radius.

### Layout

```text
┌─────────────┬──────────────────────────────────────────────┐
│             │  Topbar: title + search + user avatar        │
│  Sidebar    ├──────────────────────────────────────────────┤
│  Ministries │  Upcoming Events (list of cards)             │
│  - Worship  │  ┌────────────────────────────────────────┐  │
│  - Kids     │  │ Sunday Service · Jun 22 · 9:00 AM      │  │
│  - Hosp.    │  │ Worship · 12 volunteers needed         │  │
│  - Tech     │  └────────────────────────────────────────┘  │
│  - Outreach │  ...                                         │
│  - Prayer   ├──────────────────────────────────────────────┤
│             │  Roster — Sunday Service, Jun 22             │
│  Settings   │  Table: Name | Role | Ministry | Status      │
└─────────────┴──────────────────────────────────────────────┘
```

### Design tokens (src/styles.css)

- Font: Inter, loaded via `<link>` in `__root.tsx`; `--font-sans: "Inter"`.
- `--radius: 0.375rem` (6px).
- Indigo accent: `--primary` ≈ oklch matching #4f46e5; `--primary-foreground` white.
- Background white, foreground near-black, muted grays for secondary text/borders.
- Card: white with subtle shadow (`0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)`).

### Files

- `src/styles.css` — update tokens (radius 6px, indigo primary, shadow var, Inter as sans).
- `src/routes/__root.tsx` — add Inter `<link>` to head; update title/meta.
- `src/routes/index.tsx` — replace placeholder with dashboard composition.
- `src/components/dashboard/AppSidebar.tsx` — ministries nav using shadcn `Sidebar`.
- `src/components/dashboard/EventList.tsx` — list of event cards (date, time, ministry, volunteer count, status badge).
- `src/components/dashboard/RosterTable.tsx` — shadcn `Table` with Name, Role, Ministry, Status; status as `Badge`.
- Static mock data inline in each component (no backend).

### Components used

shadcn: `sidebar`, `card`, `table`, `badge`, `button`, `input`, `avatar`, `separator`. Lucide icons for ministries (Music, Baby, HandHeart, Monitor, Globe, HeartHandshake).

### Out of scope

No auth, no database, no edit/assign flows — display-only dashboard with mock data.
