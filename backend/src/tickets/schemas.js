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
