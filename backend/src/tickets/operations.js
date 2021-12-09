import Randexp from 'randexp'

import sql from '../pg.js'
import errors from '../errors.js'
import config from '../../config.js'
import * as stores from '../stores/index.js'
import * as strategies from './strategies.js'
import { ONE_DAY_IN_HR, ONE_HOUR_IN_MS } from './constants.js'

const { randexp } = Randexp

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

  const vehicle = await stores.vehicles.create({
    plateNumber: randexp(/[A-Z]{3} [0-9]{4}/),
    type: vehicleType
  })

  const slot = await stores.slots.findNearestAvailableSlot(entryPoint, vehicleType)

  if (!slot) {
    throw errors.badRequest('no_available_slots')
  }

  return sql.begin(async sql => {
    const ticket = await stores.tickets.create(slot, vehicle.id, {
      txn: sql
    })

    const hasBeenOccupied = await stores.slots.occupy(slot.id, {
      txn: sql,
      hash: slot.hash
    })

    if (!hasBeenOccupied) {
      throw errors.badRequest('no_available_slots')
    }

    return ticket
  })
}

/**
 * Pays the total amount that is associated to a ticket
 *
 * Once the ticket has been paid, the slot
 *  will be available for other vehicles to park
 *
 * @param {number} ticketId
 * @returns {Promise<object>}
 */

export async function pay (ticketId) {
  const ticket = await stores.tickets.findById(ticketId)

  if (!ticket) {
    throw errors.notFound('ticket', {
      id: ticketId
    })
  }

  if (ticket.paid) {
    throw errors.badRequest('paid', {
      id: ticketId
    })
  }

  const vehicle = await stores.vehicles.findById(ticket.vehicleId)

  if (!vehicle) {
    throw errors.notFound('vehicle', {
      id: ticket.vehicleId
    })
  }

  const flatRate = computeFlatRate(vehicle.lastVisitedAt)

  const amountToPay = computeAmountToPay(ticket, flatRate, strategies)

  return sql.begin(async sql => {
    const paidTicket = await stores.tickets.pay(ticket.id, amountToPay, {
      txn: sql
    })

    await stores.slots.vacant(ticket.slotId, {
      txn: sql
    })

    // the last_visit_at column will only be updated
    //  when the flat rate is greater than 0,
    //  so that the vehicle concerned won't just come and go
    //  and only end up paying the flat rate
    //
    //  come and go = (within a duration of time, e.g. 1 hour)
    if (flatRate) {
      await stores.vehicles.updateLastVisit(ticket.vehicleId, {
        txn: sql
      })
    }

    return paidTicket
  })
}

/**
 * Computes the flat rate depending when the vehicle last visited
 *
 * @param {Date} lastVisitAt
 * @param {number} [gracePeriodInHours]
 * @param {number} [defaultFlatRate]
 * @returns {number}
 */

function computeFlatRate (lastVisitAt, gracePeriodInHours = 1, defaultFlatRate = config.rates.flat) {
  const timeSpentAway = diffInHours(new Date(), lastVisitAt, Math.round)

  return timeSpentAway <= gracePeriodInHours
    ? 0
    : defaultFlatRate
}

/**
 * Computes the amount to pay
 *
 * The amount will depend on the slot type
 *  and time spent that the vehicle has been parked
 *
 * @param {object} ticket
 * @param {number} ticket.rate
 * @param {Date} ticket.startedAt
 * @param {number} flatRate
 * @param {object} strategies
 * @returns {number}
 */

function computeAmountToPay (ticket, flatRate, strategies) {
  const {
    rate,
    startedAt
  } = ticket

  const hours = diffInHours(new Date(), startedAt)

  const strategy = hours >= ONE_DAY_IN_HR
    ? 'overnight'
    : 'standard'

  return flatRate + strategies[strategy](hours, rate)
}

/**
 * Computes the difference of two dates and returns the difference as hours
 *  accepts an optional `round` function on how the final value will be rounded up
 *
 * @param {Date|number} minuend
 * @param {Date|number} subtrahend
 * @param {function} [round]
 * @returns {number}
 */

function diffInHours (minuend, subtrahend, round = Math.ceil) {
  const diff = (minuend - subtrahend) / ONE_HOUR_IN_MS

  return round(diff)
}
