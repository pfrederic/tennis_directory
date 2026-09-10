import type { Request } from 'express'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  pageSize: number
  hasNextPage: boolean
}

export interface RequestWithPagination extends Request {
  pagination?: { page: number; pageSize: number }
}
