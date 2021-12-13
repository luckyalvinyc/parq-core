import { jest } from '@jest/globals'

import { withErrorHandler } from '#server'
import * as utils from '#tests/utils.js'

let close
let request

/**
 * @type {import('./operations.js')}
 */
const operations = {
  issueTicket: jest.fn(),
  payTicket: jest.fn()
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

describe('POST /tickets', () => {
  let body

  beforeEach(() => {
    operations.issueTicket.mockResolvedValue({
      id: 1
    })

    body = {
      entryPointId: 1,
      vehicle: {
        plateNumber: 'a',
        type: 'small'
      }
    }
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.post('/', {
        body
      })

      expect(operations.issueTicket).toHaveBeenCalledTimes(1)
      expect(operations.issueTicket).toHaveBeenCalledWith(1, {
        plateNumber: 'a',
        type: 'small'
      })

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          ticket: {
            id: 1
          }
        }
      })
    })
  })

  describe('validation', () => {
    describe('entryPointId', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.entryPointId

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
        body.entryPointId = '1'

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

      it('should respond with 400 if less than 0', async () => {
        body.entryPointId = -1

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

    describe('vehicle', () => {
      it('should respond with 400 if not provided', async () => {
        delete body.vehicle

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

      it('should respond with 400 if not an object', async () => {
        body.vehicle = 1

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

      describe('plateNumber', () => {
        it('should respond with 400 if not provided', async () => {
          delete body.vehicle.plateNumber

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
          body.vehicle.plateNumber = 1

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

        it('should respond with 400 if empty string', async () => {
          body.vehicle.plateNumber = ''

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

      describe('type', () => {
        it('should respond with 400 if not provided', async () => {
          delete body.vehicle.type

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

        it('should respond with 400 if the provided value is not valid', async () => {
          body.vehicle.type = 'larger'

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
})

describe('POST /tickets/:ticketId', () => {
  beforeEach(() => {
    operations.payTicket.mockResolvedValue({
      id: 1
    })
  })

  describe('ok', () => {
    it('should respond with 200', async () => {
      const response = await request.post('/1')

      expect(operations.payTicket).toHaveBeenCalledTimes(1)
      expect(operations.payTicket).toHaveBeenCalledTimes(1, {})

      expect(response.statusCode).toBe(200)
      expect(response.data).toStrictEqual({
        data: {
          ticket: {
            id: 1
          }
        }
      })
    })
  })
})
