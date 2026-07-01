# ADR 0007: Frontend — serve-well presentation + API data layer

**Status:** Accepted (2026-07-01)  
**Supersedes:** `frontend-migration-web-next` **cutover** ([#148](https://github.com/kairan/onda-volunteer/issues/148)) — frozen, not cancelled historically  
**Preserves:** [ADR 0001](./0001-visual-system-shell-and-i18n-baseline.md) (shell/i18n/UX), [ADR 0005](./0005-system-admin-operator-role.md), [ADR 0006](./0006-onda-brand-visual-system.md) (tokens)  
**Feature spec:** [`.specs/features/frontend-restart-serve-well-base/`](../../.specs/features/frontend-restart-serve-well-base/)

## Context

`apps/web-next` ported API behavior (TanStack Query, auth, organization, routes) but built UI by cherry-picking Onda tokens onto patterns from `apps/web`. The result did not match the **serve-well** Lovable prototype stakeholders validated. Continuing #148 would ship an rejected visual layer.

The team will **restart the church-role frontend** with presentation copied from `design-reference/serve-well/` and attach the existing REST + Supabase integration as a thin data layer — not another in-place visual port.

## Decision

### Package strategy

1. New package **`apps/web-onda`** (default name) on monorepo stack: **React 19 · Vite · TanStack Router · Tailwind 4 · pnpm · TanStack Query v5**.
2. **Do not** use TanStack Start, Lovable vite config, or Bun for this package.
3. **`apps/web`** remains production until **`web-onda`** reaches route parity and CI gates pass.
4. **`apps/web-next`** is **frozen** immediately (salvage data modules only; no #148 cutover).

### Presentation authority

1. Layout and components originate from **`design-reference/serve-well/`** (`components/onda/`, `components/ui/`, `styles.css`).
2. Tokens and typography follow **ADR 0006** (aligned with serve-well clone).
3. **Reject** Lovable demo patterns: global role dropdown, mock `useRole()`, global search placeholder, mock data in shipped routes.

### Data layer

1. Port **`apiClient`**, auth, organization, leader/volunteer queries, i18n from `apps/web-next` (or `apps/web` where equivalent) — **behavior-preserving**.
2. API contracts and headers unchanged (`Bearer`, `X-Leader-Ministry-Id`, `X-Volunteer-Id`, dev-header retry).
3. Route **URLs** match existing production paths for cutover parity (`/dashboard`, `/scheduling`, …).

### Shell extensions (not in serve-well)

1. **Working context** picker: `{{ministry}} · Líder` / `{{ministry}} · Voluntário` — governs nav and leader API scope (see [working-context-picker](../../.specs/features/working-context-picker/)).
2. Church + Campus switchers per ADR 0001.
3. System Admin remains separate operator shell per ADR 0005.

### Cutover and retirement

When `web-onda` ships:

1. Production deploy targets **`@onda/web-onda`** only.
2. **Delete** `apps/web` and `apps/web-next` from the monorepo (directories, workspace entries, CI jobs, root scripts).
3. Archive TLC `frontend-migration-web-next` per AD-001; keep git history.
4. Replace or archive HOPE-era `DESIGN_SYSTEM.md` with Onda/serve-well summary.

## Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Finish `web-next` cutover (#148) | Visual layer rejected |
| Reskin `apps/web` in place | HOPE entanglement; poor serve-well fidelity |
| Run serve-well Lovable package in CI | Wrong stack; no NestJS integration |
| Keep three frontend packages forever | Operational burden |

## Consequences

- Agents implement **vertical slices**: serve-well screen + live API per route — not horizontal cherry-pick.
- `web-next` shell/routes/`__preview__` are **not** migration sources for UI.
- Theme contract tests target `web-onda` tokens from serve-well `styles.css`.
- ADR index ([README.md](./README.md)) lists 0001, 0004, 0005, 0006, 0007 as active; 0002–0003 archived.

## References

- Prototype: [`design-reference/serve-well/README.md`](../../design-reference/serve-well/README.md)
- Brand: [ADR 0006](./0006-onda-brand-visual-system.md)
- Execute tasks: [`.specs/features/frontend-restart-serve-well-base/tasks.md`](../../.specs/features/frontend-restart-serve-well-base/tasks.md)
