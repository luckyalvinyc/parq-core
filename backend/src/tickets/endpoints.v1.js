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

export async function create (req, res) {
  const {
    entryPointId,
    vehicleType
  } = req.body

  const ticket = await operations.issueTicket(entryPointId, vehicleType)

  res.send({
    data: {
      ticket: {
        id: ticket.id,
        startedAt: ticket.startedAt
      }
    }
  })
}
