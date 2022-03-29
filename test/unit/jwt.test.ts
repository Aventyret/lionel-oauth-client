/**
 * @jest-environment jsdom
 */

import { parseJwt, validateJwt } from '../../src/jwt'
import createStorageModule from '../../src/createStorageModule'
import { oauthConfig } from './test-config'

import mockAccessToken from './mockAccessToken.json'

describe('parseJwt', (): void => {
  it('should parse an access token and extract correct header and claims', (): void => {
    const parsedAccessToken = parseJwt(mockAccessToken.encoded)
    expect(parsedAccessToken.header.alg).toBe(mockAccessToken.decodedHeader.alg)
    expect(parsedAccessToken.header.typ).toBe(mockAccessToken.decodedHeader.typ)
    expect(parsedAccessToken.claims.sub).toBe(
      mockAccessToken.decodedPayload.sub
    )
    expect(parsedAccessToken.claims.iat).toBe(
      mockAccessToken.decodedPayload.iat
    )
    expect(parsedAccessToken.claims.exp).toBe(
      mockAccessToken.decodedPayload.exp
    )
    expect(parsedAccessToken.claims.nbf).toBe(
      mockAccessToken.decodedPayload.nbf
    )
    expect(parsedAccessToken.signature.length).toBeGreaterThan(0)
  })
})
describe('validateJwt', (): void => {
  beforeAll(() => {
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(
          () => mockAccessToken.decodedPayload.nbf * 1000 + 1000
        ) as jest.Mock
      )
  })
  it('should not throw error for valid token', (): void => {
    const storageModule = createStorageModule()
    validateJwt(mockAccessToken.encoded, oauthConfig, storageModule)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
