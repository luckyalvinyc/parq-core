import sql from '../pg.js'
import { types } from '../types.js'
import { valuesForInsert } from './utils.js'

export const TABLE_NAME = 'slots'

/**
 * Creates the provided slots, all slots will be available until occupied
 *
 * @param {number} spaceId
 * @param {object[]} slots
 * @param {string} slots[].type
 * @param {object} slots[].distance
 * @returns {Promise<ReturnType<toSlot>[]>}
 */

export async function bulkCreate (spaceId, slots) {
  const rowsToBeInserted = []

  for (const { type, distance } of slots) {
    rowsToBeInserted.push({
      space_id: spaceId,
      type: types.to(type),
      distance: sql.json(distance)
    })
  }

  const rows = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${valuesForInsert(sql, rowsToBeInserted)}
    RETURNING
      id,
      type,
      available;
  `

  return rows.map(toSlot)
}

/**
 * Finds the nearest available slot from a given entry point
 *  availability will also depend on the vehicle type
 *
 * @param {object} entryPoint
 * @param {number} entryPoint.id
 * @param {number} entryPoint.spaceId
 * @param {string} type
 * @returns {Promise<ReturnType<toSlot>?>}
 */

export async function findNearestAvailableSlot (entryPoint, type) {
  const {
    id: entryPointId,
    spaceId
  } = entryPoint

  const typeInInt = types.to(type)

  const [row] = await sql`
    SELECT
      id,
      type,
      available,
      md5(${TABLE_NAME}::text)
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      space_id = ${spaceId} AND
      type >= ${typeInInt} AND
      available = true
    ORDER BY
      distance->>${entryPointId} ASC
    LIMIT 1;
  `

  if (!row) {
    return null
  }

  return toSlot(row)
}

/**
 * Sets the `available` to `false` for the selected slot
 *
 * @param {number} slotId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @param {string} [options.hash]
 * @returns {Promise<boolean>}
 */

export async function occupy (slotId, options = {}) {
  const result = await updateAvailability(slotId, false, {
    txn: options.txn,
    hash: options.hash
  })

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
  const result = await updateAvailability(slotId, true, {
    txn: options.txn
  })

  return result.count === 1
}

/**
 * Updates the `available` column
 *
 * @param {number} slotId
 * @param {boolean} available
 * @param {object} options
 * @param {object} options.txn
 * @param {string} [options.hash]
 * @private
 */

async function updateAvailability (slotId, available, options) {
  const {
    txn,
    hash = null
  } = options

  const sqlt = txn || sql

  return sqlt`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      available = ${available},
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = ${slotId} AND
      (${hash}::text IS NULL OR md5(${sql(TABLE_NAME)}::text) = ${hash});
  `
}

/**
 * Updates all the slots to include the new entry point
 *
 * NOTE: This will have a performance penalty once we have many slots to update
 *
 * @param {object} entryPoint
 * @param {number} entryPoint.id
 * @param {number} entryPoint.spaceId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<boolean>}
 */

export async function includeNewEntryPoint (entryPoint, options = {}) {
  const sqlt = options.txn || sql

  const distanceForEntryPoint = sqlt.json({
    [entryPoint.id]: 1
  })

  const result = await sqlt`
    UPDATE
      ${sqlt(TABLE_NAME)}
    SET
      distance = distance || ${distanceForEntryPoint}
    WHERE
      space_id = ${entryPoint.spaceId};
  `

  return result.count > 0
}

export function build (slot) {
  const {
    spaceId,
    type,
    distance,
    available = true
  } = slot

  return {
    space_id: spaceId,
    type: types.to(type),
    distance: sql.json(distance),
    available
  }
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {number} row.id
 * @param {number} row.type
 * @param {boolean} row.available
 * @param {string} [row.md5]
 * @private
 */

function toSlot (row) {
  const slot = {
    id: row.id,
    type: types.from(row.type),
    available: row.available
  }

  if (row.md5) {
    slot.hash = row.md5
  }

  return slot
}
