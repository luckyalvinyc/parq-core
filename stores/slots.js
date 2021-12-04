import { execute } from './utils.js'

export async function listForVehicleType (type) {
  const sql = execute()

  return sql`
    SELECT
      ...
    FROM
      slots
    WHERE
      type >= ${type} AND
      available = true
  `
}

/**
 *
 * @param {number} slotId
 * @param {object} [options]
 * @param {object} [options.txn]
 */

export async function occupy (slotId, options = {}) {
  const sql = execute(options.txn)

  await sql`
    UPDATE
      slots
    SET
      available = false
    WHERE
      id = ${slotId}
  `
}
