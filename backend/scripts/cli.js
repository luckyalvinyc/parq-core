import { argv, exit } from 'process'

import * as db from './db.js'
import config from '../config.js'

const command = argv[2]

switch (command) {
  case 'create':
    await db.create(config.postgres)
    break
  default:
    console.error(`'${command}' not a valid command`)
    exit(1)
}
