import { fileURLToPath } from 'url'
import { basename, dirname } from 'path'

import Polka from 'polka'
import * as parse from '@polka/parse'
import { fdir } from 'fdir'

import { logger } from './logger.js'
import helpers from './middlewares/helpers.js'

/**
 * Starts the server
 *
 * @param {object} config
 * @param {string} config.host
 * @param {number} config.port
 */

export async function start (config) {
  const server = Polka()

  withErrorHandler(server)

  await setupRoutes(server, onError)

  server.listen(config.port, config.host, onListen.bind(null, config.port))

  return function close () {
    return new Promise(resolve => {
      /**
       * @type {import('http').Server}
       */
      const _server = server.server

      _server.close(error => {
        logger.error(error)

        resolve()
      })
    })
  }
}

/**
 * Adds an error handler from the provided `server`
 *
 * @param {ReturnType<Polka>} server
 * @param {function} handler
 */

export function withErrorHandler (server, handler = onError) {
  applyBaseMiddlewares(server)

  server.onError = onError
}

/**
 * Applies the base middlewares to the server
 *  - parse request body
 *  - `res.send(data)`
 *  - `res.status(code)`
 *
 * @param {ReturnType<Polka>} server
 */

export function applyBaseMiddlewares (server) {
  server
    .use(parse.json())
    .use(helpers)
}

/**
 * Sets up the routes for the server
 *
 * @param {import('polka').Polka} server
 * @param {function} onError
 * @param {string[]} [files]
 */

export async function setupRoutes (server, onError, files = pathToEndpoints()) {
  for (const file of files) {
    const { default: route } = await import(file)
    const [, version] = basename(file, '.js').split('.')

    route.setup()
    route.onError = onError
    server.use(`/api/${version}/${route.prefix}`, route)
  }
}

/**
 * Returns the path to the endponts `endpoints.{version}.js`
 *
 * @returns {string[]}
 */

function pathToEndpoints () {
  const pathToFile = fileURLToPath(import.meta.url)
  const cwd = dirname(pathToFile)

  const files = new fdir()
    .withFullPaths()
    .glob('./**/endpoints.!(*.spec).js')
    .crawl(cwd)
    .sync()

  return files
}

/**
 * Error handler for a route
 */

export function onError (error, req, res) {
  logger.error(error)

  res
    .status(error.statusCode || 500)
    .send({
      error: {
        message: error.message
      }
    })
}

/**
 * It will be called once the server starts listening to the specified port
 *
 * @param {number} port
 * @param {Error} error
 * @private
 */

export function onListen (port, error) {
  if (error) {
    logger.error(error)

    process.exit(1)
  }

  logger.info(`Listening on port ${port}`)
}
