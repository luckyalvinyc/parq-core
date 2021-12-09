import sql from '../pg.js'
import { types } from '../types.js'
import { valuesForInsert } from './utils.js'

export const TABLE_NAME = 'vehicles'

/**
 * Creates a vehicle and the provided plate number will be used as the id
 *
 * @param {object} vehicle
 * @param {string} vehicle.plateNumber
 * @param {string} vehicle.type
 * @returns {Promise<ReturnType<toVehicle>>}
 */

export async function create (vehicle) {
  const rowToBeInserted = build(vehicle)

  const [row] = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${valuesForInsert(sql, rowToBeInserted)}
    ON CONFLICT
      (id)
    DO UPDATE SET
      type = ${rowToBeInserted.type}
    RETURNING
      id,
      type;
    `

  return toVehicle(row)
}

/**
 * Retrieves a vehicle from the given `vehicleId`
 *
 * @param {string} vehicleId
 * @returns {Promise<ReturnType<toVehicle>?>}
 */

export async function findById (vehicleId) {
  const [row] = await sql`
    SELECT
      id,
      type,
      last_visited_at
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${vehicleId};
  `

  if (!row) {
    return null
  }

  return toVehicle(row)
}

/**
 * Updates the `last_visited_at` column to the current date
 *
 * @param {string} vehicleId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<boolean>}
 */

export async function updateLastVisit (vehicleId, options = {}) {
  const sqlt = options.txn || sql

  const result = await sqlt`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      last_visited_at = CURRENT_TIMESTAMP
    WHERE
      id = ${vehicleId};
  `

  return result.count === 1
}

/**
 * Converts the given vehicle to a DB compatible object
 *
 * @param {object} vehicle
 * @param {string} vehicle.plateNumber
 * @param {string} vehicle.type
 */

export function build (vehicle) {
  const {
    plateNumber,
    type
  } = vehicle

  return {
    id: plateNumber,
    type: types.to(type)
  }
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {string} row.id
 * @param {number} row.type
 * @param {Date} [row.last_visited_at]
 */

function toVehicle (row) {
  const vehicle = {
    id: row.id,
    type: types.from(row.type)
  }

  if (row.last_visited_at) {
    vehicle.lastVisitedAt = row.last_visited_at
  }

  return vehicle
}
