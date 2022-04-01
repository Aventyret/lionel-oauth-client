/**
 * @jest-environment jsdom
 */

import {
  parseJwt,
  validateJwtHeader,
  validateJwtClaims,
  validateJwt
} from '../../src/jwt'
import createStorageModule from '../../src/createStorageModule'
import { oauthConfig } from './test-config'
import accessTokenMock from './mocks/accessTokenMock.json'
import {
  createTokenValidTimeMock,
  createTokenEarlyTimeWithinLeewayMock,
  createTokenEarlyTimeOutsideLeewayMock,
  createTokenExpiredTimeWithinLeewayMock,
  createTokenExpiredTimeOutsideLeewayMock
} from './mocks/timeMocks'

describe('parseJwt', (): void => {
  it('should parse an access token and extract correct header and claims', (): void => {
    const parsedAccessToken = parseJwt(accessTokenMock.encoded)
    expect(parsedAccessToken.header.alg).toBe(accessTokenMock.decodedHeader.alg)
    expect(parsedAccessToken.header.typ).toBe(accessTokenMock.decodedHeader.typ)
    expect(parsedAccessToken.claims.sub).toBe(
      accessTokenMock.decodedPayload.sub
    )
    expect(parsedAccessToken.claims.iat).toBe(
      accessTokenMock.decodedPayload.iat
    )
    expect(parsedAccessToken.claims.exp).toBe(
      accessTokenMock.decodedPayload.exp
    )
    expect(parsedAccessToken.claims.nbf).toBe(
      accessTokenMock.decodedPayload.nbf
    )
    expect(parsedAccessToken.signature.length).toBeGreaterThan(0)
  })
})
describe('validateJwtHeader', (): void => {
  it('should throw without alg', (): void => {
    expect(() => {
      validateJwtHeader({
        ...accessTokenMock.decodedHeader,
        alg: null
      })
    }).toThrow('Missing alg in jwt header')
  })
  it('should throw with invalid alg', (): void => {
    expect(() => {
      validateJwtHeader({
        ...accessTokenMock.decodedHeader,
        alg: 'SH256'
      })
    }).toThrow('SH256 is not an allowed signing alg')
  })
  it('should throw without typ', (): void => {
    expect(() => {
      validateJwtHeader({
        ...accessTokenMock.decodedHeader,
        typ: null
      })
    }).toThrow('Missing typ in jwt header')
  })
})
describe('validateJwtClaims', (): void => {
  beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
  it('should not throw error with missing iss', (): void => {
    const storageModule = createStorageModule(oauthConfig)
    validateJwtClaims(
      {
        ...accessTokenMock.decodedPayload,
        iss: null
      },
      oauthConfig,
      storageModule
    )
  })
  it('should throw error with different iss than in config', (): void => {
    const storageModule = createStorageModule(oauthConfig)
    expect(() => {
      validateJwtClaims(
        {
          ...accessTokenMock.decodedPayload,
          iss: 'incorrect_iss'
        },
        oauthConfig,
        storageModule
      )
    }).toThrow('Incorrect iss in jwt claims')
  })
  it('should not throw error with correct nonce', (): void => {
    const storageModule = createStorageModule(oauthConfig)
    storageModule.set('nonce', 'mocked_nonce')
    validateJwtClaims(
      {
        ...accessTokenMock.decodedPayload,
        nonce: 'mocked_nonce'
      },
      oauthConfig,
      storageModule
    )
  })
  it('should throw error with incorrect nonce', (): void => {
    const storageModule = createStorageModule(oauthConfig)
    storageModule.set('nonce', 'incorrect_nonce')
    expect(() => {
      validateJwtClaims(
        {
          ...accessTokenMock.decodedPayload,
          nonce: 'mocked_nonce'
        },
        oauthConfig,
        storageModule
      )
    }).toThrow('Nonce in jwt do not match nonce in client')
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
describe('validateJwt', (): void => {
  describe('when token is active', (): void => {
    beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
    it('should not throw error for valid token', (): void => {
      const storageModule = createStorageModule(oauthConfig)
      validateJwt(accessTokenMock.encoded, oauthConfig, storageModule)
    })
    it('should throw error with extra characters', (): void => {
      expect(() => {
        const storageModule = createStorageModule(oauthConfig)
        validateJwt('X' + accessTokenMock.encoded, oauthConfig, storageModule)
      }).toThrow()
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('before token is active, but within leeway', (): void => {
    beforeAll(
      createTokenEarlyTimeWithinLeewayMock(accessTokenMock.decodedPayload)
    )
    it('should not throw error for valid token', (): void => {
      const storageModule = createStorageModule(oauthConfig)
      validateJwt(accessTokenMock.encoded, oauthConfig, storageModule)
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('before token is active, outside of leeway', (): void => {
    beforeAll(
      createTokenEarlyTimeOutsideLeewayMock(
        accessTokenMock.decodedPayload,
        oauthConfig
      )
    )
    it('should throw error for valid token', (): void => {
      const storageModule = createStorageModule(oauthConfig)
      expect(() => {
        validateJwt(accessTokenMock.encoded, oauthConfig, storageModule)
      }).toThrow('jwt token not valid yet')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('after token is expired, but within leeway', (): void => {
    beforeAll(
      createTokenExpiredTimeWithinLeewayMock(accessTokenMock.decodedPayload)
    )
    it('should not throw error for valid token', (): void => {
      const storageModule = createStorageModule(oauthConfig)
      validateJwt(accessTokenMock.encoded, oauthConfig, storageModule)
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('after token is expired, outside of leeway', (): void => {
    beforeAll(
      createTokenExpiredTimeOutsideLeewayMock(
        accessTokenMock.decodedPayload,
        oauthConfig
      )
    )
    it('should throw error for valid token', (): void => {
      const storageModule = createStorageModule(oauthConfig)
      expect(() => {
        validateJwt(accessTokenMock.encoded, oauthConfig, storageModule)
      }).toThrow()
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  // TODO: Add tests for validating id_token claims
})
