import Route from 'polka'

import config from '#config'
import errors from '../errors.js'
import * as schemas from './schemas.js'
import * as operations from './operations.js'

// middleware
import skema from '../middlewares/skema.js'

const route = Route()
route.prefix = 'tickets'

export default route

route.post('/', skema(schemas.create), create)

/**
 * Handles requests for creating tickets for each vehicle type
 */

async function create (req, res) {
  const {
    entryPointId,
    vehicle
  } = req.body

  const ticket = await operations.issueTicket(entryPointId, vehicle)

  res.send({
    data: {
      ticket
    }
  })
}

route.post('/:ticketId',
  skema(schemas.update, schemas.options), validateEndAt, update)

function validateEndAt (req, res, next) {
  const { endAt } = req.body

  if (!endAt) {
    return next()
  }

  const endAtDate = new Date(endAt)

  const now = new Date()
  now.setMilliseconds(0)

  if (endAtDate < now) {
    return next(errors.badRequest('validation'))
  }

  req.body.endAt = endAtDate

  next()
}

async function update (req, res) {
  const { ticketId } = req.params
  const { endAt } = req.body

  const options = {}

  if (config.isDev) {
    options.endAt = endAt
  }

  const ticket = await operations.payTicket(ticketId, options)

  res.send({
    data: {
      ticket
    }
  })
}
