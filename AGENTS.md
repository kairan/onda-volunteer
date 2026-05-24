# AGENTS.md

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

After the first green run on `main`, enable required status checks per [`docs/runbooks/github-branch-protection.md`](docs/runbooks/github-branch-protection.md). Deferred lint/coverage: `docs/issues/61-ci-lint-and-coverage.md`.

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

```bash
pnpm --filter @onda/web exec playwright install chromium   # once per machine
pnpm test:e2e:web                                          # smoke + API integration (CI parity)
pnpm --filter @onda/web test:e2e                           # smoke only (Vite, no API)
```

Shipped spec: `docs/issues/done/60-web-playwright-browser-e2e.md`.

### Gotchas

- No ESLint config exists. API: `pnpm --filter @onda/api typecheck`. Web: `tsc --noEmit` in `apps/web` when fixing strict debt — pre-existing errors don't affect runtime or tests.
- The seed creates an `Unavailability` row blocking the demo volunteer for `seed-ministry-demo` from 15:00-16:00 UTC on 2026-06-07. Assignment creation in that window will be rejected by design.
- `pnpm-workspace.yaml` has `allowBuilds` entries that prevent interactive build prompts during install.
- Prisma warns about deprecated `package.json#prisma` config — this is expected and harmless.
