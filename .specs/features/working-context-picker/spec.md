# Working context picker — Specification

**Status:** Specify draft (2026-07-01)  
**Design:** [design.md](./design.md)  
**Decisions:** [context.md](./context.md)  
**Visual reference:** [`design-reference/serve-well/`](../../../design-reference/serve-well/) (layout only — not role dropdown)

---

## Part A — Relatório `serve-well` (referência de frontend)

### A.1 O que é o repositório

**serve-well** é um protótipo Lovable exportado para `design-reference/serve-well/` no monorepo. Nome do produto na UI: **Onda · Church Volunteer Scheduling**. É **UI-first com dados mockados** — não substitui `apps/web` nem `apps/web-next`.

| Dimensão | serve-well | onda-volunteer (`apps/web-next`) |
|----------|------------|----------------------------------|
| Propósito | Referência visual / UX | App de produção |
| Backend | Supabase Auth (schema vazio) | API NestJS + Prisma |
| Dados | Arrays estáticos inline | TanStack Query + REST |
| Papéis | Dropdown demo global | Grants por ministério + org admin |
| i18n | EN hardcoded | pt-BR (default) + en |
| Testes | Nenhum | Vitest, Playwright, theme contract |

**Live:** [serve-well.lovable.app](https://serve-well.lovable.app/)

### A.2 Stack (referência)

- React 19, TanStack Start (SSR), TanStack Router, TanStack Query (infra no root)
- Tailwind CSS 4, shadcn/ui (`new-york`), lucide-react, sonner
- Supabase auth (magic link + test user)
- Vite 8 via `@lovable.dev/vite-tanstack-config`, Bun lockfile
- Design tokens em `design-reference/serve-well/src/styles.css`

### A.3 Estrutura de pastas (referência)

```
design-reference/serve-well/src/
├── routes/                 # 22 rotas file-based
├── components/
│   ├── onda/               # AppShell, AppSidebar, dashboards, modals, WeekTimeline
│   └── ui/                 # ~45 primitivos shadcn
├── lib/                    # auth, role (demo), campus (mock), utils
├── integrations/supabase/
├── styles.css              # Fonte da verdade visual Onda
└── routes/__root.tsx       # Providers + AuthGate
```

### A.4 Design system Onda (extraído do clone)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary` | `#2034D6` | Botões, links, focus ring |
| `--foreground` | `#181A43` | Texto |
| `--background` | `#FAFAFA` | Fundo da página |
| `--muted` | `#E4F1FA` | Painéis, header de cards |
| `--radius` | `0.5rem` | Cantos |
| `--shadow-card` | sombra navy sutil | Cards |
| UI font | Space Grotesk | Corpo, nav, forms |
| Display | Right Grotesk | 1–2 headlines por ecrã (`font-display`) |

Padrões de card: `rounded-lg border border-border shadow-card`.

### A.5 Rotas no protótipo vs produto

| Lovable URL | Conteúdo | Produto `web-next` |
|-------------|----------|-------------------|
| `/` | Dashboard por demo role | `/dashboard` |
| `/assignments` | Assignments voluntário | `/scheduling` (My Assignments) |
| `/time-away` | Time away | `/time-away` |
| `/events`, `/roster` | Leader | `/scheduling` (leader), event detail |
| `/scheduling` | Admin calendário | org-admin (fase futura) |
| `/system-admin/*` | Operator | `/system-admin/*` (port funcional) |

**IA de nav volunteer (produto):** Dashboard + My Assignments + Time Away — **não** combinar tudo num ecrã como no Lovable single dashboard.

### A.6 Componentes-chave a portar (presentational)

| Referência | Destino | Notas |
|------------|---------|-------|
| `styles.css` | `apps/web-next/src/styles/globals.css` | Theme contract test |
| `onda/AppShell.tsx` | `shell/AppShell.tsx` | Sem role switcher demo |
| `onda/AppSidebar.tsx` | `shell/ChurchAppSidebar.tsx` | Wire `buildNavForGrants` → **working context** (esta spec) |
| `dashboards/VolunteerDashboard.tsx` | `/dashboard` + `/scheduling` | Split IA; sem Accept/Decline |
| `dashboards/MinistryLeaderDashboard.tsx` | `LeaderSchedulingPage` | Roster + fill badge |
| `onda/modals.tsx` | dialogs de domínio | Wire a mutations reais |
| `onda/WeekTimeline.tsx` | componente partilhado | Dados reais depois |

### A.7 O que NÃO portar do Lovable

- Role switcher dropdown (demo)
- Global search (placeholder)
- Accept/Decline em assignments
- Location/venue em cards
- `useRole()` / `RoleProvider` demo
- URLs de fontes `/__l5e/assets-v1/...` (self-host)
- Dados mock como fonte de verdade

---

## Part B — Problema no produto atual

### B.1 Cenário

Utilizador **Maria**:

- **Líder** do ministério Louvor (`isLeader: true`)
- **Voluntária ativa** no ministério Kids (`membershipStatus: ACTIVE`)

Ela precisa:

1. Gerir roster / assign em **Louvor**
2. Ver **as suas escalas** em Kids (e noutros ministérios onde serve)

### B.2 Comportamento atual (`web-next`)

| Mecanismo | Comportamento | Problema |
|-----------|---------------|----------|
| `buildNavForGrants` | Se `any(isLeader)` → nav de líder; esconde `myAssignments` | Maria perde “My Assignments” no sidebar |
| `/scheduling` | `useSchedulingViewRole`: leader se `any(isLeader)` | Maria vê sempre roster de líder, nunca suas assignments |
| Ministry dropdown | Só `activeMinistryId`; não muda **modo** | Escolher Kids não a põe em “modo voluntário” |

### B.3 Objetivo desta feature

Introduzir **Working context** — combinação explícita `{ ministryId, mode: 'leader' | 'volunteer' }` — que governa nav, rotas e header `X-Leader-Ministry-Id`.

---

## Part C — Requirements

### CTX-FND-01 ⭐ MVP — Tipos e opções de contexto

**User story:** Como developer, quero derivar opções de contexto a partir do payload de organização para não duplicar regras de grants.

**Acceptance criteria:**

1. WHEN `buildWorkingContextOptions(ministries)` runs THEN it SHALL emit one `leader` option per ministry where `isLeader === true` (non-archived unless admin/sysadmin sees archived).
2. WHEN a ministry has `isLeader === true` THEN it SHALL NOT also emit a `volunteer` option for that ministry.
3. WHEN `membershipStatus === 'ACTIVE'` and not leader THEN it SHALL emit one `volunteer` option.
4. WHEN `membershipStatus` is `PENDING` or `INACTIVE` THEN it SHALL emit no option for that ministry.
5. WHEN options are sorted THEN leader options SHALL precede volunteer options; ties broken by ministry name locale `pt-BR`.

### CTX-FND-02 ⭐ MVP — Resolver contexto ativo

**Acceptance criteria:**

1. WHEN stored `WorkingContext` matches a current option THEN it SHALL be selected.
2. WHEN stored context is stale (church changed, grant revoked) THEN it SHALL fall back via `resolveWorkingContext` (see design.md).
3. WHEN exactly one option exists THEN that option SHALL be auto-selected without requiring user action.
4. WHEN zero options exist THEN `workingContext` SHALL be `null` (org-admin-only users).

### CTX-SHELL-01 ⭐ MVP — UI “Atuar como”

**User story:** Como utilizador dual-role, quero um dropdown que mostre ministério + chapéu.

**Acceptance criteria:**

1. WHEN user has ≥2 working context options THEN shell SHALL show dropdown labeled `shell:workingContextLabel` (“Atuar como”).
2. WHEN an option is selected THEN label SHALL render as `{{ministry}} · Líder` or `{{ministry}} · Voluntário` (i18n keys `shell:context.leader` / `shell:context.volunteer`).
3. WHEN user has 1 option THEN shell MAY show static label (no dropdown) or collapsed control.
4. WHEN user has 0 options THEN ministry/working picker SHALL be hidden.
5. WHEN picker changes THEN toast MAY confirm `shell:contextSwitched` (optional, ADR 0001 hybrid feedback).

### CTX-SHELL-02 ⭐ MVP — Substituir ministry-only switcher

**Acceptance criteria:**

1. WHEN working context picker is shown THEN legacy **Ministry-only** select in `OrganizationContextControls` SHALL be removed from church shell.
2. Church and Campus switchers SHALL remain unchanged (ADR 0001).
3. `activeMinistryId` on `useOrganization()` SHALL equal `workingContext.ministryId` when context is non-null (backward compat for leader pages).

### CTX-NAV-01 ⭐ MVP — Nav por contexto ativo

**Acceptance criteria:**

1. WHEN `workingContext.mode === 'volunteer'` THEN nav SHALL include `VOLUNTEER_NAV` (dashboard, myAssignments, timeAway).
2. WHEN `workingContext.mode === 'leader'` THEN nav SHALL include `LEADER_NAV` (dashboard, scheduling, roster, volunteers, timeAway) per manifest.
3. WHEN user is dual-role globally but active context is volunteer THEN `myAssignments` SHALL appear even if user leads another ministry.
4. WHEN `isOrgAdmin` THEN `ADMIN_NAV` items SHALL append regardless of working context mode.
5. Nav deduplication rules SHALL remain (one `/scheduling` path in merged nav per mode set).

### CTX-ROUTE-01 ⭐ MVP — `/scheduling` role branch

**Acceptance criteria:**

1. WHEN `workingContext.mode === 'leader'` THEN `/scheduling` SHALL render `LeaderSchedulingPage` scoped to `workingContext.ministryId`.
2. WHEN `workingContext.mode === 'volunteer'` OR context is null with volunteer nav THEN `/scheduling` SHALL render `VolunteerMyAssignmentsPage`.
3. `useSchedulingViewRole` based on `any(isLeader)` SHALL be removed.

### CTX-DATA-01 ⭐ MVP — API scope para líder

**Acceptance criteria:**

1. WHEN `workingContext.mode === 'leader'` THEN leader mutations/queries SHALL send `X-Leader-Ministry-Id: workingContext.ministryId`.
2. WHEN `workingContext.mode === 'volunteer'` THEN leader header SHALL NOT be sent.
3. A shared `useApiScope()` (or equivalent) SHALL centralize this; leader pages stop inferring scope from ambiguous `activeMinistryId` alone.

### CTX-PERSIST-01 ⭐ MVP — Persistência

**Acceptance criteria:**

1. Working context SHALL persist per `activeChurchId` in localStorage (`onda:activeWorkingContext:${churchId}`).
2. Legacy `onda:activeMinistryId` MAY be read as migration fallback once.
3. WHEN church changes THEN context SHALL re-resolve for new church (no cross-tenant ministry id).

### CTX-REDIRECT-01 — Rotas incompatíveis

**Acceptance criteria:**

1. WHEN context switches from leader → volunteer while on leader-only route (`/volunteers`, leader time-away tools) THEN app SHALL redirect to `/dashboard` or first nav item.
2. WHEN context switches volunteer → leader while on `/scheduling` THEN same path MAY stay (content swaps).
3. Org-admin routes (`/ministries`, etc.) SHALL NOT redirect on context change.

### CTX-ENG-01 ⭐ MVP — Testes

**Acceptance criteria:**

1. Unit tests for `buildWorkingContextOptions` covering dual-role, leader-only, volunteer-only, pending, leader+member same ministry.
2. Unit tests for `buildNavForWorkingContext` covering dual-role volunteer context keeps `myAssignments`.
3. Unit tests for `resolveWorkingContext` stale/migration paths.
4. Behavior test: switch context updates nav items visible in shell (optional slice 2).

---

## Part D — Traceability

| ID | Priority | Primary surfaces |
|----|----------|------------------|
| CTX-FND-01..02 | P1 | `organization/workingContext.ts` |
| CTX-SHELL-01..02 | P1 | `shell/OrganizationContextControls.tsx`, `AppShell.tsx` |
| CTX-NAV-01 | P1 | `navigation/manifest.ts` |
| CTX-ROUTE-01 | P1 | `routes/scheduling.tsx`, `LeaderSchedulingPage.tsx` |
| CTX-DATA-01 | P1 | `api` scope helper, leader mutations |
| CTX-PERSIST-01 | P1 | `organizationContextStorage.ts`, `OrganizationProvider.tsx` |
| CTX-REDIRECT-01 | P2 | `AppShell` or router guard |
| CTX-ENG-01 | P1 | `*.test.ts` |

---

## Part E — Exemplos de opções por utilizador

| Utilizador | Grants | Opções no picker |
|------------|--------|------------------|
| Maria | Líder Louvor; Active Kids, Hospitality | Louvor · Líder; Hospitalidade · Voluntário; Kids · Voluntário |
| João | Active Kids, Louvor | Kids · Voluntário; Louvor · Voluntário |
| Ana | Líder Louvor + Kids | Kids · Líder; Louvor · Líder |
| Pedro | Org admin only | (vazio — nav admin) |
| Sara | Líder Louvor; Pending Kids | Louvor · Líder |

---

## Part F — Plano de implementação sugerido

| Slice | Entregável | Depende de |
|-------|------------|------------|
| 1 | `workingContext.ts` + testes FND | — |
| 2 | `OrganizationProvider` + storage PERSIST | 1 |
| 3 | `buildNavForWorkingContext` + AppShell NAV | 2 |
| 4 | `/scheduling` + `useApiScope` ROUTE/DATA | 2 |
| 5 | Redirect + polish REDIRECT | 3–4 |
| 6 | Remover ministry dropdown legado SHELL-02 | 3 |

**Sem mudanças de API** na slice 1–4.

---

## References

- [ui-refresh context.md](../ui-refresh-onda-brand/context.md) — Lovable adopt/defer table
- [frontend-migration spec.md](../frontend-migration-web-next/spec.md) — MIG-FND-03 shell
- [`CONTEXT.md`](../../../CONTEXT.md) — Leader vs Volunteer vs Role
- [`design-reference/serve-well/README.md`](../../../design-reference/serve-well/README.md)
