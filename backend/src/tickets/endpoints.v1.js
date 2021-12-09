import Route from 'polka'

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
    vehicleType
  } = req.body

  const ticket = await operations.issueTicket(entryPointId, vehicleType)

  res.send({
    data: {
      ticket: {
        id: ticket.id,
        rate: ticket.rate,
        startedAt: ticket.startedAt
      }
    }
  })
}

route.post('/:ticketId',
  skema(schemas.update, schemas.options), update)

async function update (req, res) {
  const { ticketId } = req.params

  const ticket = await operations.pay(ticketId)

  res.send({
    data: {
      ticket
    }
  })
}
