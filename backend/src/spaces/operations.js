import sql from '../pg.js'
import errors from '../errors.js'
import * as stores from '#stores'

/**
 * Creates a parking space with the specified number of entry points
 *
 * @param {number} numberOfEntryPoints
 * @returns {Promise<object[]>}
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
 * Retrieves the information about the parking space
 *
 * @param {number} spaceId
 */

export async function getSpace (spaceId) {
  const exists = await stores.spaces.exists(spaceId)

  if (!exists) {
    throw errors.notFound('space', {
      id: spaceId
    })
  }

  const [
    entryPoints,
    slots
  ] = await Promise.all([
    stores.entryPoints.listBySpaceId(spaceId),
    stores.slots.listBySpaceId(spaceId)
  ])

  return {
    entryPoints,
    slots
  }
}

/**
 * Adds one or more slots to a parking space
 *
 * @param {number} spaceId
 * @param {object[]} slots
 * @param {string} slots[].type
 * @param {Record<string, number>} slots[].distance
 */

export async function addSlots (spaceId, slots) {
  const exists = await stores.spaces.exists(spaceId)

  if (!exists) {
    throw errors.notFound('space', {
      id: spaceId
    })
  }

  const defaultDistance = await stores.entryPoints.buildDistanceById(spaceId)

  const slotsWithDefaultDistance = withDefaultDistance(slots, defaultDistance)

  if (!slotsWithDefaultDistance.length) {
    throw errors.badRequest('invalid_entry_id')
  }

  return stores.slots.bulkCreate(spaceId, slotsWithDefaultDistance)
}

/**
 * Adds the missing entry point for a distance in a slot
 *
 * @param {object[]} slots
 * @param {string} slots[].type
 * @param {Record<string, number>} slots[].distance
 * @param {Record<string, number>} defaultDistance
 */

function withDefaultDistance (slots, defaultDistance) {
  const slotsWithDefaultDistance = []

  for (const slot of slots) {
    const slotWithDefaultDistance = {
      type: slot.type
    }

    const sanitizedDistance = removeUnknownEntryPointIds(defaultDistance, slot.distance)

    if (!sanitizedDistance) {
      continue
    }

    slotWithDefaultDistance.distance = sanitizedDistance
    slotsWithDefaultDistance.push(slotWithDefaultDistance)
  }

  return slotsWithDefaultDistance
}

/**
 * Checks the `distance` if it contains unknown entry point IDs
 *  if it does, it will be removed from the `distance`
 *
 * @param {Record<string, number>} defaultDistance
 * @param {Record<string, number>} distance
 */

export function removeUnknownEntryPointIds (defaultDistance, distance) {
  let hasKey = false

  const sanitized = Object.create(null)
  const entryIds = Object.keys(distance)

  for (const entryId of entryIds) {
    if (!defaultDistance[entryId]) {
      continue
    }

    sanitized[entryId] = distance[entryId]

    hasKey = true
  }

  if (!hasKey) {
    return
  }

  for (const entryId of Object.keys(defaultDistance)) {
    if (sanitized[entryId]) {
      continue
    }

    sanitized[entryId] = 1
  }

  return sanitized
}

/**
 * Adds a new entry point for a given space
 *
 * @param {number} spaceId
 * @param {string} label
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
