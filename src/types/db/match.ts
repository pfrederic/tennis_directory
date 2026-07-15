import type { Generated } from 'kysely'
import type { Timestamp } from './column-types'

export interface MatchDb {
  date: Timestamp
  id: Generated<number>
  isWinning: boolean
  player_id: number | null
}
