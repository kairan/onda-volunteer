# Frontend restart — serve-well + API

**Status:** Shipped and archived (2026-07-28) — Phase 5 cutover [#175](https://github.com/kairan/onda-volunteer/issues/175) Verifier PASS  
**Supersedes cutover:** [#148](https://github.com/kairan/onda-volunteer/issues/148) — frozen per [ADR 0007](../../../docs/adr/0007-frontend-serve-well-plus-api.md)

Redirect stub: [`.specs/features/frontend-restart-serve-well-base/`](../../features/frontend-restart-serve-well-base/)

## Artifacts

| File | Purpose |
|------|---------|
| [spec.md](./spec.md) | Problem, goals, requirements, phases, salvage matrix |
| [design.md](./design.md) | Package layout, layering, stack, integration |
| [context.md](./context.md) | Pivot decisions, what we abandon, IA lock |
| [tasks.md](./tasks.md) | Atomic Execute tasks |
| [validation.md](./validation.md) | T17 / RST-CUT-01 Verifier report |

## Related

| Artifact | Relationship |
|----------|--------------|
| [`design-reference/serve-well/`](../../../design-reference/serve-well/) | **Visual + layout authority** |
| [`frontend-migration-web-next` (archive)](../frontend-migration-web-next/) | **Superseded for cutover** — data-layer copy source; package deleted at #175 |
| [`.specs/features/ui-refresh-onda-brand/`](../../features/ui-refresh-onda-brand/) | Brand tokens (still valid) |
| [`.specs/features/working-context-picker/`](../../features/working-context-picker/) | Absorbed into Foundation shell (ministério · chapéu) |
| [`apps/web-onda`](../../../apps/web-onda) | Production frontend after #175 |
| [`docs/issues/done/175-web-onda-phase-5-cutover.md`](../../../docs/issues/done/175-web-onda-phase-5-cutover.md) | Cutover ship record |

## Package name

Shipped as **`apps/web-onda`**. Legacy `apps/web` and `apps/web-next` were deleted at cutover (#175).
