import { jest } from '@jest/globals'

import * as server from './server.js'

describe('@start', () => {
  it('should start the server', async () => {
    const close = await server.start({
      port: 0
    })

    expect(close).toBeInstanceOf(Function)

    await close()
  })
})

describe('@onError', () => {
  let req, res

  beforeEach(() => {
    res = {
      status: jest.fn().mockImplementation(() => res),
      send: jest.fn()
    }
  })

  it('should send the error message with the status code', () => {
    server.onError(new Error('test'), req, res)

    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(500)

    expect(res.send).toHaveBeenCalledTimes(1)
    expect(res.send).toHaveBeenCalledWith({
      error: {
        message: 'test'
      }
    })
  })
})

describe('@onListen', () => {
  beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  it('should not exit the process', () => {
    server.onListen(3000)

    expect(process.exit).toHaveBeenCalledTimes(0)
  })

  it('should exit the process when an error occurs', () => {
    server.onListen(3000, new Error('test'))

    expect(process.exit).toHaveBeenCalledTimes(1)
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
