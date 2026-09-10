import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

interface CountryBestRatioRow {
  code: string
  nbWins: string
  winRatio: string
}

@Injectable()
export class StatsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getAVG_IMC = async (): Promise<number> => {
    const queryBuilder = this.dataSource.createQueryBuilder()
    const result = await queryBuilder
      .from('player', 'p')
      .select(
        `AVG((p.weight / 1000.0) / POWER(p.height / 100.0, 2))::float8 as avg_imc`,
      )
      .getRawOne<{ avg_imc: number }>()
    return result?.avg_imc ?? 0
  }

  getHeightMedian = async (): Promise<number> => {
    const queryBuilder = this.dataSource.createQueryBuilder()
    const result = await queryBuilder
      .from('player', 'p')
      .select(
        `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY p.height)::float8 as height_median`,
      )
      .getRawOne<{ height_median: number }>()
    return result?.height_median ?? 0
  }

  getCountryWithBestRatio(): Promise<CountryBestRatioRow | undefined> {
    const nbGamesPlayedByCountry = this.dataSource
      .createQueryBuilder()
      .from('match', 'm')
      .innerJoin('player', 'p', 'm.player_id = p.id')
      .select('p.country_id', 'country_id')
      .groupBy('p.country_id')
      .addSelect('COUNT(m.id)', 'nbGames')
    return this.dataSource
      .createQueryBuilder()
      .addCommonTableExpression(
        nbGamesPlayedByCountry,
        'nb_games_played_by_country',
      )
      .from('match', 'm')
      .innerJoin('player', 'p', 'm.player_id = p.id AND m.is_winning = true')
      .innerJoin('country', 'c', 'p.country_id = c.id')
      .select('c.code', 'code')
      .addSelect('COUNT(m.id)', 'nbWins')
      .groupBy('c.code')
      .addGroupBy(`nb_games."nbGames"`)
      .innerJoin(
        'nb_games_played_by_country',
        'nb_games',
        'nb_games.country_id = p.country_id',
      )
      .addSelect(
        'COUNT(m.id)::float8 / NULLIF(nb_games."nbGames", 0)::float8',
        'winRatio',
      )
      .orderBy('winRatio', 'DESC')
      .limit(1)
      .getRawOne<CountryBestRatioRow>()
  }
}
