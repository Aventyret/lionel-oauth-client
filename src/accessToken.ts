import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { EventPublishFn } from './createEventModule'
import { validateJwt } from './jwt'

export const getAccessToken = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): string | null => {
  logger.log('Get access token')
  let accessToken = null
  try {
    accessToken = storageModule.get('accessToken')
  } catch {}
  if (!accessToken) {
    logger.log('No token in storage')
    return null
  }
  try {
    validateJwt(accessToken, oauthClientConfig)
    publish('tokenLoaded', accessToken)
  } catch {
    publish('tokenUnloaded')
    return null
  }
  logger.log('Valid token in storage')
  return accessToken
}

export const removeAccessToken = (
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): void => {
  logger.log('Remove access token')
  try {
    storageModule.remove('accessToken')
    publish('tokenUnloaded')
  } catch {}
}
