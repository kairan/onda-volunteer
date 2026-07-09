# Frontend restart — serve-well + API

**Status:** Phase 0–4 shipped (#170–#174); **Execute Phase 5 cutover** ([#175](https://github.com/kairan/onda-volunteer/issues/175), T17)  
**Supersedes cutover:** [#148](https://github.com/kairan/onda-volunteer/issues/148) — frozen per [ADR 0007](../../../docs/adr/0007-frontend-serve-well-plus-api.md)

## Artifacts

| File | Purpose |
|------|---------|
| [spec.md](./spec.md) | Problem, goals, requirements, phases, salvage matrix |
| [design.md](./design.md) | Package layout, layering, stack, integration |
| [context.md](./context.md) | Pivot decisions, what we abandon, IA lock |
| [tasks.md](./tasks.md) | Atomic Execute tasks |
| [validation.md](./validation.md) | Verifier reports (Phases 0–4) |

## Ship records

| Phase | Issue | Done doc |
|-------|-------|----------|
| 0–1 Foundation | [#170](https://github.com/kairan/onda-volunteer/issues/170) | `docs/issues/done/170-web-onda-foundation-phase-0-1.md` |
| 2 Volunteer | [#172](https://github.com/kairan/onda-volunteer/issues/172) | `docs/issues/done/172-web-onda-phase-2-volunteer.md` |
| 3 Leader | [#173](https://github.com/kairan/onda-volunteer/issues/173) | `docs/issues/done/173-web-onda-phase-3-leader.md` |
| 4 Admin | [#174](https://github.com/kairan/onda-volunteer/issues/174) | `docs/issues/done/174-web-onda-phase-4-admin.md` |
| 5 Cutover | [#175](https://github.com/kairan/onda-volunteer/issues/175) | `docs/issues/175-web-onda-phase-5-cutover.md` (active) |

## Related

| Artifact | Relationship |
|----------|--------------|
| [`design-reference/serve-well/`](../../../design-reference/serve-well/) | **Visual + layout authority** |
| [`.specs/features/frontend-migration-web-next/`](../frontend-migration-web-next/) | **Superseded for cutover** — archive at T17 (AD-001) |
| [`.specs/features/ui-refresh-onda-brand/`](../ui-refresh-onda-brand/) | Brand tokens (still valid) |
| [`.specs/features/working-context-picker/`](../working-context-picker/) | Absorbed into Foundation shell (RST-SHELL-01) |
| [`apps/web`](../../../apps/web) | Production until T17 cutover |
| [`apps/web-next`](../../../apps/web-next) | Frozen — **deleted at T17** |

## Package

**`apps/web-onda`** — serve-well presentation + salvaged `web-next` data layer. Dev: `pnpm dev:web-onda` (port 5175).
