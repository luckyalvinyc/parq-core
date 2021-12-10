import { jest } from '@jest/globals'

import { removeUnknownEntryPointIds } from './operations.js'

/**
 * @type {import('#stores')}
 */
let stores

describe('@createSpace', () => {
  /**
   * @type {import('./operations.js').createSpace}
   */
  let createSpace

  beforeEach(async () => {
    jest.unstable_mockModule('#stores', () => ({
      spaces: {
        create: jest.fn().mockResolvedValue({
          id: 1
        })
      },

      entryPoints: {
        bulkCreate: jest.fn().mockResolvedValue([{
          id: 1,
          spaceId: 1,
          label: 'A'
        }])
      }
    }))

    stores = await import('#stores')
    const operations = await import('./operations.js')

    createSpace = operations.createSpace
  })

  it('should create a parking space from the provided entry points', async () => {
    const entryPoints = await createSpace(1)

    expect(stores.spaces.create).toHaveBeenCalledTimes(1)
    expect(stores.spaces.create).toHaveBeenCalledWith(1)

    expect(stores.entryPoints.bulkCreate).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.bulkCreate).toHaveBeenCalledWith(1, ['A'])

    expect(entryPoints).toStrictEqual([{
      id: 1,
      spaceId: 1,
      label: 'A'
    }])
  })
})

describe('@getSpace', () => {
  /**
   * @type {import('./operations.js').getSpace}
   */
  let getSpace

  const spaceId = 1

  beforeEach(async () => {
    jest.unstable_mockModule('#stores', async () => ({
      spaces: {
        exists: jest.fn().mockResolvedValue(true)
      },

      entryPoints: {
        listBySpaceId: jest.fn().mockResolvedValue([{
          id: 1,
          label: 'A'
        }])
      },

      slots: {
        listBySpaceId: jest.fn().mockResolvedValue([{
          id: 1,
          type: 'small',
          available: true
        }])
      }
    }))

    stores = await import('#stores')
    const operations = await import('./operations.js')

    getSpace = operations.getSpace
  })

  it('should retrieve the current state of a space', async () => {
    const space = await getSpace(spaceId)

    expect(stores.spaces.exists).toHaveBeenCalledTimes(1)
    expect(stores.spaces.exists).toHaveBeenCalledWith(1)

    expect(stores.entryPoints.listBySpaceId).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.listBySpaceId).toHaveBeenCalledWith(1)

    expect(stores.slots.listBySpaceId).toHaveBeenCalledTimes(1)
    expect(stores.slots.listBySpaceId).toHaveBeenCalledWith(1)

    expect(space).toStrictEqual({
      entryPoints: [{
        id: 1,
        label: 'A'
      }],
      slots: [{
        id: 1,
        type: 'small',
        available: true
      }]
    })
  })

  it('should retrieve the current state of a space', async () => {
    stores.spaces.exists.mockResolvedValue(false)

    let error

    try {
      await getSpace(spaceId)
    } catch (err) {
      error = err
    }

    expect(error.type).toBe('not_found')
    expect(error.message).toBe('space')
    expect(error.data).toStrictEqual({
      id: 1
    })
  })
})

describe('@addSlots', () => {
  /**
   * @type {import('./operations.js').addSlots}
   */
  let addSlots

  const slots = [{
    type: 'small',
    distance: {
      1: 0.10,
      2: 1,
      3: 1
    }
  }]

  const spaceId = 1

  beforeEach(async () => {
    jest.unstable_mockModule('../stores/index.js', () => ({
      spaces: {
        exists: jest.fn().mockResolvedValue(true)
      },

      entryPoints: {
        buildDistanceById: jest.fn().mockResolvedValue({
          1: 1,
          2: 1,
          3: 1
        })
      },

      slots: {
        bulkCreate: jest.fn().mockResolvedValue([{
          id: 1,
          type: 'small',
          available: true
        }])
      }
    }))

    stores = await import('../stores/index.js')
    const operations = await import('./operations.js')

    addSlots = operations.addSlots
  })

  it('should add slots to a space', async () => {
    const addedSlots = await addSlots(spaceId, slots)

    expect(stores.spaces.exists).toHaveBeenCalledTimes(1)
    expect(stores.spaces.exists).toHaveBeenCalledWith(1)

    expect(stores.entryPoints.buildDistanceById).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.buildDistanceById).toHaveBeenCalledWith(1)

    expect(stores.slots.bulkCreate).toHaveBeenCalledTimes(1)
    expect(stores.slots.bulkCreate).toHaveBeenCalledWith(1, slots)

    expect(addedSlots).toStrictEqual([{
      id: 1,
      type: 'small',
      available: true
    }])
  })

  it('should throw an error if the provided space ID does not exists', async () => {
    stores.spaces.exists.mockResolvedValue(false)

    let error

    try {
      await addSlots(spaceId, slots)
    } catch (err) {
      error = err
    }

    expect(error.type).toBe('not_found')
    expect(error.message).toBe('space')
    expect(error.data).toStrictEqual({
      id: 1
    })
  })

  it('should throw an error if the entry point ID provided in `distance` does not exists', async () => {
    const slots = [{
      type: 'small',
      distance: {
        4: 1
      }
    }]

    let error

    try {
      await addSlots(spaceId, slots)
    } catch (err) {
      error = err
    }

    expect(error.type).toBe('bad_request')
    expect(error.message).toBe('invalid_entry_id')
  })
})

describe('@removeUnknownEntryPointIds', () => {
  const defaultDistance = {
    1: 1,
    2: 1,
    3: 1
  }

  const distance = {
    1: 0.5
  }

  const distanceWithUnknownIds = {
    1: 0.5,
    4: 0.1
  }

  const distanceAllUnknownIds= {
    4: 0.5,
    5: 0.5
  }

  it('should add the missing entry point IDs from `distance`', () => {
    const sanitizedDistance = removeUnknownEntryPointIds(defaultDistance, distance)

    expect(sanitizedDistance).toEqual({
      1: 0.5,
      2: 1,
      3: 1
    })
  })

  it('should not include unknown entry point IDs', () => {
    const sanitizedDistance = removeUnknownEntryPointIds(defaultDistance, distanceWithUnknownIds)

    expect(sanitizedDistance).toEqual({
      1: 0.5,
      2: 1,
      3: 1
    })
  })

  it('should return undefined if all entry point IDs are unknown', () => {
    const sanitizedDistance = removeUnknownEntryPointIds(defaultDistance, distanceAllUnknownIds)

    expect(sanitizedDistance).toBe(undefined)
  })
})

describe('@addEntryPoint', () => {
  /**
   * @type {import('./operations.js').addEntryPoint}
   */
  let addEntryPoint

  const spaceId = 1
  const transaction = 'transaction'

  beforeEach(async () => {
    jest.unstable_mockModule('../stores/index.js', () => ({
      spaces: {
        exists: jest.fn().mockResolvedValue(true),
        incrementEntryPoints: jest.fn().mockResolvedValue()
      },

      entryPoints: {
        create: jest.fn().mockResolvedValue({
          id: 1,
          spaceId,
          label: 'label'
        })
      },

      slots: {
        includeNewEntryPoint: jest.fn().mockResolvedValue()
      }
    }))

    jest.unstable_mockModule('../pg.js', () => ({
      default: {
        begin: jest.fn().mockImplementation(async fn => fn(transaction))
      }
    }))

    stores = await import('../stores/index.js')
    const operations = await import('./operations.js')

    addEntryPoint = operations.addEntryPoint
  })

  it('should add a new entry point', async () => {
    const entryPoint = await addEntryPoint(spaceId, 'label')

    expect(stores.spaces.exists).toHaveBeenCalledTimes(1)
    expect(stores.spaces.exists).toHaveBeenCalledWith(1)

    expect(stores.entryPoints.create).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.create).toHaveBeenCalledWith(1, 'label', {
      txn: 'transaction'
    })

    expect(stores.spaces.incrementEntryPoints).toHaveBeenCalledTimes(1)
    expect(stores.spaces.incrementEntryPoints).toHaveBeenCalledWith(1, {
      txn: 'transaction'
    })

    expect(stores.slots.includeNewEntryPoint).toHaveBeenCalledTimes(1)
    expect(stores.slots.includeNewEntryPoint).toHaveBeenCalledWith({
      id: 1,
      spaceId: 1,
      label: 'label'
    }, {
      txn: 'transaction'
    })

    expect(entryPoint).toStrictEqual({
      id: 1,
      spaceId: 1,
      label: 'label'
    })
  })

  it('should throw an error if the provided space ID does not exists', async () => {
    stores.spaces.exists.mockResolvedValue(false)

    let error

    try {
      await addEntryPoint(spaceId, 'label')
    } catch (err) {
      error = err
    }

    expect(error.type).toBe('not_found')
    expect(error.message).toBe('space')
    expect(error.data).toStrictEqual({
      id: 1
    })
  })
})
