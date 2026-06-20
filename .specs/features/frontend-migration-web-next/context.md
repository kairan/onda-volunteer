# Frontend migration — context & decisions

Captured during Specify (2026-06-20). Locks the scope for the `web-next` rebuild and its relationship to `ui-refresh-onda-brand`.

## Why a rebuild instead of the in-place refresh

`ui-refresh-onda-brand` was specified as a **re-skin of the existing `apps/web`** (preserve shell, reuse routes/APIs, swap tokens). The user has decided to instead **rebuild the frontend from scratch** to also modernize the data layer and shed accumulated HOPE-era structure. The refresh is **not discarded** — it becomes the **design source** consumed by the rebuild.

| Concern | Resolution |
|---------|------------|
| `ui-refresh-onda-brand` overlap | Reused as design/UX authority (tokens, typography, Volunteer/Leader layouts). Not re-specified here. |
| Stack | **Unchanged** — React 19 + Vite 6 + TanStack Router + Tailwind 4 + i18next |
| Migration strategy | **Parallel app (strangler):** new `apps/web-next`, migrate route-by-route, `apps/web` stays green until cutover |
| Data layer | **Rewrite** — adopt **TanStack Query** (queries, mutations, cache/invalidation); keep pessimistic scheduling mutations (ADR 0001) |
| System Admin + org-admin | **Port functionally** with neutral inherited Onda tokens; visual redesign deferred to a future phase |

## Keep vs rebuild (current `apps/web/src`)

| Layer | Modules | Migration treatment |
|-------|---------|---------------------|
| **Domain/data contract** | `apiAuthHeaders`, `apiError`, `sessionToken`, `auth/`, `identity/`, `organization/`, `events/`, `settings/`, `feedback/`, `i18n/`, `navigation/manifest` | Behavior-preserving **port onto TanStack Query** (re-express, do not blindly copy) |
| **Visual / HOPE (ADR 0003)** | `components/ui/*`, `shell/*`, `routes/*.tsx`, `styles/globals.css`, `theme/tokens.ts` (HOPE vars), `DESIGN_SYSTEM.md`, legacy `/` landing | **Rebuild** on Onda tokens; do not carry forward |
| **Out-of-design routes** | `system-admin/*` (ADR 0005), `ministries`, `volunteers`, `ministryLeaders`, event-create flows | **Functional port**, neutral tokens, redesign later |

## Scope tension noted during Specify

The Onda design (ADR 0006 / `ui-refresh-onda-brand`) covers **Volunteer + Leader only**. A from-scratch app must still ship **every** existing route for parity, so System Admin and org-admin screens are in **migration scope** even though they are out of **design scope**. They render with shell/token defaults until a future design phase.

## Risks / open items for Design phase

- **Right Grotesk license** — confirm before Execute (else Space Grotesk fallback per ADR 0006).
- **Cutover mechanics** — decide whether final step renames `web-next` → `web` or repoints deploy; affects CI workflow paths.
- **Query/loader boundary** — TanStack Router loaders vs TanStack Query: pick one ownership model for server reads and document it in `design.md`.
- **Coverage floors** — `web-next` must meet the global floors (#129) before cutover; plan test porting per route slice.
- **Dual CI cost** — running gates for both `apps/web` and `apps/web-next` until cutover; keep migration window tight.

## ADR impact

- No new ADR required to start; this migration **executes** ADR 0006 on a new base. If the data-layer rewrite (TanStack Query) or the strangler/cutover approach is deemed an architectural decision worth recording, add an ADR during Design.
