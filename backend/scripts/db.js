import pgtools from 'pgtools'

export async function create (config) {
  try {
    await pgtools.createdb({
      user: config.username,
      password: config.password
    }, config.database)

    console.log(`Database ${config.database} has been created`)
  } catch (error) {
    // https://www.postgresql.org/docs/13/errcodes-appendix.html
    // 42P04 - duplicate_database
    if (error?.pgErr?.code !== '42P04') {
      console.error(error.message)

      process.exit(1)
    }

    console.log(`Database ${config.database} has already been created`)
  }
}
