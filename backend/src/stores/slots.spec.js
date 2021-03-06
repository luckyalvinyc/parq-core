import { jest } from '@jest/globals'

import * as spaces from './spaces.js'
import * as utils from '#tests/utils.js'
import { valuesForInsert } from '../stores/utils.js'

/**
 * @type {import('./slots.js')}
 */
let store

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./slots.js')
})

beforeEach(async () => {
  await sql`
    TRUNCATE TABLE ${sql(spaces.TABLE_NAME)} RESTART IDENTITY CASCADE;
  `

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

describe('@bulkCreate', () => {
  it('should create the provided slots', async () => {
    const rawSlots = [{
      type: 'small',
      distance: {
        1: 0,
        2: 1
      }
    }, {
      type: 'medium',
      distance: {
        1: 1,
        2: 0
      }
    }]

    const slots = await store.bulkCreate(1, rawSlots)

    expect(slots.length).toBe(2)
    expect(slots).toEqual([{
      id: 1,
      type: 'small',
      available: true
    }, {
      id: 2,
      type: 'medium',
      available: true
    }])
  })
})

describe('@findNearestAvailableSlot', () => {
  const spaceId = 1
  const entryPointId1 = 1
  const entryPointId2 = 2
  const entryPointId3 = 3

  beforeEach(async () => {
    await setupPerDescribe([{
      spaceId,
      type: 'small',
      distance: {
        [entryPointId1]: 0.10,
        [entryPointId2]: 0.5,
        [entryPointId3]: 0.3
      }
    }, {
      spaceId,
      type: 'medium',
      distance: {
        [entryPointId1]: 0.01,
        [entryPointId2]: 1,
        [entryPointId3]: 0.05
      }
    }, {
      spaceId,
      type: 'large',
      distance: {
        [entryPointId1]: 1,
        [entryPointId2]: 0.20,
        [entryPointId3]: 0.25
      },
      available: false
    }])
  })

  it('should return the nearest available slot from an entry point', async () => {
    const slot = await store.findNearestAvailableSlot({
      id: entryPointId1,
      spaceId
    }, 'small')

    function isMD5 (string) {
      return /^[a-f0-9]{32}$/.test(string)
    }

    expect(isMD5(slot.hash)).toBe(true)
    delete slot.hash

    expect(slot).toStrictEqual({
      id: 2,
      type: 'medium',
      available: true
    })
  })

  it('should return null if no available slots for a vehicle type', async () => {
    const slot = await store.findNearestAvailableSlot({
      id: entryPointId2,
      spaceId
    }, 'large')

    expect(slot).toBe(null)
  })
})

describe('@listBySpaceId', () => {
  const spaceId = 1

  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should return a list of slots from the provided `spaceId`', async () => {
    const slots = await store.listBySpaceId(spaceId)

    expect(slots).toStrictEqual([{
      id: 1,
      type: 'small',
      available: true
    }])
  })

  it('should return an empty list if space does not contain any slots', async () => {
    const slots = await store.listBySpaceId(2)

    expect(slots).toStrictEqual([])
  })
})

describe('@occupy', () => {
  let slotId

  beforeEach(async () => {
    slotId = 1

    await setupPerDescribe()
  })

  it('should set `available` column to `false`', async () => {
    const isUpdated = await store.occupy(slotId)

    expect(isUpdated).toBe(true)

    const [slot] = await sql`
      SELECT
        id,
        available,
        created_at AS "createdAt",
        updated_at as "updatedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    expect(slot.updatedAt.valueOf()).toBeGreaterThan(slot.createdAt.valueOf())
    delete slot.createdAt
    delete slot.updatedAt

    expect(slot).toStrictEqual({
      id: 1,
      available: false
    })
  })

  it('should update if the hash provided match the current hash of the row', async () => {
    const [row] = await sql`
      SELECT
        md5(${sql(store.TABLE_NAME)}::text) AS hash
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    const isUpdated = await store.occupy(slotId, {
      hash: row.hash
    })

    expect(isUpdated).toBe(true)
  })

  it('should not update if the row has been updated from its original hash value', async () => {
    const [row] = await sql`
      SELECT
        md5(${sql(store.TABLE_NAME)}::text) AS hash
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    await sql`
      UPDATE
        ${sql(store.TABLE_NAME)}
      SET
        available = false
      WHERE
        id = ${slotId};
    `

    const isUpdated = await store.occupy(slotId, {
      hash: row.hash
    })

    expect(isUpdated).toBe(false)
  })

  it('should not update if the provided `slotId` does not exists', async () => {
    slotId = 2
    const isUpdated = await store.occupy(slotId)

    expect(isUpdated).toBe(false)
  })

  it('should use the transaction context if provided', async () => {
    let error

    try {
      await sql.begin(async sql => {
        await store.occupy(slotId, {
          txn: sql
        })

        throw new Error('test')
      })
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('test')

    const [slot] = await sql`
      SELECT
        available
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    expect(slot.available).toBe(true)
  })
})

describe('@vacant', () => {
  let slotId

  beforeEach(async () => {
    slotId = 1

    await setupPerDescribe([{
      spaceId: 1,
      type: 'small',
      distance: {
        1: 0
      },
      available: false
    }])
  })

  it('should set `available` column to `true`', async () => {
    const isUpdated = await store.vacant(slotId)

    expect(isUpdated).toBe(true)

    const [slot] = await sql`
      SELECT
        id,
        available,
        created_at AS "createdAt",
        updated_at as "updatedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    expect(slot.updatedAt.valueOf()).toBeGreaterThan(slot.createdAt.valueOf())
    delete slot.createdAt
    delete slot.updatedAt

    expect(slot).toStrictEqual({
      id: 1,
      available: true
    })
  })

  it('should not update if the provided `slotId` does not exists', async () => {
    slotId = 2
    const isUpdated = await store.vacant(slotId)

    expect(isUpdated).toBe(false)
  })

  it('should use the transaction context if provided', async () => {
    let error

    try {
      await sql.begin(async sql => {
        await store.vacant(slotId, {
          txn: sql
        })

        throw new Error('test')
      })
    } catch (err) {
      error = err
    }

    expect(error).toBeInstanceOf(Error)

    const [slot] = await sql`
      SELECT
        available
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId};
    `

    expect(slot.available).toBe(false)
  })
})

describe('@includeNewEntryPoint', () => {
  beforeEach(async () => {
    await setupPerDescribe()
  })

  it('should add the new entry point ID as a key to the `distance`', async () => {
    await store.includeNewEntryPoint({
      id: 2,
      spaceId: 1
    })

    const [row] = await sql`
      SELECT
        *
      FROM
        slots
      WHERE
        id = 1;
    `

    expect(row.distance).toStrictEqual({
      1: 0,
      2: 1
    })
  })
})

describe('@toSlot', () => {
  it('should include `ticket` property if present from the provided `row`', () => {
    const startedAt = new Date()

    const slot = store.toSlot({
      id: 1,
      type: 0,
      available: true,
      ticket: {
        id: 1,
        rate: 10,
        vehicle_id: 'a',
        vehicle_type: 0,
        created_at: startedAt
      }
    })

    expect(slot).toStrictEqual({
      id: 1,
      type: 'small',
      available: true,
      ticket: {
        id: 1,
        rate: 10,
        startedAt,
        vehicle: {
          id: 'a',
          type: 'small'
        }
      }
    })
  })
})

async function setupPerDescribe (slots = []) {
  const rowsToBeInserted = []

  if (!slots.length) {
    rowsToBeInserted.push(store.build({
      spaceId: 1,
      type: 'small',
      distance: {
        1: 0
      }
    }))
  }

  for (const slot of slots) {
    rowsToBeInserted.push(store.build(slot))
  }

  await sql`
    INSERT INTO
      ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, rowsToBeInserted)};
  `
}
