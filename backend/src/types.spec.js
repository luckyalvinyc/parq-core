import { types } from './types.js'

it('labels', () => {
  expect(types.labels).toStrictEqual([
    'small',
    'medium',
    'large'
  ])
})

describe('@to', () => {
  ;['small', 'medium', 'large'].forEach((label, index) => {
    it(`should convert ${label} to ${index}`, () => {
      expect(types.to(label)).toBe(index)
    })
  })

  it('should throw an error if the given type is not valid', () => {
    expect(() => {
      types.to('hmm')
    }).toThrow()
  })
})

describe('@from', () => {
  const typesByValue = {
    0: 'small',
    1: 'medium',
    2: 'large'
  }

  Object.keys(typesByValue).forEach(value => {
    const label = typesByValue[value]

    it(`should convert ${value} to ${label}`, () => {
      expect(types.from(value)).toBe(label)
    })
  })

  it('should throw an error if the given value is not valid', () => {
    expect(() => {
      types.from(100)
    }).toThrow()
  })
})
