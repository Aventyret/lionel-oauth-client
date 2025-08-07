import handleCallback, {
  getCallbackParams,
  getTokenRequestBody,
  validateCallbackParams,
  validateClientState
} from '../../src/handleCallback'
import createStorageModule from '../../src/createStorageModule'
import * as nonceModule from '../../src/createNonce'
import createLogger from '../../src/logger'
import { oauthConfig, oidcConfig } from './test-config'
import tokenResponseMock from './mocks/tokenResponseMock.json'
import accessTokenMock from './mocks/accessTokenMock.json'
import idTokenResponseMock from './mocks/idTokenResponseMock.json'
import idTokenMock from './mocks/idTokenMock.json'
import nonceMock from './mocks/nonceMock.json'
import { createTokenValidTimeMock } from './mocks/timeMocks'
import { vi, Mock } from 'vitest'

describe('getCallbackParams', (): void => {
  it('should read state and code params from fragment', (): void => {
    const callbackParams = getCallbackParams(
      '#code=mocked_code&state=mocked_state'
    )
    expect(callbackParams.code).toBe('mocked_code')
    expect(callbackParams.state).toBe('mocked_state')
  })
  it('should read state and code params from query params', (): void => {
    const callbackParams = getCallbackParams(
      '?code=mocked_code&state=mocked_state'
    )
    expect(callbackParams.code).toBe('mocked_code')
    expect(callbackParams.state).toBe('mocked_state')
  })
  it('should read error, errorDescription and errorUri params from query params', (): void => {
    const callbackParams = getCallbackParams(
      '?error=mocked_error&error_description=mocked_error_description&error_uri=mocked_error_uri&state=mocked_state'
    )
    expect(callbackParams.error).toBe('mocked_error')
    expect(callbackParams.errorDescription).toBe('mocked_error_description')
    expect(callbackParams.errorUri).toBe('mocked_error_uri')
    expect(callbackParams.state).toBe('mocked_state')
  })
  it('should return empty object with no query string', (): void => {
    const callbackParams = getCallbackParams('')
    expect(typeof callbackParams.code).toBe('undefined')
    expect(typeof callbackParams.state).toBe('undefined')
  })
})

describe('getTokenRequestBody', (): void => {
  it('should get a correct request body', (): void => {
    const requestBody = getTokenRequestBody(
      oauthConfig,
      'mocked_code_verifier',
      'mocked_code'
    )
    expect(requestBody.get('client_id')).toBe(oauthConfig.clientId)
    expect(requestBody.get('redirect_uri')).toBe(oauthConfig.redirectUri)
    expect(requestBody.get('grant_type')).toBe('authorization_code')
    expect(requestBody.get('code')).toBe('mocked_code')
    expect(requestBody.get('code_verifier')).toBe('mocked_code_verifier')
  })
})

describe('validateCallbackParams', (): void => {
  it('should not throw errors with code and state', (): void => {
    validateCallbackParams({ code: 'mocked_code', state: 'mocked_state' })
  })
  it('should throw error with error and state', (): void => {
    expect(() =>
      validateCallbackParams({ error: 'mocked_error', state: 'mocked_state' })
    ).toThrow('mocked_error')
  })
})

describe('validateClientState', (): void => {
  it('should not throw errors with correct state and code verifier', (): void => {
    validateClientState(
      { code: 'mocked_code', state: 'mocked_state' },
      'mocked_state',
      'mocked_code_verifier'
    )
  })
})

describe('handleCallback', (): void => {
  describe('with access_token', (): void => {
    describe('with correct token response', (): void => {
      beforeAll(() => {
        vi.spyOn(window, 'fetch').mockImplementation(
          vi.fn(() => {
            return Promise.resolve({
              status: 200,
              json: () => Promise.resolve(tokenResponseMock)
            })
          }) as Mock
        )
      })
      beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
      it('should return access token when type is redirect', async (): Promise<void> => {
        const storageModule = createStorageModule(oauthConfig)
        storageModule.set('state', 'mocked_state')
        storageModule.set('codeVerifier', 'mocked_code_verifier')
        const callbackResponse = await handleCallback(
          oauthConfig,
          storageModule,
          null,
          createLogger(oauthConfig)
        )
        expect(callbackResponse.tokenResponse.accessToken).toBe(
          tokenResponseMock.access_token
        )
        expect(callbackResponse.callbackType).toBe('redirect')
      })
      afterAll(() => {
        vi.resetAllMocks()
      })
    })
  })
  describe('with id token', (): void => {
    describe('with correct token response', (): void => {
      beforeAll(() => {
        vi.spyOn(window, 'fetch').mockImplementation(
          vi.fn(() => {
            return Promise.resolve({
              status: 200,
              json: () => Promise.resolve(idTokenResponseMock)
            })
          }) as Mock
        )
        vi.spyOn(nonceModule, 'nonceHash').mockImplementation(
          vi.fn(() => {
            return Promise.resolve(nonceMock.hash)
          })
        )
      })
      beforeAll(createTokenValidTimeMock(idTokenMock.decodedPayload))
      it('should return id token', async (): Promise<void> => {
        const storageModule = createStorageModule(oidcConfig)
        storageModule.set('state', 'mocked_state')
        storageModule.set('nonce', nonceMock.nonce)
        storageModule.set('codeVerifier', 'mocked_code_verifier')
        const callbackResponse = await handleCallback(
          oidcConfig,
          storageModule,
          oidcConfig.metaData,
          createLogger(oidcConfig)
        )
        expect(callbackResponse.tokenResponse?.accessToken).toBe(
          idTokenResponseMock.access_token
        )
        expect(callbackResponse.tokenResponse?.idToken).toBe(
          idTokenResponseMock.id_token
        )
        expect(callbackResponse.callbackType).toBe('redirect')
      })
      afterEach(() => {
        try {
          const storageModule = createStorageModule(oidcConfig)
          storageModule.remove('accessToken')
          storageModule.remove('idToken')
        } catch {}
      })
      afterAll(() => {
        vi.resetAllMocks()
      })
    })
    describe('with invalid id token in response', (): void => {
      beforeAll(() => {
        vi.spyOn(window, 'fetch').mockImplementation(
          vi.fn(() => {
            return Promise.resolve({
              status: 200,
              json: () =>
                Promise.resolve({
                  ...idTokenResponseMock,
                  id_token: 'X' + idTokenResponseMock.access_token
                })
            })
          }) as Mock
        )
      })
      it('should not set access token or id token in storage', async (): Promise<void> => {
        const storageModule = createStorageModule(oidcConfig)
        storageModule.set('state', 'mocked_state')
        storageModule.set('codeVerifier', 'mocked_code_verifier')
        try {
          await handleCallback(
            oidcConfig,
            storageModule,
            oidcConfig.metaData,
            createLogger(oidcConfig)
          )
        } catch {}
        expect(() => storageModule.get('accessToken')).toThrow('Value not set')
        expect(() => storageModule.get('idToken')).toThrow('Value not set')
      })
      afterAll(() => {
        vi.resetAllMocks()
      })
    })
  })
})
