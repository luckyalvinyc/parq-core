import { jest } from '@jest/globals'

import * as utils from '../../tests/utils.js'

/**
 * @type {import('./spaces.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./spaces.js')
})

beforeEach(async () => {
  await sql`
    TRUNCATE ${sql(store.TABLE_NAME)} RESTART IDENTITY CASCADE
  `
})

afterAll(async () => {
  await sql.end()
})

describe('@create', () => {
  it('should create a parking space with the number of entry points', async () => {
    const space = await store.create(3)

    expect(space).toStrictEqual({
      id: 1,
      entryPoints: 3
    })
  })
})

describe('@exists', () => {
  beforeEach(async () => {
    const space = {
      entry_points: 3
    }

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(space, 'entry_points')}
    `
  })

  it('should return true if the given space id exists', async () => {
    const exists = await store.exists(1)

    expect(exists).toBe(true)
  })

  it('should return false if the given space id does not exists', async () => {
    const exists = await store.exists(2)

    expect(exists).toBe(false)
  })
})
