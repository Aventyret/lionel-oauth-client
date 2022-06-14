import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import createState from './createState'
import { removeAccessToken } from './accessToken'
import { removeUser } from './user'
import { MetaData } from './metaData'
import { Logger } from './logger'

export interface SignOutOptions {
  postLogoutRedirectUri?: string
  useIdTokenHint?: boolean
}

export const getSignOutRedirectUri = async (
  { useIdTokenHint = true, postLogoutRedirectUri = '' }: SignOutOptions,
  metaData: MetaData | null = null,
  storageModule: StorageModule,
  state: string
): Promise<string> => {
  if (!metaData?.end_session_endpoint) {
    throw Error('No end_session_endpoint in meta data')
  }
  const uri = metaData.end_session_endpoint
  const queryParams = [`state=${state}`]
  let idToken = ''
  try {
    idToken = storageModule.get('idToken')
  } catch {}
  if (idToken && useIdTokenHint) {
    queryParams.push(`id_token_hint=${idToken}`)
  }
  if (postLogoutRedirectUri) {
    if (!idToken || !useIdTokenHint) {
      throw Error(
        'An id token is required when sending post_logout_redirect_uri'
      )
    }
    queryParams.push(`post_logout_redirect_uri=${postLogoutRedirectUri}`)
  }
  return `${uri}?${queryParams.join('&')}`
}

export default async (
  options: SignOutOptions = {},
  oauthClientConfig: OauthClientConfig,
  metaData: MetaData | null = null,
  storageModule: StorageModule,
  logger: Logger
): Promise<void> => {
  logger.log('Sign In')
  logger.log({ oauthClientConfig, storageModule })
  const state = createState()
  storageModule.set('signoutState', state)
  location.assign(
    await getSignOutRedirectUri(options, metaData, storageModule, state)
  )
  removeAccessToken(storageModule, logger)
  removeUser(storageModule, logger)
}
