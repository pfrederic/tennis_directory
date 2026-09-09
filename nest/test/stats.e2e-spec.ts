import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { AppModule } from '../src/app.module'
import { Sex } from '../src/types/common'

describe('StatsController (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "match", "player", "country" RESTART IDENTITY CASCADE',
    )
  })

  const insertCountry = async (code: string): Promise<number> => {
    const result = await dataSource.manager.insert('country', [
      { code, picture: null },
    ])
    return result.identifiers[0]?.id as number
  }

  const insertPlayer = async (params: {
    countryId: number
    height: number
    weight: number
  }): Promise<number> => {
    const result = await dataSource.manager.insert('player', [
      {
        firstname: 'John',
        lastname: 'Doe',
        shortname: 'J.DOE',
        sex: Sex.M,
        picture: null,
        birthday: new Date('1990-01-01'),
        points: 1000,
        country: { id: params.countryId },
        height: params.height,
        weight: params.weight,
      },
    ])
    return result.identifiers[0]?.id as number
  }

  const insertMatch = async (
    playerId: number,
    isWinning: boolean,
  ): Promise<void> => {
    await dataSource.manager.insert('match', [
      {
        player_id: playerId,
        is_winning: isWinning,
        date: new Date('2024-01-01'),
      },
    ])
  }

  it('GET /stats computes avg_imc, height_median and the country with the best win ratio from the seeded data', async () => {
    const franceId = await insertCountry('FRA')
    const spainId = await insertCountry('ESP')

    // height in cm, weight in grams (see PlayerService/README).
    const player1 = await insertPlayer({
      countryId: franceId,
      height: 180,
      weight: 80_000,
    })
    const player2 = await insertPlayer({
      countryId: spainId,
      height: 190,
      weight: 90_000,
    })

    // France: 1 win out of 1 game played -> ratio 1.
    await insertMatch(player1, true)
    // Spain: 1 win out of 2 games played -> ratio 0.5.
    await insertMatch(player2, true)
    await insertMatch(player2, false)

    const response = await request(app.getHttpServer())
      .get('/stats')
      .expect(200)

    const expectedAvgImc = (80 / Math.pow(1.8, 2) + 90 / Math.pow(1.9, 2)) / 2
    const expectedHeightMedian = (180 + 190) / 2

    expect(response.body.avg_imc).toBeCloseTo(expectedAvgImc, 5)
    expect(response.body.height_median).toBeCloseTo(expectedHeightMedian, 5)
    expect(response.body.country_with_best_ratio_win).toMatchObject({
      code: 'FRA',
      nbWins: '1',
    })
  })

  it('GET /stats returns 0 averages and no country when there is no data', async () => {
    const response = await request(app.getHttpServer())
      .get('/stats')
      .expect(200)

    expect(response.body.avg_imc).toBe(0)
    expect(response.body.height_median).toBe(0)
    expect(response.body.country_with_best_ratio_win).toBeUndefined()
  })
})
