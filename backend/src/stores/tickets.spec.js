import { jest } from '@jest/globals'

import * as utils from '#tests/utils.js'
import { valuesForInsert } from './utils.js'

/**
 * @type {import('./tickets.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  jest.unstable_mockModule('../../config.js', () => ({
    default: {
      rates: {
        perHour: {
          small: 5
        }
      }
    }
  }))

  store = await import('./tickets.js')
})

beforeEach(async () => {
  await sql`
    TRUNCATE ${sql(store.TABLE_NAME)} RESTART IDENTITY CASCADE;
  `

  await sql`
    INSERT INTO
      spaces (entry_points)
    VALUES (3);
  `
})

afterAll(async () => {
  await sql.end()
})

describe('@create', () => {
  const vehicleId = 'a'

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
        slots ${valuesForInsert(sql, slot)};
    `

    const vehicle = {
      id: vehicleId,
      type: 0
    }

    await sql`
      INSERT INTO
        vehicles ${valuesForInsert(sql, vehicle)};
    `
  })

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
      vehicleId: "a",
      rate: 5,
      paid: false
    })
  })
})
