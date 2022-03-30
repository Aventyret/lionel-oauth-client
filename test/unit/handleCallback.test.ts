/**
 * @jest-environment jsdom
 */

import handleCallback, {
  getCallbackParams,
  getTokenRequestBody,
  validateCallbackParams,
  validateClientState
} from '../../src/handleCallback'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oauthConfig } from './test-config'
import mockOauthTokenResponse from './mockOauthTokenResponse.json'
import mockAccessToken from './mockAccessToken.json'

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
    expect(requestBody.client_id).toBe(oauthConfig.clientId)
    expect(requestBody.redirect_uri).toBe(oauthConfig.redirectUri)
    expect(requestBody.grant_type).toBe('authorization_code')
    expect(requestBody.code).toBe('mocked_code')
    expect(requestBody.code_verifier).toBe('mocked_code_verifier')
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
            json: () => Promise.resolve(mockOauthTokenResponse)
          })
        }) as jest.Mock
      )
      jest
        .spyOn(Date, 'now')
        .mockImplementation(
          jest.fn(
            () => mockAccessToken.decodedPayload.nbf * 1000 + 1000
          ) as jest.Mock
        )
    })
    it('should set access token in storage', async (): Promise<void> => {
      const storageModule = createStorageModule()
      storageModule.set('state', 'mocked_state')
      storageModule.set('codeVerifier', 'mocked_code_verifier')
      await handleCallback(
        oauthConfig,
        createStorageModule(),
        createLogger(oauthConfig)
      )
      expect(storageModule.get('accessToken')).toBe(
        mockOauthTokenResponse.access_token
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
                ...mockOauthTokenResponse,
                access_token: 'X' + mockOauthTokenResponse.access_token
              })
          })
        }) as jest.Mock
      )
    })
    it('should not set access token in storage', async (): Promise<void> => {
      const storageModule = createStorageModule()
      storageModule.set('state', 'mocked_state')
      storageModule.set('codeVerifier', 'mocked_code_verifier')
      await handleCallback(
        oauthConfig,
        createStorageModule(),
        createLogger(oauthConfig)
      )
      expect(() => storageModule.get('accessToken')).toThrow('Value not set')
    })
    afterAll(() => {
      jest.resetAllMocks()
    })
  })
})
