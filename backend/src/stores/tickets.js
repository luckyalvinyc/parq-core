import config from '../../config.js'
import { execute } from './utils.js'

export const TABLE_NAME = 'tickets'

/**
 * Creates a ticket based on the slot occupied
 *
 * @param {object} slot
 * @param {number} slot.id
 * @param {string} slot.type
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<object>}
 */

export async function create (slot, options = {}) {
  const sql = execute(options.txn)

  const rowToBeInserted = {
    slot_id: slot.id,
    rate: config.rates.perHour[slot.type]
  }

  const [ row ] = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowToBeInserted, 'slot_id', 'rate')}
    RETURNING
      id,
      slot_id,
      rate,
      started_at
  `

  return toTicket(row)
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @private
 */

function toTicket (row) {
  return {
    id: row.id,
    slotId: row.slot_id,
    rate: Number(row.rate),
    startedAt: row.started_at
  }
}
