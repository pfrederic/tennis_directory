import { Database } from '@/types/db'
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('country')
    .addColumn('id', 'integer', col =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn('picture', 'text')
    .addColumn('code', 'text', col => col.notNull())
    .execute()

  await db.schema
    .createTable('player')
    .addColumn('id', 'integer', col =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn('firstname', 'text', col => col.notNull())
    .addColumn('lastname', 'text', col => col.notNull())
    .addColumn('shortname', 'text', col => col.notNull())
    .addColumn('sex', 'text', col => col.notNull())
    .addColumn('picture', 'text')
    .addColumn('birthday', 'date', col => col.notNull())
    .addColumn('weight', 'integer', col => col.notNull())
    .addColumn('height', 'integer', col => col.notNull())
    .addColumn('points', 'integer', col => col.notNull())
    .addColumn('country_id', 'integer', col =>
      col.references('country.id').notNull(),
    )
    .addColumn('created_at', 'text', col =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('match')
    .addColumn('id', 'integer', col =>
      col.generatedAlwaysAsIdentity().primaryKey(),
    )
    .addColumn('player_id', 'integer', col =>
      col.references('player.id').notNull(),
    )
    .addColumn('isWinning', 'boolean', col => col.notNull())
    .addColumn('date', 'date', col => col.notNull())
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('match').execute()
  await db.schema.dropTable('player').execute()
  await db.schema.dropTable('country').execute()
}
