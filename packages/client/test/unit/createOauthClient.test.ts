import {
  createOauthClient,
  createOidcClient
} from '../../src/createOauthClient'
import { oauthConfig, oidcConfig } from './test-config'

describe('createOauthClient', (): void => {
  it('should return an object when passing a valid config', (): void => {
    const oauthClient = createOauthClient(oauthConfig)
    expect(typeof oauthClient).toBe('object')
  })
  it('should set correct config attributes, including defaults', (): void => {
    const oauthClient = createOauthClient(oauthConfig)
    const clientConfig = oauthClient.getConfig()
    expect(clientConfig.issuer).toBe(oauthConfig.issuer)
    expect(clientConfig.clientId).toBe(oauthConfig.clientId)
    expect(clientConfig.redirectUri).toBe(oauthConfig.redirectUri)
    expect(clientConfig.scopes).toBe(oauthConfig.scopes)
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

describe('createOidcClient', (): void => {
  it('should return an object when passing a valid config', (): void => {
    const oidcClient = createOidcClient(oidcConfig)
    expect(typeof oidcClient).toBe('object')
  })
  it('should set correct config attributes, including defaults', (): void => {
    const oidcClient = createOidcClient(oidcConfig)
    const clientConfig = oidcClient.getConfig()
    expect(clientConfig.issuer).toBe(oidcConfig.issuer)
    expect(clientConfig.clientId).toBe(oidcConfig.clientId)
    expect(clientConfig.redirectUri).toBe(oidcConfig.redirectUri)
    expect(clientConfig.scopes).toBe(oidcConfig.scopes)
    expect(clientConfig.tokenLeewaySeconds).toBe(60)
    expect(clientConfig.debug).toBe(false)
  })
})
