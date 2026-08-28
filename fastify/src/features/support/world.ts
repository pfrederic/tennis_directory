import {
  setWorldConstructor,
  World as CucumberWorld,
  IWorldOptions,
} from '@cucumber/cucumber'
import { FastifyInstance, InjectOptions, LightMyRequestResponse } from 'fastify'
import type { Insertable, Kysely } from 'kysely'
import { CountryDb, Database, MatchDb, PlayerDb } from '@/types/db'

export interface TestContext {
  app: FastifyInstance
  db: Kysely<Database>
}

type NewPlayer = Omit<Insertable<PlayerDb>, 'country_id'> & {
  countryCode: string
}

export class CustomWorld extends CucumberWorld {
  context!: TestContext
  response!: LightMyRequestResponse

  private store = new Map<string, unknown>()

  constructor(options: IWorldOptions) {
    super(options)
  }

  async inject(options: InjectOptions): Promise<LightMyRequestResponse> {
    this.response = await this.context.app.inject(options)
    return this.response
  }

  remember<T>(key: string, value: T): void {
    this.store.set(key, value)
  }

  recall<T>(key: string): T {
    if (!this.store.has(key)) {
      throw new Error(`Aucune valeur mémorisée sous la clé "${key}"`)
    }
    return this.store.get(key) as T
  }

  async createCountry(country: Insertable<CountryDb>): Promise<number> {
    const inserted = await this.context.db
      .insertInto('country')
      .values(country)
      .returning('id')
      .executeTakeFirstOrThrow()

    return inserted.id
  }

  async findCountryIdByCode(code: string): Promise<number> {
    const country = await this.context.db
      .selectFrom('country')
      .select('id')
      .where('code', '=', code)
      .executeTakeFirstOrThrow()

    return country.id
  }

  async createPlayer(player: NewPlayer): Promise<number> {
    const { countryCode, ...rest } = player
    const country_id = await this.findCountryIdByCode(countryCode)

    const inserted = await this.context.db
      .insertInto('player')
      .values({ ...rest, country_id })
      .returning('id')
      .executeTakeFirstOrThrow()

    this.remember(`player:${rest.shortname}`, inserted.id)
    return inserted.id
  }

  playerId(shortname: string): number {
    return this.recall<number>(`player:${shortname}`)
  }

  async createMatch(match: Insertable<MatchDb>): Promise<void> {
    await this.context.db.insertInto('match').values(match).execute()
  }
}

setWorldConstructor(CustomWorld)
