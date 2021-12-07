export const create = {
  body: {
    type: 'object',
    required: ['numberOfEntryPoints'],
    properties: {
      numberOfEntryPoints: {
        type: 'integer',
        minimum: 3
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
          properties: {
            type: {
              enum: [
                'small',
                'medium',
                'large'
              ]
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
