import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { EventPublishFn } from './createEventModule'
import { parseJwt, validateJwt, validateIdToken, TokenPart } from './jwt'

export interface User extends TokenPart {
  iss: string
  sub: string
  aud: string | string[]
  iat: number
  exp: number
}

export const getUser = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): User | null => {
  logger.log('Get User from id token')
  let idToken = null
  try {
    idToken = storageModule.get('idToken')
  } catch {}
  if (!idToken) {
    logger.log('No valid id token in storage')
    return null
  }
  let user = null
  try {
    validateJwt(idToken, oauthClientConfig)
    validateIdToken(idToken, oauthClientConfig)
    logger.log('Valid id token in storage')
    user = parseJwt(idToken).claims
    publish('userLoaded', user as User)
  } catch {
    publish('userUnloaded')
    return null
  }
  return user as User
}

export const removeUser = (
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): void => {
  logger.log('Remove user')
  try {
    storageModule.remove('idToken')
    publish('userUnloaded')
  } catch {}
}

export const refreshUser = (logger: Logger): void => {
  logger.log('Refresh user')
  try {
  } catch {}
}
