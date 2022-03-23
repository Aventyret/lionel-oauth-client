/**
 * @jest-environment jsdom
 */

import createOauthClient, { OauthClient } from '../../src/createOauthClient'
import { oauthConfig } from './test-config'

describe('createOauthClient', (): void => {
  test('returns an object when using a valid config', (): void => {
    const oauthClient: OauthClient = createOauthClient(oauthConfig)
    expect(typeof oauthClient).toBe('object')
  })
  test('throws an error if issuer is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      issuer: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
  test('throws an error if clientId is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      clientId: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
  test('throws an error if redirectUri is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      redirectUri: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
})
