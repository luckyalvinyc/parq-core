import { jest } from '@jest/globals'

import * as utils from '../../tests/utils.js'
import { valuesForInsert } from './utils.js'

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
  it('should create an entry point from the provided label', async () => {
    const entryPoint = await store.create(1, 'a')

    expect(entryPoint).toStrictEqual({
      id: 1,
      spaceId: 1,
      label: 'a'
    })
  })
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
    await setupPerDescribe()
  })

  it('should return the entry point from the provided `entryPointId`', async () => {
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

describe('@listBySpaceId', () => {
  const spaceId = 1

  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should return a list of entry points from the provided `spaceId`', async () => {
    const entryPoints = await store.listBySpaceId(spaceId)

    expect(entryPoints).toStrictEqual([{
      id: 1,
      label: 'a'
    }])
  })

  it('should return an empty list if space does not contain any entry points', async () => {
    const entryPoints = await store.listBySpaceId(2)

    expect(entryPoints).toStrictEqual([])
  })
})

describe('@buildDistanceById', () => {
  beforeEach(async () => {
    await setupPerDescribe([
      store.build({
        spaceId: 1,
        label: 'b'
      }),
      store.build({
        spaceId: 1,
        label: 'c'
      })
    ])
  })

  it('should return the default distance for a space with entry point ID as their keys', async () => {
    const distance = await store.buildDistanceById(1)

    expect(distance).toStrictEqual({
      1: 1,
      2: 1,
      3: 1
    })
  })

  it('should return null the provided `spaceId` does not exists', async () => {
    const distance = await store.buildDistanceById(2)

    expect(distance).toBe(null)
  })
})

async function setupPerDescribe (additional = []) {
  const rowsToBeInserted = [
    store.build({
      spaceId: 1,
      label: 'a'
    })
  ]

  rowsToBeInserted.push(...additional)

  await sql`
    INSERT INTO
      ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, rowsToBeInserted)};
  `
}
