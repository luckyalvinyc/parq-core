import { env } from 'process'
import ley from 'ley'

import { create as createDB } from '../scripts/db.js'

export default setup

async function setup () {
  env.TZ = 'GMT'
  env.POSTGRES_DATABASE = 'parq_core_test'

  const mod = await import('../config.js')
  const config = mod.default

  await createDB(config.postgres)

  await ley.up({
    dir: 'migrations',
    driver: 'postgres',
    config: config.postgres
  })
}
