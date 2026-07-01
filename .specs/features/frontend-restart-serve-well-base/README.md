# Frontend restart — serve-well + API

**Status:** Planning complete — ready for Execute (T01) (2026-07-01)  
**Supersedes cutover:** [#148](https://github.com/kairan/onda-volunteer/issues/148) — frozen per [ADR 0007](../../../docs/adr/0007-frontend-serve-well-plus-api.md)

## Artifacts

| File | Purpose |
|------|---------|
| [spec.md](./spec.md) | Problem, goals, requirements, phases, salvage matrix |
| [design.md](./design.md) | Package layout, layering, stack, integration |
| [context.md](./context.md) | Pivot decisions, what we abandon, IA lock |
| [tasks.md](./tasks.md) | Atomic Execute tasks |

## Related

| Artifact | Relationship |
|----------|--------------|
| [`design-reference/serve-well/`](../../../design-reference/serve-well/) | **Visual + layout authority** |
| [`.specs/features/frontend-migration-web-next/`](../frontend-migration-web-next/) | **Superseded for cutover** — data-layer modules become copy source only |
| [`.specs/features/ui-refresh-onda-brand/`](../ui-refresh-onda-brand/) | Brand tokens (still valid) |
| [`.specs/features/working-context-picker/`](../working-context-picker/) | Absorbed into Foundation shell (ministério · chapéu) |
| [`apps/web`](../../../apps/web) | Stays production until final cutover |
| [`apps/web-next`](../../../apps/web-next) | Frozen until T17 — salvage data layer; **package deleted at cutover** |

## Package name (Execute)

Default target: **`apps/web-onda`** (new package). Alternative: rename `web-next` in a dedicated PR — decision at T01.
