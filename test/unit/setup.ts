import * as codeChallenge from '../../src/codeChallenge'

beforeAll(() => {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => {
        return array.map(() => {
          return Math.floor(Math.random() * 10)
        })
      },
      digest: (hashFn: string, charCodes: Uint8Array): Promise<ArrayBuffer> => {
        console.log('Mock crypto digest', hashFn, charCodes)
        return Promise.resolve(new ArrayBuffer(43))
      }
    }
  })
})

beforeEach(() => {
  jest.spyOn(codeChallenge, 'createCodeChallenge').mockReturnValue(
    Promise.resolve({
      verifier: 'mocked_code_verifier',
      challenge: 'mocked_code_challenge'
    })
  )
})
