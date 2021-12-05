import sql from '../pg.js'

// sut
import * as store from './tickets.js'

afterEach(async () => {
  await sql`
    TRUNCATE slots RESTART IDENTITY CASCADE
  `
})

afterAll(async () => {
  await sql.end({ timeout: 0 })
})

it('TABLE_NAME', () => {
  expect(store.TABLE_NAME).toBe('tickets')
})

describe('@create', () => {
  beforeEach(async () => {
    const rowToBeInserted = {
      type: 0,
      distance: sql.json({
        1: 0
      })
    }

    await sql`
      INSERT INTO
        slots ${sql(rowToBeInserted, 'type', 'distance')}
    `
  })

  it('should create a ticket based on the provided slot', async () => {
    const slotId = 1
    const rate = 20

    const ticket = await store.create(slotId, rate)

    expect(ticket.startedAt.valueOf()).toBeLessThan(Date.now())
    delete ticket.startedAt

    expect(ticket).toStrictEqual({
      id: 1,
      slotId: 1,
      rate: 20
    })
  })
})
