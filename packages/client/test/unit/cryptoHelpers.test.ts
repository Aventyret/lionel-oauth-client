import { randomString, hash } from '../../src/cryptoHelpers'

describe('randomString', (): void => {
  it('should return a string with the specified length', (): void => {
    ;[1, 8, 16, 32, 64].forEach((specifiedLength: number) => {
      expect(randomString(specifiedLength).length).toBe(specifiedLength)
    })
  })
})

describe('hash', (): void => {
  it('when mocked should return a string of 86 chars', async (): Promise<void> => {
    ;[1, 8, 16, 32, 64].forEach(async (specifiedLength: number) => {
      expect((await hash(randomString(specifiedLength))).length).toBe(86)
    })
  })
})
