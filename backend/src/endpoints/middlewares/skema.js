import Ajv from 'ajv'
import errors from '../../errors.js'

const ALLOWED_TARGETS = new Set(['params', 'body'])

export default skema

/**
 * Creates a middleware that can be used to validate incoming requests
 *
 * @param {object} schemaKeyedByTarget - keys can be one of the following:
 *                                         - params
 *                                         - body
 * @returns {Function}
 */

function skema (schemaKeyedByTarget) {
  const ajv = new Ajv()

  const validators = Object.create(null)

  for (const target of Object.keys(schemaKeyedByTarget)) {
    if (!ALLOWED_TARGETS.has(target)) {
      continue
    }

    validators[target] = ajv.compile(schemaKeyedByTarget[target])
  }

  skema._validators = validators

  return skema

  /**
   * skema middleware
   */

  function skema (req, res, next) {
    for (const target of Object.keys(validators)) {
      const validator = validators[target]

      const isValid = validator(req[target])

      if (!isValid) {
        return next(errors.badRequest('validation'))
      }
    }

    next()
  }
}
