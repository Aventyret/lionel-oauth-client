import createOauthClient, { OauthClient } from '../../src/createOauthClient'
import { oauthConfig } from './test-config'

describe('createOauthClient', (): void => {
  it('should return an object when passing a valid config', (): void => {
    const oauthClient: OauthClient = createOauthClient(oauthConfig)
    expect(typeof oauthClient).toBe('object')
  })
  it('should set correct config attributes, including defaults', (): void => {
    const oauthClient: OauthClient = createOauthClient(oauthConfig)
    const clientConfig = oauthClient.getConfig()
    expect(clientConfig.issuer).toBe(oauthConfig.issuer)
    expect(clientConfig.clientId).toBe(oauthConfig.clientId)
    expect(clientConfig.redirectUri).toBe(oauthConfig.redirectUri)
    expect(clientConfig.scope).toBe(oauthConfig.scope)
    expect(clientConfig.authorizationEndpoint).toBe('/authorize')
    expect(clientConfig.tokenEndpoint).toBe('/token')
    expect(clientConfig.tokenLeewaySeconds).toBe(60)
    expect(clientConfig.debug).toBe(false)
  })
  it('should throw an error if issuer is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      issuer: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
  it('should throw an error if clientId is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      clientId: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
  it('should throw an error if redirectUri is missing', (): void => {
    const invalidConfig = {
      ...oauthConfig,
      redirectUri: undefined
    }
    //@ts-expect-error throws error with invalid config
    expect(() => createOauthClient(invalidConfig)).toThrow()
  })
})
