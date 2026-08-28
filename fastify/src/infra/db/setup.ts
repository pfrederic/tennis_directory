import { Kysely } from 'kysely'
import { Database } from '@/types/db'
import { createPostgresDialect } from '@/infra/db/dialect'

export const db = new Kysely<Database>({
  dialect: createPostgresDialect(),
  log(event) {
    if (event.level === 'query') {
      console.log('SQL:', event.query.sql)
      console.log('Params:', event.query.parameters)
    }
  },
})
