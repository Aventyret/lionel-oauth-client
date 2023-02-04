import useOauthClient from '../../src/useOauthClient'
import { oauthConfig } from './test-config'

describe('useOauthClient', (): void => {
  it('returns client and refs', (): void => {
    const { oauthClient, accessToken, accessTokenExpires } =
      useOauthClient(oauthConfig)

    expect(typeof oauthClient).toBe('object')
    expect(typeof accessToken).toBe('object')
    expect(typeof accessTokenExpires).toBe('object')
  })
})
