import { FastifyInstance } from 'fastify'

function apiLogs(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, _reply) => {
    fastify.log.info(
      `Incoming request : ${request.method} ${request.url} at ${Date.now()}`,
    )
  })
}

export default apiLogs
