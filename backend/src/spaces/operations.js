import sql from '../pg.js'
import errors from '../errors.js'
import * as stores from '../stores/index.js'

/**
 * Creates a parking space with the specified number of entry points
 *
 *  @param {number} numberOfEntryPoints
 *  @returns {Promise<object[]>}
 */

export async function createSpace (numberOfEntryPoints) {
  const space = await stores.spaces.create(numberOfEntryPoints)

  const labels = createLabels(numberOfEntryPoints)

  return stores.entryPoints.bulkCreate(space.id, labels)
}

/**
 * Create labels from the provided entry points
 *
 * @param {number} numberOfEntryPoints
 * @returns {string[]}
 * @private
 */

function createLabels (numberOfEntryPoints) {
  const labels = []

  for (let i = 0; i < numberOfEntryPoints; i++) {
    // char code for A is 65
    const label = String.fromCharCode(65 + i)

    labels.push(label)
  }

  return labels
}

/**
 * Adds one or more slots to a parking space
 *
 * @param {number} spaceId
 * @param {object[]} slots
 */

export async function addSlots (spaceId, slots) {
  const exists = await stores.spaces.exists(spaceId)

  if (!exists) {
    throw errors.notFound('space', {
      id: spaceId
    })
  }

  return stores.slots.bulkCreate(spaceId, slots)
}

/**
 * Adds a new entry point for a given space
 *
 * @param {number} spaceId
 * @param {string} label
 * @returns {Promise<object>}
 */

export async function addEntryPoint (spaceId, label) {
  const exists = await stores.spaces.exists(spaceId)

  if (!exists) {
    throw errors.notFound('space', {
      id: spaceId
    })
  }

  const entryPoint = await sql.begin(async sql => {
    const entryPoint = await stores.entryPoints.create(spaceId, label, {
      txn: sql
    })

    await stores.spaces.incrementEntryPoints(spaceId, {
      txn: sql
    })

    await stores.slots.includeNewEntryPoint(entryPoint, {
      txn: sql
    })

    return entryPoint
  })

  return entryPoint
}