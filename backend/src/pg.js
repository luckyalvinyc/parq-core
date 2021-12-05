import postgres from 'postgres'

import config from '../config.js'

export default connect(config.postgres)

export function connect (conf = config.postgres) {
  return postgres({
    port: conf.port,
    username: conf.username,
    password: conf.password,
    database: conf.database,

    onnotice (message) {
      if (config.isTest) {
        return
      }

      console.log(message)
    }
  })
}
