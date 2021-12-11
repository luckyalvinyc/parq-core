import { types } from '../types.js'

export const create = {
  body: {
    type: 'object',
    required: [
      'entryPointId',
      'vehicle'
    ],
    properties: {
      entryPointId: {
        type: 'integer',
        minimum: 1
      },
      vehicle: {
        type: 'object',
        required: [
          'plateNumber',
          'type'
        ],
        properties: {
          plateNumber: {
            type: 'string',
            minLength: 1
          },
          type: {
            enum: types.labels
          }
        }
      }
    }
  }
}

export const update = {
  body: {
    type: 'object',
    properties: {
      numberOfHoursToAdvance: {
        type: 'integer',
        minimum: 1
      }
    }
  }
}
