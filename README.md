# Tennis Directory

A small [Fastify](https://fastify.dev/) + TypeScript REST API for managing a directory of tennis players (and their match results), built on PostgreSQL with [Kysely](https://kysely.dev/) as the query builder/migrator.

It exposes endpoints to list/create players and to compute a few aggregate statistics (average BMI, median height, country with the best win ratio) from the player and match data.

## Tech stack

- **Runtime**: Node.js 22, TypeScript, run via `tsx`
- **HTTP framework**: Fastify 5
- **Database**: PostgreSQL, accessed with Kysely (query builder, migrations, seeds, codegen)
- **Testing**: Cucumber (`@cucumber/cucumber`) for BDD-style feature tests
- **Deployment**: Docker Compose + Caddy (reverse proxy/TLS) on AWS Lightsail via Terraform, deployed on demand via GitHub Actions — see [DEPLOY.md](DEPLOY.md)

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

A local Postgres instance is provided via Docker Compose:

```bash
docker compose up -d
```

### 3. Configure environment

A `.env` file is already present at the repo root for local dev (matching the `docker-compose.yml` credentials — `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` are the same names the official Postgres image itself expects, kept as the single source of truth):

```
POSTGRES_DB=tennis_directory
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
ENV=dev
```

There's also an `.env.test` used when running the test suite.

### 4. Run migrations (and seed data)

```bash
yarn migrate:run
yarn migrate:seed
```

`migrate:run` creates the database (if needed) and applies all Kysely migrations; `migrate:seed` inserts sample players/countries/matches.

### 5. Start the server

```bash
yarn start
```

This regenerates the Kysely DB types (`db:codegen`) and starts the server with `tsx watch`, listening on `http://localhost:3000` by default (override with `PORT`).

### Running tests

```bash
yarn test
```

Runs the Cucumber feature suite against `.env.test` (make sure the `tennis_directory_test` database exists — `yarn migrate:run` with `ENV_FILE=.env.test` if needed).

### Linting

```bash
yarn lint
```

## API reference

Base URL (local): `http://localhost:3000`

### Health

Simple liveness check.

```bash
curl http://localhost:3000/health
```

### List players

Paginated list of players, sortable by ranking points.

- Query params: `page` (default `1`), `pageSize` (default `10`, max `100`), `rankSort` (`asc` | `desc`, default `desc`)

```bash
curl "http://localhost:3000/players?page=1&pageSize=10&rankSort=desc"
```

### Get a player by id

```bash
curl http://localhost:3000/players/1
```

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
    "weight": 80,
    "height": 188,
    "points": 12000,
    "country_id": 1
  }'
```

### Get global stats

Returns average BMI, median height, and the country with the best match win ratio.

```bash
curl http://localhost:3000/stats
```

## Deployment

Runs on a single AWS Lightsail instance (app + Postgres via Docker Compose, Caddy handling automatic HTTPS), provisioned with Terraform. Deploys are triggered manually from the GitHub Actions "Deploy" workflow (`workflow_dispatch`) and gated on the Cucumber test suite passing first.

See [DEPLOY.md](DEPLOY.md) for the full deployment guide (in French).
