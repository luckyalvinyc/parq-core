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
      md5(${sql(TABLE_NAME)}::text)
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      space_id = ${spaceId} AND
      type >= ${typeInInt} AND
      available = true
    ORDER BY
      distance->>${entryPointId} ASC,
      type ASC
    LIMIT 1;
  `

  if (!row) {
    return null
  }

  return toSlot(row)
}

/**
 * List all slots for the provided `spaceId`
 *
 * @param {number} spaceId
 * @returns {Promise<ReturnType<toSlot>[]>}
 */

export async function listBySpaceId (spaceId) {
  const rows = await sql`
    SELECT
      slots.id,
      slots.type,
      slots.available,

      t.ticket
    FROM
      ${sql(TABLE_NAME)}
    LEFT JOIN LATERAL (
      SELECT
        json_build_object(
          'id', tickets.id,
          'vehicle_id', tickets.vehicle_id,
          'vehicle_type', vehicles.type,
          'rate', tickets.rate,
          'created_at', tickets.created_at
        ) AS ticket
      FROM
        tickets
      INNER JOIN vehicles ON
        tickets.vehicle_id = vehicles.id
      WHERE
        tickets.slot_id = slots.id AND
        tickets.paid = false
    ) AS t ON true
    WHERE
      slots.space_id = ${spaceId}
    ORDER BY
      slots.id ASC;
  `

  return rows.map(toSlot)
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

/**
 * Converts the given slot to a DB compatible object
 *
 * @param {object} slot
 * @param {number} slot.spaceId
 * @param {string} slot.type
 * @param {Record<string, number>} slot.distance
 * @param {boolean} [slot.available]
 */

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
 * @param {object} [row.ticket]
 * @param {number} row.ticket.id
 * @param {number} row.ticket.vehicle_id
 * @param {number} row.ticket.vehicle_type
 * @param {number} row.ticket.rate
 * @param {Date} row.ticket.created_at
 * @private
 */

export function toSlot (row) {
  const slot = {
    id: row.id,
    type: types.from(row.type),
    available: row.available
  }

  if (row.md5) {
    slot.hash = row.md5
  }

  if (row.ticket) {
    slot.ticket = {
      id: row.ticket.id,
      rate: row.ticket.rate,
      startedAt: row.ticket.created_at,
      vehicle: {
        id: row.ticket.vehicle_id,
        type: types.from(row.ticket.vehicle_type)
      }
    }
  }

  return slot
}
