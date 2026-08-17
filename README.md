# Onda Volunteer (issue 01 slice)

Tracer bullet: **Postgres → Prisma → Nest read API → Vite + TanStack Router** for church volunteer scheduling. Canonical **Event** times are stored and returned as **UTC**; the API adds display strings in the **Campus** IANA timezone.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Docker](https://docs.docker.com/get-docker/) (for local Postgres)

## One-time setup

From the repository root:

```bash
docker compose up -d
```

Wait until Postgres is healthy, then:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web-onda/.env.example apps/web-onda/.env
pnpm install
cd apps/api && pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm prisma:seed
```

The seed creates multi-church demo data (`seed-church-demo` as Onda Brasil, `seed-church-norte` as Onda USA, `seed-church-europa` as Onda Europa, `seed-church-japao` as Onda Japão — campuses from [ondadura.com.br/campus](https://www.ondadura.com.br/campus)) and public event `seed-event-public`.

## Supabase Auth (optional)

For email sign-in and JWT-protected API calls, create a free [Supabase](https://supabase.com) project and follow **[docs/runbooks/supabase-auth-local.md](docs/runbooks/supabase-auth-local.md)**. The web app shows a sign-in panel when `VITE_SUPABASE_*` is set; link your user to the demo volunteer with `pnpm link:volunteer-auth -- <uuid>`.

## Run API and web

Two terminals:

```bash
pnpm dev:api
```

```bash
pnpm dev:web-onda
```

Open `http://localhost:5175/`. Dev persona switcher: `/user-select`.

## Tests

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onda?schema=public"
pnpm test
pnpm test:e2e:web-onda   # Playwright: Chromium + seeded API + Vite
```

## Project layout

| Path | Role |
|------|------|
| `apps/api/prisma` | Schema + migrations + seed |
| `apps/api/src/` | Nest bounded contexts |
| `apps/web-onda/` | Production church-role frontend (serve-well + API) |
| `docker-compose.yml` | Local Postgres |

Domain vocabulary lives in `CONTEXT.md`; backlog slices are under `docs/issues/`. Cutover redirects: [`docs/runbooks/web-onda-cutover-redirects.md`](docs/runbooks/web-onda-cutover-redirects.md).
