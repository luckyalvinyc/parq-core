import Polka from 'polka'

/**
 * @param {object} config
 * @param {string} config.host
 * @param {number} config.port
 * @returns {() => Promise<void>}
 */

export function start (config) {
  const server = Polka()

  server.listen(config.port, config.host, onListen.bind(null, config.port))

  return function close () {
    return new Promise(resolve => {
      /**
       * @type {import('http').Server}
       */
      const _server = server.server

      _server.close(error => {
        console.error(error)

        resolve()
      })
    })
  }
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
    console.error(error.message)
    process.exit(1)
  }

  console.log(`Listening on port ${port}`)
}
