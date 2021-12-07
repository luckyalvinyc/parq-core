import sql from '../pg.js'

export const TABLE_NAME = 'entry_points'

/**
 * Creates entry points from the given labels
 *
 * @param {number} spaceId
 * @param {string[]} labels
 * @returns {Promise<object[]>}
 */

export async function bulkCreate (spaceId, labels) {
  const rowsToBeInserted = []

  for (const label of labels) {
    rowsToBeInserted.push({
      space_id: spaceId,
      label
    })
  }

  const rows = await sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rowsToBeInserted, 'space_id', 'label')}
    RETURNING
      id,
      space_id,
      label
  `

  return rows.map(toEntryPoint)
}

/**
 * Retrieves an entry point from the given id
 *
 * @param {number} entryPointId
 * @returns {Promise<object>}
 */

export async function findById (entryPointId) {
  const [ row ] = await sql`
    SELECT
      id,
      space_id,
      label
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${entryPointId}
  `

  if (!row) {
    return null
  }

  return toEntryPoint(row)
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @private
 */

function toEntryPoint (row) {
  return {
    id: parseInt(row.id, 10),
    spaceId: parseInt(row.space_id, 10),
    label: row.label
  }
}
