import { jest } from '@jest/globals'

import * as utils from '../../tests/utils.js'

/**
 * @type {import('./tickets.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./tickets.js')
})

beforeEach(async () => {
  await sql`
    TRUNCATE ${sql(store.TABLE_NAME)} RESTART IDENTITY CASCADE
  `

  await sql`
    INSERT INTO
      spaces (entry_points)
    VALUES (3)
  `
})

afterAll(async () => {
  await sql.end()
})

describe('@create', () => {
  beforeEach(async () => {
    const slot = {
      space_id: 1,
      type: 0,
      distance: sql.json({
        1: 0
      })
    }

    await sql`
      INSERT INTO
        slots ${sql(slot, 'space_id', 'type', 'distance')}
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
