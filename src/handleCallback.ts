import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { validateJwt, validateIdToken, validateJwtNonce } from './jwt'
import { MetaData } from './metaData'
import { Logger } from './logger'

interface CallbackParams {
  code?: string
  state?: string
}

export interface TokenReponse {
  accessToken: string
  idToken?: string
  sessionState?: string
}

export const getCallbackParams = (queryString: string) => {
  return queryString
    .replace(new RegExp('^#'), '')
    .replace(new RegExp(/^\?/), '')
    .split('&')
    .reduce((params: CallbackParams, part: string): CallbackParams => {
      if (part.startsWith('code=')) {
        params.code = part.split('=')[1]
      }
      if (part.startsWith('state=')) {
        params.state = part.split('=')[1]
      }
      return params
    }, {})
}

export const getTokenRequestBody = (
  oauthClientConfig: OauthClientConfig,
  codeVerifier: string,
  code?: string
): URLSearchParams => {
  return new URLSearchParams({
    client_id: oauthClientConfig.clientId,
    redirect_uri: oauthClientConfig.redirectUri,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    code: code || ''
  } as Record<string, string>)
}

export const validateCallbackParams = (
  callbackParams: CallbackParams
): void => {
  if (!callbackParams.state) {
    throw Error('Missing state in callback params')
  }
  if (!callbackParams.code) {
    throw Error('Missing code in callback params')
  }
}

export const validateClientState = (
  callbackParams: CallbackParams,
  clientState: string,
  clientCodeVerifier: string
): void => {
  if (callbackParams.state !== clientState) {
    throw Error('Incorrect state stored in oauth client')
  }
  if (!clientCodeVerifier) {
    throw Error('Missing code verifier in client')
  }
}

const requestToken = async (
  oauthClientConfig: OauthClientConfig,
  metaData: MetaData | null = null,
  tokenRequestBody: URLSearchParams
): Promise<TokenReponse> => {
  const uri =
    metaData?.token_endpoint ||
    `${oauthClientConfig.issuer}${oauthClientConfig.tokenEndpoint}`
  const response = await fetch(uri, {
    method: 'POST',
    body: new URLSearchParams(tokenRequestBody)
  })
  if (response.status >= 200 && response.status < 300) {
    const tokenResponse = await response.json()
    return {
      accessToken: tokenResponse.access_token || '',
      idToken: tokenResponse.id_token || '',
      sessionState: tokenResponse.session_state || ''
    }
  }
  throw Error(`Get Token http status ${response.status}`)
}

const cleanupStorage = (storageModule: StorageModule): void => {
  storageModule.remove('accessToken')
  storageModule.remove('state')
  storageModule.remove('nonce')
  storageModule.remove('codeVerifier')
}

export default async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  metaData: MetaData | null = null,
  logger: Logger
): Promise<TokenReponse> => {
  logger.log('Handle Callback')
  logger.log({ oauthClientConfig, storageModule })
  const callbackParams = getCallbackParams(location.hash || location.search)
  logger.log('Callback Params')
  logger.log({ callbackParams })
  validateCallbackParams(callbackParams)
  const clientState = storageModule.get('state')
  const clientCodeVerifier = storageModule.get('codeVerifier')
  validateClientState(callbackParams, clientState, clientCodeVerifier)
  const tokenRequestBody = getTokenRequestBody(
    oauthClientConfig,
    clientCodeVerifier,
    callbackParams.code
  )
  logger.log('Token Request Body')
  logger.log({ tokenRequestBody })
  let tokenResponse
  try {
    tokenResponse = await requestToken(
      oauthClientConfig,
      metaData,
      tokenRequestBody
    )
  } catch (error: unknown) {
    logger.error(error)
    cleanupStorage(storageModule)
    throw Error('Token request failed')
  }
  try {
    validateJwt(tokenResponse.accessToken, oauthClientConfig)
    if (tokenResponse.idToken) {
      validateJwt(tokenResponse.idToken, oauthClientConfig)
      validateIdToken(tokenResponse.idToken, oauthClientConfig)
      validateJwtNonce(tokenResponse.idToken, storageModule)
    }
    cleanupStorage(storageModule)
  } catch (error: unknown) {
    logger.error(error)
    cleanupStorage(storageModule)
    throw Error(`Invalid token retreived: ${error}`)
  }
  return tokenResponse
}
