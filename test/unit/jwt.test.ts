/**
 * @jest-environment jsdom
 */

import { parseJwt } from '../../src/jwt'

import mockAccessToken from './mockAccessToken.json'

describe('parseJwt', (): void => {
  it('should parse an access token and extract a correct header and payload', (): void => {
    const parsedAccessToken = parseJwt(mockAccessToken.encoded)
    expect(parsedAccessToken.header.alg).toBe(mockAccessToken.decodedHeader.alg)
    expect(parsedAccessToken.header.typ).toBe(mockAccessToken.decodedHeader.typ)
    expect(parsedAccessToken.payload.sub).toBe(
      mockAccessToken.decodedPayload.sub
    )
    expect(parsedAccessToken.payload.iat).toBe(
      mockAccessToken.decodedPayload.iat
    )
    expect(parsedAccessToken.payload.exp).toBe(
      mockAccessToken.decodedPayload.exp
    )
    expect(parsedAccessToken.payload.nbf).toBe(
      mockAccessToken.decodedPayload.nbf
    )
    expect(parsedAccessToken.signature.length).toBeGreaterThan(0)
  })
})
