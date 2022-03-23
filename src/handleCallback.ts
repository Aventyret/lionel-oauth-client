import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export default (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): void => {
  logger.log('Handle Callback')
  logger.log({ oauthClientConfig, storageModule })
}
