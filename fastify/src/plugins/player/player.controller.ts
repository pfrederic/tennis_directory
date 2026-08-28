import FastifyPlugin from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { PlayerDb } from '@/types/db'
import type { Insertable, Selectable } from 'kysely'
import { GetPlayersQuery, GetPlayerByIdParams } from './player.type'

async function player(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: 'Player',
    type: 'object',
    properties: {
      id: { type: 'number' },
      firstname: { type: 'string' },
      lastname: { type: 'string' },
      shortname: { type: 'string' },
      sex: { type: 'string' },
      picture: { type: 'string' },
      birthday: { type: 'string', format: 'date' },
      weight: { type: 'number' },
      height: { type: 'number' },
      points: { type: 'number' },
      country_id: { type: 'number' },
      created_at: { type: 'string', format: 'date-time' },
    },
  })

  fastify.get<GetPlayersQuery>(
    '/players',
    {
      schema: {
        querystring: {
          allOf: [
            { $ref: 'PaginationQuery#' },
            {
              type: 'object',
              properties: {
                rankSort: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc',
                },
              },
            },
          ],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: 'Player#' },
              },
              page: { type: 'number' },
              pageSize: { type: 'number' },
              hasNextPage: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, rankSort } = request.query

      const playersPaginated = await fastify.paginate<Selectable<PlayerDb>>(
        fastify.playerService.getPlayers,
        pageSize,
        page,
        rankSort,
      )

      return reply.code(200).send(playersPaginated)
    },
  )

  fastify.get<GetPlayerByIdParams>(
    '/players/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
          required: ['id'],
        },
        response: {
          200: { $ref: 'Player#' },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const player = await fastify.playerService.getPlayerById(id)
      if (!player) {
        return reply.code(404).send({ error: 'Player not found' })
      }
      return reply.code(200).send(player)
    },
  )

  fastify.post(
    '/players',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            shortname: { type: 'string' },
            sex: { type: 'string' },
            picture: { type: 'string' },
            birthday: { type: 'string', format: 'date' },
            weight: { type: 'number' },
            height: { type: 'number' },
            points: { type: 'number' },
            country_id: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'boolean',
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const newPlayer: Insertable<PlayerDb> =
        request.body as Insertable<PlayerDb>
      await fastify.playerService.insertPlayer(newPlayer)

      return reply.code(200).send({ message: 'Player created successfully' })
    },
  )
}

export default FastifyPlugin(player, { name: 'player' })
