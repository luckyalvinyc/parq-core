import { jest } from '@jest/globals'

import * as utils from '#tests/utils.js'
import { valuesForInsert } from '../stores/utils.js'

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
    TRUNCATE ${sql(store.TABLE_NAME)} RESTART IDENTITY CASCADE;
  `
})

afterAll(async () => {
  await sql.end()
})

describe('@create', () => {
  it('should create a parking space', async () => {
    const space = await store.create({
      name: 'acme',
      entryPoints: 3
    })

    expect(space).toStrictEqual({
      id: 1,
      name: 'acme'
    })
  })

  it('should return null if the `name` provided for a parking space has already been taken', async () => {
    await store.create({
      name: 'acme',
      entryPoints: 3
    })

    const space = await store.create({
      name: 'Acme',
      entryPoints: 3
    })

    expect(space).toBe(null)
  })

  it('should throw an error if error code is not related to UNIQUE_VIOLATION', async () => {
    jest.unstable_mockModule('../pg.js', () => ({
      default: jest.fn().mockImplementation(query => {
        if (typeof query !== 'object') {
          return
        }

        if (!Array.isArray(query)) {
          return
        }

        return Promise.reject(new Error('test'))
      })
    }))

    const store = await import('./spaces.js')

    let error

    try {
      await store.create({
        name: 'acme',
        entryPoints: 3
      })
    } catch (err) {
      error = err
    }

    expect(error.message).toBe('test')
  })
})

describe('@list', () => {
  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should return a list of created parking space ', async () => {
    const spaces = await store.list()

    expect(spaces).toStrictEqual([{
      id: 1,
      name: 'acme'
    }])
  })
})

describe('@exists', () => {
  const spaceId = 1
  const nonExistentSpaceId = 2

  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should return true if the provided `spaceId` exists', async () => {
    const exists = await store.exists(spaceId)

    expect(exists).toBe(true)
  })

  it('should return false if the provided `spaceId` does not exists', async () => {
    const exists = await store.exists(nonExistentSpaceId)

    expect(exists).toBe(false)
  })
})

describe('@incrementEntryPoints', () => {
  const spaceId = 1

  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should increment the number of entry points', async () => {
    let row

    // query before increase
    ;[row] = await sql`
      SELECT
        entry_points
      FROM
        spaces
      WHERE
        id = 1
    `

    expect(row.entry_points).toBe(3)

    await store.incrementEntryPoints(spaceId)

    ;[row] = await sql`
      SELECT
        entry_points
      FROM
        spaces
      WHERE
        id = 1
    `

    expect(row.entry_points).toBe(4)
  })
})

async function setupPerDescribe () {
  const space = store.build({
    name: 'acme',
    entryPoints: 3
  })

  await sql`
    INSERT INTO
      ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, space)};
  `
}
