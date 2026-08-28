import type { Generated } from 'kysely'

export interface CountryDb {
  code: string
  id: Generated<number>
  picture: string | null
}
