import errors from './errors.js'

it('should have badRequest method', () => {
  const error = errors.badRequest()

  expect(error.message).toBe('bad_request')
  expect(error.statusCode).toBe(400)
})

it('should have notFound method', () => {
  const error = errors.notFound()

  expect(error.message).toBe('not_found')
  expect(error.statusCode).toBe(404)
})
