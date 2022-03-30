import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export default (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): string => {
  logger.log('Get Access Token')
  logger.log({ oauthClientConfig })
  logger.log({ storageModule })
  return ''
}
