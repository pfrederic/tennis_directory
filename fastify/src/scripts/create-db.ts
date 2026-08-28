import { Pool } from 'pg'

const DEFAULT_ADMIN_DB = 'postgres'

async function createDatabaseIfNotExists() {
  console.log('TEST !!! ', process.env.POSTGRES_DB)
  const dbName = process.env.POSTGRES_DB
  if (!dbName) {
    throw new Error("POSTGRES_DB manquant dans les variables d'environnement.")
  }

  const adminPool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: DEFAULT_ADMIN_DB,
  })

  try {
    const { rows } = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    )

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✅ Base "${dbName}" créée.`)
    } else {
      console.log(`ℹ️  Base "${dbName}" existe déjà.`)
    }
  } catch (err: any) {
    if (err.code === '42P04') {
      console.log(`ℹ️  Base "${dbName}" déjà créée par un autre process.`)
    } else {
      throw err
    }
  } finally {
    await adminPool.end()
  }
}

createDatabaseIfNotExists().catch(err => {
  console.error('❌ Erreur lors de la création de la base :', err)
  process.exit(1)
})
