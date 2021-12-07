import { jest } from '@jest/globals'

import errors from '../../errors.js'
import { createLabels } from './spaces.js'

// dependencies
let stores

let req, res

beforeEach(() => {
  req = {}

  res = {
    send: jest.fn()
  }
})

describe('@create', () => {
  let create

  beforeEach(async () => {
    req = {
      body: {
        entryPoints: 1
      }
    }

    jest.unstable_mockModule('../../stores/index.js', () => ({
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

    stores = await import('../../stores/index.js')
    const route = await import('./spaces.js')

    create = route.create
  })

  it('should create a parking space from the provided entry points', async () => {
    await create(req, res)

    expect(stores.spaces.create).toHaveBeenCalledTimes(1)
    expect(stores.spaces.create).toHaveBeenCalledWith(1)

    expect(stores.entryPoints.bulkCreate).toHaveBeenCalledTimes(1)
    expect(stores.entryPoints.bulkCreate).toHaveBeenCalledWith(1, ['A'])

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith({
      data: {
        entryPoints: [{
          id: 1,
          spaceId: 1,
          label: 'A'
        }]
      }
    })
  })
})

describe('@createLabels', () => {
  it('should generate labels from a given number of entry points', () => {
    const labels = createLabels(3)

    expect(labels).toStrictEqual([
      'A',
      'B',
      'C'
    ])
  })
})

describe('@update', () => {
  let update

  const slots = [{
    type: 'small',
    distance: {
      1: 0.10
    }
  }]

  beforeEach(async () => {
    req = {
      params: {
        id: 1
      },
      body: {
        slots
      }
    }

    jest.unstable_mockModule('../../stores/index.js', () => ({
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

    stores = await import('../../stores/index.js')
    const route = await import('./spaces.js')

    update = route.update
  })

  it('should add slots to a space', async () => {
    await update(req, res)

    expect(stores.spaces.exists).toHaveBeenCalledTimes(1)
    expect(stores.spaces.exists).toHaveBeenCalledWith(1)

    expect(stores.slots.bulkCreate).toHaveBeenCalledTimes(1)
    expect(stores.slots.bulkCreate).toHaveBeenCalledWith(1, slots)

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith({
      data: {
        slots: [{
          id: 1,
          type: 'small',
          available: true
        }]
      }
    })
  })

  it('should throw an error if the provided space id does not exists', async () => {
    stores.spaces.exists.mockResolvedValue(false)

    let error

    try {
      await update(req, res)
    } catch (err) {
      error = err
    }

    expect(error.type).toBe('not_found')
    expect(error.message).toBe('space')
    expect(error.data).toStrictEqual({
      id: 1
    })

    expect(res.send).toHaveBeenCalledTimes(0)
  })
})
