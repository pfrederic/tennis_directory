import FastifyPlugin from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

async function stats(fastify: FastifyInstance) {
  fastify.get(
    '/stats',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              avg_imc: { type: 'number' },
              height_median: { type: 'number' },
              country_with_best_ratio_win: {
                type: ['object', 'null'],
                properties: {
                  country_code: { type: 'string' },
                  win_ratio: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const avg_imc = await fastify.statsService.getAVG_IMC()
      const height_median = await fastify.statsService.getHeightMedian()
      const country_with_best_ratio_win =
        await fastify.statsService.getCountryWithBestRatioWin()

      return reply.code(200).send({
        avg_imc,
        height_median,
        country_with_best_ratio_win,
      })
    },
  )
}

export default FastifyPlugin(stats, { name: 'stats' })
