import Route from 'polka'

import errors from '../../errors.js'
import * as stores from '../../stores/index.js'

import skema from '../middlewares/skema.js'

const route = Route()
route.prefix = 'spaces'

export default route

route.post('/', skema({
  body: {
    type: 'object',
    required: ['entryPoints'],
    properties: {
      entryPoints: {
        type: 'integer',
        minimum: 3
      }
    }
  }
}), create)

/**
 * Handles requests for creating a parking space
 *  which can have multiple entry points
 */

export async function create (req, res) {
  const { entryPoints } = req.body

  const space = await stores.spaces.create(entryPoints)

  const labels = createLabels(entryPoints)

  const createdEntryPoints = await stores.entryPoints.bulkCreate(space.id, labels)

  res.send({
    data: {
      entryPoints: createdEntryPoints
    }
  })
}

/**
 * Create labels from the provided entry points
 *
 * @param {number} entryPoints
 * @returns {string[]}
 */

export function createLabels (entryPoints) {
  const labels = []

  for (let i = 0; i < entryPoints; i++) {
    // char code for A is 65
    const label = String.fromCharCode(65 + i)

    labels.push(label)
  }

  return labels
}

route.post('/:id', skema({
  body: {
    type: 'object',
    required: ['slots'],
    properties: {
      slots: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            type: {
              enum: [
                'small',
                'medium',
                'large'
              ]
            },
            distance: {
              type: 'object',
              patternProperties: {
                '^\\d+$': {
                  type: 'number',
                  minimum: 0,
                  maximum: 1
                }
              },
              additionalProperties: false
            }
          }
        }
      }
    }
  }
}), update)

/**
 * Handles requests for adding slots to a space
 */

export async function update (req, res) {
  const spaceId = req.params.id

  const exists = await stores.spaces.exists(spaceId)

  if (!exists) {
    throw errors.notFound('space', {
      id: spaceId
    })
  }

  const { slots } = req.body

  const createdSlots = await stores.slots.bulkCreate(spaceId, slots)

  res.send({
    data: {
      slots: createdSlots
    }
  })
}
