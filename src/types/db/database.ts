import type { CountryDb } from './country'
import type { MatchDb } from './match'
import type { PlayerDb } from './player'

export type Database = {
  country: CountryDb
  match: MatchDb
  player: PlayerDb
}
