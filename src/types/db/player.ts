import type { Generated } from 'kysely'
import type { Timestamp } from './column-types'

export interface PlayerDb {
  birthday: Timestamp
  country_id: number
  created_at: Generated<string>
  firstname: string
  height: number
  id: Generated<number>
  lastname: string
  picture: string | null
  points: number
  sex: string
  shortname: string
  weight: number
}
