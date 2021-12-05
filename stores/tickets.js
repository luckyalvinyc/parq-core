import { execute } from './utils.js'

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

  const [ ticket ] = await sql`
    INSERT INTO
      tickets ${sql(rowToBeInserted, 'slot_id', 'rate')}
    RETURNING
      id,
      slot_id AS "slotId",
      rate,
      started_at AS "startedAt"
  `

  return ticket
}
