import { execute } from './utils.js'

export const TABLE_NAME = 'tickets'

/**
 * Creates a ticket based on the slot occupied
 *
 * @param {number} slotId
 * @param {number} rate
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<object>}
 */

export async function create (slotId, rate, options = {}) {
  const sql = execute(options.txn)

  const rowToBeInserted = {
    slot_id: slotId,
    rate
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
    id: parseInt(row.id, 10),
    slotId: row.slot_id,
    rate: Number(row.rate),
    startedAt: row.started_at
  }
}
