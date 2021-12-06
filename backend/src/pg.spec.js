import { jest } from '@jest/globals'

import { onNotice } from './pg.js'

describe('@onNotice', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should log message if not in test environment', () => {
    onNotice(false, 'message')

    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('message')
  })

  it('should not log message in test environment', () => {
    onNotice(true, 'message')

    expect(console.log).toHaveBeenCalledTimes(0)
  })
})
