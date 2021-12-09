import config from '#config'

import pino from 'pino'

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
