import {
  parseJwt,
  validateJwtHeader,
  validateJwtClaims,
  validateJwt,
  validateJwtNonce,
  validateIdToken
} from '../../src/jwt'
import createStorageModule from '../../src/createStorageModule'
import * as nonceModule from '../../src/createNonce'
import { oauthConfig, oidcConfig } from './test-config'
import accessTokenMock from './mocks/accessTokenMock.json'
import idTokenMock from './mocks/idTokenMock.json'
import nonceMock from './mocks/nonceMock.json'
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
    validateJwtClaims(
      {
        ...accessTokenMock.decodedPayload,
        iss: null
      },
      oauthConfig
    )
  })
  it('should throw error with different iss than in config', (): void => {
    expect(() => {
      validateJwtClaims(
        {
          ...accessTokenMock.decodedPayload,
          iss: 'incorrect_iss'
        },
        oauthConfig
      )
    }).toThrow('Incorrect iss in jwt claims')
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
describe('validateJwt', (): void => {
  describe('when token is active', (): void => {
    beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
    it('should not throw error for valid token', (): void => {
      validateJwt(accessTokenMock.encoded, oauthConfig)
    })
    it('should throw error with extra characters', (): void => {
      expect(() => {
        validateJwt('X' + accessTokenMock.encoded, oauthConfig)
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
      validateJwt(accessTokenMock.encoded, oauthConfig)
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
      expect(() => {
        validateJwt(accessTokenMock.encoded, oauthConfig)
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
      validateJwt(accessTokenMock.encoded, oauthConfig)
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
      expect(() => {
        validateJwt(accessTokenMock.encoded, oauthConfig)
      }).toThrow()
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
})
describe('validateJwtNonce', (): void => {
  describe('with mocked nonce in storage', (): void => {
    beforeAll(() => {
      jest.spyOn(nonceModule, 'nonceHash').mockImplementation(
        jest.fn(() => {
          return Promise.resolve(nonceMock.hash)
        })
      )
    })
    it('should pass if nonce in storage is correct', async (): Promise<void> => {
      const storageModule = createStorageModule(oidcConfig)
      storageModule.set('nonce', nonceMock.nonce)
      await validateJwtNonce(idTokenMock.encoded, storageModule)
      storageModule.remove('nonce')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  it('should not pass if nonce in storage is not correct', async (): Promise<void> => {
    const storageModule = createStorageModule(oidcConfig)
    storageModule.set('nonce', 'nonce_incorrect')
    try {
      await validateJwtNonce(idTokenMock.encoded, storageModule)
    } catch (error: unknown) {
      expect((error as Error).message).toBe(
        'Nonce in jwt does not match nonce in client'
      )
    }
    storageModule.remove('nonce')
  })
  it('should pass if token has no nonce', async (): Promise<void> => {
    const storageModule = createStorageModule(oauthConfig)
    await validateJwtNonce(accessTokenMock.encoded, storageModule)
  })
})
describe('validateIdToken•', (): void => {
  it('should pass for correct id token', (): void => {
    validateIdToken(idTokenMock.encoded, oidcConfig)
  })
})
