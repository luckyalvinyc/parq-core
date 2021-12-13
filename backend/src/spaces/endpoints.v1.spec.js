import { jest } from '@jest/globals'

import { withErrorHandler } from '#server'
import * as utils from '#tests/utils.js'

let close
let request

/**
 * @type {import('./operations.js')}
 */
const operations = {
  createSpace: jest.fn(),
  listSpaces: jest.fn(),
  getSpace: jest.fn(),
  addSlots: jest.fn(),
  addEntryPoint: jest.fn()
}

beforeAll(async () => {
  jest.unstable_mockModule('./operations.js', () => operations)

  const { default: route } = await import('./endpoints.v1.js')

  withErrorHandler(route)
  route.setup()

  const server = utils.server.start(route)

  close = server.close
  request = server.request
})

afterEach(() => {
  jest.clearAllMocks()
})

afterAll(async () => {
  if (close) {
    await close()
  }
})

describe('POST /spaces', () => {
  let body

  beforeEach(() => {
    operations.createSpace.mockResolvedValue({
      id: 1,
      name: 'acme'
    })

    body = {
      name: 'acme',
      numberOfEntryPoints: 3
    }
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.post('/', {
        body: {
          name: 'acme',
          numberOfEntryPoints: 3
        }
      })

      expect(operations.createSpace).toHaveBeenCalledTimes(1)
      expect(operations.createSpace).toHaveBeenCalledWith('acme', 3)

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          space: {
            id: 1,
            name: 'acme'
          }
        }
      })
    })
  })

  describe('validation', () => {
    describe('name', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.name

        let response

        try {
          await request.post('/', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if not a string', async () => {
        body.name = 1

        let response

        try {
          await request.post('/', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })
    })

    describe('numberOfEntryPoints', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.numberOfEntryPoints

        let response

        try {
          await request.post('/', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if not an integer', async () => {
        body.numberOfEntryPoints = '1'

        let response

        try {
          await request.post('/', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if less than 3', async () => {
        body.numberOfEntryPoints = 2

        let response

        try {
          await request.post('/', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })
    })
  })
})

describe('GET /spaces', () => {
  beforeEach(() => {
    operations.listSpaces.mockResolvedValue([])
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.get('/')

      expect(operations.listSpaces).toHaveBeenCalledTimes(1)

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          spaces: []
        }
      })
    })
  })
})

describe('GET /spaces/:spaceId', () => {
  beforeEach(() => {
    operations.getSpace.mockResolvedValue({
      slots: [],
      entryPoints: []
    })
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.get('/1')

      expect(operations.getSpace).toHaveBeenCalledTimes(1)
      expect(operations.getSpace).toHaveBeenCalledTimes(1)

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          space: {
            slots: [],
            entryPoints: []
          }
        }
      })
    })
  })
})

describe('POST /spaces/:spaceId', () => {
  let body

  beforeEach(() => {
    operations.addSlots.mockResolvedValue([])

    body = {
      slots: [{
        type: 'small',
        distance: {
          1: 1
        }
      }]
    }
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.post('/1', {
        body
      })

      expect(operations.addSlots).toHaveBeenCalledTimes(1)
      expect(operations.addSlots).toHaveBeenCalledTimes(1)

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          slots: []
        }
      })
    })
  })

  describe('validation', () => {
    describe('slots', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.slots

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if not an array', async () => {
        body.slots = 'a'

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if empty array is provided', async () => {
        body.slots = []

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if array item does not contain `type`', async () => {
        body.slots = [{
          distance: {
            1: 1
          }
        }]

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if the value provided for `type` is not valid', async () => {
        body.slots = [{
          type: 'larger',
          distance: {
            1: 1
          }
        }]

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if array item does not contain `distance`', async () => {
        body.slots = [{
          type: 'small'
        }]

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if the value provided to the `distance` is less than 0', async () => {
        body.slots = [{
          type: 'small',
          distance: {
            0: -1
          }
        }]

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if the value provided to the `distance` is greater than 1', async () => {
        body.slots = [{
          type: 'small',
          distance: {
            0: 2
          }
        }]

        let response

        try {
          await request.post('/1', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })
    })
  })
})

describe('POST /spaces/:spaceId/entry_points', () => {
  let body

  beforeEach(() => {
    operations.addEntryPoint.mockResolvedValue({
      id: 1,
      label: 'a'
    })

    body = {
      label: 'a'
    }
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.post('/1/entry_points', {
        body
      })

      expect(operations.addEntryPoint).toHaveBeenCalledTimes(1)
      expect(operations.addEntryPoint).toHaveBeenCalledTimes(1)

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          entryPoint: {
            id: 1,
            label: 'a'
          }
        }
      })
    })
  })

  describe('validation', () => {
    describe('label', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.label

        let response

        try {
          await request.post('/1/entry_points', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })

      it('should respond with 400 if not a string', async () => {
        body.label = 1

        let response

        try {
          await request.post('/1/entry_points', {
            body
          })
        } catch (error) {
          response = error
        }

        expect(response.statusCode).toBe(400)
      })
    })
  })
})
