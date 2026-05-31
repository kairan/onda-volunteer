# Onda Volunteer — TLC overlay

Repo-specific rules for **tlc-spec-driven** on this brownfield monorepo. Read this file at the start of any TLC workflow here.

## Brownfield: do not fork documentation

The upstream skill may create `.specs/codebase/` (STACK, ARCHITECTURE, etc.). **Skip that on this repo.** Instead load:

| Upstream `.specs/codebase/` intent | Onda source |
|-----------------------------------|-------------|
| Stack, monorepo layout, scripts | [`AGENTS.md`](../../../AGENTS.md), root `package.json`, `apps/api`, `apps/web` |
| Domain model | [`CONTEXT.md`](../../../CONTEXT.md) |
| Architecture decisions | [`docs/adr/`](../../../docs/adr/) |
| Feature history / acceptance specs | [`docs/issues/`](../../../docs/issues/) |
| Testing approach | `AGENTS.md` (Running tests), `apps/api` Jest e2e, `apps/web` Vitest + Playwright |

If `design.md` or `tasks.md` reference `.specs/codebase/CONCERNS.md` or `TESTING.md`, substitute judgment from `docs/issues/`, ADRs, and code review — do not generate empty codebase stubs.

## Feature paths (canonical)

All per-feature artifacts use **one directory**:

```text
.specs/features/<feature-slug>/
├── spec.md       # Specify
├── context.md    # Discuss (optional)
├── design.md     # Design (optional)
└── tasks.md      # Tasks (optional)
```

Use kebab-case slugs (e.g. `leader-manages-unavailability`). Do not write under `.specs/<feature-slug>/` without the `features/` segment.

## Project-level TLC files

| File | Purpose |
|------|---------|
| `.specs/project/PROJECT.md` | Product vision (points at `CONTEXT.md` for domain depth) |
| `.specs/project/ROADMAP.md` | Milestones; link to `docs/issues/` for detail |
| `.specs/project/STATE.md` | Decisions, blockers, deferred ideas across sessions |
| `.specs/HANDOFF.md` | Session pause/resume (overwritten each handoff) |

## GitHub Issues integration

- **Specify / Design / Tasks** live under `.specs/features/` (committed).
- **Execute** happens on a branch; align commits with TLC atomic-commit guidance.
- After **Tasks**, create or update GitHub Issues from `tasks.md` with `gh` (requirement IDs in the spec should match issue numbers when both exist).
- Do **not** invoke legacy [`to-issues`](../_legacy/to-issues/SKILL.md) or [`triage`](../_legacy/triage/SKILL.md) unless the user explicitly names them.

## Tracking “done” on brownfield Onda

When closing a feature, update in order: `tasks.md` checkboxes → `docs/issues/done/<#>-*.md` acceptance criteria → `docs/issues/README.md` row → `.specs/project/ROADMAP.md` if theme status changed → `.specs/project/STATE.md` for decisions/lessons. **Shipped code + README index beat stale TLC checkboxes.** HITL-only rows (e.g. WCAG human sign-off) may stay open in `hitl-signoff.md` after automated gates ship.

## Tests during Execute

Follow **tlc-spec-driven** `references/implement.md` and [`AGENTS.md`](../../../AGENTS.md) (Running tests). API: Jest e2e with Postgres. Web: Vitest + Playwright.

Do **not** invoke legacy [`tdd`](../_legacy/tdd/SKILL.md) unless the user explicitly names it.

## Legacy skills

Skills under [`.cursor/skills/_legacy/`](../_legacy/README.md) are retired from default agent routing. TLC covers their workflows; see `_legacy/README.md` for the mapping.
