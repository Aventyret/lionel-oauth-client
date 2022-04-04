import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import createState from './createState'
import { createCodeChallenge } from './codeChallenge'
import createNonce, { nonceHash } from './createNonce'
import { MetaData } from './metaData'
import { Logger } from './logger'

export interface SignInOptions {
  idTokenHint?: string
  loginHint?: string
  display?: string
  prompt?: string
  nonce?: string
}

export const getAuthorizeUri = async (
  options: SignInOptions,
  oauthClientConfig: OauthClientConfig,
  metaData: MetaData | null = null,
  state: string,
  codeChallenge: string
): Promise<string> => {
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
  if (options.idTokenHint) {
    queryParams.push(`id_token_hint=${options.idTokenHint}`)
  }
  if (options.loginHint) {
    queryParams.push(`login_hint=${options.loginHint}`)
  }
  if (options.display) {
    queryParams.push(`display=${options.display}`)
  }
  if (options.prompt) {
    queryParams.push(`prompt=${options.prompt}`)
  }
  if (options.nonce) {
    queryParams.push(`nonce=${await nonceHash(options.nonce)}`)
  }
  return `${uri}?${queryParams.join('&')}`
}

export default async (
  options: SignInOptions,
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
  if (!options.nonce && oauthClientConfig.useNonce) {
    options.nonce = createNonce()
  }
  if (options.nonce) {
    storageModule.set('nonce', options.nonce)
  }
  location.assign(
    await getAuthorizeUri(
      options,
      oauthClientConfig,
      metaData,
      state,
      challenge
    )
  )
}
