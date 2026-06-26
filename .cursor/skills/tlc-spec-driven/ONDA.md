# Onda Volunteer — TLC brownfield overlay

Repo-specific rules for **tlc-spec-driven v3.1+** on this brownfield monorepo. **Read this file at the start of every TLC phase** before loading upstream references.

## Brownfield model (v3.1)

Upstream v2 had a **Map codebase** phase that wrote seven files under `.specs/codebase/`. **v3.1 removed that.** Brownfield context is loaded continuously via the **Knowledge Verification Chain** (codebase → project docs → Context7 → web → flag uncertain) at Specify, Design, and Tasks — not as a one-time generated folder.

**On Onda Volunteer:**

- **Never** create `.specs/codebase/*` or duplicate stack/architecture/convention docs there.
- **Always** use the canonical sources in this file instead.
- Flag risks in each feature's `design.md` → `## Risks & Concerns` (v3.1 inline concerns — there is no separate `CONCERNS.md`).

---

## Repository at a glance

| Package | Path | Role |
|---------|------|------|
| API | `apps/api` | NestJS + Prisma + PostgreSQL — bounded contexts as modules: `identity/`, `organization/`, `scheduling/`, `events/`, `system-admin/` |
| Web (current) | `apps/web` | React + Vite + TanStack Router — primary shipped UI |
| Web-next (migration) | `apps/web-next` | Strangler migration target; Lovable/HOPE visual layer (see ADR 0006) |
| Web-legacy | `apps/web-legacy` | Frozen reference during migration — do not extend unless a spec explicitly says so |

**Monorepo:** pnpm workspace; root scripts in `package.json` (`build`, `lint`, `test`, `typecheck:*`, `dev:*`, `test:e2e:web*`).

**Database:** PostgreSQL 16 via Docker; Prisma schema `apps/api/prisma/schema.prisma`; migrations under `apps/api/prisma/migrations/`.

**Domain language:** [`CONTEXT.md`](../../../CONTEXT.md) — Identity, Organization, Availability, Scheduling bounded contexts. Treat glossary wording as normative; update `CONTEXT.md` when Specify locks new terms.

---

## Knowledge Verification Chain — Onda sources

When upstream references say "project docs" or "read the codebase", use this table:

| Chain step | Onda source | Load when |
|------------|-------------|-----------|
| **1. Codebase** | Relevant `apps/*` modules, neighboring features, existing tests | Specify (light scan), Design (reuse + concerns), Tasks (test matrix sampling) |
| **2. Project docs** | See table below | Every phase |
| **3. Context7 MCP** | Library/API docs for unfamiliar dependencies | Design research |
| **4. Web search** | Official docs, reputable patterns | Design research |
| **5. Uncertain** | Say so explicitly — never fabricate | Any phase |

### Project docs map (do not duplicate)

| TLC / agent need | Canonical source |
|------------------|------------------|
| Stack, scripts, dev auth, CI, test commands | [`AGENTS.md`](../../../AGENTS.md) |
| Domain model, ubiquitous language | [`CONTEXT.md`](../../../CONTEXT.md) |
| Architecture decisions | [`docs/adr/`](../../../docs/adr/) |
| Shipped / active issue specs, acceptance criteria | [`docs/issues/`](../../../docs/issues/) (`done/` for completed) |
| Architecture tech-debt index (fragile seams) | [`docs/issues/architecture-debt.md`](../../../docs/issues/architecture-debt.md) |
| API auth contract | [`docs/runbooks/api-auth-context.md`](../../../docs/runbooks/api-auth-context.md) |
| Product vision (brief) | [`.specs/project/PROJECT.md`](../../../.specs/project/PROJECT.md) |
| Milestones / themes | [`.specs/project/ROADMAP.md`](../../../.specs/project/ROADMAP.md) |
| Cross-session decisions | [`.specs/project/STATE.md`](../../../.specs/project/STATE.md) → `## Decisions` |
| Session handoff | [`.specs/HANDOFF.md`](../../../.specs/HANDOFF.md) |
| Confirmed execution lessons | `.specs/LESSONS.md` (via lessons script — see below) |
| Active feature work | `.specs/features/<slug>/` |

If upstream `design.md` / `tasks.md` text mentions `.specs/codebase/TESTING.md` or `CONCERNS.md`, substitute **`AGENTS.md`** + **`architecture-debt.md`** + code review — do not generate stubs.

---

## Path overrides (upstream v3.1 → Onda)

Upstream v3.1 uses a flatter `.specs/` layout. **This repo keeps the existing paths:**

| Upstream v3.1 | Onda path | Notes |
|---------------|-----------|-------|
| `.specs/STATE.md` → `## Decisions` | `.specs/project/STATE.md` | Append-only project decisions; use `AD-NNN` format per [memory.md](references/memory.md) for **new** entries (legacy bullet entries may remain) |
| `.specs/STATE.md` → `## Handoff` | `.specs/HANDOFF.md` | Overwritten each pause; section-scoped write — never clobber `STATE.md` decisions |
| `.specs/lessons.json` / `LESSONS.md` | `.specs/lessons.json` / `.specs/LESSONS.md` | Same paths; create on first lesson |
| `scripts/lessons.py` | `.cursor/skills/tlc-spec-driven/scripts/lessons.py` | Run from **repo root** |

**Lessons commands** (repo root):

```bash
python3 .cursor/skills/tlc-spec-driven/scripts/lessons.py list --status confirmed
python3 .cursor/skills/tlc-spec-driven/scripts/lessons.py init   # first use only
```

When upstream says "read `.specs/STATE.md`", read **decisions** from `.specs/project/STATE.md` and **handoff** from `.specs/HANDOFF.md` on resume. Do not migrate to `.specs/STATE.md` without an explicit repo decision.

---

## Phase-by-phase loading (Onda)

### Specify

1. Load confirmed lessons (command above).
2. Light codebase scan — neighboring routes/modules/tests for the feature area.
3. Read linked `docs/issues/<#>-*.md` when the feature maps to a GitHub issue.
4. Skim `CONTEXT.md` for terms the feature touches.
5. Run implicit-requirement dimensions sweep per upstream [specify.md](references/specify.md).

### Design

1. Read feature `spec.md` (+ `context.md` if present).
2. Read `.specs/project/STATE.md` **Decisions** — conform or supersede with new `AD-NNN`.
3. Load confirmed lessons again for Large/Complex.
4. Walk Knowledge Verification Chain; capture findings in `## Risks & Concerns` in `design.md`.
5. Check `docs/adr/` and `architecture-debt.md` for seams the feature crosses.

### Tasks

1. Read `design.md`.
2. Generate **Test Coverage Matrix**, **Parallelism Assessment**, and **Gate Check Commands** per [tasks.md](references/tasks.md) — sample Onda tests and cite `AGENTS.md` as the guidelines source.

**Onda test matrix defaults** (confirm in each feature's `tasks.md`):

| Layer | Type | Location pattern | Run command |
|-------|------|------------------|-------------|
| API domain | unit | `apps/api/src/**/*.test.ts` | `pnpm --filter @onda/api exec jest --config ./test/jest-unit.json` |
| API HTTP | e2e (Jest + Postgres) | `apps/api/test/*.e2e-spec.ts` | `pnpm --filter @onda/api test` (unit + e2e `--runInBand`) |
| Web UI | unit / behavior (Vitest + RTL) | `apps/web/src/**/*.test.ts(x)`, `*.behavior.test.tsx` | `pnpm --filter @onda/web test` |
| Web browser | e2e (Playwright) | `apps/web/e2e/*.spec.ts` | `pnpm test:e2e:web` (CI parity) or `pnpm --filter @onda/web test:e2e` (smoke) |
| Web-next | same patterns | `apps/web-next/` | `pnpm --filter @onda/web-next test` / `pnpm test:e2e:web-next` |

**Parallelism:** API Jest e2e truncates shared Postgres tables between cases → **not parallel-safe** (`--runInBand`). Web Vitest/Playwright: infer from existing config; default sequential when unsure.

**Gate commands** (typical):

| Gate | Command |
|------|---------|
| Quick (web-only task) | `pnpm --filter @onda/web test` |
| Full (API + web) | `export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onda?schema=public && pnpm test` |
| Build + lint (phase end) | `pnpm lint && pnpm build` |
| Coverage (when spec requires) | `pnpm test:coverage` |

RTL behavior tests: use `@testing-library/user-event`, not `fireEvent` — see `AGENTS.md`.

### Execute

Follow [implement.md](references/implement.md) + `AGENTS.md` (Running tests). One atomic commit per task.

After the **last** task: **Verifier always runs** (author ≠ verifier) → writes `.specs/features/<slug>/validation.md` → distills lessons if signals present. See [sub-agents.md](references/sub-agents.md) / [validate.md](references/validate.md).

### Memory (pause / resume / decisions)

Follow [memory.md](references/memory.md) with Onda paths above. **Section-scoped writes are mandatory** — pausing updates only `HANDOFF.md`; design decisions append only to `STATE.md` Decisions.

---

## Feature paths (canonical)

```text
.specs/features/<feature-slug>/
├── spec.md         # Specify
├── context.md      # Discuss (optional)
├── design.md       # Design (optional) — includes ## Risks & Concerns
├── tasks.md        # Tasks (optional) — includes test matrix sections
└── validation.md   # Verifier report after Execute
```

Use kebab-case slugs; prefer `<issue>-<slug>` when tied to GitHub (e.g. `58-web-retire-legacy-event-routes`). Do not write under `.specs/<slug>/` without the `features/` segment.

---

## GitHub Issues integration

- **Specify / Design / Tasks** live under `.specs/features/` (committed).
- **Execute** on a feature branch; atomic commits per task.
- After **Tasks**, create or update GitHub Issues from `tasks.md` with `gh`; align requirement IDs with issue numbers when both exist.
- Label **`ready-for-agent`** when blockers are cleared (`docs/issues/README.md`).
- Do **not** invoke legacy [`to-issues`](../_legacy/to-issues/SKILL.md) or [`triage`](../_legacy/triage/SKILL.md) unless the user explicitly names them.

---

## Tracking “done” on brownfield Onda

When closing a feature, update in order:

1. `tasks.md` checkboxes
2. `docs/issues/done/<#>-*.md` acceptance criteria
3. `docs/issues/README.md` row
4. `.specs/project/ROADMAP.md` if theme status changed
5. `.specs/project/STATE.md` for new project-level decisions

**Shipped code + README index beat stale TLC checkboxes.** HITL-only rows (e.g. WCAG human sign-off in `hitl-signoff.md`) may stay open after automated gates ship.

---

## Legacy skills

Skills under [`.cursor/skills/_legacy/`](../_legacy/README.md) are retired from default routing. TLC v3.1 covers their workflows; see `_legacy/README.md` for the mapping. Do **not** invoke legacy [`tdd`](../_legacy/tdd/SKILL.md) unless the user explicitly names it.
