import sql from '../pg.js'
import { execute } from './utils.js'

export const TABLE_NAME = 'slots'

export const TYPES = Types()

/**
 * Creates the provided slots, all slots will be available until occupied
 *
 * @param {number} spaceId
 * @param {object[]} slots
 * @param {number} slots[].type
 * @param {object} slots[].distance
 * @returns {Promise<object[]>}
 */

export async function bulkCreate (spaceId, slots) {
  const rowsToBeInserted = []

  for (const { type, distance } of slots) {
    rowsToBeInserted.push({
      space_id: spaceId,
      type: TYPES.to(type),
      distance: sql.json(distance)
    })
  }

  const rows = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowsToBeInserted, 'space_id', 'type', 'distance')}
    RETURNING
      id,
      type,
      available
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
 * @returns {Promise<object[]>}
 */

export async function findNearestAvailableSlot (entryPoint, type) {
  const columns = [
    'id',
    'type',
    'available'
  ]

  const typeInInt = TYPES.to(type)

  const {
    id: entryPointId,
    spaceId
  } = entryPoint

  const [ row ] = await sql`
    SELECT
      ${sql(columns)}
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      space_id = ${spaceId} AND
      type >= ${typeInInt} AND
      available = true
    ORDER BY
      distance->>${entryPointId} ASC
    LIMIT 1
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
 * Updates all the slots to include the new entry point
 *
 * NOTE: This will have a performance penalty once we have many slots to update
 *
 * @param {object} entryPoint
 * @param {number} entryPoint.id
 * @param {number} entryPoint.spaceId
 * @param {object} [options]
 * @param {object} [options.txn]
 */

export async function includeNewEntryPoint (entryPoint, options = {}) {
  const sql = execute(options.txn)

  const distanceForEntryPoint = sql.json({
    [entryPoint.id]: 1
  })

  await sql`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      distance = distance || ${distanceForEntryPoint}
    WHERE
      space_id = ${entryPoint.spaceId}
  `
}

function Types () {
  const valueByType = {
    small: 0,
    medium: 1,
    large: 2
  }

  const typeByValue = {
    0: 'small',
    1: 'medium',
    2: 'large'
  }

  return {
    byLabel: createBy('label'),
    byValue: createBy('value'),
    labels: Object.keys(valueByType),

    to (type) {
      const value = valueByType[type]

      if (value === undefined) {
        throw new Error(`Type of: ${type} is not recognized`)
      }

      return value
    },

    from (value) {
      return typeByValue[value]
    }
  }

  function createBy (type) {
    const container = Object.create(null)

    for (const label of Object.keys(valueByType)) {
      container[label] = type === 'value'
        ? valueByType[label]
        : label
    }

    return container
  }
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
    type: TYPES.from(row.type),
    available: row.available
  }
}
