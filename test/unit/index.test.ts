import lionel from '../../src'

describe('index', (): void => {
  test('library is exported', (): void => {
    const libraryTypeOf: string = typeof lionel
    expect(libraryTypeOf).toBe('object')
  })
})
