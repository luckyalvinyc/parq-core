import { env } from 'process'

const {
  NODE_ENV = 'development',

  SERVER_HOST = 'localhost',
  SERVER_PORT = '3000',

  FLAT_RATE = '40',
  FULL_DAY_RATE = '5000',

  SMALL_RATE = '20',
  MEDIUM_RATE = '60',
  LARGE_RATE = '100',

  // POSTGRES
  POSTGRES_PORT = '5432',
  POSTGRES_DATABASE = 'parq_core',
  POSTGRES_USERNAME = 'postgres',
  POSTGRES_PASSWORD = 'postgres'
} = env

export default {
  isTest: NODE_ENV === 'test',

  server: {
    host: SERVER_HOST,
    port: parseInt(SERVER_PORT, 10)
  },

  rates: {
    flat: Number(FLAT_RATE),
    fullDay: Number(FULL_DAY_RATE),

    perHour: {
      small: Number(SMALL_RATE),
      medium: Number(MEDIUM_RATE),
      large: Number(LARGE_RATE)
    }
  },

  postgres: {
    port: parseInt(POSTGRES_PORT, 10),
    database: POSTGRES_DATABASE,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD
  }
}
