import { buildApp } from './app'

async function start() {
  const fastify = await buildApp()

  fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    fastify.log.info(`Server listening at ${address}`)
  })
}

start()
