import handleCallback, {
  getCallbackParams,
  getTokenRequestBody,
  validateCallbackParams,
  validateClientState
} from '../../src/handleCallback'
import createStorageModule from '../../src/createStorageModule'
import createEventModule from '../../src/createEventModule'
import createLogger from '../../src/logger'
import { oauthConfig } from './test-config'
import tokenResponseMock from './mocks/tokenResponseMock.json'
import accessTokenMock from './mocks/accessTokenMock.json'
import { createTokenValidTimeMock } from './mocks/timeMocks'

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
  describe('with correct token response', (): void => {
    beforeAll(() => {
      jest.spyOn(window, 'fetch').mockImplementation(
        jest.fn(() => {
          return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(tokenResponseMock)
          })
        }) as jest.Mock
      )
    })
    beforeAll(createTokenValidTimeMock(accessTokenMock.decodedPayload))
    it('should set access token in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oauthConfig)
      storageModule.set('state', 'mocked_state')
      storageModule.set('codeVerifier', 'mocked_code_verifier')
      const { publish } = createEventModule()
      await handleCallback(
        oauthConfig,
        storageModule,
        null,
        createLogger(oauthConfig),
        publish
      )
      expect(storageModule.get('accessToken')).toBe(
        tokenResponseMock.access_token
      )
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
  describe('with invalid token in response', (): void => {
    beforeAll(() => {
      jest.spyOn(window, 'fetch').mockImplementation(
        jest.fn(() => {
          return Promise.resolve({
            status: 200,
            json: () =>
              Promise.resolve({
                ...tokenResponseMock,
                access_token: 'X' + tokenResponseMock.access_token
              })
          })
        }) as jest.Mock
      )
    })
    it('should not set access token in storage', async (): Promise<void> => {
      const storageModule = createStorageModule(oauthConfig)
      storageModule.set('state', 'mocked_state')
      storageModule.set('codeVerifier', 'mocked_code_verifier')
      const { publish } = createEventModule()
      try {
        await handleCallback(
          oauthConfig,
          storageModule,
          null,
          createLogger(oauthConfig),
          publish
        )
      } catch {}
      expect(() => storageModule.get('accessToken')).toThrow('Value not set')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
})
