import sql from '../pg.js'

export const TABLE_NAME = 'spaces'

/**
 * Creates a parking space and the number of entry points available
 *
 * @param {number} entryPoints
 * @returns {Promise<void>}
 */

export async function create (entryPoints) {
  const rowToBeInserted = {
    entry_points: entryPoints
  }

  const [ row ] = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowToBeInserted, 'entry_points')}
    RETURNING
      id,
      entry_points AS "entryPoints"
  `

  return row
}

/**
 * Checks if the given `spaceId` exists
 *
 * @param {number} spaceId
 * @returns {Promise<boolean>}
 */

export async function exists (spaceId) {
  const [ row ] = await sql`
    SELECT
      id
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${spaceId}
  `

  return row !== undefined
}
