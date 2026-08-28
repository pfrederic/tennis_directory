import 'dotenv/config'
import type { DataSourceOptions } from 'typeorm'

const PgConfig: Pick<
  Extract<DataSourceOptions, { type: 'postgres' }>,
  | 'type'
  | 'host'
  | 'port'
  | 'username'
  | 'password'
  | 'database'
  | 'synchronize'
  | 'logging'
  | 'migrationsRun'
> = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  migrationsRun: false,
}

export default PgConfig
