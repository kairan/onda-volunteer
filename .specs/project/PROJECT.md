# Onda Volunteer

**Vision:** Church volunteer scheduling across ministries and events — rostering, availability, and leader workflows with a shared UTC timeline and church-scoped stewardship.

**For:** Church admins, ministry leaders, and volunteers.

**Solves:** Coordinating who serves when, respecting unavailability and membership rules, without spreadsheet chaos.

## Goals

- Leaders can build and adjust rosters for private and public events with scheduling rules enforced in the API.
- Volunteers can record time away and manage their assignments within ministry scope.
- Domain language stays consistent (`CONTEXT.md`) across API, web, and docs.

## Tech stack

**Core:** pnpm monorepo — NestJS + Prisma + PostgreSQL (`apps/api`), React + Vite + TanStack Router (`apps/web`).

**Key dependencies:** Prisma, TanStack Router/Query, Playwright (e2e), Jest (API e2e).

See [`AGENTS.md`](../../AGENTS.md) for dev commands, auth bypass, and CI.

## Scope

**In scope:** Identity, Organization, Availability, Scheduling bounded contexts as documented in [`CONTEXT.md`](../../CONTEXT.md).

**Out of scope (current glossary):** Volunteers without their own sign-in; public events spanning multiple churches on one occurrence.

## Domain reference

Full ubiquitous language and relationships: **[`CONTEXT.md`](../../CONTEXT.md)**.

Architecture decisions: **[`docs/adr/`](../../docs/adr/)**.

Issue-level specs and history: **[`docs/issues/`](../../docs/issues/)**.
