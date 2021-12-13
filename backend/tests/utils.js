import crypto from 'crypto'
import postgres from 'postgres'
import { post, get } from 'httpie'

import config from '#config'

export const db = {
  async create () {
    const sql = postgres({
      port: config.postgres.port,
      username: config.postgres.username,
      password: config.postgres.password
    })

    const template = config.postgres.database
    const testDB = template + '_' + crypto.randomUUID()

    await sql`CREATE DATABASE ${sql(testDB)} TEMPLATE ${sql(template)}`

    return {
      name: testDB,

      async drop () {
        await sql`DROP DATABASE ${sql(testDB)}`
        await sql.end()
      }
    }
  },

  replace (jest, path, database) {
    const sql = postgres({
      port: config.postgres.port,
      username: config.postgres.username,
      password: config.postgres.password,
      database,

      onnotice () {}
    })

    jest.unstable_mockModule(path, () => ({
      default: sql
    }))

    return sql
  }
}

export const server = {
  start (server) {
    server.listen(0)
    const port = server.server.address().port

    function close () {
      return new Promise((resolve, reject) => {
        /**
         * @type {import('http').Server}
         */
        const _server = server.server


        _server.close(error => {
          error ? reject(error) : resolve()
        })
      })
    }

    function request (port) {
      const baseURL = 'http://localhost:' + port

      return {
        get (path) {
          return get(baseURL + path)
        },

        post (path, body) {
          return post(baseURL + path, body)
        }
      }
    }

    return {
      close,
      request: request(port)
    }
  }
}
