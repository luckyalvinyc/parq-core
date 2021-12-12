import sql from '../pg.js'
import errors from '../errors.js'
import config from '#config'
import * as stores from '#stores'
import * as strategies from './strategies.js'
import { ONE_DAY_IN_HR, ONE_HOUR_IN_MS } from './constants.js'

/**
 * Issues a ticket from a given entry point for a vehicle type
 *
 * @param {number} entryPointId
 * @param {object} vehicle
 * @param {string} vehicle.plateNumber
 * @param {string} vehicle.type
 */

export async function issueTicket (entryPointId, vehicle) {
  const entryPoint = await stores.entryPoints.findById(entryPointId)

  if (!entryPoint) {
    throw errors.notFound('entry_point', {
      id: entryPointId
    })
  }

  const createdVehicle = await stores.vehicles.create({
    plateNumber: vehicle.plateNumber,
    type: vehicle.type
  })

  const hasUnpaidTicket = await stores.tickets.checkForUnpaidTicket(createdVehicle.id)

  if (hasUnpaidTicket) {
    throw errors.badRequest('already_parked')
  }

  const slot = await stores.slots.findNearestAvailableSlot(entryPoint, createdVehicle.type)

  if (!slot) {
    throw errors.badRequest('no_available_slots')
  }

  return sql.begin(async sql => {
    const ticket = await stores.tickets.create(slot, createdVehicle.id, {
      txn: sql
    })

    const hasBeenOccupied = await stores.slots.occupy(slot.id, {
      txn: sql,
      hash: slot.hash
    })

    if (!hasBeenOccupied) {
      throw errors.badRequest('no_available_slots')
    }

    return {
      id: ticket.id,
      slotId: ticket.slotId,
      vehicleId: ticket.vehicleId,
      type: slot.type,
      rate: ticket.rate,
      startedAt: ticket.startedAt
    }
  })
}

/**
 * Pays the amount that is associated to a ticket
 *
 * Once the ticket has been paid, the slot
 *  will be available for other vehicles to park
 *
 * @param {number} ticketId
 * @param {object} [options]
 * @param {Date} [options.endAt]
 */

export async function payTicket (ticketId, options = {}) {
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

  const { endAt } = options
  const flatRate = computeFlatRate(vehicle.lastVisitedAt)
  const amountToPay = computeAmountToPay(ticket, flatRate, strategies, endAt)

  return sql.begin(async sql => {
    const paidTicket = await stores.tickets.pay(ticket.id, amountToPay, {
      txn: sql,
      endAt
    })

    await stores.slots.vacant(ticket.slotId, {
      txn: sql
    })

    await stores.vehicles.updateLastVisit(ticket.vehicleId, {
      txn: sql,
      endAt
    })

    return paidTicket
  })
}

/**
 * Computes the flat rate depending when the vehicle last visited
 *
 * @param {Date} [lastVisitedAt]
 * @param {number} [gracePeriodInHours]
 * @param {number} [defaultFlatRate]
 * @returns {number}
 */

function computeFlatRate (lastVisitedAt, gracePeriodInHours = 1, defaultFlatRate = config.rates.flat) {
  if (!lastVisitedAt) {
    return defaultFlatRate
  }

  let now = new Date()

  // we only allow this behavior during development
  //  as we are able to set a custom time to end
  if (config.isDev && now < lastVisitedAt) {
    now = lastVisitedAt
    lastVisitedAt = new Date()
  }

  const timeSpentAway = diffInHours(now, lastVisitedAt, Math.round)

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
 * @param {Date} [endAt]
 * @returns {number}
 */

function computeAmountToPay (ticket, flatRate, strategies, endAt = new Date()) {
  const {
    rate,
    startedAt
  } = ticket

  const hours = diffInHours(endAt, startedAt)

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
