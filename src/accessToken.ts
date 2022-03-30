import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { validateJwt } from './jwt'

export const getAccessToken = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): string | null => {
  logger.log('Get Access Token')
  try {
    const accessToken = storageModule.get('accessToken')
    validateJwt(accessToken, oauthClientConfig, storageModule)
    logger.log('Valid token in storage')
    return accessToken
  } catch {}
  logger.log('No valid token in storage')
  return null
}
