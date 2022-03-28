/**
 * @jest-environment jsdom
 */

import handleCallback, { getCallbackParams } from '../../src/handleCallback'
import createStorageModule from '../../src/createStorageModule'
import createLogger from '../../src/logger'
import { oauthConfig } from './test-config'

describe('getCallbackParams', (): void => {
  it('should read state and code params', (): void => {
    const callbackParams = getCallbackParams(
      '#code=mocked_code&state=mocked_state'
    )
    expect(callbackParams.code).toBe('mocked_code')
    expect(callbackParams.state).toBe('mocked_state')
  })
})

describe('handleCallback', (): void => {
  it.only('should not throw any errors', async (): Promise<void> => {
    const storageModule = createStorageModule()
    storageModule.set('state', 'mocked_state')
    storageModule.set('codeVerifier', 'mocked_code_verifier')
    await handleCallback(
      oauthConfig,
      createStorageModule(),
      createLogger(oauthConfig)
    )
  })
})
