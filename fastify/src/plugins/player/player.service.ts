import { Database, PlayerDb } from '@/types/db'
import type { Insertable, Kysely, Selectable } from 'kysely'

export class PlayerService {
  constructor(private db: Kysely<Database>) {}

  getPlayers = async (
    limit: number,
    page: number,
    rankSort: 'asc' | 'desc' = 'desc',
  ): Promise<Selectable<PlayerDb>[]> => {
    return this.db
      .selectFrom('player')
      .selectAll()
      .orderBy('points', rankSort)
      .limit(limit)
      .offset((page - 1) * limit)
      .execute()
  }

  getPlayerById = async (id: number): Promise<Selectable<PlayerDb> | null> => {
    const player = await this.db
      .selectFrom('player')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return player ?? null
  }

  insertPlayer = async (player: Insertable<PlayerDb>): Promise<void> => {
    await this.db.insertInto('player').values(player).execute()
  }
}
