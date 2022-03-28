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
  Object.defineProperty(window, 'location', {
    value: {
      assign: jest.fn(),
      hash: '#state=mocked_state&code=mocked_code'
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
