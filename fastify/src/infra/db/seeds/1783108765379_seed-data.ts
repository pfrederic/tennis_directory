import { CountryDb, Database, MatchDb, PlayerDb } from '@/types/db'
import dayjs from 'dayjs'
import type { Insertable, Kysely } from 'kysely'

const playersData = [
  {
    id: 52,
    firstname: 'Novak',
    lastname: 'Djokovic',
    shortname: 'N.DJO',
    sex: 'M',
    country: {
      picture: 'https://tenisu.latelier.co/resources/Serbie.png',
      code: 'SRB',
    },
    picture: 'https://tenisu.latelier.co/resources/Djokovic.png',
    data: {
      points: 2542,
      weight: 80000,
      height: 188,
      birthday: '1987-05-22',
      last: [1, 1, 1, 1, 1],
    },
  },
  {
    id: 95,
    firstname: 'Venus',
    lastname: 'Williams',
    shortname: 'V.WIL',
    sex: 'F',
    country: {
      picture: 'https://tenisu.latelier.co/resources/USA.png',
      code: 'USA',
    },
    picture: 'https://tenisu.latelier.co/resources/Venus.webp',
    data: {
      points: 1105,
      weight: 74000,
      height: 185,
      birthday: '1981-09-26',
      last: [0, 1, 0, 0, 1],
    },
  },
  {
    id: 65,
    firstname: 'Stan',
    lastname: 'Wawrinka',
    shortname: 'S.WAW',
    sex: 'M',
    country: {
      picture: 'https://tenisu.latelier.co/resources/Suisse.png',
      code: 'SUI',
    },
    picture: 'https://tenisu.latelier.co/resources/Wawrinka.png',
    data: {
      points: 1784,
      weight: 81000,
      height: 183,
      birthday: '1985-03-28',
      last: [1, 1, 1, 0, 1],
    },
  },
  {
    id: 102,
    firstname: 'Serena',
    lastname: 'Williams',
    shortname: 'S.WIL',
    sex: 'F',
    country: {
      picture: 'https://tenisu.latelier.co/resources/USA.png',
      code: 'USA',
    },
    picture: 'https://tenisu.latelier.co/resources/Serena.png',
    data: {
      points: 3521,
      weight: 72000,
      height: 175,
      birthday: '1981-09-26',
      last: [0, 1, 1, 1, 0],
    },
  },
  {
    id: 17,
    firstname: 'Rafael',
    lastname: 'Nadal',
    shortname: 'R.NAD',
    sex: 'M',
    country: {
      picture: 'https://tenisu.latelier.co/resources/Espagne.png',
      code: 'ESP',
    },
    picture: 'https://tenisu.latelier.co/resources/Nadal.png',
    data: {
      points: 1982,
      weight: 85000,
      height: 185,
      birthday: '1986-06-03',
      last: [1, 0, 0, 0, 1],
    },
  },
]

export async function seed(db: Kysely<Database>): Promise<void> {
  try {
    const uniqueCountries = Array.from(
      new Map(playersData.map(p => [p.country.code, p.country])).values(),
    )

    const countriesWithIds = uniqueCountries.map(
      (country): Insertable<CountryDb> => ({
        picture: country.picture,
        code: country.code,
      }),
    )

    await db
      .insertInto('country')
      .values(countriesWithIds)
      .onConflict(oc => oc.column('id').doNothing())
      .execute()

    const countriesInserted = await db
      .selectFrom('country')
      .selectAll()
      .execute()

    const countryIdByCode = new Map(countriesInserted.map(c => [c.code, c.id]))

    const players = playersData.map((player): Insertable<PlayerDb> => {
      const countryId = countryIdByCode.get(player.country.code)
      if (!countryId) {
        throw new Error(
          `Country code ${player.country.code} not found in countryIdByCode map`,
        )
      }
      return {
        firstname: player.firstname,
        lastname: player.lastname,
        shortname: player.shortname,
        sex: player.sex,
        picture: player.picture,
        birthday: new Date(player.data.birthday),
        weight: player.data.weight,
        height: player.data.height,
        points: player.data.points,
        country_id: countryId,
      }
    })

    await db
      .insertInto('player')
      .values(players)
      .onConflict(oc => oc.column('id').doNothing())
      .execute()

    const playersInserted = await db.selectFrom('player').selectAll().execute()
    const matches: Array<Insertable<MatchDb>> = []

    for (const player of playersData) {
      const insertedPlayerId = playersInserted.find(
        p => p.firstname === player.firstname,
      )?.id
      if (!insertedPlayerId) {
        throw new Error(
          `Player ${player.firstname} not found in playersInserted`,
        )
      }
      player.data.last.forEach((result, index) => {
        const date = dayjs()
          .subtract(index * 7, 'day')
          .toDate()
        matches.push({
          player_id: insertedPlayerId,
          isWinning: result === 1,
          date: date,
        })
      })
    }

    await db
      .insertInto('match')
      .values(matches)
      .onConflict(oc => oc.column('id').doNothing())
      .execute()
  } catch (error) {
    console.error('Error seeding data:', error)
    await Promise.all([
      db.deleteFrom('match').execute(),
      db.deleteFrom('player').execute(),
      db.deleteFrom('country').execute(),
    ])
    throw error
  }
}
