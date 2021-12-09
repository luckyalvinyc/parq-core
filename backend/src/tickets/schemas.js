export const create = {
  body: {
    type: 'object',
    required: [
      'entryPointId',
      'vehicleType'
    ],
    properties: {
      entryPointId: {
        type: 'integer',
        minimum: 1
      },
      vehicleType: {
        enum: [
          'small',
          'medium',
          'large'
        ]
      }
    }
  }
}

export const update = {
  body: {
    type: 'object',
    required: ['endAt'],
    properties: {
      endAt: {
        type: 'string',
        format: 'date-time'
      }
    }

  }
}

export const options = {
  formats: ['date-time']
}
