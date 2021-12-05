import postgres from 'postgres'

import config from '../config.js'

export default postgres({
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,

  onnotice (message) {
    if (config.isTest) {
      return
    }

    console.log(message)
  }
})
