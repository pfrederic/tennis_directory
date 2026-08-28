import { buildApp } from './app'

async function start() {
  const fastify = await buildApp()

  const port = process.env.PORT ? Number(process.env.PORT) : 3000

  fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`Server listening at ${address}`)
  })
}

start()
