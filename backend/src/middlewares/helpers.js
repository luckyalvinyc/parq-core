import send from '@polka/send'

export default helpers

/**
 * Adds the following methods to the response object:
 *  - `res.send(data)`
 *  - `res.status(code)`
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
