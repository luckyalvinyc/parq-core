import sql from '../pg.js'

export const TABLE_NAME = 'spaces'

/**
 * Creates a parking space and the number of entry points available
 *
 * @param {number} entryPoints
 * @returns {Promise<ReturnType<toSpace>>}
 */

export async function create (entryPoints) {
  const rowToBeInserted = {
    entry_points: entryPoints
  }

  const [row] = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowToBeInserted, 'entry_points')}
    RETURNING
      id,
      entry_points;
  `

  return toSpace(row)
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
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {number} row.id
 * @param {number} row.entry_points
 * @private
 */

function toSpace (row) {
  return {
    id: row.id,
    entryPoints: row.entry_points
  }
}
