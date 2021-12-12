import { jest } from '@jest/globals'

let stores

// doesn't matter what value is assigned here
// as we're mocking the `sql.begin` and check
// if the `transaction` is being passed properly
const transaction = 'transaction'

beforeEach(() => {
  jest.unstable_mockModule('../pg.js', () => ({
    default: {
      begin: jest.fn().mockImplementation(async fn => fn(transaction))
    }
  }))
})

describe('@issueTicket', () => {
  let issueTicket

  const entryPointId = 1

  const ticket = {
    id: 1,
    slotId: 1,
    vehicleId: 'a',
    rate: 20,
    startedAt: new Date()
  }

  const vehicle = {
    plateNumber: 'a',
    type: 'small'
  }

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
        occupy: jest.fn().mockResolvedValue(true)
      },

      vehicles: {
        create: jest.fn().mockResolvedValue({
          id: 'a',
          type: 'small'
        })
      },

      tickets: {
        create: jest.fn().mockResolvedValue(ticket),
        checkForUnpaidTicket: jest.fn().mockResolvedValue(false)
      }
    }))

    stores = await import('../stores/index.js')
    const operations = await import('./operations.js')

    issueTicket = operations.issueTicket
  })

  it('should issue a ticket from an entry point and creates the vehicle', async () => {
    const issuedTicket = await issueTicket(entryPointId, vehicle)

    expect(stores.entryPoints.findById).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.findById).toHaveBeenCalledWith(1)

    expect(stores.vehicles.create).toHaveBeenCalledTimes(1)
    expect(stores.vehicles.create).toHaveBeenCalledWith(vehicle)

    expect(stores.tickets.checkForUnpaidTicket).toHaveBeenCalledTimes(1)
    expect(stores.tickets.checkForUnpaidTicket).toHaveBeenCalledWith('a')

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
    }, 'a', {
      txn: 'transaction'
    })

    expect(issuedTicket).toStrictEqual({
      ...ticket,
      type: 'small'
    })
  })

  it('should throw an error if entry point does not exists', async () => {
    stores.entryPoints.findById.mockResolvedValue(null)

    let error

    try {
      await issueTicket(entryPointId, vehicle)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('entry_point')
    expect(error.data).toStrictEqual({
      id: 1
    })
  })

  // this is just an added guard, so that a vehicle is distinct within a parking space
  it('should throw an error if vehicle is already parked', async () => {
    stores.tickets.checkForUnpaidTicket.mockResolvedValue(true)

    let error

    try {
      await issueTicket(entryPointId, vehicle)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('already_parked')
  })

  it('should throw an error if no slots are available', async () => {
    stores.slots.findNearestAvailableSlot.mockResolvedValue(null)

    let error

    try {
      await issueTicket(entryPointId, vehicle)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('no_available_slots')
  })

  it('should throw an error if failed to occupy a slot', async () => {
    stores.slots.occupy.mockResolvedValue(false)

    let error

    try {
      await issueTicket(entryPointId, vehicle)
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('no_available_slots')
  })
})

describe('@payTicket', () => {
  let payTicket

  let vehicle, ticket

  const ticketId = 1

  const initialHours = 3
  const gracePeriodInHours = 1
  const flatRate = 40
  const fullDayRate = 5000
  const smallRatePerHour = 20

  beforeEach(async () => {
    vehicle = {
      id: 'a',
      type: 'small'
    }

    ticket = {
      id: 1,
      vehicleId: 1,
      rate: smallRatePerHour,
      paid: false,
      startedAt: new Date()
    }

    jest.unstable_mockModule('../stores/index.js', () => ({
      slots: {
        vacant: jest.fn().mockResolvedValue(true)
      },

      vehicles: {
        findById: jest.fn().mockResolvedValue(vehicle),
        updateLastVisit: jest.fn().mockResolvedValue(true)
      },

      tickets: {
        findById: jest.fn().mockResolvedValue(ticket),
        pay: jest.fn().mockResolvedValue({
          id: 1,
          paid: true
        })
      }
    }))

    jest.unstable_mockModule('#config', () => ({
      default: {
        initialHours,
        gracePeriod: gracePeriodInHours,

        rates: {
          flat: flatRate,
          fullDay: fullDayRate,
          perHour: {
            small: smallRatePerHour
          }
        }
      }
    }))

    jest.useFakeTimers('modern')

    stores = await import('../stores/index.js')
    const operations = await import('./operations.js')

    payTicket = operations.payTicket
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should only pay the flat rate for the first initial hours', async () => {
    const paidTicket = await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(flatRate)

    expect(paidTicket).toStrictEqual({
      id: 1,
      paid: true
    })
  })

  it('should pay the flat rate plus the additional exceeded hours', async () => {
    const date = new Date()
    date.setHours(date.getHours() + initialHours + 1)

    jest.setSystemTime(date)

    await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(flatRate + smallRatePerHour)
  })

  it('should pay the flat rate plus the full day rate', async () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)

    jest.setSystemTime(date)

    await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(flatRate + fullDayRate)
  })

  it('should pay the flat rate plus the full day rate and the remaining hours', async () => {
    const exceededHours = 5

    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(date.getHours() + exceededHours)

    jest.setSystemTime(date)

    await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(flatRate + fullDayRate + (smallRatePerHour * exceededHours))
  })

  // this assumes that vehicle has paid the flat rate before leaving
  it('should not pay any amount if vehicle comes back within the grace period', async () => {
    vehicle.lastVisitedAt = new Date()
    stores.vehicles.findById(vehicle)

    const date = new Date()
    date.setMinutes(30)

    jest.setSystemTime(date)

    await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(0)
  })

  it('should pay the flat rate if the last visited date exceeds the grace period', async () => {
    vehicle.lastVisitedAt = new Date()
    stores.vehicles.findById(vehicle)

    const date = new Date()
    date.setHours(date.getHours() + 2)

    jest.setSystemTime(date)

    await payTicket(ticketId)

    expect(stores.tickets.pay).toHaveBeenCalledTimes(1)
    expect(stores.tickets.pay.mock.calls[0][1]).toBe(flatRate)

    expect(stores.vehicles.updateLastVisit).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if the provided `ticketId` does not exists', async () => {
    stores.tickets.findById.mockResolvedValue(null)

    await expect(payTicket(ticketId)).rejects.toThrow({
      message: 'ticket'
    })
  })

  it('should throw an error if the ticket has been paid', async () => {
    stores.tickets.findById.mockResolvedValue({
      paid: true
    })

    await expect(payTicket(ticketId)).rejects.toThrow({
      message: 'paid'
    })
  })

  it('should throw an error if vehicle attached to the ticket does not exists', async () => {
    stores.vehicles.findById.mockResolvedValue(null)

    await expect(payTicket(ticketId)).rejects.toThrow({
      message: 'vehicle'
    })
  })
})
