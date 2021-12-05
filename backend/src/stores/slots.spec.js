import sql from '../pg.js'

// sut
import * as store from './slots.js'

afterEach(async () => {
  await sql`
    TRUNCATE TABLE slots RESTART IDENTITY CASCADE
  `
})

afterAll(async () => {
  await sql.end({ timeout: 0 })
})

it('TYPES', () => {
  expect(store.TYPES).toStrictEqual({
    small: 0,
    medium: 1,
    large: 2
  })
})

it('TABLE_NAME', () => {
  expect(store.TABLE_NAME).toBe('slots')
})

const { TYPES } = store

describe('@bulkCreate', () => {
  it('should create the provided slots', async () => {
    const rawSlots = [{
      type: TYPES.small,
      distance: {
        1: 0,
        2: 1
      }
    }, {
      type: TYPES.medium,
      distance: {
        1: 1,
        2: 0
      }
    }]

    const slots = await store.bulkCreate(rawSlots)

    expect(slots.length).toBe(2)
    expect(slots).toStrictEqual(expect.arrayContaining([{
      id: 1,
      type: TYPES.small,
      distance: {
        1: 0,
        2: 1
      },
      available: true
    }, {
      id: 2,
      type: TYPES.medium,
      distance: {
        1: 1,
        2: 0
      },
      available: true
    }]))
  })
})

describe('@listForVehicleType', () => {
  beforeEach(async () => {
    const rawSlots = [{
      type: TYPES.small,
      distance: sql.json({
        1: 0
      })
    }, {
      type: TYPES.medium,
      distance: sql.json({
        1: 0.1
      })
    }, {
      type: TYPES.large,
      distance: sql.json({
        1: 0.2
      })
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(rawSlots, 'type', 'distance')}
    `
  })

  it('should list slots for small vehicle which includes small, medium and large', async () => {
    const slots = await store.listForVehicleType(TYPES.small)

    expect(slots.length).toBe(3)
    expect(slots).toStrictEqual(expect.arrayContaining([{
      id: 1,
      type: TYPES.small,
      distance: {
        1: 0
      },
      available: true
    }, {
      id: 2,
      type: TYPES.medium,
      distance: {
        1: 0.1
      },
      available: true
    }, {
      id: 3,
      type: TYPES.large,
      distance: {
        1: 0.2
      },
      available: true
    }]))
  })

  it('should list slots for medium vehicle which includes medium and large', async () => {
    const slots = await store.listForVehicleType(TYPES.medium)

    expect(slots.length).toBe(2)
    expect(slots).toStrictEqual(expect.arrayContaining([{
      id: 2,
      type: TYPES.medium,
      distance: {
        1: 0.1
      },
      available: true
    }, {
      id: 3,
      type: TYPES.large,
      distance: {
        1: 0.2
      },
      available: true
    }]))
  })

  it('should list slots for large vehicle which includes large only', async () => {
    const slots = await store.listForVehicleType(TYPES.large)

    expect(slots.length).toBe(1)
    expect(slots).toStrictEqual(expect.arrayContaining([{
      id: 3,
      type: TYPES.large,
      distance: {
        1: 0.2
      },
      available: true
    }]))
  })
})

describe('@occupy', () => {
  beforeEach(async () => {
    const rawSlots = [{
      type: TYPES.small,
      distance: sql.json({
        1: 0
      })
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(rawSlots, 'type', 'distance')}
    `
  })

  it('should set `available` column to `false`', async () => {
    const id = 1
    const isUpdated = await store.occupy(id)

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
        id = ${id}
    `

    expect(slot.updatedAt.valueOf()).toBeGreaterThan(slot.createdAt.valueOf())
    delete slot.createdAt
    delete slot.updatedAt

    expect(slot).toStrictEqual({
      id: 1,
      available: false
    })
  })

  it('should not update if the provided `id` does not exists', async () => {
    const id = 2
    const isUpdated = await store.occupy(id)

    expect(isUpdated).toBe(false)
  })

  it('should use the transaction context if provided', async () => {
    const id = 1

    let error

    try {
      await sql.begin(async sql => {
        await store.occupy(id, {
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
        id = ${id}
    `

    expect(slot.available).toBe(true)
  })
})

describe('@vacant', () => {
  beforeEach(async () => {
    const rawSlots = [{
      type: TYPES.small,
      distance: sql.json({
        1: 0
      }),
      available: false
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(rawSlots, 'type', 'distance', 'available')}
    `
  })

  it('should set `available` column to `true`', async () => {
    const id = 1
    const isUpdated = await store.vacant(id)

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
        id = ${id}
    `

    expect(slot.updatedAt.valueOf()).toBeGreaterThan(slot.createdAt.valueOf())
    delete slot.createdAt
    delete slot.updatedAt

    expect(slot).toStrictEqual({
      id: 1,
      available: true
    })
  })

  it('should not update if the provided `id` does not exists', async () => {
    const id = 2
    const isUpdated = await store.vacant(id)

    expect(isUpdated).toBe(false)
  })

  it('should use the transaction context if provided', async () => {
    const id = 1

    let error

    try {
      await sql.begin(async sql => {
        await store.vacant(id, {
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
        id = ${id}
    `

    expect(slot.available).toBe(false)
  })
})

