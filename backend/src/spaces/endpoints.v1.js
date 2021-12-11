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

async function create (req, res) {
  const {
    name,
    numberOfEntryPoints
  } = req.body

  const space = await operations.createSpace(name, numberOfEntryPoints)

  res.send({
    data: {
      space
    }
  })
}

route.get('/', list)

/**
 * Handles requests for listing parking spaces
 */

async function list (req, res) {
  const spaces = await operations.listSpaces()

  res.send({
    data: {
      spaces
    }
  })
}

route.get('/:spaceId',
  skema(schemas.get), get)

/**
 * Handles requests for retrieving a space
 */

async function get (req, res) {
  const { spaceId } = req.params

  const space = await operations.getSpace(spaceId)

  res.send({
    data: space
  })
}

route.post('/:spaceId',
  skema(schemas.update), update)

/**
 * Handles requests for adding slots to a space
 */

async function update (req, res) {
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
