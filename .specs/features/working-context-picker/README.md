# Working context picker (ministério + chapéu)

**Status:** Specify draft — absorbed into [frontend-restart-serve-well-base](../frontend-restart-serve-well-base/) Foundation (RST-SHELL-01). Keep for working-context algorithm detail.  
**Created:** 2026-07-01  
**Motivation:** Dual-role users (líder num ministério, voluntário noutro) não são bem servidos pelo shell atual.

## Artifacts

| File | Purpose |
|------|---------|
| [spec.md](./spec.md) | Problema, requisitos, traceability, relatório serve-well resumido |
| [design.md](./design.md) | Modelo técnico, algoritmos, impacto em `web-next` |
| [context.md](./context.md) | Decisões, relação com Lovable, o que rejeitar |

## Related

- Domain: [`CONTEXT.md`](../../../CONTEXT.md) — **Leader** vs **Volunteer** vs **Role**
- Shell baseline: [ADR 0001](../../../docs/adr/0001-visual-system-shell-and-i18n-baseline.md)
- Visual reference: [`design-reference/serve-well/`](../../../design-reference/serve-well/)
- Nav atual: `apps/web-next/src/navigation/manifest.ts`
- Org context: `apps/web-next/src/organization/OrganizationProvider.tsx`
