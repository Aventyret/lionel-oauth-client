import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import createState from './createState'
import { createCodeChallenge } from './codeChallenge'
import { MetaData } from './metaData'
import { Logger } from './logger'

export const getAuthorizeUri = (
  oauthClientConfig: OauthClientConfig,
  metaData: MetaData | null = null,
  state: string,
  codeChallenge: string
): string => {
  const uri =
    metaData?.authorization_endpoint ||
    `${oauthClientConfig.issuer}${oauthClientConfig.authorizationEndpoint}`
  const queryParams = [
    `client_id=${oauthClientConfig.clientId}`,
    `redirect_uri=${encodeURIComponent(oauthClientConfig.redirectUri)}`,
    `scope=${oauthClientConfig.scopes?.join(' ')}`,
    'response_type=code',
    `state=${state}`,
    `code_challenge=${codeChallenge}`,
    'code_challenge_method=S256'
  ]
  if (oauthClientConfig.responseMode) {
    queryParams.push(`response_mode=${oauthClientConfig.responseMode}`)
  }
  return `${uri}?${queryParams.join('&')}`
}

export default async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  metaData: MetaData | null = null,
  logger: Logger
): Promise<void> => {
  logger.log('Sign In')
  logger.log({ oauthClientConfig, storageModule })
  const state = createState()
  storageModule.set('state', state)
  const { verifier, challenge } = await createCodeChallenge()
  storageModule.set('codeVerifier', verifier)
  location.assign(
    getAuthorizeUri(oauthClientConfig, metaData, state, challenge)
  )
}
