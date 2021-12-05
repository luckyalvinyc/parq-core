import Route from 'polka'
import stores from './stores.js'

const route = Route()

export default route

route.post('/', skema({
  type: 'object',
  required: [
    'vehicleType'
  ],
  properties: {
    vehicleType: {
      enum: [
        'light',
        'medium',
        'heavy'
      ]
    }
  }
}), create)

async function create (req, res) {
  const {
    vehicleType
  } = req.body

  const ticket = await stores.tickets.create(vehicleType)

  res.send({
    data: {
      ticket
    }
  })
}

route.get('/:id', skema({
  params: {
    id: {
      type: 'integer',
      minimum: 1
    }
  }
}), get)

async function get (req, res) {
  const ticket = await stores.tickets.findById(req.params.id)

  res.send({
    data: {
      ticket
    }
  })
}

function skema (spec) {
  return function (req, res, next) {
    next()
  }
}
