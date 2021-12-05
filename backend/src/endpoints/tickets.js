import Route from 'polka'

import sql from '../pg.js'
import errors from '../errors.js'
import config from '../../config.js'
import * as stores from '../stores/index.js'

// middleware
import skema from './middlewares/skema.js'

const route = Route()

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

  const entryPointExists = await stores.entryPoints.exists(entryPointId)

  if (!entryPointExists) {
    throw errors.notFound('entry_point', {
      id: entryPointId
    })
  }

  const slots = await stores.slots.listForVehicleType(vehicleType)

  if (!slots.length) {
    throw errors.badRequest('no_available_slots')
  }

  const slot = findNearestSlot(entryPointId, slots)

  const ticket = await sql.begin(async sql => {
    await stores.slots.occupy(slot.id, {
      txn: sql
    })

    const ticket = await stores.tickets.create(slot.id, config.rates[slot.type], {
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

/**
 * Returns the nearest slot from a given entry point
 *
 * @param {number} entryPointId
 * @param {object[]} slots
 * @param {object} slots[].distance
 * @returns {object}
 */

export function findNearestSlot (entryPointId, slots) {
  let nearestSlot = slots[0]
  let min = nearestSlot.distance[entryPointId]

  for (const slot of slots.slice(1)) {
    const distance = slot.distance[entryPointId]

    if (distance >= min) {
      continue
    }

    min = distance
    nearestSlot = slot
  }

  return nearestSlot
}

