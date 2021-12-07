import sql from '../pg.js'
import errors from '../errors.js'
import * as stores from '../stores/index.js'

/**
 * Issues a ticket from a given entry point for a vehicle type
 *
 * @param {number} entryPointId
 * @param {string} vehicleType
 * @returns {Promise<object>}
 */

export async function issueTicket (entryPointId, vehicleType) {
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

  return sql.begin(async sql => {
    await stores.slots.occupy(slot.id, {
      txn: sql
    })

    const ticket = await stores.tickets.create(slot, {
      txn: sql
    })

    return ticket
  })
}
