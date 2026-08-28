import { FastifyInstance } from 'fastify'

async function health(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok' }
  })
}

export default health
