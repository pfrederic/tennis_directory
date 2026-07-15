import { Pool } from 'pg'

const POSTGRES_DB = 'postgres'

async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME
  if (!dbName) {
    throw new Error("DB_NAME manquant dans les variables d'environnement.")
  }

  const adminPool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: POSTGRES_DB,
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
