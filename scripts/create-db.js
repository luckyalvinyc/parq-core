import pgtools from 'pgtools'
import config from '../config.js'

try {
  await pgtools.createdb({
    user: config.postgres.username,
    password: config.postgres.password
  }, config.postgres.database)

  console.log(`Database ${config.postgres.database} has been created`)
} catch (error) {
  // https://www.postgresql.org/docs/13/errcodes-appendix.html
  // 42P04 - duplicate_database
  if (error?.pgErr?.code !== '42P04') {
    console.error(error.message)

    process.exit(1)
  }

  console.log(`Database ${config.postgres.database} has already been created`)
}
