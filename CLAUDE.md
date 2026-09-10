# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The same small tennis-players REST API (list/search/create players, `GET /stats` for
average BMI, median height, country with the best match win ratio) implemented **twice**,
side by side, as a learning/comparison exercise — not a product with one canonical answer:

- `fastify/` — Fastify 5 + Kysely (query builder, close to SQL) + PostgreSQL. Feature-complete,
  covered by Cucumber tests, and the version actually deployed to production.
- `nest/` — NestJS 11 + TypeORM + PostgreSQL. Modules/DI/decorators, active-record-style
  entities, class migrations. Same functional spec, reimplemented from scratch. No unit tests;
  e2e coverage is limited to `/stats`. Deployment scaffolding was copied from `fastify/` but
  never provisioned.

**Each folder is a fully independent project** — own `package.json`, lockfile, `.env`,
`Dockerfile`, `docker-compose*.yml`. `cd` into `fastify/` or `nest/` before running any command
below; there is no root-level install/build. Don't assume a fix or convention in one project
applies to the other — compare them, don't copy blindly, since divergence (e.g. `weight` in kg
vs grams, `rankSort` semantics, `country_id` vs `country` code) is often intentional.

Root-level leftovers (`.config/cucumber.json`, `.config/kysely.config.ts`, `src/scripts/create-db.ts`,
`.github/workflows/deploy.yml`) predate the fastify/nest split and assume a flat single-project
layout — they don't resolve correctly against either subfolder today. Don't use them as a
reference for how `fastify/`'s own equivalents (`fastify/.config`-style commands driven from
`fastify/package.json`) work.

## Commands

Run from inside `fastify/` or `nest/`, not the repo root.

### fastify/

```bash
yarn install
docker compose up -d                 # local Postgres (port 5432)
yarn migrate:run                     # creates DB if needed, applies Kysely migrations
yarn migrate:seed                    # inserts sample players/countries/matches
yarn start                           # db:codegen + tsx watch src/server.ts, port 3000
yarn build                           # tsc -p tsconfig.json -> build/
yarn test                            # Cucumber feature suite against .env.test
yarn lint                            # eslint -c eslint.config.mjs ./src
```

- `yarn test` needs the `tennis_directory_test` DB migrated first: `ENV_FILE=.env.test yarn migrate:run`.
- To run a single Cucumber feature/scenario, pass a path or `--name` to the underlying binary,
  e.g. `env $(cat .env.test) cucumber-js -c .config/cucumber.json src/features/player/search-player.feature`.
- `yarn db:codegen` regenerates `src/types/db/*` from the live DB schema (Kysely codegen) —
  rerun it after changing a migration.

### nest/

```bash
yarn install
docker compose up -d                 # local Postgres (port 5432)
# create .env manually (gitignored) — see nest/README.md for required vars
yarn build                           # nest build + tsc-alias; required before migrate:run
yarn migrate:run                     # runs against compiled dist/datasource/pg.datasource.js
yarn start:dev                       # nest start --watch, port 3000
yarn test                            # Jest unit tests (no *.spec.ts files exist yet)
yarn test:e2e                        # Jest e2e (./test/jest-e2e.json) against tennis_directory_test DB
yarn lint                            # eslint -c eslint.config.mjs ./src
```

- Seeding is a migration (`src/migrations/1786093810100-seed.ts`), not a separate step —
  `migrate:run` both creates schema and inserts sample data.
- `yarn test:e2e` needs Postgres running and a valid `.env`; a Jest `globalSetup`
  (`test/global-setup.ts`) creates/rebuilds `tennis_directory_test` from
  `1786045103101-init_db.ts` before every run.
- To run a single e2e spec: `DB_NAME=tennis_directory_test NODE_ENV=test yarn test:e2e -- stats.e2e-spec.ts`.
- `nest/test.js` at the project root is an unrelated scratch file, not part of any suite.

Both projects format with Prettier (`singleQuote: true, semi: false, trailingComma: 'all', arrowParens: 'avoid'`,
shared `.prettierrc` at repo root) and lint with `strictTypeChecked` from `typescript-eslint`.

## Architecture

### fastify/ — plugin-per-feature, decorators for DI

- `src/server.ts` calls `buildApp()` (`src/app.ts`), which wires everything as Fastify plugins:
  `pagination` first, then `playerController`/`statsController` (each registered after its
  service is attached via `fastify.decorate('playerService', new PlayerService(db))` — services
  are plain classes constructed with the shared Kysely `db` instance, not a DI container), then
  `health`, then a global error handler.
- Each feature under `src/plugins/<feature>/` follows the same three-file shape: `*.controller.ts`
  (routes + JSON Schema for querystring/body/response, registered as a `fastify-plugin`),
  `*.service.ts` (a class holding the Kysely queries), `*.type.ts` (route param/query types).
  Route access to a service goes through `fastify.<name>Service`, typed via TS module
  augmentation (`declare module 'fastify' { interface FastifyInstance { ... } }`) — see
  `src/plugins/pagination.ts` and `src/app.ts` for the pattern.
- Pagination is a Fastify plugin (`src/plugins/pagination.ts`) that decorates `fastify.paginate()`.
  It always fetches `pageSize + 1` rows from the passed query function to derive `hasNextPage`,
  then trims the extra row — services just need a `(pageSize, page, ...args) => Promise<T[]>`
  signature. The route calls `fastify.paginate(fastify.playerService.getPlayers, pageSize, page, rankSort)`.
- DB layer: `src/infra/db/setup.ts` exports the shared Kysely `db`; `src/infra/db/dialect.ts`
  builds the `pg` Pool from env vars matching the official Postgres image's own names
  (`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`). Migrations/seeds live under
  `src/infra/db/migrations` and `src/infra/db/seeds`, driven by `kysely-ctl`
  (config at repo-root `.config/kysely.config.ts`, invoked via `yarn kysely ...` from `fastify/`).
  `src/types/db/*` are Kysely-codegen'd types — do not hand-edit `database.ts`; rerun `yarn db:codegen`.
- Stats (`src/plugins/stats/stats.service.ts`) are raw SQL expressions (`sql<T>\`...\``) inside
  Kysely queries, not generic query-builder chains — the win-ratio query in particular is a CTE
  joining `match`/`player`/`country`; if you touch it, note it was recently fixed
  (`529954b Fix stats query`) and now has a regression test (`ae0aeb9`).
- Tests: `src/features/*.feature` (Gherkin) + `src/features/step_definitions/*.steps.ts` (Cucumber
  step defs) + `src/features/support/{world,hooks,custom-parameter-types}.ts`. Tests exercise the
  built app via `buildApp()`, not a running server.

### nest/ — modules/DI, TypeORM entities, decorator-driven pagination

- `src/main.ts` bootstraps `AppModule` with a global `ValidationPipe({ transform: true })` —
  all request validation goes through `class-validator` DTOs, not manual checks.
- `AppModule` (`src/app.module.ts`) imports `databaseModule`, `PlayerModule`, `StatsModule`, and
  registers `PaginationInterceptor` as a **global** `APP_INTERCEPTOR`. Each feature is a standard
  Nest module under `src/entity/<feature>/` with `*.module.ts` / `*.controller.ts` /
  `*.service.ts` (+ `*.entity.ts` for TypeORM entities, `*.dto.ts` for validated input).
  `PlayerModule` imports `CountryModule` to resolve a player's `country` code to a `country_id`.
- Pagination is decorator-driven, not manual per-route: a controller method marks itself with
  `@Paginated()` (`src/helpers/pagination/pagination.decorator.ts`, sets a reflectable
  `PAGINATED_KEY` metadata flag) and consumes `@PaginationQuery(SomeDto)`
  (`pagination.query.ts`) to get `{ skip, take, ... }`. The **global** `PaginationInterceptor`
  then reads that metadata post-handler, slices the array response down to `pageSize` and adds
  `{ data, page, pageSize, hasNextPage }` — so the wrapping happens outside the controller/service,
  and a route without `@Paginated()` returns its raw payload unchanged.
- DB layer: `src/datasource/pg.datasource.ts` is the TypeORM DataSource (used directly by the
  `typeorm` CLI for migrations, since those run against **compiled** `dist/`, not `src/`).
  `src/config/pg.config.ts` / `src/database.module.ts` wire the same connection into Nest's DI
  via `@nestjs/typeorm`. Migrations are classes under `src/migrations/`, run with
  `typeorm migration:run -d dist/datasource/pg.datasource.js` — always `yarn build` first.
- Env var names differ from `fastify/` on purpose: `DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` here vs.
  `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` in `fastify/` (which mirror the official
  Postgres image's own var names). Don't assume one project's `.env` works for the other.
- Known quirks worth knowing before "fixing" them without checking intent: `rankSort` on
  `GET /players` currently orders by lastname/firstname, not points; `POST /players` takes
  `weight` in **grams** (fastify's takes kilograms) and an unknown `country` code raises a plain
  `500` instead of a 4xx (`PlayerService.addPlayer` throws a plain `Error`, not an `HttpException`).
- Tests: `test/*.e2e-spec.ts` (Jest + `supertest` against an in-process Nest app), `test/global-setup.ts`
  rebuilds the `tennis_directory_test` schema from the init migration before each run. No
  `*.spec.ts` unit tests exist yet in `src/`.

## Deployment

Only `fastify/infra/terraform/` holds real Terraform state — `fastify/` is what's actually
deployed (AWS Lightsail, Docker Compose + Caddy, `yarn` gated on the Cucumber suite passing, via
GitHub Actions `workflow_dispatch`). `nest/`'s `Dockerfile`/`docker-compose.prod.yml`/`Caddyfile`/
`DEPLOY.md` are scaffolding adapted from `fastify/`'s but never provisioned — its
`infra/terraform/` is empty and it has no `.env.prod.example`. See `fastify/DEPLOY.md` (French)
for the real deployment process.
