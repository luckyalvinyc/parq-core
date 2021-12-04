import Polka from 'polka'

/**
 * @param {object} config
 * @param {number} config.port
 * @returns {() => Promise<void>}
 */

export function start (config) {
  const server = Polka()

  server.post('/pay', skema({
    ticketId: {
      type: 'integer',
      minimum: 1
    }
  }), async (req, res) => {
    const { ticketId } = req.body

    const ticket = await store.tickets.findById(ticketId)

    if (!ticket) {
      throw new Error('not_found')
    }

    // send
  })

  server.listen(config.port, onListen.bind(null, config.port))

  return function close () {
    return new Promise((resolve, reject) => {
      /**
       * @type {import('http').Server}
       */
      const _server = server.server

      _server.close(error => {
        error ? reject(error) : resolve()
      })
    })
  }
}

function skema () {
  return function (req, res, next) {
    next()
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
