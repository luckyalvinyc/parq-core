import { jest } from '@jest/globals'

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
  // as we're mocking the `sql.begin` and check
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

    jest.unstable_mockModule('../../stores/index.js', () => ({
      entryPoints: {
        findById: jest.fn().mockResolvedValue({
          id: 1,
          spaceId: 1
        })
      },

      slots: {
        findNearestAvailableSlot: jest.fn().mockResolvedValue({
          id: 1,
          type: 'small'
        }),
        occupy: jest.fn().mockResolvedValue()
      },

      tickets: {
        create: jest.fn().mockResolvedValue(ticket)
      }
    }))

    jest.unstable_mockModule('../../pg.js', () => ({
      default: {
        begin: jest.fn().mockImplementation(async fn => fn(transaction))
      }
    }))

    stores = await import('../../stores/index.js')
    const route = await import('./tickets.js')

    create = route.create
  })

  it('should create a ticket for a vehicle type', async () => {
    await create(req, res)

    expect(stores.slots.findNearestAvailableSlot).toHaveBeenCalledTimes(1)
    expect(stores.slots.findNearestAvailableSlot).toHaveBeenCalledWith({
      id: 1,
      spaceId: 1
    }, 'small')

    expect(stores.slots.occupy).toHaveBeenCalledTimes(1)
    expect(stores.slots.occupy).toHaveBeenCalledWith(1, {
      txn: 'transaction'
    })

    expect(stores.tickets.create).toHaveBeenCalledTimes(1)
    expect(stores.tickets.create).toHaveBeenCalledWith(1, 'small', {
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
    stores.entryPoints.findById.mockResolvedValue(null)

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
    stores.slots.findNearestAvailableSlot.mockResolvedValue(null)

    let error

    try {
      await create(req, res)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('no_available_slots')
  })
})
