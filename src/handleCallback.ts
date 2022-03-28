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

export const getCallbackParams = (locationHash: string) => {
  return locationHash
    .replace(new RegExp('^#'), '')
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

const getTokenRequestBody = (
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

export default async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): Promise<void> => {
  logger.log('Handle Callback')
  logger.log({ oauthClientConfig, storageModule })
  const callbackParams = getCallbackParams(location.hash || '#')
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
}
