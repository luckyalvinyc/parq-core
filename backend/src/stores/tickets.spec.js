import { jest } from '@jest/globals'

import * as spaces from './spaces.js'
import * as utils from '#tests/utils.js'
import { valuesForInsert } from './utils.js'

/**
 * @type {import('./tickets.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  // mock rates for predictable test
  jest.unstable_mockModule('../../config.js', () => ({
    default: {
      rates: {
        perHour: {
          small: 20
        }
      }
    }
  }))

  store = await import('./tickets.js')
})

beforeEach(async () => {
  await Promise.all([
    sql`
      TRUNCATE ${sql(spaces.TABLE_NAME)} RESTART IDENTITY CASCADE;
    `,
    sql`
      TRUNCATE vehicles RESTART IDENTITY CASCADE;
    `
  ])

  const rowToBeInserted = spaces.build({
    name: 'acme',
    entryPoints: 3
  })

  await sql`
    INSERT INTO
      ${sql(spaces.TABLE_NAME)} ${valuesForInsert(sql, rowToBeInserted)};
  `
})

afterAll(async () => {
  await sql.end()
})

describe('@create', () => {
  const vehicleId = 'a'

  beforeEach(setupPerDescribe())

  it('should create a ticket based on the provided slot', async () => {
    const ticket = await store.create({
      id: 1,
      type: 'small'
    }, vehicleId)

    expect(ticket.startedAt.valueOf()).toBeLessThan(Date.now())
    delete ticket.startedAt

    expect(ticket).toStrictEqual({
      id: 1,
      slotId: 1,
      vehicleId: 'a',
      rate: 20,
      paid: false
    })
  })
})

describe('@findById', () => {
  const ticketId = 1
  const nonExistentTicketId = 2

  beforeEach(setupPerDescribe({
    withTicket: true
  }))

  it('should return the ticket from the provided `ticketId`', async () => {
    const ticket = await store.findById(ticketId)

    expect(ticket.startedAt.valueOf()).toBeLessThan(Date.now())
    delete ticket.startedAt

    expect(ticket).toStrictEqual({
      id: 1,
      slotId: 1,
      vehicleId: 'a',
      rate: 30,
      paid: false
    })
  })

  it('should return null if the provided `ticketId` does not exists', async () => {
    const ticket = await store.findById(nonExistentTicketId)

    expect(ticket).toBe(null)
  })
})

describe('@checkForUnpaidTicket', () => {
  const vehicleId = 'a'

  beforeEach(setupPerDescribe({
    withTicket: true
  }))

  it('should return true if the provided `vehicleId` has unpaid ticket', async () => {
    const hasUnpaidTicket = await store.checkForUnpaidTicket(vehicleId)

    expect(hasUnpaidTicket).toBe(true)
  })

  it('should return true if the provided `vehicleId` has unpaid ticket', async () => {
    await sql`
      UPDATE
        ${sql(store.TABLE_NAME)}
      SET
        paid = true
      WHERE
        vehicle_id = ${vehicleId};
    `

    const hasUnpaidTicket = await store.checkForUnpaidTicket(vehicleId)

    expect(hasUnpaidTicket).toBe(false)
  })
})

describe('@pay', () => {
  const ticketId = 1
  const nonExistentTicketId = 2

  beforeEach(setupPerDescribe({
    withTicket: true
  }))

  it('should update the `paid` to `true`', async () => {
    const ticket = await store.pay(ticketId, 40)

    expect(ticket.endedAt.valueOf()).toBeGreaterThan(ticket.startedAt.valueOf())
    delete ticket.startedAt
    delete ticket.endedAt

    expect(ticket).toStrictEqual({
      id: 1,
      slotId: 1,
      vehicleId: 'a',
      rate: 30,
      paid: true,
      amount: 40
    })
  })

  it('should return null if the provided `ticketId` does not exists', async () => {
    const ticket = await store.pay(nonExistentTicketId, 40)

    expect(ticket).toBe(null)
  })
})

function setupPerDescribe (options = {}) {
  return async function () {
    const slot = {
      space_id: 1,
      type: 0,
      distance: sql.json({
        1: 0
      })
    }

    await sql`
      INSERT INTO
        slots ${valuesForInsert(sql, slot)};
    `

    const vehicle = {
      id: 'a',
      type: 0
    }

    await sql`
      INSERT INTO
        vehicles ${valuesForInsert(sql, vehicle)};
    `

    if (!options.withTicket) {
      return
    }

    const ticket = store.build({
      slotId: 1,
      vehicleId: 'a',
      rate: 30
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, ticket)};
    `
  }
}
