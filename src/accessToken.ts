import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export const getAccessToken = (
  storageModule: StorageModule,
  logger: Logger
): string | null => {
  logger.log('Get access token')
  let accessToken = null
  let accessTokenExpires = null
  try {
    accessToken = storageModule.get('accessToken')
    accessTokenExpires = getAccessTokenExpires(storageModule)
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
    validateAccessTokenExpiration(accessTokenExpires)
  } catch {
    return null
  }
  logger.log('Valid token in storage')
  return accessToken
}

export const getAccessTokenExpires = (storageModule: StorageModule): number => {
  try {
    return parseInt(storageModule.get('accessTokenExpires'), 10)
  } catch {}
  return 0
}

export const removeAccessToken = (
  storageModule: StorageModule,
  logger: Logger
): void => {
  logger.log('Remove access token')
  try {
    storageModule.remove('accessToken')
  } catch {}
  try {
    storageModule.remove('accessTokenExpires')
  } catch {}
}

export const validateAccessTokenExpiration = (expires: number): void => {
  const now = new Date(0)
  now.setUTCSeconds(Math.floor(Date.now() / 1000))
  if (expires) {
    if (isNaN(expires)) {
      throw Error(`Invalid expires, ${expires} is not a number`)
    }
    const tokenExpDate = new Date(0)
    tokenExpDate.setUTCSeconds(expires)
    if (now > tokenExpDate) {
      throw Error('Access token is expired')
    }
  }
}
