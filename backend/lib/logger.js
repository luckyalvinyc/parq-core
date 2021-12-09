import { env } from 'process'

import pino from 'pino'

export const logger = pino({
  enabled: env.NODE_ENV !== 'test'
})
