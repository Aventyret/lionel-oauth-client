import signIn, { getAuthorizeUri } from '../../src/signIn'
import createStorageModule from '../../src/createStorageModule'
import createState from '../../src/createState'
import { createCodeChallenge } from '../../src/codeChallenge'
import { nonceHash } from '../../src/createNonce'
import createLogger from '../../src/logger'
import { oauthConfig, oidcConfig } from './test-config'

describe('getAuthorizeUri', (): void => {
  it('should return a correct uri to authorize endpoint', async (): Promise<void> => {
    const authorizationEndpoint = '/auth'
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const authorizeUri = getAuthorizeUri(
      {},
      {
        ...oauthConfig,
        authorizationEndpoint
      },
      null,
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
  it('should include response_mode if provided in config', async (): Promise<void> => {
    const authorizationEndpoint = '/auth'
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const authorizeUri = getAuthorizeUri(
      {},
      {
        ...oauthConfig,
        authorizationEndpoint,
        responseMode: 'fragment'
      },
      oidcConfig.metaData,
      state,
      codeChallengeData.challenge
    )
    expect(authorizeUri).toMatch(new RegExp('response_mode=fragment'))
  })
  it('should get authorize uri from meta data for oidc client', async (): Promise<void> => {
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const authorizeUri = getAuthorizeUri(
      {},
      {
        ...oidcConfig,
        authorizationEndpoint: '/not_interersted'
      },
      oidcConfig.metaData,
      state,
      codeChallengeData.challenge
    )
    expect(authorizeUri).toMatch(
      new RegExp(`^${oidcConfig.metaData.authorization_endpoint}?`)
    )
    expect(authorizeUri).toMatch(new RegExp('response_type=code'))
    expect(authorizeUri).toMatch(
      new RegExp(`client_id=${oauthConfig.clientId}`)
    )
    expect(authorizeUri).toMatch(new RegExp(`state=${state}`))
    expect(authorizeUri).toMatch(
      new RegExp(`code_challenge=${codeChallengeData.challenge}`)
    )
  })
  it('should include idTokenHint, loginHint, display, prompt and nonce if provided in options', async (): Promise<void> => {
    const state = createState()
    const codeChallengeData = await createCodeChallenge()
    const options = {
      idTokenHint: 'mocked_id_token_hint',
      loginHint: 'mocked_login_hint',
      display: 'mocked_display',
      prompt: 'mocked_prompt',
      nonce: 'mocked_nonce'
    }
    const authorizeUri = getAuthorizeUri(
      options,
      oidcConfig,
      oidcConfig.metaData,
      state,
      codeChallengeData.challenge
    )
    expect(authorizeUri).toMatch(
      new RegExp(`id_token_hint=${options.idTokenHint}`)
    )
    expect(authorizeUri).toMatch(new RegExp(`login_hint=${options.loginHint}`))
    expect(authorizeUri).toMatch(new RegExp(`display=${options.display}`))
    expect(authorizeUri).toMatch(new RegExp(`prompt=${options.prompt}`))
    expect(authorizeUri).toMatch(
      new RegExp(`nonce=${nonceHash(options.nonce)}`)
    )
  })
})

describe('signIn', (): void => {
  it('should not throw any errors', (): void => {
    signIn(
      {},
      oauthConfig,
      createStorageModule(oauthConfig),
      null,
      createLogger(oauthConfig)
    )
  })
})
