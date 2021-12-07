import { jest } from '@jest/globals'

// dependencies
let stores

describe('@createSpace', () => {
  let createSpace

  beforeEach(async () => {
    jest.unstable_mockModule('../stores/index.js', () => ({
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

    stores = await import('../stores/index.js')
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

describe('@addSlots', () => {
  let addSlots

  const slots = [{
    type: 'small',
    distance: {
      1: 0.10
    }
  }]

  const spaceId = 1

  beforeEach(async () => {
    jest.unstable_mockModule('../stores/index.js', () => ({
      spaces: {
        exists: jest.fn().mockResolvedValue(true)
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

    expect(stores.slots.bulkCreate).toHaveBeenCalledTimes(1)
    expect(stores.slots.bulkCreate).toHaveBeenCalledWith(1, slots)

    expect(addedSlots).toStrictEqual([{
      id: 1,
      type: 'small',
      available: true
    }])
  })

  it('should throw an error if the provided space id does not exists', async () => {
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
})
