import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'
import playerController from './plugins/player/player.controller'
import statsController from './plugins/stats/stats.controller'
import health from './plugins/health'
import apiLogs from './hooks/API_logs'
import errorHandler from './helpers/errorHandler'
import { PlayerService } from './plugins/player/player.service'
import { StatsService } from './plugins/stats/stats.service'
import { db } from './infra/db/setup'
import pagination from './plugins/pagination'

const isDev = process.env.ENV !== 'production'

declare module 'fastify' {
  interface FastifyInstance {
    playerService: PlayerService
    statsService: StatsService
  }
}

export async function buildApp(
  opts: FastifyServerOptions = {},
): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }
      : true,
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
    ...opts,
  })

  apiLogs(fastify)
  await fastify.register(pagination)

  fastify.decorate('playerService', new PlayerService(db))
  await fastify.register(playerController, { dependency: ['pagination'] })

  fastify.decorate('statsService', new StatsService(db))
  await fastify.register(statsController, { dependency: ['statsService'] })

  await fastify.register(health)
  fastify.setErrorHandler(errorHandler)

  return fastify
}
