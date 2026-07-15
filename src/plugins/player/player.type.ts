import { PlayerDb } from '@/types/db'
import { HttpError } from '@/types/http/error'
import { Selectable } from 'kysely'

export type PlayerRow = {
  firstname: string
  lastname: string
  shortname: string
  sex: string
  birthday: string
  weight: string
  height: string
  points: string
  country?: string
}

export type PlayersBody = {
  items: Selectable<PlayerDb>[]
  page: number
  pageSize: number
  hasNextPage: boolean
}

export type GetPlayersQuery = {
  Querystring: {
    rankSort?: 'asc' | 'desc'
    page: number
    pageSize: number
  }
  Reply: {
    items: Selectable<PlayerDb>[]
    page: number
    pageSize: number
    hasNextPage: boolean
  }
}

export type GetPlayerByIdParams = {
  Params: {
    id: number
  }
  Reply: Selectable<PlayerDb> | HttpError
}
