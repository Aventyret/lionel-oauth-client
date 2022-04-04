import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { validateJwt } from './jwt'

export const getAccessToken = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): string | null => {
  logger.log('Get access token')
  try {
    const accessToken = storageModule.get('accessToken')
    validateJwt(accessToken, oauthClientConfig)
    logger.log('Valid token in storage')
    return accessToken
  } catch {}
  logger.log('No valid token in storage')
  return null
}

export const removeAccessToken = (
  storageModule: StorageModule,
  logger: Logger
): void => {
  logger.log('Remove access token')
  try {
    storageModule.remove('accessToken')
  } catch {}
}
