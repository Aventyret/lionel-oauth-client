import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

interface CallbackParams {
  code?: string
  state?: string
}

interface TokenRequestBody {
  client_id: string
  redirect_uri: string
  code_verifier: string
  grant_type: string
  code?: string
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
): TokenRequestBody => {
  return {
    client_id: oauthClientConfig.clientId,
    redirect_uri: oauthClientConfig.redirectUri,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    code: code
  }
}

export const validateCallbackParams = (
  callbackParams: CallbackParams
): void => {
  if (!callbackParams.state) {
    throw new Error('Missing state in callback params')
  }
  if (!callbackParams.code) {
    throw new Error('Missing code in callback params')
  }
}

export const validateClientState = (
  callbackParams: CallbackParams,
  clientState: string,
  clientCodeVerifier: string
): void => {
  if (callbackParams.state !== clientState) {
    throw new Error('Incorrect state stored in oauth client')
  }
  if (!clientCodeVerifier) {
    throw new Error('Missing code verifier in client')
  }
}

export const requestToken = async (
  oauthClientConfig: OauthClientConfig,
  tokenRequestBody: TokenRequestBody
): Promise<string> => {
  const uri = `${oauthClientConfig.issuer}${oauthClientConfig.tokenEndpoint}`
  const response = await fetch(uri, {
    method: 'POST',
    body: JSON.stringify(tokenRequestBody)
  })
  if (response.status >= 200 && response.status < 300) {
    return (await response.json())?.access_token
  }
  throw new Error(`Get Token http status ${response.status}`)
}

export default async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): Promise<void> => {
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
  try {
    const accessToken = await requestToken(oauthClientConfig, tokenRequestBody)
    storageModule.set('accessToken', accessToken)
  } catch (error: unknown) {
    logger.error(error)
    storageModule.remove('accessToken')
  }
  storageModule.remove('state')
  storageModule.remove('codeVerifier')
}
