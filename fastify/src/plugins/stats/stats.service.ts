import { Database } from '@/types/db'
import { sql, type Kysely } from 'kysely'

export class StatsService {
  constructor(private db: Kysely<Database>) {}

  getAVG_IMC = async (): Promise<number> => {
    const result = await this.db
      .selectFrom('player')
      .select(
        sql<number>`AVG((weight / 1000.0) / POWER(height / 100.0, 2))::float8`.as(
          'avg_imc',
        ),
      )
      .executeTakeFirst()
    return result?.avg_imc ?? 0
  }

  getHeightMedian = async (): Promise<number> => {
    const result = await this.db
      .selectFrom('player')
      .select(
        sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY height)::float8`.as(
          'height_median',
        ),
      )
      .executeTakeFirst()
    return result?.height_median ?? 0
  }

  getCountryWithBestRatioWin = async (): Promise<{
    country_code: string
    win_ratio: number
  } | null> => {
    const result = await this.db
      .with('nb_games_played_by_country', db =>
        db
          .selectFrom('match')
          .innerJoin('player', 'match.player_id', 'player.id')
          .select('player.country_id')
          .groupBy('player.country_id')
          .select(sql<number>`COUNT(match.id)`.as('nb_games_played')),
      )
      .selectFrom('match')
      .innerJoin('player', join =>
        join
          .onRef('match.player_id', '=', 'player.id')
          .on('match.isWinning', '=', true),
      )
      .innerJoin('country', 'player.country_id', 'country.id')
      .innerJoin(
        'nb_games_played_by_country',
        'country.id',
        'nb_games_played_by_country.country_id',
      )
      .select(
        sql<number>`COUNT(match.id)::float8/NULLIF(nb_games_played_by_country.nb_games_played, 0)::float8`.as(
          'win_ratio',
        ),
      )
      .select('country.code as country_code')
      .groupBy('country.code')
      .groupBy('nb_games_played_by_country.nb_games_played')
      .orderBy('win_ratio', 'desc')
      .limit(1)
      .executeTakeFirst()

    return result ?? null
  }
}
