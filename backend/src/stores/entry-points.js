import sql from '../pg.js'
import { execute } from './utils.js'

export const TABLE_NAME = 'entry_points'

/**
 * Creates an entry point for a space
 *
 * @param {number} spaceId
 * @param {string} label
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<object>}
 */

export async function create (spaceId, label, options = {}) {
  const [ row ] = await _create({
    space_id: spaceId,
    label
  }, options.txn)

  return toEntryPoint(row)
}

/**
 * Creates entry points for a space
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

  const rows = await _create(rowsToBeInserted)

  return rows.map(toEntryPoint)
}

/**
 * Query for inserting rows to the `slots` table
 *
 * @param {object|object[]} rows
 * @param {object} [txn]
 */

async function _create (rows, txn) {
  const sql = execute(txn)

  return sql`
    INSERT INTO
      ${sql(TABLE_NAME)} ${sql(rows, 'space_id', 'label')}
    RETURNING
      id,
      space_id,
      label
  `
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
    id: row.id,
    spaceId: row.space_id,
    label: row.label
  }
}
