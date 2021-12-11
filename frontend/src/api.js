const req = request()

export const api = {
  spaces: spaces()
}

// ~~~~~~~~~~
// /spaces
// ~~~~~~~~~~

function spaces (prefix = 'spaces') {
  prefix = baseURL(prefix)

  return {
    /**
     * GET /spaces/
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
    }
  }
}

/**
 *
 * @param {string} prefix
 * @param {string} version
 * @returns {string}
 */

function baseURL (prefix, version = 'v1') {
  return `/api/${version}/${prefix}`
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
