import createState from '../../src/createState'

describe('createState', (): void => {
  it('should return a 32 length string', (): void => {
    expect(createState().length).toBe(32)
  })
})
