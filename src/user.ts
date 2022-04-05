import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { parseJwt, validateJwt, validateIdToken, TokenPart } from './jwt'

export const getUser = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): TokenPart | null => {
  logger.log('Get User from id token')
  try {
    const idToken = storageModule.get('idToken')
    validateJwt(idToken, oauthClientConfig)
    validateIdToken(idToken, oauthClientConfig)
    logger.log('Valid id token in storage')
    const user = parseJwt(idToken).claims
    return user
  } catch {}
  logger.log('No valid id token in storage')
  return null
}

export const removeUser = (
  storageModule: StorageModule,
  logger: Logger
): void => {
  logger.log('Remove user')
  try {
    storageModule.remove('idToken')
  } catch {}
}

export const refreshUser = (logger: Logger): void => {
  logger.log('Refresh user')
  try {
  } catch {}
}
