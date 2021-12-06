export const httpStatuses = [{
  statusCode: 400,
  name: 'bad_request'
}, {
  statusCode: 404,
  name: 'not_found'
}]

export default createHttpStatusErrors(httpStatuses)

/**
 * Creates an object which will contain methods for throwing HTTP status error
 *
 * @param {object[]} httpStatuses
 * @param {number} httpStatuses[].statusCode
 * @param {string} httpStatuses[].name
 * @returns {object}
 * @private
 */

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

/**
 * Converts the given snake_case string to camelCase
 *
 * @param {string} string
 * @returns {string}
 * @private
 */

export function snakeToCamelCase (string) {
  const segments = string.split('_')

  return segments[0] + capitalizeEach(segments.slice(1))
}

/**
 * Transforms every string in strings to be capitalized form
 *
 * @param {string[]} strings
 * @returns {string}
 * @private
 */

function capitalizeEach (strings) {
  return strings
    .map(capitalize)
    .join('')
}

/**
 * Transforms the given string to be capitalized form
 *
 * @param {string} string
 * @returns {string}
 * @private
 */

function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}
