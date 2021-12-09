import crypto from 'crypto'
import postgres from 'postgres'

import config from '../config.js'

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
  },

  values (sql, rows) {
    let row = rows

    if (Array.isArray(rows)) {
      row = rows[0]
    }

    const columns = Object.keys(row)
    const args = [rows].concat(columns)

    return sql.apply(sql, args)
  }
}
