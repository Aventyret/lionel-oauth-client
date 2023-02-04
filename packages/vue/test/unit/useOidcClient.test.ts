import useOidcClient from '../../src/useOidcClient'
import { oidcConfig } from './test-config'

describe('useOidcClient', (): void => {
  it('returns client and refs', (): void => {
    const { oidcClient, accessToken, accessTokenExpires, user } =
      useOidcClient(oidcConfig)

    expect(typeof oidcClient).toBe('object')
    expect(typeof accessToken).toBe('object')
    expect(typeof accessTokenExpires).toBe('object')
    expect(typeof user).toBe('object')
  })
})
