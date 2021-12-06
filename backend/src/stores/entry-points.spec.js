import sql from '../pg.js'

// sut
import * as store from './entry-points.js'

afterEach(async () => {
  await sql`
    TRUNCATE ${sql(store.TABLE_NAME)} RESTART IDENTITY CASCADE
  `
})

afterAll(async () => {
  await sql.end({ timeout: 0 })
})

it('TABLE_NAME', () => {
  expect(store.TABLE_NAME).toBe('entry_points')
})

describe('@bulkCreate', () => {
  it('should create entry points from the provided labels', async () => {
    const entryPoints = await store.bulkCreate(['a', 'b'])

    expect(entryPoints).toStrictEqual([{
      id: 1,
      label: 'a'
    }, {
      id: 2,
      label: 'b'
    }])
  })
})

describe('@exists', () => {
  beforeEach(async () => {
    const rowsToBeInserted = [{
      id: 1,
      label: 'a'
    }]

    await sql`
      INSERT INTO
        ${sql(store.TABLE_NAME)} ${sql(rowsToBeInserted, 'label')}
    `
  })

  it('should return true if the provided entry point exists', async () => {
    const exists = await store.exists(1)

    expect(exists).toBe(true)
  })

  it('should returnf alse if the provided entry point does not exists', async () => {
    const exists = await store.exists(2)

    expect(exists).toBe(false)
  })
})
