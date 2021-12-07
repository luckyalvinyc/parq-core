import { jest } from '@jest/globals'

import * as server from './server.js'

describe('@start', () => {
  it('should start the server', async () => {
    const close = await server.start({
      port: 3000
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
  it('should log what port the server is listening to', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})

    server.onListen(3000)

    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('Listening on port 3000')
  })

  it('should exit the process when an error occurs', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(process, 'exit').mockImplementation(() => {})

    server.onListen(3000, new Error('test'))

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith('test')

    expect(process.exit).toHaveBeenCalledTimes(1)
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
