import sql from '../pg.js'
import { valuesForInsert } from './utils.js'

export const TABLE_NAME = 'entry_points'

/**
 * Creates an entry point for a space
 *
 * @param {number} spaceId
 * @param {string} label
 * @param {object} [options]
 * @param {object} [options.txn]
 * @returns {Promise<ReturnType<toEntryPoint>>}
 */

export async function create (spaceId, label, options = {}) {
  const [row] = await _create(build({
    spaceId,
    label
  }), options.txn)

  return toEntryPoint(row)
}

/**
 * Creates entry points for a space
 *
 * @param {number} spaceId
 * @param {string[]} labels
 * @returns {Promise<ReturnType<toEntryPoint>[]>}
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
 * @param {object[]|object} rows
 * @param {object} [txn]
 */

async function _create (rows, txn) {
  const sqlt = txn || sql

  return sqlt`
    INSERT INTO
      ${sql(TABLE_NAME)} ${valuesForInsert(sql, rows)}
    RETURNING
      id,
      space_id,
      label;
  `
}

/**
 * Retrieves an entry point from the provided `entryPointId`
 *
 * @param {number} entryPointId
 * @returns {Promise<ReturnType<toEntryPoint>?>}
 */

export async function findById (entryPointId) {
  const [row] = await sql`
    SELECT
      id,
      space_id,
      label
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      id = ${entryPointId};
  `

  if (!row) {
    return null
  }

  return toEntryPoint(row)
}

/**
 * List all entry points for the provided `spaceId`
 *
 * @param {number} spaceId
 * @returns {Promise<ReturnType<toEntryPoint>[]>}
 */

export async function listBySpaceId (spaceId) {
  const rows = await sql`
    SELECT
      id,
      label
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      space_id = ${spaceId}
    ORDER BY
      id ASC;
  `

  return rows.map(toEntryPoint)
}

/**
 * Builds an object where the keys are the entry IDs and the value is `1`
 *
 * @param {number} spaceId
 * @returns {Promise<Record<string, number>?>}
 */

export async function buildDistanceById (spaceId) {
  const [row] = await sql`
    SELECT
      jsonb_object_agg(id, 1) AS distance
    FROM
      ${sql(TABLE_NAME)}
    WHERE
      space_id = ${spaceId};
  `

  return row.distance
}

/**
 * Converts the given entry point to a DB compatible object
 *
 * @param {object} entryPoint
 * @param {number} entryPoint.spaceId
 * @param {string} entryPoint.label
 */

export function build (entryPoint) {
  const {
    spaceId,
    label
  } = entryPoint

  return {
    space_id: spaceId,
    label
  }
}

/**
 * Applies necessary transformation to a given row
 *
 * @param {object} row
 * @param {number} row.id
 * @param {number} [row.space_id]
 * @param {string} row.label
 * @private
 */

function toEntryPoint (row) {
  const entryPoint = {
    id: row.id,
    label: row.label
  }

  if (row.space_id) {
    entryPoint.spaceId = row.space_id
  }

  return entryPoint
}
