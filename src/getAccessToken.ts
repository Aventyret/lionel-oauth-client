import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { validateJwt } from './jwt'

export default (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): string | null => {
  logger.log('Get Access Token')
  try {
    const accessToken = storageModule.get('accessToken')
    validateJwt(accessToken, oauthClientConfig, storageModule)
    return accessToken
  } catch {}
  return null
}
