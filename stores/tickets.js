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
  const rowToBeInserted = {
    slot_id: slotId,
    rate
  }

  const sql = execute(options.txn)

  const rows = await sql`
    INSERT INTO tickets ${sql(rowToBeInserted, 'slot_id', 'rate')}
  `

  return toTicket(rows[0])
}

function toTicket (row) {
  return {
    id: row.id,
    slotId: row.slot_id,
    rate: row.rate,
    startedAt: row.started_at
  }
}
