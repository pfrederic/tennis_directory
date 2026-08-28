# Tennis Directory (NestJS)

A [NestJS](https://nestjs.com/) + TypeScript REST API for managing a directory of tennis players (and their match results), built on PostgreSQL with [TypeORM](https://typeorm.io/) for entities, migrations and query building.

This is a from-scratch reimplementation of the same functional spec as the sibling [`fastify/`](../fastify/README.md) project — see the [root README](../README.md) for why this repo has the same API built twice.

## Tech stack

- **Runtime**: Node.js 22, TypeScript
- **HTTP framework**: NestJS 11 (modules, controllers, dependency injection), on top of Express
- **Database**: PostgreSQL, accessed with TypeORM (entities, migrations, query builder)
- **Validation**: `class-validator` / `class-transformer` DTOs, enforced by a global `ValidationPipe`
- **Testing**: Jest is wired up (`test`, `test:e2e` scripts) but the project currently has **no `*.spec.ts` / `*.e2e-spec.ts` files** — unlike `fastify/`, which has a full Cucumber suite
- **Deployment**: `Dockerfile`, `docker-compose.prod.yml`, `Caddyfile` and `DEPLOY.md` mirror the `fastify/` setup, but `infra/terraform/` is empty and there's no `.env.prod.example` here — nothing has actually been provisioned for this implementation yet

## Getting started (local)

### Prerequisites

- Node.js >= 22
- Yarn
- Docker (to run PostgreSQL locally)

### 1. Install dependencies

```bash
yarn install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts the official Postgres image with `POSTGRES_USER=postgres` / `POSTGRES_PASSWORD=postgres` / `POSTGRES_DB=tennis_directory`, on port `5432`.

### 3. Configure environment

There's no `.env` shipped (it's gitignored) — create one at the project root. Note that the app reads **different variable names** than the ones the Postgres image itself uses:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tennis_directory
PORT=3000
```

### 4. Build, then run migrations

```bash
yarn build
yarn migrate:run
```

`migrate:run` runs `typeorm migration:run` against the **compiled** `dist/datasource/pg.datasource.js`, so `yarn build` has to run first. It also creates the database if it doesn't exist (`src/scripts/create-db.ts`) and loads its environment via `env $(cat ${ENV_FILE:-.env})`, so the `.env` file from step 3 needs to actually exist.

There's no separate seed command like `fastify/`'s `migrate:seed`: seeding is itself a migration (`1786093810100-seed.ts`), so `migrate:run` both creates the schema and inserts sample players/countries/matches in one go.

### 5. Start the server

```bash
yarn start:dev
```

Runs `nest start --watch`, listening on `http://localhost:3000` by default (override with `PORT`). `yarn start` runs it once without watching; `yarn start:prod` runs the already-built `dist/main.js`.

### Running tests

```bash
yarn test      # unit tests (Jest)
yarn test:e2e  # e2e tests (Jest, ./test/jest-e2e.json)
```

Both are configured, but there is currently nothing for them to run — no spec files exist yet. (`test.js` at the project root is an unrelated scratch file, not part of any suite.)

### Linting

```bash
yarn lint
```

## API reference

Base URL (local): `http://localhost:3000`

### List players

Paginated, searchable list of players.

- Query params: `page` (default `1`), `pageSize` (default `10`, max `100`), `search` (optional, case-insensitive match on firstname OR lastname), `rankSort` (`asc` | `desc`, default `asc`)
- Unknown query params are rejected with `400` (validation whitelist)
- Note: despite the name, `rankSort` currently orders by lastname then firstname — not by ranking points

```bash
curl "http://localhost:3000/players?page=1&pageSize=10&rankSort=asc&search=nadal"
```

Response shape:

```json
{ "data": [ /* players */ ], "page": 1, "pageSize": 10, "hasNextPage": true }
```

(`pageSize` in the response is the actual number of items returned — the interceptor fetches `pageSize + 1` internally just to compute `hasNextPage`.)

### Get a player by id

```bash
curl http://localhost:3000/players/1
```

Returns `404` if no player has that id.

### Create a player

```bash
curl -X POST http://localhost:3000/players \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Novak",
    "lastname": "Djokovic",
    "shortname": "N.DJO",
    "sex": "M",
    "picture": "https://example.com/djokovic.png",
    "birthday": "1987-05-22",
    "weight": 80000,
    "height": 188,
    "points": 12000,
    "country": "SRB"
  }'
```

Two details that differ from `fastify/`'s version of this same endpoint:

- `weight` is in **grams**, not kilograms (seed data and the BMI calculation both assume grams).
- `country` is an existing country **code** (e.g. `"SRB"`), resolved via `CountryService.findByCode` — not a `country_id`. An unknown code currently causes a plain `500` rather than a `4xx`, since `PlayerService.addPlayer` throws a plain `Error` instead of a NestJS `HttpException`.

### Get global stats

```bash
curl http://localhost:3000/stats
```

Intended to return average BMI, median height, and the country with the best match win ratio — same as `fastify/`'s `/stats`. See **Known gaps** below: this endpoint currently errors.

## Known gaps

- **`GET /stats` returns `500`.** `getAVG_IMC` and `getHeightMedian` work, but `getCountryWithBestRatio` throws `TypeORMError: Nested CTEs aren't supported (CTE: nb_games_played_by_country)` — it builds the CTE's subquery from the very same `QueryBuilder` instance it then attaches the CTE to, which TypeORM rejects. (Verified by running the app locally.) Fixing that surfaces a second issue: the query then selects `c.name`, but the `country` table (see `1786045103101-init_db.ts`) only has `id`, `picture` and `code` — no `name` column.
- **No automated tests.** `test`/`test:e2e` are wired via Jest, but no `*.spec.ts` or `*.e2e-spec.ts` files exist yet.
- **Deployment isn't provisioned.** `infra/terraform/` is empty and `.env.prod.example` (referenced by `DEPLOY.md`) doesn't exist in this folder — the deployment files here were adapted from `fastify/`'s (which *is* deployed) but never run for this implementation.

## AI

This README was written with the help of Claude Code, after reading through the whole `src/` tree and actually running the app locally (build, migrate, start, `curl` against every endpoint) to confirm the behavior described above, including the `/stats` bug. The deployment scaffolding (`Dockerfile`, `docker-compose.prod.yml`, `Caddyfile`, `DEPLOY.md`) was carried over from the `fastify/` implementation and adapted, but — per **Known gaps** — never actually exercised for `nest/`.

Everything else (business logic, entities, modules, project structure) is hand-written code.
