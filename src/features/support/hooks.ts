import { execSync } from 'node:child_process'
import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  ITestCaseHookParameter,
  Status,
} from '@cucumber/cucumber'
import { FastifyInstance } from 'fastify'
import { buildApp } from '@/app'
import { db } from '@/infra/db/setup'
import { CustomWorld } from './world'

let app: FastifyInstance

BeforeAll(async function () {
  execSync('yarn migrate:run', {
    env: { ...process.env, ENV_FILE: '.env.test' },
    stdio: 'inherit',
  })

  app = await buildApp({ logger: false })
  await app.ready()
})

AfterAll(async function () {
  if (app) {
    await app.close()
  }
  await db.destroy()
})

Before(async function (this: CustomWorld) {
  this.context = { app, db }

  await db.deleteFrom('match').execute()
  await db.deleteFrom('player').execute()
  await db.deleteFrom('country').execute()
})

After(async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
  if (result?.status === Status.FAILED && this.response) {
    console.error(
      `Échec du scénario — dernière réponse HTTP : ${this.response.statusCode}\n${this.response.payload}`,
    )
  }
})
