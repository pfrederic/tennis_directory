import { DataSource } from 'typeorm'
import PgConfig from '@/config/pg.config'

const PgDataSource = new DataSource({
  ...PgConfig,
  entities: [__dirname + '/../entity/**/*.entity.js'],
  migrations: [__dirname + '/../migrations/*.js'],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'each',
})

export default PgDataSource
