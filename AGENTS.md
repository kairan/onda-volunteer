# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Onda Volunteer is a pnpm monorepo (`apps/api` + `apps/web`) for church volunteer scheduling.

- **API** (`apps/api`): NestJS + Prisma + PostgreSQL — `pnpm dev:api` (port 3000)
- **Web** (`apps/web`): React + Vite + TanStack Router — `pnpm dev:web` (port 5173)
- **Database**: PostgreSQL 16 via Docker (`docker compose up -d`)

Standard scripts are in the root `package.json`: `dev:api`, `dev:web`, `test`, `build`.

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

API tests (Jest e2e) apply Prisma migrations and truncate tables between cases. Web tests (Vitest) cover design tokens and UI primitives. Both require PostgreSQL to be running.

### Gotchas

- No ESLint config exists. Use `tsc --noEmit` for type checking. The web app has some pre-existing TS strict errors that don't affect runtime or tests.
- The seed creates an `Unavailability` row blocking the demo volunteer for `seed-ministry-demo` from 15:00-16:00 UTC on 2026-06-07. Assignment creation in that window will be rejected by design.
- `pnpm-workspace.yaml` has `allowBuilds` entries that prevent interactive build prompts during install.
- Prisma warns about deprecated `package.json#prisma` config — this is expected and harmless.
