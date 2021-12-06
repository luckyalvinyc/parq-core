import prexit from 'prexit'

import config from './config.js'
import sql from './src/pg.js'
import * as server from './src/server.js'

prexit(cleanup)

let close

try {
  close = server.start(config.server)
} catch (error) {
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
