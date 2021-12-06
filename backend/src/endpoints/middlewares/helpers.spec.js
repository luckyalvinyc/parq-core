import { jest } from '@jest/globals'

jest.unstable_mockModule('@polka/send', () => ({
  default: jest.fn()
}))

const { default: send } = await import('@polka/send')
const { default: helpers } = await import('./helpers.js')

let req, res, next

beforeEach(() => {
  res = {}
  next = jest.fn()
})

describe('@send', () => {
  it('should call the internal `send` method', () => {
    helpers(req, res, next)

    const data = {
      ok: true
    }

    res.send(data)

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(res, 200, JSON.stringify(data), {
      'Content-Type': 'application/json; charset=utf-8'
    })
  })
})

describe('@status', () => {
  it('should set the `statusCode`', () => {
    helpers(req, res, next)

    res.status(201)

    expect(res.statusCode).toBe(201)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it('should return itself so it can be chained', () => {
    helpers(req, res, next)

    const instance = res.status(201)

    expect(instance).toStrictEqual(res)
  })
})

