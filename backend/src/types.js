export const types = createTypes()

/**
 * This is a shared types for both vehicles and slots
 *  once the types will deviate, this also needs to be separated
 */
function createTypes () {
  const valueByType = {
    small: 0,
    medium: 1,
    large: 2
  }

  const typeByValue = {
    0: 'small',
    1: 'medium',
    2: 'large'
  }

  return {
    labels: Object.keys(valueByType),

    /**
     * Converts the provided `type` to its integer value
     *
     * @param {string} type
     * @returns {number}
     */
    to (type) {
      const value = valueByType[type]

      if (value === undefined) {
        throw new Error(`Type of: ${type} is not recognized`)
      }

      return value
    },

    /**
     * Converts the provided `value` to its string value
     *
     * @param {number} value
     * @returns {string}
     */
    from (value) {
      const type = typeByValue[value]

      if (type === undefined) {
        throw new Error(`Value of: ${value} is not recognized`)
      }

      return type
    }
  }
}
