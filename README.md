# Onda Volunteer (issue 01 slice)

Tracer bullet: **Postgres → Prisma → Nest read API → Vite + TanStack Router** for a single **Event** with **Church** timezone framing. Canonical **Event** times are stored and returned as **UTC**; the API adds display strings in the **Church** default IANA timezone.

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
cp apps/web/.env.example apps/web/.env
pnpm install
cd apps/api && pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm prisma:seed
```

The seed creates demo church `seed-church-demo` and public event `seed-event-public` (used by the web `.env.example`).

## Supabase Auth (optional)

For email sign-in and JWT-protected API calls, create a free [Supabase](https://supabase.com) project and follow **[docs/runbooks/supabase-auth-local.md](docs/runbooks/supabase-auth-local.md)**. The web app shows a sign-in panel when `VITE_SUPABASE_*` is set; link your user to the demo volunteer with `pnpm link:volunteer-auth -- <uuid>`.

## Run API and web

Two terminals:

```bash
pnpm dev:api
```

```bash
pnpm dev:web
```

Open `http://localhost:5173/`, follow **View demo event**, or browse directly to `http://localhost:5173/events/seed-event-public`.

## Tests (API contract)

Integration tests apply migrations, use the same `DATABASE_URL` as local dev, and truncate tables between cases.

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/onda?schema=public"
pnpm test
```

## Project layout

| Path | Role |
|------|------|
| `apps/api/prisma` | Schema + migrations + seed |
| `apps/api/src/events` | `GET /events/:id` read model |
| `apps/web/src/router.tsx` | TanStack Router tree, event `loader` + page |
| `docker-compose.yml` | Local Postgres |

Domain vocabulary lives in `CONTEXT.md`; backlog slices are under `docs/issues/`.
