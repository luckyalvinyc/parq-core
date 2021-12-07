import { jest } from '@jest/globals'

// dependencies
let stores

describe('@issueTicket', () => {
  let issueTicket

  const entryPointId = 1
  const vehicleType = 'small'

  const ticket = {
    id: 1,
    startedAt: new Date()
  }

  // doesn't matter what value is assigned here
  // as we're mocking the `sql.begin` and check
  // if the `transaction` is being passed properly
  const transaction = 'transaction'

  beforeEach(async () => {
    jest.unstable_mockModule('../stores/index.js', () => ({
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

    jest.unstable_mockModule('../pg.js', () => ({
      default: {
        begin: jest.fn().mockImplementation(async fn => fn(transaction))
      }
    }))

    stores = await import('../stores/index.js')
    const operations = await import('./operations.js')

    issueTicket = operations.issueTicket
  })

  it('should issue a ticket from an entry point for a vehicle type', async () => {
    const issuedTicket = await issueTicket(entryPointId, vehicleType)

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
    expect(stores.tickets.create).toHaveBeenCalledWith({
      id: 1,
      type: 'small'
    }, {
      txn: 'transaction'
    })

    expect(issuedTicket).toStrictEqual(ticket)
  })

  it('should throw an error if entry point does not exists', async () => {
    stores.entryPoints.findById.mockResolvedValue(null)

    let error

    try {
      await issueTicket(entryPointId, vehicleType)
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
      await issueTicket(entryPointId, vehicleType)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('no_available_slots')
  })
})
