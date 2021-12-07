import Route from 'polka'

import skema from '../middlewares/skema.js'
import * as schemas from './schemas.js'
import * as operations from './operations.js'

const route = Route()
route.prefix = 'spaces'

export default route

route.post('/', skema(schemas.create), create)

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

route.post('/:id', skema(schemas.update), update)

/**
 * Handles requests for adding slots to a space
 */

export async function update (req, res) {
  const spaceId = req.params.id
  const { slots } = req.body

  const createdSlots = await operations.addSlots(spaceId, slots)

  res.send({
    data: {
      slots: createdSlots
    }
  })
}
