import { jest } from '@jest/globals'

import * as utils from '#tests/utils.js'
import { valuesForInsert } from './utils.js'

/**
 * @type {import('./vehicles.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./vehicles.js')
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
  it('should create a vehicle with the provided plate number and type', async () => {
    const vehicleId = 'a'

    const vehicle = await store.create({
      plateNumber: vehicleId,
      type: 'small'
    })

    const [row] = await sql`
      SELECT
        type
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${vehicleId};
    `

    expect(row.type).toBe(0)

    expect(vehicle).toStrictEqual({
      id: 'a',
      type: 'small'
    })
  })

  it('should return the original record based on the provided `plateNumber`', async () => {
    await store.create({
      plateNumber: 'a',
      type: 'small'
    })

    const vehicle = await store.create({
      plateNumber: 'a',
      type: 'medium'
    })

    expect(vehicle).toStrictEqual({
      id: 'a',
      type: 'small'
    })
  })
})

describe('@findById', () => {
  const vehicleId = 'a'

  const lastVisitedAt = new Date()

  beforeEach(async () => {
    const vehicle = store.build({
      plateNumber: vehicleId,
      type: 'small',
      lastVisitedAt
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, vehicle)};
    `
  })

  it('should return the vehicle from the provided vehicle ID', async () => {
    const vehicle = await store.findById('a')

    expect(vehicle).toStrictEqual({
      id: 'a',
      type: 'small',
      lastVisitedAt
    })
  })

  it('should return null if the provided vehicle ID does not exists', async () => {
    const vehicle = await store.findById('b')

    expect(vehicle).toBe(null)
  })
})

describe('@updateLastVisit', () => {
  const vehicleId = 'a'

  beforeEach(async () => {
    const vehicle = store.build({
      plateNumber: vehicleId,
      type: 'small'
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, vehicle)};
    `
  })

  it('should return true if the vehicle has been updated', async () => {
    let row

    ;[row] = await sql`
      SELECT
        updated_at AS "lastVisitedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${vehicleId}
    `

    expect(row.lastVisitedAt).toBe(null)

    const isUpdated = await store.updateLastVisit('a')

    expect(isUpdated).toBe(true)

    ;[row] = await sql`
      SELECT
        updated_at AS "lastVisitedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${vehicleId};
    `

    expect(row.lastVisitedAt.valueOf()).toBeLessThan(Date.now())
  })

  it('should return false if the provided vehicle ID does not exists', async () => {
    const isUpdated = await store.updateLastVisit('b')

    expect(isUpdated).toBe(false)
  })
})
