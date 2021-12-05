import Route from 'polka'

import config from './config.js'
import * as stores from './stores/index.js'
import sql from './pg.js'

const route = Route()

export default route

route.post('/', skema({
  type: 'object',
  required: [
    'entryPoints'
  ],
  properties: {
    entryPoints: {
      type: 'integer',
      minimum: 3
    }
  }
}), create)

async function create (req, res) {
  const { entryPoints } = req.body

  const labels = []

  for (let i = 0; i < entryPoints; i++) {
    const label = String.fromCharCode('A'.charCodeAt() + i)

    labels.push(label)
  }
}

route.post('/park', skema({
  type: 'object',
  required: [
    'entranceId',
    'vehicleType'
  ],
  properties: {
    entranceId: {
      type: 'integer',
      minimum: 0
    },
    vehicleType: {
      enum: [
        'small',
        'medium',
        'large'
      ]
    }
  }
}), park)

async function park (req, res) {
  const {
    entranceId,
    vehicleType
  } = req.body

  const slots = await stores.slots.listForVehicleType(vehicleType)

  if (!slots.length) {
    throw new Error('no_more_available_slots')
  }

  const slot = findNearestSlotFromEntrace(entranceId, slots)

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

export function findNearestSlotFromEntrace (entranceId, slots) {
  let nearestSlot = slots[0]
  let min = nearestSlot.distance[entranceId]

  for (const slot of slots.slice(1)) {
    const distance = slot.distance[entranceId]

    if (distance >= min) {
      continue
    }

    min = distance
    nearestSlot = slot
  }

  return nearestSlot
}

function skema () {
  return function (req, res) {

  }
}
