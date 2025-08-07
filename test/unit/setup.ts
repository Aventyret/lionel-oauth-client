import * as codeChallenge from '../../src/codeChallenge'
import { TextEncoder, TextDecoder } from 'util'
import { vi } from 'vitest'

beforeAll(() => {
  Object.defineProperty(window, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => {
        return array.map(() => {
          return Math.floor(Math.random() * 10)
        })
      },
      subtle: {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        /* eslint-disable @typescript-eslint/no-unused-vars */
        digest: (
          //@ts-ignore
          hashFn: string,
          //@ts-ignore
          charCodes: Uint8Array
        ): Promise<ArrayBuffer> => {
          return Promise.resolve(new ArrayBuffer(43))
        }
        /* eslint-enable @typescript-eslint/ban-ts-comment */
        /* eslint-enable @typescript-eslint/no-unused-vars */
      }
    }
  })
  Object.defineProperty(window, 'location', {
    value: {
      assign: vi.fn(),
      hash: '#state=mocked_state&code=mocked_code'
    }
  })
  Object.defineProperty(window, 'fetch', {
    value: vi.fn()
  })
  Object.defineProperty(window, 'TextEncoder', {
    value: TextEncoder
  })
  Object.defineProperty(window, 'TextDecoder', {
    value: TextDecoder
  })
})

beforeEach(() => {
  vi.spyOn(codeChallenge, 'createCodeChallenge').mockReturnValue(
    Promise.resolve({
      verifier: 'mocked_code_verifier',
      challenge: 'mocked_code_challenge'
    })
  )
})
