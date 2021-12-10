import prexit from 'prexit'

import config from '#config'
import sql from './src/pg.js'
import { logger } from './src/logger.js'
import * as server from './src/server.js'

prexit(cleanup)

let close

try {
  close = await server.start(config.server)
} catch (error) {
  logger.error(error)

  await cleanup()
  process.exit(1)
}

/**
 * Cleans up the following resources:
 *  - db
 *  - server
 */

async function cleanup () {
  await sql.end()

  if (close) {
    await close()
  }
}
