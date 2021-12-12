import sql from '../pg.js'
import config from '../../config.js'
import { valuesForInsert } from './utils.js'

export const TABLE_NAME = 'tickets'

/**
 * Creates a ticket based on the slot occupied
 *
 * @param {object} slot
 * @param {number} slot.id
 * @param {string} slot.type
 * @param {string} vehicleId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<ReturnType<toTicket>>}
 */

export async function create (slot, vehicleId, options = {}) {
  const sqlt = options.txn || sql

  const rowToBeInserted = {
    slot_id: slot.id,
    vehicle_id: vehicleId,
    rate: config.rates.perHour[slot.type]
  }

  const [row] = await sqlt`
    INSERT INTO
      ${sql(TABLE_NAME)} ${valuesForInsert(sql, rowToBeInserted)}
    RETURNING
      ${sql(baseColumns())};
  `

  return toTicket(row)
}

/**
 * Retrieves a ticket from the provided `ticketId`
 *
 * @param {number} ticketId
 * @returns {Promise<ReturnType<toTicket>?>}
 */

export async function findById (ticketId) {
  const [row] = await sql`
    SELECT
      ${sql(baseColumns())}
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${ticketId};
  `

  if (!row) {
    return null
  }

  return toTicket(row)
}

/**
 * Checks if the provided `vehicleId` have ticket that is still not paid
 *
 * @param {string} vehicleId
 * @returns {Promise<boolean>}
 */

export async function checkForUnpaidTicket (vehicleId) {
  const [row] = await sql`
    SELECT
      id
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      vehicle_id = ${vehicleId} AND
      paid = false
    LIMIT 1;
  `

  return row !== undefined
}

/**
 * Sets the `paid` to `true` and the `amount` that has been charged
 *
 * @param {number} ticketId
 * @param {number} amount
 * @param {object} [options]
 * @param {object} [options.txn]
 * @param {Date} [options.endAt]
 * @returns {Promise<ReturnType<toTicket>?>}
 */

export async function pay (ticketId, amount, options = {}) {
  const {
    txn,
    endAt = null
  } = options

  const sqlt = txn || sql

  const [row] = await sqlt`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      amount = ${amount},
      paid = true,
      updated_at = COALESCE(${endAt}, CURRENT_TIMESTAMP)
    WHERE
      id = ${ticketId}
    RETURNING
      ${sql(columnsForPaid())};
  `

  if (!row) {
    return null
  }

  return toTicket(row)
}

function baseColumns () {
  return [
    'id',
    'slot_id',
    'vehicle_id',
    'rate',
    'paid',
    'created_at'
  ]
}

function columnsForPaid () {
  return baseColumns().concat([
    'amount',
    'updated_at'
  ])
}

/**
 * Converts the given ticket to a DB compatible object
 *
 * @param {object} ticket
 * @param {number} ticket.slotId
 * @param {string} ticket.vehicleId
 * @param {number} ticket.rate
 */

export function build (ticket) {
  const {
    slotId,
    vehicleId,
    rate
  } = ticket

  return {
    slot_id: slotId,
    vehicle_id: vehicleId,
    rate
  }
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {number} row.id
 * @param {number} row.slot_id
 * @param {string} row.vehicle_id
 * @param {number} row.rate
 * @param {boolean} row.paid
 * @param {number} [row.amount]
 * @param {Date} row.created_at
 * @param {Date} [row.updated_at]
 * @private
 */

function toTicket (row) {
  const ticket = {
    id: row.id,
    slotId: row.slot_id,
    vehicleId: row.vehicle_id,
    rate: Number(row.rate),
    paid: row.paid,
    startedAt: row.created_at
  }

  if (row.amount) {
    ticket.amount = Number(row.amount)
  }

  if (row.updated_at) {
    ticket.endedAt = row.updated_at
  }

  return ticket
}
