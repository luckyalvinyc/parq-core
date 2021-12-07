import send from '@polka/send'

export default helpers

/**
 * Adds response helper methods:
 *  - `send(data)`
 *  - `status(code)`
 */

function helpers (req, res, next) {
  res.send = data => {
    send(res, res.statusCode || 200, JSON.stringify(data), {
      'Content-Type': 'application/json; charset=utf-8'
    })
  }

  res.status = code => {
    res.statusCode = code

    return res
  }

  next()
}
