export default createHttpStatusErrors([{
  statusCode: 400,
  name: 'badRequest'
}])

function createHttpStatusErrors (httpStatuses) {
  const errors = {}

  for (const { statusCode, name } of httpStatuses) {
    const typeOfError = snakeToCamelCase(name)

    errors[typeOfError] = function (message, data) {
      const error = new Error(message ?? name)
      error.statusCode = statusCode

      if (data) {
        error.data = data
      }

      return error
    }
  }

  return errors
}

function snakeToCamelCase (string) {
  const segments = string.split('_')

  return segments[0] + capitalizeEach(segments.slice(1))
}

function capitalizeEach (strings) {
  return strings
    .map(capitalize)
    .join('')
}

function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}
