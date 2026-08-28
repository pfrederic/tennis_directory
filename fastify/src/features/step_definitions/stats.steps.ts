import assert from 'node:assert/strict'
import { DataTable, Given, Then, When } from '@cucumber/cucumber'
import { StatsBody } from '@/plugins/stats/stats.type'
import { CustomWorld } from '../support/world'

interface MatchHistoryRow {
  result: string
  date: string
}

function statsBody(world: CustomWorld): StatsBody {
  return JSON.parse(world.response.payload) as StatsBody
}

Given(
  'the following match history is recorded for player {string}:',
  async function (this: CustomWorld, shortname: string, table: DataTable) {
    const rows = table.hashes() as unknown as MatchHistoryRow[]
    const player_id = this.playerId(shortname)

    for (const row of rows) {
      await this.createMatch({
        player_id,
        isWinning: row.result === 'win',
        date: new Date(row.date),
      })
    }
  },
)

When('I view the global statistics', async function (this: CustomWorld) {
  await this.inject({ method: 'GET', url: '/stats' })
})

Then(
  'the average BMI is {float}',
  function (this: CustomWorld, expected: number) {
    assert.equal(statsBody(this).avg_imc, expected)
  },
)

Then(
  'the height median is {float}',
  function (this: CustomWorld, expected: number) {
    assert.equal(statsBody(this).height_median, expected)
  },
)

Then(
  'the country with the best win ratio is {string} with a win ratio of {float}',
  function (this: CustomWorld, countryCode: string, winRatio: number) {
    const best = statsBody(this).country_with_best_ratio_win
    assert.ok(best, 'No country with a best win ratio was returned')
    assert.equal(best.country_code, countryCode)
    assert.equal(Number(best.win_ratio), winRatio)
  },
)

Then(
  'there is no country with a best win ratio',
  function (this: CustomWorld) {
    assert.equal(statsBody(this).country_with_best_ratio_win, null)
  },
)
