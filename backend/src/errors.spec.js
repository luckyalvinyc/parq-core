import {
  httpStatuses,
  snakeToCamelCase,
  default as errors
} from './errors.js'

httpStatuses.forEach(e => {
  const method = snakeToCamelCase(e.name)

  describe(`@${method}`, () => {
    it('no args', () => {
      const error = errors[method]()

      expect(error.message).toBe(e.name)
      expect(error.statusCode).toBe(e.statusCode)
    })

    it('custom message', () => {
      const error = errors[method]('custom')

      expect(error.message).toBe('custom')
    })

    it('with data', () => {
      const error = errors[method]('custom', {
        a: 1
      })

      expect(error.data).toStrictEqual({
        a: 1
      })
    })
  })
})
