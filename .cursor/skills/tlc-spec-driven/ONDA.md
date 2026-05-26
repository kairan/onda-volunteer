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
- When work is ready for the shared queue, run **to-issues** against `spec.md` + `tasks.md`, or create/update issues manually with `gh`.
- Use **triage** only for issue workflow (labels, agent briefs), not for feature planning.

## Tests during Execute

Invoke the **tdd** skill when adding or changing behavior tests. API: Jest e2e with Postgres. Web: Vitest + Playwright per `AGENTS.md`.
