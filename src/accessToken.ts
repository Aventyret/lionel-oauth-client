import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export const getAccessToken = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): string | null => {
  logger.log('Get access token')
  let accessToken = null
  let accessTokenExpires = null
  try {
    accessToken = storageModule.get('accessToken')
    accessTokenExpires = storageModule.get('accessTokenExpires')
  } catch {}
  if (!accessToken) {
    logger.log('No token in storage')
    return null
  }
  if (!accessTokenExpires) {
    logger.log('No expires in storage')
    return null
  }
  try {
    validateAccessTokenExpiration(
      parseInt(accessTokenExpires || '0', 10),
      oauthClientConfig
    )
  } catch {
    return null
  }
  logger.log('Valid token in storage')
  return accessToken
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

export const validateAccessTokenExpiration = (
  expires: number,
  oauthClientConfig: OauthClientConfig
): void => {
  const now = new Date(0)
  now.setUTCSeconds(Math.floor(Date.now() / 1000))
  if (expires) {
    if (isNaN(expires)) {
      throw Error(`Invalid expires, ${expires} is not a number`)
    }
    const tokenExpDate = new Date(0)
    tokenExpDate.setUTCSeconds(
      expires + (oauthClientConfig.tokenLeewaySeconds || 0)
    )
    if (now > tokenExpDate) {
      throw Error('jwt token is expired')
    }
  }
}
