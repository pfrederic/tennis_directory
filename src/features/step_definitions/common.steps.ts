import assert from 'node:assert/strict'
import { Then } from '@cucumber/cucumber'
import { CustomWorld } from '../support/world'
import { PaginatedBody } from '@/helpers/commonType'

function paginatedBody(world: CustomWorld): PaginatedBody {
  return JSON.parse(world.response.payload) as PaginatedBody
}

Then(
  'the response has status {int}',
  function (this: CustomWorld, statusCode: number) {
    assert.equal(
      this.response.statusCode,
      statusCode,
      `Received response: ${this.response.payload}`,
    )
  },
)

Then(
  /^the response contains (\d+) (?:player|match)\(s\)$/,
  function (this: CustomWorld, count: string) {
    const body = paginatedBody(this)
    assert.equal(body.items.length, Number(count))
  },
)

Then('the next page is available', function (this: CustomWorld) {
  const body = paginatedBody(this)
  assert.equal(body.hasNextPage, true)
})
