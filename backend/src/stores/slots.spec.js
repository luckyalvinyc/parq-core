import { jest } from '@jest/globals'

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
    TRUNCATE TABLE slots RESTART IDENTITY CASCADE;
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
    const slots = [
      store.build({
        spaceId,
        type: 'small',
        distance: {
          [entryPointId1]: 0.10,
          [entryPointId2]: 0.5,
          [entryPointId3]: 0.3
        },
      }),
      store.build({
        spaceId,
        type: 'medium',
        distance: {
          [entryPointId1]: 0.01,
          [entryPointId2]: 1,
          [entryPointId3]: 0.05
        },
      }),
      store.build({
        spaceId,
        type: 'large',
        distance: {
          [entryPointId1]: 1,
          [entryPointId2]: 0.20,
          [entryPointId3]: 0.25
        },
        available: false
      })
    ]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, slots)};
    `
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

describe('@occupy', () => {
  let slotId

  beforeEach(async () => {
    slotId = 1

    const slot = store.build({
      spaceId: 1,
      type: 'small',
      distance: {
        1: 0
      }
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, slot)};
    `
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

    const slot = store.build({
      spaceId: 1,
      type: 'small',
      distance: {
        1: 0
      },
      available: false
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, slot)};
    `
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
    const slot = store.build({
      spaceId: 1,
      type: 'small',
      distance: {
        1: 0
      },
      available: false
    })

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${valuesForInsert(sql, slot)};
    `
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
