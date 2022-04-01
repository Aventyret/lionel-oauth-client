/**
 * @jest-environment jsdom
 */

import createOidcClient from '../../src/createOidcClient'
import { oidcConfig } from './test-config'

describe('createOidcClient', (): void => {
  it('should return an object when passing a valid config', (): void => {
    const oidcClient = createOidcClient(oidcConfig)
    expect(typeof oidcClient).toBe('object')
  })
  it('should set correct config attributes, including defaults', (): void => {
    const oidcClient = createOidcClient(oidcConfig)
    console.log({ oidcClient })
    const clientConfig = oidcClient.getConfig()
    expect(clientConfig.issuer).toBe(oidcConfig.issuer)
    expect(clientConfig.clientId).toBe(oidcConfig.clientId)
    expect(clientConfig.redirectUri).toBe(oidcConfig.redirectUri)
    expect(clientConfig.scopes).toBe(oidcConfig.scopes)
    expect(clientConfig.authorizationEndpoint).toBe(
      oidcConfig.metaData.authorization_endpoint.replace(oidcConfig.issuer, '')
    )
    expect(clientConfig.tokenEndpoint).toBe(
      oidcConfig.metaData.token_endpoint.replace(oidcConfig.issuer, '')
    )
    expect(clientConfig.tokenLeewaySeconds).toBe(60)
    expect(clientConfig.debug).toBe(false)
  })
})
