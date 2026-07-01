# Architecture Decision Records (ADR)

Index of **active** decisions for the Onda Volunteer monorepo. Read this first before implementing frontend or shell work.

## Active ADRs (use these)

| ADR | Topic | When to read |
|-----|-------|--------------|
| [0001](./0001-visual-system-shell-and-i18n-baseline.md) | Shell layout, i18n, a11y, scheduling UX (pessimistic mutations, toasts) | Any signed-in route, org switchers, translations |
| [0004](./0004-retire-legacy-event-detail-route.md) | Canonical event detail URL | Links, tests, redirects |
| [0005](./0005-system-admin-operator-role.md) | System Admin operator grant + `/system-admin/*` | Operator APIs and pages |
| [0006](./0006-onda-brand-visual-system.md) | Onda brand tokens, typography, Volunteer/Leader UX patterns | All visual work |
| [0007](./0007-frontend-serve-well-plus-api.md) | **Current frontend strategy:** serve-well UI + API layer → `apps/web-onda` | New frontend Execute; supersedes web-next cutover |

## Visual + layout reference (not an ADR)

| Resource | Role |
|----------|------|
| [`design-reference/serve-well/`](../../design-reference/serve-well/) | Lovable clone — **layout authority** for `web-onda` |
| [`.specs/features/frontend-restart-serve-well-base/`](../../.specs/features/frontend-restart-serve-well-base/) | Execute spec, tasks, salvage matrix |
| [`.specs/features/working-context-picker/`](../../.specs/features/working-context-picker/) | Ministério · chapéu shell control |

## Archived ADRs (history only)

| ADR | Topic | Superseded by |
|-----|-------|---------------|
| [0002](./archive/0002-lamborghini-inspired-brand-layer.md) | Lamborghini brand layer | 0006 |
| [0003](./archive/0003-hope-design-system-replaces-lamborghini.md) | HOPE brutalism | 0006 |

Stubs at `0002-*.md` and `0003-*.md` in this folder redirect to `archive/`.

## Historical docs

| Doc | Status |
|-----|--------|
| [`DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) | HOPE era — historical; use ADR 0006 + serve-well |
| [`.specs/features/frontend-migration-web-next/`](../../.specs/features/frontend-migration-web-next/) | Frozen — data-layer salvage only |

## Domain language

Product terms (**Church**, **Leader**, **Role**, **Assignment**, …): [`CONTEXT.md`](../../CONTEXT.md) — not replaced by ADRs.

## Adding a new ADR

1. Next number: `0008-...`
2. Update this README active table
3. Link from relevant `.specs/features/*/spec.md` if tied to a feature slice
