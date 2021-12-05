import sql from '../pg.js'

export const TABLE_NAME = 'entry_points'

/**
 * Creates entry points from the given labels
 *
 * @param {string[]} labels
 * @returns {Promise<object[]>}
 */

export async function bulkCreate (labels) {
  return sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(labels, 'label')}
    RETURNING
      id,
      label
  `
}

/**
 * Checks if the given entry point exists
 *
 * @param {number} entryPointId
 * @returns {Promise<boolean>}
 */

export async function exists (entryPointId) {
  const [ entryPoint ] = await sql`
    SELECT
      id
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${entryPointId}
  `

  return entryPoint !== undefined
}
