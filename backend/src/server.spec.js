import { jest } from '@jest/globals'

import * as server from './server.js'

describe('@start', () => {
  it('should start the server', async () => {
    const close = server.start({
      port: 3000
    })

    expect(close).toBeInstanceOf(Function)

    await close()
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
