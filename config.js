import { env } from 'process'

const {
  NODE_ENV = 'development',

  SMALL_RATE = '20',
  MEDIUM_RATE = '60',
  LARGE_RATE = '100',

  // POSTGRES
  POSTGRES_PORT = '5432',
  POSTGRES_DATABASE = 'parq_core',
  POSTGRES_USERNAME = 'postgres',
  POSTGRES_PASSWORD = 'postgres',
} = env

export default {
  isTest: NODE_ENV === 'test',

  rates: {
    small: Number(SMALL_RATE),
    medium: Number(MEDIUM_RATE),
    large: Number(LARGE_RATE)
  },

  postgres: {
    port: parseInt(POSTGRES_PORT, 10),
    database: POSTGRES_DATABASE,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD
  }
}
