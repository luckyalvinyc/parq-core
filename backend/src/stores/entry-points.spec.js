import { jest } from '@jest/globals'

import * as utils from '../../tests/utils.js'

/**
 * @type {import('./entry-points.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./entry-points.js')
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

describe('@bulkCreate', () => {
  it('should create entry points from the provided labels', async () => {
    const entryPoints = await store.bulkCreate(1, ['a', 'b'])

    expect(entryPoints).toStrictEqual([{
      id: 1,
      spaceId: 1,
      label: 'a'
    }, {
      id: 2,
      spaceId: 1,
      label: 'b'
    }])
  })
})

describe('@findById', () => {
  beforeEach(async () => {
    const rowsToBeInserted = [{
      id: 1,
      space_id: 1,
      label: 'a'
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(rowsToBeInserted, 'space_id', 'label')}
    `
  })

  it('should return the entry point for a given id', async () => {
    const entryPoint = await store.findById(1)

    expect(entryPoint).toStrictEqual({
      id: 1,
      spaceId: 1,
      label: 'a'
    })
  })

  it('should return null if the provided entry point does not exists', async () => {
    const entryPoint = await store.findById(2)

    expect(entryPoint).toBe(null)
  })
})
