import postgres from 'postgres'

const DUPLICATE_DATABASE = '42P04'

/**
 * Creates the database from the provided `config`
 *
 * @param {object} config
 * @param {number} config.port
 * @param {string} config.username
 * @param {string} config.password
 * @param {string} config.database
 * @param {object} [options]
 * @param {boolean} [options.force]
 * @returns {Promise<void>}
 */

export async function create (config, options = {}) {
  const sql = postgres({
    port: config.port,
    user: config.username,
    password: config.password
  })

  if (options.force) {
    await sql`
      DROP DATABASE IF EXISTS ${sql(config.database)};
    `
  }

  try {
    await sql`
      CREATE DATABASE ${sql(config.database)};
    `

    console.log(`Database ${config.database} has been created`)
  } catch (error) {
    // https://www.postgresql.org/docs/13/errcodes-appendix.html
    if (error.code !== DUPLICATE_DATABASE) {
      console.error(error.message)

      process.exit(1)
    }

    console.log(`Database ${config.database} has already been created`)
  } finally {
    sql.end()
  }
}
