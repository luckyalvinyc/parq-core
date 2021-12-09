export const types = createTypes()

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
    byLabel: createBy('label'),
    byValue: createBy('value'),
    labels: Object.keys(valueByType),

    /**
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
     * @param {number} value
     * @returns {string}
     */
    from (value) {
      return typeByValue[value]
    }
  }

  function createBy (type) {
    const container = Object.create(null)

    for (const label of Object.keys(valueByType)) {
      container[label] = type === 'value'
        ? valueByType[label]
        : label
    }

    return container
  }
}
