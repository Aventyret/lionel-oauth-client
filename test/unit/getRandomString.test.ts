import getRandomString from '../../src/getRandomString'

describe('getRandomString', (): void => {
  it('should return a string with the specified length', (): void => {
    ;[1, 8, 16, 32, 64].forEach((length: number) => {
      expect(getRandomString(length).length).toBe(length)
    })
  })
})
