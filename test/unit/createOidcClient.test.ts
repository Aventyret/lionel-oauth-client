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
    const clientConfig = oidcClient.getConfig()
    expect(clientConfig.issuer).toBe(oidcConfig.issuer)
    expect(clientConfig.clientId).toBe(oidcConfig.clientId)
    expect(clientConfig.redirectUri).toBe(oidcConfig.redirectUri)
    expect(clientConfig.scopes).toBe(oidcConfig.scopes)
    expect(clientConfig.tokenLeewaySeconds).toBe(60)
    expect(clientConfig.debug).toBe(false)
  })
})
