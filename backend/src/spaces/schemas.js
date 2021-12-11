import { types } from '../types.js'

export const create = {
  body: {
    type: 'object',
    required: [
      'name',
      'numberOfEntryPoints'
    ],
    properties: {
      name: {
        type: 'string',
        minLength: 1
      },
      numberOfEntryPoints: {
        type: 'integer',
        minimum: 3
      }
    }
  }
}

export const get = {
  params: {
    type: 'object',
    required: ['spaceId'],
    properties: {
      spaceId: {
        type: 'integer',
        minimum: 1
      }
    }
  }
}

export const update = {
  body: {
    type: 'object',
    required: ['slots'],
    properties: {
      slots: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          required: [
            'type',
            'distance'
          ],
          properties: {
            type: {
              enum: types.labels
            },
            distance: {
              type: 'object',
              patternProperties: {
                '^\\d+$': {
                  type: 'number',
                  minimum: 0,
                  maximum: 1
                }
              },
              additionalProperties: false
            }
          }
        }
      }
    }
  }
}

export const updateForEntryPoints = {
  type: 'object',
  required: ['label'],
  properties: {
    label: {
      type: 'string',
      minLength: 1
    }
  }
}
