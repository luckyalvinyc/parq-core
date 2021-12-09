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

  return toTicket(row)
}

/**
 * Sets the `paid` to `true` and the `amount` that has been charged
 *
 * @param {number} ticketId
 * @param {number} amount
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<ReturnType<toTicket>>}
 */

export async function pay (ticketId, amount, options = {}) {
  const sqlt = options.txn || sql

  const [row] = await sqlt`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      amount = ${amount},
      paid = true,
      ended_at = CURRENT_TIMESTAMP
    WHERE
      id = ${ticketId}
    RETURNING
      ${sql(columnsForPaid())};
  `

  return toTicket(row)
}

function baseColumns () {
  return [
    'id',
    'slot_id',
    'vehicle_id',
    'rate',
    'paid',
    'started_at'
  ]
}

function columnsForPaid () {
  return baseColumns().concat([
    'amount',
    'ended_at'
  ])
}

export function build (ticket) {
  return {

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
 * @param {Date} row.started_at
 * @param {Date} [row.ended_at]
 * @private
 */

function toTicket (row) {
  const ticket = {
    id: row.id,
    slotId: row.slot_id,
    vehicleId: row.vehicle_id,
    rate: Number(row.rate),
    paid: row.paid,
    startedAt: row.started_at
  }

  if (row.amount) {
    ticket.amount = Number(row.amount)
  }

  if (row.ended_at) {
    ticket.endedAt = row.ended_at
  }

  return ticket
}
