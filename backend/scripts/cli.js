import { argv, exit } from 'process'

import config from '#config'
import * as db from './db.js'

const command = argv[2]

switch (command) {
  case 'create':
    await db.create(config.postgres)
    break
  default:
    console.error(`'${command}' not a valid command`)
    exit(1)
}
