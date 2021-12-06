import postgres from 'postgres'

import config from '../config.js'

export default postgres({
  port: config.postgres.port,
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,

  onnotice: onNotice.bind(null, config.isTest)
})

export function onNotice (isTest, message) {
  if (isTest) {
    return
  }

  console.log(message)
}
