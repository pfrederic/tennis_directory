# Tennis Directory

A small REST API for a directory of tennis players (and their match results) — players list/search/create, plus a few aggregate stats (average BMI, median height, country with the best match win ratio) computed from player and match data.

This repository implements that exact same spec **twice**, in two independent projects:

- [`fastify/`](fastify/README.md) — Fastify 5 + [Kysely](https://kysely.dev/) (SQL-close query builder) + PostgreSQL
- [`nest/`](nest/README.md) — NestJS 11 + [TypeORM](https://typeorm.io/) (DI, decorators, entities/migrations) + PostgreSQL

## Why the same thing twice?

This is a learning exercise / POC playground, not a product. Keeping the functional spec identical between the two folders removes "what to build" as a variable, so the only thing that differs between `fastify/` and `nest/` is the stack itself:

- **Fastify + Kysely** stays close to SQL and plain functions: hand-rolled plugins, a query builder rather than an ORM, generated DB types.
- **NestJS + TypeORM** is the opinionated, batteries-included alternative: modules/DI/decorators, active-record-style entities, class-based migrations, declarative validation pipes.

It's meant as reference material for comparing the two on concrete, small problems — pagination, request validation, a raw-SQL stats endpoint, migrations + seed data, Docker/Caddy/Terraform deployment — rather than reading about the differences in the abstract.

## Repository layout

| Folder | Stack | Status |
|---|---|---|
| [`fastify/`](fastify/README.md) | Fastify 5 + Kysely + PostgreSQL | Feature-complete, covered by a Cucumber test suite, the implementation actually deployed to production |
| [`nest/`](nest/README.md) | NestJS 11 + TypeORM + PostgreSQL | Same endpoints reimplemented; no automated tests yet; `/stats` currently errors ([details](nest/README.md#known-gaps)); deployment scaffolding copied from `fastify/` but never provisioned |

Each folder is a **fully independent project** — its own `package.json`, lockfile, `.env`, `Dockerfile`, `docker-compose*.yml`. Install and run them separately; see each project's own README for setup instructions.

## The spec, implemented twice

- `GET /players` — paginated, searchable list of players
- `GET /players/:id` — a single player
- `POST /players` — create a player, attached to a country
- `GET /stats` — average BMI, median height, country with the best match win ratio

Request/response details (query params, body shape, quirks specific to each stack) are documented in each project's own README.

## Things to know before touching both at once

- Both apps default to port `3000`, and both projects ship a local `docker-compose.yml` publishing Postgres on `5432` — you can't run `fastify/` and `nest/` side by side without changing ports/DB name in one of them.
- Both `Caddyfile`s point at the same domain (`tennis-directory.pif-engineer.com`), but only `fastify/infra/terraform/` holds real Terraform state — that's the implementation actually running in production; `nest/`'s deployment files are unwired scaffolding.
- A few files at the repo root — `.config/cucumber.json`, `.config/kysely.config.ts`, `.github/workflows/deploy.yml` — predate this repo being split into `fastify/`/`nest/` subfolders and still assume a flat, single-project layout. They resolve paths relative to a project root that no longer matches either subfolder, so `fastify/`'s own `yarn test` / `yarn migrate:run` and the root deploy workflow don't run as-is post-split. That's a known side effect of this reorg, not yet cleaned up.

## AI

This README and [`nest/README.md`](nest/README.md) were written with the help of Claude Code, based on reading through both codebases and actually running the `nest/` app locally to confirm its documented behavior (including the `/stats` bug noted above). The per-project deployment infra (`Dockerfile`, `docker-compose.prod.yml`, `Caddyfile`, Terraform, the GitHub Actions workflow, `DEPLOY.md`) predates this reorg and was itself generated with Claude Code for the `fastify/` implementation — see the AI section in [`fastify/README.md`](fastify/README.md) for details.

Business logic, tests, and overall project structure in both `fastify/` and `nest/` are hand-written.
