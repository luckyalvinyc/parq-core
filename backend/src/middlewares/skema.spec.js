import { jest } from '@jest/globals'

import skema from './skema.js'
import errors from '../errors.js'

let schemaKeyedByTarget

let req, res, next

beforeEach(() => {
  schemaKeyedByTarget = {
    body: {
      type: 'object',
      required: [
        'name'
      ],
      properties: {
        name: {
          type: 'string',
          minLength: 1
        }
      }
    },
    params: {
      type: 'object',
      required: [
        'id'
      ],
      properties: {
        id: {
          type: 'integer',
          minimum: 1
        }
      }
    }
  }

  req = {
    body: {
      name: 'a'
    },
    params: {
      id: 1
    }
  }

  next = jest.fn()
})

it('should return a function', () => {
  const middleware = skema(schemaKeyedByTarget)

  expect(middleware).toBeInstanceOf(Function)
})

it('should add formats if `formats` option is provided', async () => {
  jest.unstable_mockModule('ajv-formats', () => ({
    default: jest.fn()
  }))

  const { default: addFormats } = await import('ajv-formats')
  const { default: skema } = await import('./skema.js')

  const middleware = skema(schemaKeyedByTarget, {
    formats: ['uri']
  })

  expect(addFormats).toHaveBeenCalledTimes(1)
  expect(addFormats).toHaveBeenCalledWith(middleware._ajv, ['uri'])
})

it('should skip unknown targets', () => {
  const middleware = skema({
    a: { }
  })

  expect(middleware._validators).toStrictEqual(Object.create(null))
})

it('should call next without an error if validation suceed', () => {
  const middleware = skema(schemaKeyedByTarget)

  middleware(req, res, next)

  expect(next).toHaveBeenCalledTimes(1)
  expect(next).toHaveBeenCalledWith()
})

it('should call next with an error of validation failed for the request body', () => {
  const middleware = skema(schemaKeyedByTarget)

  req.body.name = ''

  middleware(req, res, next)

  expect(next).toHaveBeenCalledTimes(1)
  expect(next).toHaveBeenCalledWith(errors.badRequest('validation'))
})

it('should call next with an error of validation failed for the request params', () => {
  const middleware = skema(schemaKeyedByTarget)

  req.params.id = 0

  middleware(req, res, next)

  expect(next).toHaveBeenCalledTimes(1)
  expect(next).toHaveBeenCalledWith(errors.badRequest('validation'))
})
