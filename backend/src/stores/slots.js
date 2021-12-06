import { execute } from './utils.js'

export const TABLE_NAME = 'slots'

export const TYPES = {
  small: 0,
  medium: 1,
  large: 2
}

/**
 * Creates the provided slots, all slots will be available until occupied
 *
 * @param {object[]} rawSlots
 * @param {number} rawSlots[].type
 * @param {object} rawSlots[].distance
 * @returns {Promise<object[]>}
 */

export async function bulkCreate (rawSlots) {
  const sql = execute()
  const rowsToBeInserted = []

  for (const { type, distance } of rawSlots) {
    rowsToBeInserted.push({
      type,
      distance: sql.json(distance)
    })
  }

  const rows = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowsToBeInserted, 'type', 'distance')}
    RETURNING
      id,
      type,
      distance,
      available
  `

  return rows.map(toSlot)
}

/**
 * Lists all slots that are available based on the provided `type`
 *
 * @param {number} type
 * @returns {Promise<object[]>}
 */

export async function listForVehicleType (type) {
  const sql = execute()

  const columns = [
    'id',
    'distance',
    'type',
    'available'
  ]

  const rows = await sql`
    SELECT
      ${sql(columns)}
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      type >= ${type} AND
      available = true
  `

  return rows.map(toSlot)
}

/**
 * Sets the `available` to `false` for the selected slot
 *
 * @param {number} slotId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<boolean>}
 */

export async function occupy (slotId, options = {}) {
  const result = await updateAvailability(slotId, false, options.txn)

  return result.count === 1
}

/**
 * Sets the `available` to `true` for the selected slot
 *
 * @param {number} slotId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<boolean>}
 */

export async function vacant (slotId, options = {}) {
  const result = await updateAvailability(slotId, true, options.txn)

  return result.count === 1
}


/**
 * Updates the `available` column
 *
 * @param {number} slotId
 * @param {boolean} available
 * @param {object} txn
 * @private
 */

async function updateAvailability (slotId, available, txn) {
  const sql = execute(txn)

  return sql`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      available = ${available},
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = ${slotId}
  `
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @private
 */

function toSlot (row) {
  return {
    id: parseInt(row.id, 10),
    type: row.type,
    distance: row.distance,
    available: row.available
  }
}
