# AGENTS.md

## Spec-driven workflow (TLC)

This repo uses **[tlc-spec-driven](.cursor/skills/tlc-spec-driven/SKILL.md)** as the default way to plan and ship work: **Specify → Design → Tasks → Execute** (phases auto-size by scope).

Read **[`.cursor/skills/tlc-spec-driven/ONDA.md`](.cursor/skills/tlc-spec-driven/ONDA.md)** before any TLC phase on this brownfield project — it maps TLC outputs to existing docs and avoids duplicate brownfield maps.

### Documentation map

| TLC / agent need | Use this repo source (do not duplicate) |
|------------------|----------------------------------------|
| Brownfield overlay (v3.1 paths, test matrix, phase loading) | [`.cursor/skills/tlc-spec-driven/ONDA.md`](.cursor/skills/tlc-spec-driven/ONDA.md) |
| Domain language, bounded contexts | [`CONTEXT.md`](CONTEXT.md) |
| Architecture decisions | [`docs/adr/`](docs/adr/) |
| Shipped / planned work, issue specs | [`docs/issues/`](docs/issues/) (`done/` for completed) |
| Architecture tech-debt / fragile seams | [`docs/issues/architecture-debt.md`](docs/issues/architecture-debt.md) |
| Cloud agent runbook | This file (`AGENTS.md`) |
| Feature specs, design, tasks (active work) | `.specs/features/<feature-slug>/` (`spec.md`, `design.md`, `tasks.md`, optional `context.md`, `validation.md`) |
| Vision, roadmap, session memory | `.specs/project/` (`PROJECT.md`, `ROADMAP.md`, `STATE.md`) |
| Pause / resume between sessions | `.specs/HANDOFF.md` |
| Confirmed execution lessons | `.specs/LESSONS.md` (via `.cursor/skills/tlc-spec-driven/scripts/lessons.py`) |

**Brownfield rule (TLC v3.1):** Do **not** generate `.specs/codebase/*`. There is no separate “map codebase” phase — load context through the Knowledge Verification Chain and [ONDA.md](.cursor/skills/tlc-spec-driven/ONDA.md) at Specify, Design, and Tasks.

**Tracker rule:** GitHub Issues remain the execution queue for humans and cloud agents. After TLC **Tasks**, create or update issues from `tasks.md` (see skill routing below). Keep requirement IDs in specs aligned with issue numbers when both exist.

### Skills

**Active:** [`tlc-spec-driven`](.cursor/skills/tlc-spec-driven/SKILL.md) — default for planning, implementation, tests, issue breakdown, and validation on this repo.

**Delivery loop (explicit):** [`agent-delivery-loop`](.cursor/skills/agent-delivery-loop/SKILL.md) — when the user asks to "run the delivery loop", "ship ready issues", or work the `ready-for-agent` queue end-to-end. Orchestrates the pipeline as a gated state machine (update main → branch per issue → plan/execute → PR → wait CI → `ready-for-agent-review` → address feedback → merge → archive doc to `done/` + drop labels). Routes to `tlc-spec-driven` (plan/execute), `address-pr-comments` (review feedback + CI), and `babysit` (conflict-only) instead of reimplementing them. Repo-specific labels/paths live in [config.example.md](.cursor/skills/agent-delivery-loop/config.example.md). Not auto-selected.

**PR review (explicit):** [`address-pr-comments`](.cursor/skills/address-pr-comments/SKILL.md) — when the user asks to address or answer PR comments: load linked TLC feature(s) (`spec.md`, `tasks.md` **Verify** lines), triage in scope, fix, push, reply on threads, summarize. See [tlc-context.md](.cursor/skills/address-pr-comments/tlc-context.md). Not auto-selected for feature work.

**Legacy:** [`.cursor/skills/_legacy/`](.cursor/skills/_legacy/README.md) (`to-issues`, `to-prd`, `triage`, `tdd`, `grill-me`, `grill-with-docs`, `improve-codebase-architecture`). Do **not** load or follow legacy skills unless the user **explicitly** names one (e.g. “use the triage skill”). Otherwise always use **tlc-spec-driven** + `ONDA.md`.

| Former workflow | Use TLC instead |
|-----------------|-----------------|
| PRD / plan → issues (`to-prd`, `to-issues`) | **Specify** → **Tasks** → `gh issue create` from `tasks.md` |
| Issue triage / agent briefs (`triage`) | **Specify** / **Tasks** + GitHub; see `docs/issues/` conventions |
| Test-first dev (`tdd`) | **Execute** + `references/implement.md` + `AGENTS.md` (Running tests) |
| Grill / stress-test plan (`grill-me`, `grill-with-docs`) | **Discuss** during Specify; update `CONTEXT.md` / ADRs when decisions land |
| Architecture deepening (`improve-codebase-architecture`) | **Design** for structural changes; read `CONTEXT.md` + `docs/adr/` |

When the user says **implement**, **design**, **tasks**, **triage**, **TDD**, or **break into issues** without naming a legacy skill, use **tlc-spec-driven** only.

## Cursor Cloud specific instructions

### Overview

Onda Volunteer is a pnpm monorepo (`apps/api` + `apps/web`) for church volunteer scheduling.

- **API** (`apps/api`): NestJS + Prisma + PostgreSQL — `pnpm dev:api` (port 3000)
- **Web** (`apps/web`): React + Vite + TanStack Router — `pnpm dev:web` (port 5173)
- **Database**: PostgreSQL 16 via Docker (`docker compose up -d`)

Standard scripts are in the root `package.json`: `dev:api`, `dev:web`, `test`, `build`.

### CI (GitHub Actions)

PRs and pushes to `main` run:

- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) — parallel `build` (`pnpm build`) and `test` (`pnpm test` with Postgres 16).
- **Web Playwright e2e** ([`.github/workflows/e2e-web.yml`](.github/workflows/e2e-web.yml)) — browser e2e with Postgres + API.

After the first green run on `main`, enable required status checks per [`docs/runbooks/github-branch-protection.md`](docs/runbooks/github-branch-protection.md). Lint/coverage baseline shipped in `docs/issues/done/61-ci-lint-and-coverage.md`.

### GitHub CLI (cloud agents)

Boot runs `.cursor/scripts/cloud-install.sh` from `environment.json` (`pnpm install`, then `gh auth login` when configured).

1. Create a fine-grained GitHub PAT with **Pull requests** and **Issues** read/write on this repo.
2. Add it in [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) as `GH_TOKEN`.
3. Start a **new** cloud agent run after adding or rotating the secret.

`GH_TOKEN` is injected into the agent environment. For tools that expect `GITHUB_TOKEN`, run `export GITHUB_TOKEN="$GH_TOKEN"` in the shell (or add a second secret with that name).

### Starting services

1. Start Docker daemon: `sudo dockerd &>/tmp/dockerd.log &` (wait ~3 s).
2. Start Postgres: `sudo docker compose up -d` (from repo root).
3. Run Prisma migrations: `cd apps/api && pnpm exec prisma migrate deploy && cd ..`
4. Start API: `pnpm dev:api` (uses `AUTH_ALLOW_DEV_HEADERS=true` so no Supabase needed).
5. Start Web: `pnpm dev:web`.

### Authentication bypass

Local dev uses dev-header authentication (`AUTH_ALLOW_DEV_HEADERS=true` in `apps/api/.env`). Send `X-Leader-Ministry-Id` and `X-Volunteer-Id` headers to impersonate a volunteer/leader without Supabase. The web app also sends these automatically when `VITE_AUTH_USE_DEV_HEADERS=true`.

### Running tests

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onda?schema=public"
pnpm test
```

API tests (Jest e2e) apply Prisma migrations and truncate tables between cases. Web unit tests (Vitest) cover design tokens and UI primitives. Browser e2e (Playwright) live in `apps/web/e2e` and start the Vite dev server automatically. Both API and full dashboard Playwright flows require PostgreSQL (and `pnpm dev:api` for dashboard/API-backed UI).

#### Web Vitest behavior tests (RTL)

- Use `@testing-library/user-event` for all user interactions in Vitest + React Testing Library behavior tests (`*.behavior.test.tsx`).
- Do **not** use `fireEvent` from Testing Library to simulate clicks, typing, or keyboard input.
- For controlled inputs that hydrate asynchronously: `const user = userEvent.setup()`, `waitFor` until the field has the expected value, then `user.clear` + `user.type`. See `apps/web/src/routes/ministries.behavior.test.tsx` (rename test ~L116–134).
- Exception: only when `userEvent` cannot model the interaction — add a brief comment in the test explaining why. Keep exceptions rare.

```bash
pnpm --filter @onda/web exec playwright install chromium   # once per machine
pnpm test:e2e:web                                          # smoke + API integration (CI parity)
pnpm --filter @onda/web test:e2e                           # smoke only (Vite, no API)
```

Shipped spec: `docs/issues/done/60-web-playwright-browser-e2e.md`.

### Gotchas

- ESLint: `pnpm lint` (`--max-warnings 0`; required CI gate per #126). Typecheck: `pnpm typecheck:api` / `pnpm typecheck:web`. Coverage: `pnpm test:coverage` enforces global floors per #129 (API Jest e2e, web Vitest).
- API auth context contract: [`docs/runbooks/api-auth-context.md`](docs/runbooks/api-auth-context.md).
- The seed creates an `Unavailability` row blocking the demo volunteer for `seed-ministry-demo` from 15:00-16:00 UTC on 2026-06-07. Assignment creation in that window will be rejected by design.
- `pnpm-workspace.yaml` has `allowBuilds` entries that prevent interactive build prompts during install.
- Prisma warns about deprecated `package.json#prisma` config — this is expected and harmless.
