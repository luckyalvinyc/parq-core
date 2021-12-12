const req = request(baseURL())

export const api = {
  spaces: spaces(),
  tickets: tickets()
}

// ~~~~~~~~~~
// /spaces
// ~~~~~~~~~~

function spaces (prefix = '/spaces') {
  return {
    /**
     * POST /spaces
     *
     * @param {object} space
     * @param {string} space.name
     * @param {number} space.entryPoints
     */

    async create (space) {
      const response = await req.post(prefix, {
        name: space.name,
        numberOfEntryPoints: space.entryPoints
      })

      return response.data
    },

    /**
     * GET /spaces
     *
     * @returns {Promise<object[]>}
     */

    async list () {
      const response = await req.get(prefix)

      return response.data
    },

    /**
     * GET /spaces/:spaceId
     *
     * @param {number} spaceId
     * @returns {Promise<object>}
     */

    async get (spaceId) {
      const response = await req.get(`${prefix}/${spaceId}`)

      return response.data
    },

    /**
     * POST /spaces/:spaceId
     *
     * @param {number} spaceId
     * @param {object[]} slots
     * @param {string} slots[].type
     * @param {Record<string, number>} slots[].distance
     * @returns {Promise<object>}
     */

    async update (spaceId, slots) {
      const response = await req.post(`${prefix}/${spaceId}`, {
        slots
      })

      return response.data
    }
  }
}

// ~~~~~~~~~~
// /tickets
// ~~~~~~~~~~

function tickets (prefix = '/tickets') {
  return {
    /**
     * POST /tickets
     *
     * @param {number} entryPointId
     * @param {object} vehicle
     * @param {string} vehicle.plateNumber
     * @param {string} vehicle.type
     */

    async create (entryPointId, vehicle) {
      const response = await req.post(prefix, {
        entryPointId,
        vehicle: {
          plateNumber: vehicle.plateNumber.trim(),
          type: vehicle.type
        }
      })

      return response.data
    },

    /**
     * POST /tickets/:ticketId
     *
     * @param {number} ticketId
     */

    async update (ticketId, options) {
      const response = await req.post(`${prefix}/${ticketId}`, {
        numberOfHoursToAdvance: undefined
      })

      return response.data
    }
  }
}

/**
 *
 * @param {string} version
 * @returns {string}
 */

function baseURL (version = 'v1') {
  return `/api/${version}`
}

/**
 *
 * @param {string} [baseURL]
 * @private
 */

function request (baseURL = '') {
  return {
    /**
     * @param {string} path
     */

    async get (path) {
      const response = await fetch(baseURL + path)

      return response.json()
    },

    /**
     *
     * @param {string} path
     * @param {object} [body]
     * @param {object} [headers]
     */

    async post (path, body, headers) {
      const opts = {
        method: 'POST',
        headers: Object.assign({
          'Content-Type': 'application/json; charset=utf-8'
        }, headers)
      }

      if (body) {
        opts.body = JSON.stringify(body)
      }

      const response = await fetch(baseURL + path, opts)

      let data

      try {
        data = await response.json()
      } catch {
        // ignore if response is not application/json
      }

      if (response.status >= 400 || response.status >= 500) {
        throw new Error(data.error.message)
      }

      return data
    }
  }
}
