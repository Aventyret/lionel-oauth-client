import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'
import { EventPublishFn } from './createEventModule'
import { MetaData } from './metaData'
import { getAccessToken, getAccessTokenClaims } from './accessToken'
import { parseJwt, validateJwt, validateIdToken, TokenPart } from './jwt'

export interface User extends TokenPart {
  iss?: string
  sub?: string
  aud?: string | string[]
  iat?: number
  exp?: number
}

export const getIdToken = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): string | null => {
  logger.log('Get User from id token')
  let idToken = null
  try {
    idToken = storageModule.get('idToken')
  } catch {}
  if (!idToken) {
    logger.log('No valid id token in storage')
    return null
  }
  try {
    validateJwt(idToken, oauthClientConfig)
    validateIdToken(idToken, oauthClientConfig)
    logger.log('Valid id token in storage')
  } catch {
    publish('userUnloaded')
    return null
  }
  return idToken
}

export const getIdTokenClaims = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): TokenPart | null => {
  logger.log('Get access token claims')
  const idToken = getIdToken(oauthClientConfig, storageModule, logger, publish)
  if (!idToken) {
    return null
  }
  const { claims } = parseJwt(idToken)
  return claims
}

export const getUser = (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger,
  publish: EventPublishFn
): User | null => {
  const accessTokenClaims = getAccessTokenClaims(
    oauthClientConfig,
    storageModule,
    logger,
    publish
  )
  const idTokenClaims = getIdTokenClaims(
    oauthClientConfig,
    storageModule,
    logger,
    publish
  )
  let userInfoClaims = null
  try {
    const userInfo = storageModule.get('userInfo')
    if (userInfo) {
      userInfoClaims = JSON.parse(userInfo) as User
    }
  } catch {}
  if (idTokenClaims || userInfoClaims) {
    return mergeAndFilterUserClaims(
      accessTokenClaims || {},
      idTokenClaims || {},
      userInfoClaims || {}
    )
  }
  return null
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

const requestUserInfo = async (
  metaData: MetaData | null = null,
  accessToken: string
): Promise<User> => {
  const uri = metaData?.userinfo_endpoint || ''
  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  if (response.status >= 200 && response.status < 300) {
    return (await response.json()) as User
  }
  throw Error(`Get user info http status ${response.status}`)
}

export const getUserInfo = async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  metaData: MetaData,
  logger: Logger,
  publish: EventPublishFn
): Promise<User | null> => {
  logger.log('Get user info')
  if (!oauthClientConfig.useUserInfoEndpoint || !metaData.userinfo_endpoint) {
    return getUser(oauthClientConfig, storageModule, logger, publish)
  }
  try {
    const accessToken = getAccessToken(
      oauthClientConfig,
      storageModule,
      logger,
      publish
    )
    if (!accessToken) {
      return null
    }
    const userInfo = await requestUserInfo(metaData, accessToken)
    if (userInfo) {
      storageModule.set('userInfo', JSON.stringify(userInfo))
    } else {
      try {
        storageModule.remove('userInfo')
      } catch {}
    }
    return userInfo
  } catch {}
  return null
}

const protocolClaims = <const>[
  'client_id',
  'nonce',
  'at_hash',
  'iat',
  'nbf',
  'exp',
  'aud',
  'iss',
  'c_hash'
]

export const mergeAndFilterUserClaims = (...claims: TokenPart[]): User => {
  const mergedClaims = claims.reduce((userClaims: User, claim: TokenPart) => {
    return {
      ...userClaims,
      ...(claim || {})
    }
  }, {} as User)
  protocolClaims.forEach(claim => {
    delete mergedClaims[claim]
  })
  return mergedClaims
}
