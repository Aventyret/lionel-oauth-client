import signIn, { getAuthorizeUri } from '../../src/signIn'
import createStorageModule from '../../src/createStorageModule'
import createState from '../../src/createState'
import { createCodeChallenge } from '../../src/codeChallenge'
import createLogger from '../../src/logger'
import { oauthConfig } from './test-config'

describe('getAuthorizeUri', (): void => {
  it('should return a correct uri to authorize endpoint', async (): Promise<void> => {
    const authorizationEndpoint = '/auth'
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const authorizeUri = getAuthorizeUri(
      {
        ...oauthConfig,
        authorizationEndpoint
      },
      state,
      codeChallengeData.challenge
    )
    expect(authorizeUri).toMatch(new RegExp(`^${oauthConfig.issuer}?`))
    expect(authorizeUri).toMatch(new RegExp(`${authorizationEndpoint}`))
    expect(authorizeUri).toMatch(new RegExp('response_type=code'))
    expect(authorizeUri).toMatch(
      new RegExp(`client_id=${oauthConfig.clientId}`)
    )
    expect(authorizeUri).toMatch(new RegExp(`state=${state}`))
    expect(authorizeUri).toMatch(
      new RegExp(`code_challenge=${codeChallengeData.challenge}`)
    )
  })
  it('should include response_mode if provided', async (): Promise<void> => {
    const authorizationEndpoint = '/auth'
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const authorizeUri = getAuthorizeUri(
      {
        ...oauthConfig,
        authorizationEndpoint,
        responseMode: 'fragment'
      },
      state,
      codeChallengeData.challenge
    )
    expect(authorizeUri).toMatch(new RegExp('response_mode=fragment'))
  })
})

describe('signIn', (): void => {
  it('should not throw any errors', (): void => {
    signIn(
      oauthConfig,
      createStorageModule(oauthConfig),
      createLogger(oauthConfig)
    )
  })
})
