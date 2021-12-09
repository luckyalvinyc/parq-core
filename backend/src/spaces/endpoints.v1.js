import Route from 'polka'

import skema from '../middlewares/skema.js'
import * as schemas from './schemas.js'
import * as operations from './operations.js'

const route = Route()
route.prefix = 'spaces'

export default route

route.post('/',
  skema(schemas.create), create)

/**
 * Handles requests for creating a parking space
 *  which can have multiple entry points
 */

export async function create (req, res) {
  const { numberOfEntryPoints } = req.body

  const entryPoints = await operations.createSpace(numberOfEntryPoints)

  res.send({
    data: {
      entryPoints
    }
  })
}

route.post('/:spaceId',
  skema(schemas.update), update)

/**
 * Handles requests for adding slots to a space
 */

export async function update (req, res) {
  const { spaceId } = req.params
  const { slots } = req.body

  const createdSlots = await operations.addSlots(spaceId, slots)

  res.send({
    data: {
      slots: createdSlots
    }
  })
}

route.post('/:spaceId/entry_points',
  skema(schemas.updateForEntryPoints), updateForEntryPoints)

/**
 * Handles requests for adding an entry point to a space
 */

async function updateForEntryPoints (req, res) {
  const { spaceId } = req.params
  const { label } = req.body

  const entryPoint = await operations.addEntryPoint(spaceId, label)

  res.send({
    data: {
      entryPoint
    }
  })
}
