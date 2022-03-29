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
describe('validateJwtHeader', (): void => {
  it('should throw without alg', (): void => {
    expect(() => {
      validateJwtHeader({
        ...mockAccessToken.decodedHeader,
        alg: null
      })
    }).toThrow('Missing alg in jwt header')
  })
  it('should throw with invalid alg', (): void => {
    expect(() => {
      validateJwtHeader({
        ...mockAccessToken.decodedHeader,
        alg: 'SH256'
      })
    }).toThrow('SH256 is not an allowed signing alg')
  })
  it('should throw without typ', (): void => {
    expect(() => {
      validateJwtHeader({
        ...mockAccessToken.decodedHeader,
        typ: null
      })
    }).toThrow('Missing typ in jwt header')
  })
})
describe('validateJwtClaims', (): void => {
  beforeAll(() => {
    jest
      .spyOn(Date, 'now')
      .mockImplementation(
        jest.fn(
          () => mockAccessToken.decodedPayload.nbf * 1000 + 1000
        ) as jest.Mock
      )
  })
  it('should not throw error with missing iss', (): void => {
    const storageModule = createStorageModule()
    validateJwtClaims(
      {
        ...mockAccessToken.decodedPayload,
        iss: null
      },
      oauthConfig,
      storageModule
    )
  })
  it('should throw error with different iss than in config', (): void => {
    const storageModule = createStorageModule()
    expect(() => {
      validateJwtClaims(
        {
          ...mockAccessToken.decodedPayload,
          iss: 'incorrect_iss'
        },
        oauthConfig,
        storageModule
      )
    }).toThrow('Incorrect iss in jwt claims')
  })
  it('should not throw error with correct nonce', (): void => {
    const storageModule = createStorageModule()
    storageModule.set('nonce', 'mocked_nonce')
    validateJwtClaims(
      {
        ...mockAccessToken.decodedPayload,
        nonce: 'mocked_nonce'
      },
      oauthConfig,
      storageModule
    )
  })
  it('should throw error with incorrect nonce', (): void => {
    const storageModule = createStorageModule()
    storageModule.set('nonce', 'incorrect_nonce')
    expect(() => {
      validateJwtClaims(
        {
          ...mockAccessToken.decodedPayload,
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
    it('should throw error with extra characters', (): void => {
      expect(() => {
        const storageModule = createStorageModule()
        validateJwt('X' + mockAccessToken.encoded, oauthConfig, storageModule)
      }).toThrow()
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('before token is active, but within leeway', (): void => {
    beforeAll(() => {
      jest
        .spyOn(Date, 'now')
        .mockImplementation(
          jest.fn(
            () => (mockAccessToken.decodedPayload.nbf - 1) * 1000
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
  describe('before token is active, outside of leeway', (): void => {
    beforeAll(() => {
      jest
        .spyOn(Date, 'now')
        .mockImplementation(
          jest.fn(
            () =>
              (mockAccessToken.decodedPayload.nbf -
                oauthConfig.tokenLeewaySeconds -
                1) *
              1000
          ) as jest.Mock
        )
    })
    it('should throw error for valid token', (): void => {
      const storageModule = createStorageModule()
      expect(() => {
        validateJwt(mockAccessToken.encoded, oauthConfig, storageModule)
      }).toThrow('jwt token not valid yet')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('after token is expired, but within leeway', (): void => {
    beforeAll(() => {
      jest
        .spyOn(Date, 'now')
        .mockImplementation(
          jest.fn(
            () => (mockAccessToken.decodedPayload.exp + 1) * 1000
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
  describe('after token is expired, outside of leeway', (): void => {
    beforeAll(() => {
      jest
        .spyOn(Date, 'now')
        .mockImplementation(
          jest.fn(
            () =>
              (mockAccessToken.decodedPayload.exp +
                oauthConfig.tokenLeewaySeconds +
                1) *
              1000
          ) as jest.Mock
        )
    })
    it('should throw error for valid token', (): void => {
      const storageModule = createStorageModule()
      expect(() => {
        validateJwt(mockAccessToken.encoded, oauthConfig, storageModule)
      }).toThrow()
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  // TODO: Add tests for validating id_token claims
})
