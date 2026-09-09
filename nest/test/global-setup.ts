import { DataSource } from 'typeorm'
import { createDatabaseIfNotExists } from '../src/scripts/create-db'
import { InitDb1786045103101 } from '../src/migrations/1786045103101-init_db'
import PgConfig from '../src/config/pg.config'

/**
 * Runs once before the whole e2e suite (see `globalSetup` in
 * jest-e2e.json). It provisions a throwaway schema on the *test* database
 * so specs can seed and assert against real data instead of mocks.
 *
 * Safety: this drops tables, so it refuses to run against anything that
 * doesn't look like a dedicated test database (see `yarn test:e2e`, which
 * sets DB_NAME accordingly).
 */
export default async function globalSetup(): Promise<void> {
  const dbName = process.env.DB_NAME
  if (!dbName || !dbName.includes('test')) {
    throw new Error(
      `Refusing to run e2e tests against database "${dbName}". ` +
        'DB_NAME must point to a dedicated test database (run tests via "yarn test:e2e").',
    )
  }

  await createDatabaseIfNotExists()

  const dataSource = new DataSource({ ...PgConfig })
  await dataSource.initialize()

  try {
    const queryRunner = dataSource.createQueryRunner()
    try {
      // Start from a clean, known schema on every run.
      await queryRunner.query(
        'DROP TABLE IF EXISTS "match", "player", "country" CASCADE',
      )
      await new InitDb1786045103101().up(queryRunner)
    } finally {
      await queryRunner.release()
    }
  } finally {
    await dataSource.destroy()
  }
}
