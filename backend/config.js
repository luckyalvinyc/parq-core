import { env } from 'process'

import dotenv from 'dotenv'

const Env = {
  dev: 'development',
  test: 'test'
}

if (env.NODE_ENV === Env.dev) {
  dotenv.config()
}

const {
  NODE_ENV = Env.dev,

  SERVER_HOST = 'localhost',
  SERVER_PORT = '3000',

  INITIAL_HOURS = '3',

  FLAT_RATE = '40',
  FULL_DAY_RATE = '5000',

  SMALL_RATE = '20',
  MEDIUM_RATE = '60',
  LARGE_RATE = '100',

  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD
} = env

export default {
  isDev: NODE_ENV === Env.dev,
  isTest: NODE_ENV === Env.test,

  server: {
    host: SERVER_HOST,
    port: parseInt(SERVER_PORT, 10)
  },

  initialHours: parseInt(INITIAL_HOURS),

  rates: {
    flat: Number(FLAT_RATE),
    fullDay: Number(FULL_DAY_RATE),

    perHour: {
      small: Number(SMALL_RATE),
      medium: Number(MEDIUM_RATE),
      large: Number(LARGE_RATE)
    }
  },

  postgres: postgresDefaults({
    port: parseInt(POSTGRES_PORT, 10),
    database: POSTGRES_DATABASE,
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD
  })
}

function postgresDefaults (config) {
  return {
    port: config.port || 5432,
    database: config.database || 'parq_core',
    username: config.username || 'postgres',
    password: config.password || 'postgres'
  }
}
