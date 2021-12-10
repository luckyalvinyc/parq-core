import pino from 'pino'

import config from '#config'

let transport

if (config.isDev) {
  transport = {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
}

export const logger = pino({
  enabled: !config.isTest,
  transport
})
