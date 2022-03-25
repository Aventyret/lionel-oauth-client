import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

const getAuthorizeUri = (
  oauthClientConfig: OauthClientConfig,
  state: string,
  codeChallenge: string
): string => {
  let uri = `${oauthClientConfig.issuer}${oauthClientConfig.authorizationEndpoint}`
  uri += `?client_id=${oauthClientConfig.clientId}`
  uri += `&redirect_uri=${oauthClientConfig.redirectUri}`
  uri += `&redirect_uri=${oauthClientConfig.redirectUri}`
  uri += `&scope=${oauthClientConfig.scope}`
  uri += '&response_type=code'
  uri += '&response_mode=fragment'
  uri += `&state=${state}`
  uri += `&code_challenge=${codeChallenge}`
  uri += '&code_challenge_method=S256'
  return uri
}

export default (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): void => {
  logger.log('Sign In')
  logger.log({ oauthClientConfig, storageModule })
  location.assign(getAuthorizeUri(oauthClientConfig, '', ''))
}
