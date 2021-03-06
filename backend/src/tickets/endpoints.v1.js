import Route from 'polka'

import config from '#config'
import * as schemas from './schemas.js'
import * as operations from './operations.js'

// middleware
import skema from '../middlewares/skema.js'

const route = Route()
route.prefix = 'tickets'

export default route

route.setup = function setup () {
  route.post('/',
    skema(schemas.create), create)

  /**
   * Handles requests for creating tickets for each vehicle type
   */

  async function create (req, res) {
    const {
      entryPointId,
      vehicle
    } = req.body

    const ticket = await operations.issueTicket(entryPointId, vehicle)

    res.send({
      data: {
        ticket
      }
    })
  }

  route.post('/:ticketId',
    skema(schemas.update), update)

  /**
   * Handles requests for updating ticket status
   */

  async function update (req, res) {
    const { ticketId } = req.params
    const { numberOfHoursToAdvance } = req.body

    const options = {}

    if (config.isDev && numberOfHoursToAdvance) {
      const endAt = new Date()
      endAt.setHours(endAt.getHours() + numberOfHoursToAdvance)

      options.endAt = endAt
    }

    const ticket = await operations.payTicket(ticketId, options)

    res.send({
      data: {
        ticket
      }
    })
  }
}

