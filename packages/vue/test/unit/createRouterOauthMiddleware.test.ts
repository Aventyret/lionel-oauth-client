import createRouterOauthMiddleware from '../../src/createRouterOauthMiddleware'
import { oauthConfig } from './test-config'

describe('createRouterOauthMiddleware', (): void => {
  it('returns a middleware function', (): void => {
    const middleware = createRouterOauthMiddleware(oauthConfig, {
      clientType: 'oauth'
    })

    expect(typeof middleware).toBe('function')
  })
})
