import Route from 'polka'

import sql from '../../pg.js'
import errors from '../../errors.js'
import * as stores from '../../stores/index.js'

// middleware
import skema from '../middlewares/skema.js'

const route = Route()
route.prefix = 'tickets'

export default route

route.post('/', skema({
  body: {
    type: 'object',
    required: [
      'entryPointId',
      'vehicleType'
    ],
    properties: {
      entryPointId: {
        type: 'integer',
        minimum: 1
      },
      vehicleType: {
        enum: [
          'small',
          'medium',
          'large'
        ]
      }
    }
  }
}), create)

/**
 * Handles requests for creating tickets for each vehicle type
 */

export async function create (req, res) {
  const {
    entryPointId,
    vehicleType
  } = req.body

  const entryPoint = await stores.entryPoints.findById(entryPointId)

  if (!entryPoint) {
    throw errors.notFound('entry_point', {
      id: entryPointId
    })
  }

  const slot = await stores.slots.findNearestAvailableSlot(entryPoint, vehicleType)

  if (!slot) {
    throw errors.badRequest('no_available_slots')
  }

  const ticket = await sql.begin(async sql => {
    await stores.slots.occupy(slot.id, {
      txn: sql
    })

    const ticket = await stores.tickets.create(slot.id, slot.type, {
      txn: sql
    })

    return ticket
  })

  res.send({
    data: {
      ticket: {
        id: ticket.id,
        startedAt: ticket.startedAt
      }
    }
  })
}
