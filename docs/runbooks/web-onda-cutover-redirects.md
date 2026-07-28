# web-onda cutover — URL redirects (#175 / RST-CUT-01)

Production frontend is **`apps/web-onda`** (`@onda/web-onda`). Legacy packages `apps/web` and `apps/web-next` were removed from the monorepo at cutover.

## Deploy entrypoint

| Surface | Value |
|---------|-------|
| Package | `@onda/web-onda` |
| Dev | `pnpm dev:web-onda` → `http://localhost:5175` |
| Build | `pnpm --filter @onda/web-onda build` |
| Preview | `pnpm --filter @onda/web-onda preview` |
| Env template | `apps/web-onda/.env.example` |
| CORS / cookie origin | API `WEB_ORIGIN` must include the web-onda origin (local: `http://localhost:5175`) |

## URL parity vs deleted `apps/web`

Protected app paths are the same as pre-cutover `apps/web` / `apps/web-next`:

| Path | Notes |
|------|-------|
| `/` | Signed-in → `/dashboard`; signed-out → `/auth` |
| `/auth` | Sign-in (web-onda) |
| `/dashboard` | Volunteer / role home |
| `/scheduling` | Volunteer assignments or leader roster (context-dependent) |
| `/scheduling/events/$eventId` | Event detail / roster |
| `/scheduling/events/new` | Create public event |
| `/scheduling/events/new-private` | Create private event |
| `/time-away` | Volunteer unavailability |
| `/leader/volunteer-time-away` | Leader-managed blocks |
| `/ministries`, `/volunteers`, `/ministry-leaders` | Org-admin |
| `/system-admin/*` | Operator shell (ADR 0005) |
| `/user-select` | Dev-only persona switcher |

### Documented redirects (in-app)

| Legacy / bookmark | Target |
|-------------------|--------|
| `/events/$eventId` | `/scheduling/events/$eventId` (client redirect; ADR 0004) |

No additional server redirect map is required when the host already serves `web-onda` at the previous production origin. If a CDN or reverse proxy still points at a deleted Vite app build, point it at the `web-onda` build artifact instead.

## Branch protection (post-merge)

Drop required checks for deleted packages; require:

- `CI / typecheck-web-onda`
- `Web Playwright e2e / playwright-web-onda`

See [`github-branch-protection.md`](./github-branch-protection.md).
