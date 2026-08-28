import assert from 'node:assert/strict'
import { DataTable, Given, Then, When } from '@cucumber/cucumber'
import type { Selectable } from 'kysely'
import { PlayerDb } from '@/types/db'
import type { PlayerRow } from '@/plugins/player/player.type'
import { CustomWorld } from '../support/world'
import { PlayersBody } from '@/plugins/player/player.type'

function playersBody(world: CustomWorld): PlayersBody {
  return JSON.parse(world.response.payload) as PlayersBody
}

interface CountryRow {
  code: string
}

Given(
  'the following countries exist:',
  async function (this: CustomWorld, table: DataTable) {
    const rows = table.hashes() as unknown as CountryRow[]

    for (const row of rows) {
      await this.createCountry({
        code: row.code,
        picture: `https://example.test/${row.code}.png`,
      })
    }
  },
)

Given(
  'the following players exist:',
  async function (this: CustomWorld, table: DataTable) {
    const rows = table.hashes() as unknown as PlayerRow[]

    for (const row of rows) {
      await this.createPlayer({
        firstname: row.firstname,
        lastname: row.lastname,
        shortname: row.shortname,
        sex: row.sex,
        picture: `https://example.test/${row.shortname}.png`,
        birthday: new Date(row.birthday),
        weight: Number(row.weight),
        height: Number(row.height),
        points: Number(row.points),
        countryCode: row.country ?? 'FRA',
      })
    }
  },
)

Given(
  'the player {string} exists',
  async function (this: CustomWorld, shortname: string) {
    await this.createPlayer({
      firstname: shortname,
      lastname: shortname,
      shortname,
      sex: 'M',
      picture: `https://example.test/${shortname}.png`,
      birthday: new Date('1990-01-01'),
      weight: 80000,
      height: 185,
      points: 1000,
      countryCode: 'FRA',
    })
  },
)

When(
  'I create a player with the following information:',
  async function (this: CustomWorld, table: DataTable) {
    const [row] = table.hashes() as unknown as PlayerRow[]
    if (!row) {
      throw new Error('The step table does not contain any row')
    }
    const country_id = await this.findCountryIdByCode(row.country ?? 'FRA')

    await this.inject({
      method: 'POST',
      url: '/players',
      payload: {
        firstname: row.firstname,
        lastname: row.lastname,
        shortname: row.shortname,
        sex: row.sex,
        picture: `https://example.test/${row.shortname}.png`,
        birthday: row.birthday,
        weight: Number(row.weight),
        height: Number(row.height),
        points: Number(row.points),
        country_id,
      },
    })
  },
)

When('I search for players', async function (this: CustomWorld) {
  await this.inject({ method: 'GET', url: '/players?page=1&pageSize=10' })
})

When(
  'I search for players sorted by points in {sortOrder} order',
  async function (this: CustomWorld, rankSort: 'asc' | 'desc') {
    await this.inject({
      method: 'GET',
      url: `/players?page=1&pageSize=10&rankSort=${rankSort}`,
    })
  },
)

When(
  'I search for players on page {int} with a page size of {int}',
  async function (this: CustomWorld, page: number, pageSize: number) {
    await this.inject({
      method: 'GET',
      url: `/players?page=${page}&pageSize=${pageSize}`,
    })
  },
)

When(
  'I view the profile of player {string}',
  async function (this: CustomWorld, shortname: string) {
    await this.inject({
      method: 'GET',
      url: `/players/${this.playerId(shortname)}`,
    })
  },
)

When(
  'I view the profile of the player with id {int}',
  async function (this: CustomWorld, id: number) {
    await this.inject({ method: 'GET', url: `/players/${id}` })
  },
)

Then(
  'the player {string} now exists in the directory',
  async function (this: CustomWorld, shortname: string) {
    const player = await this.context.db
      .selectFrom('player')
      .selectAll()
      .where('shortname', '=', shortname)
      .executeTakeFirst()

    assert.ok(player, `Player ${shortname} was not found in the database`)
  },
)

Then(
  'the ranking contains the following players in this order:',
  function (this: CustomWorld, table: DataTable) {
    const expected = table.raw().map(([shortname]) => shortname)
    const actual = playersBody(this).items.map(player => player.shortname)

    assert.deepEqual(actual, expected)
  },
)

Then(
  'the displayed profile is that of player {string}',
  function (this: CustomWorld, shortname: string) {
    const player = JSON.parse(this.response.payload) as Selectable<PlayerDb>
    assert.equal(player.shortname, shortname)
  },
)
