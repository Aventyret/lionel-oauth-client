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
  it('should set access token in storage', async (): Promise<void> => {
    const mockedAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsIm5iZiI6MTUxNjIzODk2Mn0.fcvceR4YsgVNOV85iUHsgX0G-2Di2LCJyAJZ7RxNLJM'
    const storageModule = createStorageModule()
    storageModule.set('state', 'mocked_state')
    storageModule.set('codeVerifier', 'mocked_code_verifier')
    await handleCallback(
      oauthConfig,
      createStorageModule(),
      createLogger(oauthConfig)
    )
    expect(storageModule.get('accessToken')).toBe(mockedAccessToken)
  })
})
