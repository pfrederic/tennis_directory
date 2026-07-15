import { FastifyInstance } from 'fastify'
import FastifyPlugin from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    paginationSchemas: {
      query: object
    }
    paginate<T>(
      query: (pageSize: number, page: number, ...args: any[]) => Promise<T[]>,
      pageSize: number,
      page: number,
      ...args: any[]
    ): Promise<{
      items: T[]
      page: number
      pageSize: number
      hasNextPage: boolean
    }>
  }
}

export type PaginationQuery = {
  page?: number
  pageSize?: number
}

async function pagination(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'PaginationQuery',
    type: 'object',
    properties: {
      page: { type: 'number', minimum: 1, default: 1 },
      pageSize: { type: 'number', minimum: 1, maximum: 100, default: 10 },
    },
  })
  fastify.decorate(
    'paginate',
    async <T>(
      query: (pageSize: number, page: number, ...args: any[]) => Promise<T[]>,
      pageSize: number,
      page: number,
      ...args: any[]
    ) => {
      const newPageSize = pageSize + 1
      const items = await query(newPageSize, page, ...args)
      const hasNextPage = items.length > pageSize
      const paginatedItems = hasNextPage ? items.slice(0, -1) : items
      return { items: paginatedItems, page, pageSize, hasNextPage }
    },
  )
}

export default FastifyPlugin(pagination, { name: 'pagination' })
