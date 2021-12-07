import { jest } from '@jest/globals'

import * as utils from '../../tests/utils.js'

/**
 * @type {import('./slots.js')}
 */
let store

let TYPES

let sql

beforeAll(async () => {
  sql = utils.db.replace(jest, '../pg.js', db.name)

  store = await import('./slots.js')
  TYPES = store.TYPES
})

beforeEach(async () => {
  await sql`
    TRUNCATE TABLE slots RESTART IDENTITY CASCADE
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

describe('TYPES', () => {
  it('properties', () => {
    expect(TYPES).toEqual({
      byLabel: {
        small: 'small',
        medium: 'medium',
        large: 'large'
      },
      byValue: {
        small: 0,
        medium: 1,
        large: 2
      },
      labels: [
        'small',
        'medium',
        'large'
      ],
      to: expect.any(Function),
      from: expect.any(Function)
    })
  })

  describe('@to', () => {
    it('should throw an error if the given type is not recognized', () => {
      expect(() => {
        TYPES.to('3ple')
      }).toThrow(/3ple/)
    })
  })
})

describe('@bulkCreate', () => {
  it('should create the provided slots', async () => {
    const rawSlots = [{
      type: TYPES.byLabel.small,
      distance: {
        1: 0,
        2: 1
      }
    }, {
      type: TYPES.byLabel.medium,
      distance: {
        1: 1,
        2: 0
      }
    }]

    const slots = await store.bulkCreate(1, rawSlots)

    expect(slots.length).toBe(2)
    expect(slots).toEqual([{
      id: 1,
      type: TYPES.byLabel.small,
      available: true
    }, {
      id: 2,
      type: TYPES.byLabel.medium,
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
    const slots = [{
      space_id: spaceId,
      type: TYPES.byValue.small,
      distance: sql.json({
        [entryPointId1]: 0.10,
        [entryPointId2]: 0.5,
        [entryPointId3]: 0.3
      }),
      available: true
    }, {
      space_id: spaceId,
      type: TYPES.byValue.medium,
      distance: sql.json({
        [entryPointId1]: 0.01,
        [entryPointId2]: 1,
        [entryPointId3]: 0.05
      }),
      available: true
    }, {
      space_id: spaceId,
      type: TYPES.byValue.large,
      distance: sql.json({
        [entryPointId1]: 1,
        [entryPointId2]: 0.20,
        [entryPointId3]: 0.25
      }),
      available: false
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(slots, 'space_id', 'type', 'distance', 'available')}
    `
  })

  it('should return the nearest available slot from an entry point', async () => {
    const slot = await store.findNearestAvailableSlot({
      id: entryPointId1,
      spaceId
    }, TYPES.byLabel.small)

    expect(slot).toStrictEqual({
      id: 2,
      type: TYPES.byLabel.medium,
      available: true
    })
  })

  it('should return null if no available slots for a vehicle type', async () => {
    const slot = await store.findNearestAvailableSlot({
      id: entryPointId2,
      spaceId
    }, TYPES.byLabel.large)

    expect(slot).toBe(null)
  })
})

describe('@occupy', () => {
  let slotId

  beforeEach(async () => {
    slotId = 1

    const slots = [{
      space_id: 1,
      type: TYPES.byValue.small,
      distance: sql.json({
        1: 0
      })
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(slots, 'space_id', 'type', 'distance')}
    `
  })

  it('should set `available` column to `false`', async () => {
    const isUpdated = await store.occupy(slotId)

    expect(isUpdated).toBe(true)

    const [ slot ] = await sql`
      SELECT
        id,
        available,
        created_at AS "createdAt",
        updated_at as "updatedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId}
    `

    expect(slot.updatedAt.valueOf()).toBeGreaterThan(slot.createdAt.valueOf())
    delete slot.createdAt
    delete slot.updatedAt

    expect(slot).toStrictEqual({
      id: 1,
      available: false
    })
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

    const [ slot ] = await sql`
      SELECT
        available
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId}
    `

    expect(slot.available).toBe(true)
  })
})

describe('@vacant', () => {
  let slotId

  beforeEach(async () => {
    slotId = 1

    const slots = [{
      space_id: 1,
      type: TYPES.byValue.small,
      distance: sql.json({
        1: 0
      }),
      available: false
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(slots, 'space_id', 'type', 'distance', 'available')}
    `
  })

  it('should set `available` column to `true`', async () => {
    const isUpdated = await store.vacant(slotId)

    expect(isUpdated).toBe(true)

    const [ slot ] = await sql`
      SELECT
        id,
        available,
        created_at AS "createdAt",
        updated_at as "updatedAt"
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId}
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

    const [ slot ] = await sql`
      SELECT
        available
      FROM
        ${sql(store.TABLE_NAME)}
      WHERE
        id = ${slotId}
    `

    expect(slot.available).toBe(false)
  })
})

