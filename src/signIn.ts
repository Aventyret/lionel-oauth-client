import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import getRandomString from './getRandomString'
import createState from './createState'
import createCodeChallenge from './createCodeChallenge'
import { Logger } from './logger'

const getAuthorizeUri = (
  oauthClientConfig: OauthClientConfig,
  state: string,
  codeChallenge: string
): string => {
  const uri = `${oauthClientConfig.issuer}${oauthClientConfig.authorizationEndpoint}`
  const queryParams = [
    `client_id=${oauthClientConfig.clientId}`,
    `redirect_uri=${oauthClientConfig.redirectUri}`,
    `redirect_uri=${oauthClientConfig.redirectUri}`,
    `scope=${oauthClientConfig.scope}`,
    'response_type=code',
    'response_mode=fragment',
    `state=${state}`,
    `code_challenge=${codeChallenge}`,
    'code_challenge_method=S256'
  ]
  return `${uri}?${queryParams.join('&')}`
}

export default async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): Promise<void> => {
  logger.log('Sign In')
  logger.log({ oauthClientConfig, storageModule })
  const state = createState()
  storageModule.set('state', state)
  const codeVerifier = getRandomString(43)
  storageModule.set('codeVerifier', codeVerifier)
  const codeChallenge = await createCodeChallenge(codeVerifier)
  location.assign(getAuthorizeUri(oauthClientConfig, state, codeChallenge))
}
