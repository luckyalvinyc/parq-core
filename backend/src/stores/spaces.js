import sql from '../pg.js'
import { valuesForInsert } from './utils.js'

export const TABLE_NAME = 'spaces'
const UNIQUE_VIOLATION = '23505'

/**
 * Creates a parking space and the number of entry points available
 *
 * @param {object} space
 * @param {string} space.name
 * @param {number} space.entryPoints
 * @returns {Promise<ReturnType<toSpace>?>}
 */

export async function create (space) {
  const rowToBeInserted = build(space)

  try {
    const [row] = await sql`
      INSERT INTO
        ${sql(TABLE_NAME)} ${valuesForInsert(sql, rowToBeInserted)}
      RETURNING
        id,
        name;
    `

    return toSpace(row)
  } catch (error) {
    if (error.code !== UNIQUE_VIOLATION) {
      throw error
    }

    return null
  }
}

/**
 * List all parking spaces
 *
 * @returns {Promise<ReturnType<toSpace>[]>}
 */

export async function list () {
  const rows = await sql`
    SELECT
      id,
      name
    FROM
      ${sql(TABLE_NAME)};
  `

  return rows.map(toSpace)
}

/**
 * Checks if the given `spaceId` exists
 *
 * @param {number} spaceId
 * @returns {Promise<boolean>}
 */

export async function exists (spaceId) {
  const [row] = await sql`
    SELECT
      id
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${spaceId};
  `

  return row !== undefined
}

/**
 * Increments the total number of entry points for a space
 *
 * @param {number} spaceId
 * @param {object} [options]
 * @param {object} [options.txn]
 * @param {Promise<boolean>}
 */

export async function incrementEntryPoints (spaceId, options = {}) {
  const sqlt = options.txn || sql

  const result = await sqlt`
    UPDATE
      ${sql(TABLE_NAME)}
    SET
      entry_points = entry_points + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE
      id = ${spaceId};
  `

  return result.count === 1
}

/**
 * Converts the given `space` to a DB compatible object
 *
 * @param {object} space
 * @param {string} space.name
 * @param {number} space.entryPoints
 */

export function build (space) {
  const {
    name,
    entryPoints
  } = space

  return {
    name,
    entry_points: entryPoints
  }
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {number} row.id
 * @param {string} row.name
 * @private
 */

function toSpace (row) {
  return {
    id: row.id,
    name: row.name
  }
}
