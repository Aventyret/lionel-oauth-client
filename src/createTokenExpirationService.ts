import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { EventPublishFn } from './createEventModule'
import { getAccessTokenExpires } from './accessToken'
import { Logger } from './logger'
import { validateAccessTokenExpiration } from './accessToken'

const CHECK_TOKEN_EXPIRATION_INTERVAL_DELAY_SECONDS = 5

interface TokenExpirationService {
  start: () => void
  stop: () => void
}

const createTokenExpirationService = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  publish: EventPublishFn,
  logger: Logger
): TokenExpirationService => {
  let checkExpirationInterval = 0

  const start = () => {
    stop()
    let accessTokenExpires = getAccessTokenExpires(storageModule)
    const checkTokenExpirationIntervalDelaySeconds = Math.min(
      accessTokenExpires - Date.now() / 1000,
      CHECK_TOKEN_EXPIRATION_INTERVAL_DELAY_SECONDS
    )
    checkExpirationInterval = window.setInterval(() => {
      accessTokenExpires = getAccessTokenExpires(storageModule)
      try {
        validateAccessTokenExpiration(accessTokenExpires)
      } catch {
        logger.log('Access token did expire')
        publish('tokenDidExpire')
        stop()
      }
      try {
        validateAccessTokenExpiration(
          accessTokenExpires - (oauthClientConfig.tokenWillExpireSeconds || 60)
        )
      } catch {
        logger.log('Access token will expire')
        publish('tokenWillExpire')
      }
    }, checkTokenExpirationIntervalDelaySeconds * 1000)
  }

  const stop = () => {
    window.clearInterval(checkExpirationInterval)
  }

  return {
    start,
    stop
  }
}

export default createTokenExpirationService
