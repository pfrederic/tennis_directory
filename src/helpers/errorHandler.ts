import { FastifyRequest, FastifyReply } from 'fastify'

function errorHandler<TError>(
  error: TError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if ((error as any).validation) {
    return reply.code(400).send({
      error: 'Query string invalide',
      details: (error as any).validation,
    })
  }
  return reply.send(error)
}

export default errorHandler
