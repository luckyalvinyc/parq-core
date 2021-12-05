import { jest } from '@jest/globals'
import * as route from './tickets.js'

// dependencies
let stores

let req, res

describe('@create', () => {
  let create

  const ticket = {
    id: 1,
    startedAt: new Date()
  }

  // doesn't matter what value is assigned here
  // as we'll be mocking the `sql.begin` and check
  // if the `transaction` is being passed properly
  const transaction = 'transaction'

  beforeEach(async () => {
    req = {
      body: {
        entryPointId: 1,
        vehicleType: 'small'
      }
    }

    res = {
      send: jest.fn()
    }

    jest.unstable_mockModule('../stores/index.js', () => ({
      entryPoints: {
        exists: jest.fn().mockResolvedValue(true)
      },

      slots: {
        listForVehicleType: jest.fn().mockResolvedValue([{
          id: 1,
          distance: {
            1: 0.1
          },
          type: 'small'
        }]),
        occupy: jest.fn().mockResolvedValue()
      },

      tickets: {
        create: jest.fn().mockResolvedValue(ticket)
      }
    }))

    jest.unstable_mockModule('../pg.js', () => ({
      default: {
        begin: jest.fn().mockImplementation(async fn => fn(transaction))
      }
    }))

    jest.unstable_mockModule('../../config.js', () => ({
      default: {
        rates: {
          small: 2
        }
      }
    }))

    stores = await import('../stores/index.js')
    const route = await import('./tickets.js')

    create = route.create
  })

  it('should create a ticket for a vehicle type', async () => {
    await create(req, res)

    expect(stores.slots.listForVehicleType).toHaveBeenCalledTimes(1)
    expect(stores.slots.listForVehicleType).toHaveBeenCalledWith('small')

    expect(stores.slots.occupy).toHaveBeenCalledTimes(1)
    expect(stores.slots.occupy).toHaveBeenCalledWith(1, {
      txn: 'transaction'
    })

    expect(stores.tickets.create).toHaveBeenCalledTimes(1)
    expect(stores.tickets.create).toHaveBeenCalledWith(1, 2, {
      txn: 'transaction'
    })

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith({
      data: {
        ticket
      }
    })
  })

  it('should throw an error if entry point does not exists', async () => {
    stores.entryPoints.exists.mockResolvedValue(false)

    let error

    try {
      await create(req, res)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('entry_point')
    expect(error.data).toStrictEqual({
      id: 1
    })
  })

  it('should throw an error if no slots are available', async () => {
    stores.slots.listForVehicleType.mockResolvedValue([])

    let error

    try {
      await create(req, res)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('no_available_slots')
  })
})

describe('@findNearestSlot', () => {
  const slot1 = {
    id: 1,
    distance: {
      1: 1,
      2: 0.5
    }
  }

  const slot2 = {
    id: 2,
    distance: {
      1: 0.5,
      2: 0.3
    }
  }

  const slot3 = {
    id: 3,
    distance: {
      1: 0.3,
      2: 1
    }
  }

  const slots = [slot1, slot2, slot3]

  it('should return the nearest slot from entry point 1', () => {
    const slot = route.findNearestSlot(1, slots)

    expect(slot).toStrictEqual(slot3)
  })

  it('should return the nearest slot from entry point 2', () => {
    const slot = route.findNearestSlot(2, slots)

    expect(slot).toStrictEqual(slot2)
  })
})
