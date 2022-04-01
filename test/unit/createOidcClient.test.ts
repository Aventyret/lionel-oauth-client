/**
 * @jest-environment jsdom
 */

import createOidcClient, { OidcClient } from '../../src/createOidcClient'
import { oidcConfig } from './test-config'

describe('createOidcClient', (): void => {
  it('should return an object when passing a valid config', async (): Promise<void> => {
    const oidcClient: OidcClient = await createOidcClient(oidcConfig)
    expect(typeof oidcClient).toBe('object')
  })
  it('should set correct config attributes, including defaults', async (): Promise<void> => {
    const oidcClient: OidcClient = await createOidcClient(oidcConfig)
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
