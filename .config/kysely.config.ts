import { defineConfig } from 'kysely-ctl'
import { createPostgresDialect } from '../src/infra/db/dialect'

export default defineConfig({
  dialect: createPostgresDialect(),
  migrations: {
    migrationFolder: '../src/infra/db/migrations',
  },
  seeds: {
    seedFolder: '../src/infra/db/seeds',
  },
})
