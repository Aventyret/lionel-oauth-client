import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { nonceHash } from './createNonce'

const allowedSigningAlgs = <const>[
  'RS256',
  'RS384',
  'RS512',
  'PS256',
  'PS384',
  'PS512',
  'ES256',
  'ES384',
  'ES512'
]

export interface TokenPart {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface Token {
  header: TokenPart
  claims: TokenPart
  signature: string
}

export const parseJwt = (token: string): Token => {
  const tokenParts = token.split('.')

  return {
    header: parseJwtPart(tokenParts[0]),
    claims: parseJwtPart(tokenParts.length > 1 ? tokenParts[1] : ''),
    signature: tokenParts.length > 2 ? tokenParts[2] : ''
  }
}

const parseJwtPart = (part: string): TokenPart => {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  try {
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (char) {
          return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(json)
  } catch {}

  return {}
}

export const validateJwt = (
  token: string,
  oauthClientConfig: OauthClientConfig
): void => {
  const decodedToken = parseJwt(token)
  validateJwtHeader(decodedToken.header)
  validateJwtClaims(decodedToken.claims, oauthClientConfig)
  validateJwtSignature(decodedToken.signature)
}

export const validateJwtHeader = (header: TokenPart) => {
  if (!header.alg) {
    throw Error('Missing alg in jwt header')
  }
  if (!allowedSigningAlgs.includes(header.alg)) {
    throw Error(`${header.alg} is not an allowed signing alg`)
  }
}

export const validateJwtClaims = (
  claims: TokenPart,
  oauthClientConfig: OauthClientConfig
) => {
  if (claims.iss && claims.iss !== oauthClientConfig.issuer) {
    throw Error('Incorrect iss in jwt claims')
  }
  const now = new Date(0)
  now.setUTCSeconds(Math.floor(Date.now() / 1000))
  if (oauthClientConfig.authenticationMaxAgeSeconds && claims.auth_time) {
    if (isNaN(claims.auth_time)) {
      throw Error(`Invalid auth_time, ${claims.auth_time} is not a number`)
    }
    const tokenEndDate = new Date(0)
    tokenEndDate.setUTCSeconds(
      claims.auth_time +
        oauthClientConfig.authenticationMaxAgeSeconds +
        (oauthClientConfig.tokenLeewaySeconds || 0)
    )
    if (now > tokenEndDate) {
      throw Error('jwt token is too old')
    }
  }
  if (claims.nbf) {
    if (isNaN(claims.nbf)) {
      throw Error(`Invalid nbf, ${claims.nbf} is not a number`)
    }
    const tokenStartDate = new Date(0)
    tokenStartDate.setUTCSeconds(
      claims.nbf - (oauthClientConfig.tokenLeewaySeconds || 0)
    )
    if (now < tokenStartDate) {
      throw Error('jwt token not valid yet')
    }
  }
}

const validateJwtSignature = (signature: string) => {
  if (!signature) {
    throw Error('Missing signature in jwt')
  }
}

export const validateJwtNonce = async (
  token: string,
  storageModule: StorageModule
): Promise<void> => {
  const { claims } = parseJwt(token)
  if (claims.nonce) {
    let nonce
    try {
      nonce = storageModule.get('nonce')
    } catch {}

    if ((await nonceHash(nonce || '')) !== claims.nonce) {
      throw Error('Nonce in jwt does not match nonce in client')
    }
  }
}

export const validateJwtExpiration = (
  token: string,
  oauthClientConfig: OauthClientConfig
): void => {
  const { claims } = parseJwt(token)
  const now = new Date(0)
  now.setUTCSeconds(Math.floor(Date.now() / 1000))
  if (claims.exp) {
    if (isNaN(claims.exp)) {
      throw Error(`Invalid exp, ${claims.exp} is not a number`)
    }
    const tokenExpDate = new Date(0)
    tokenExpDate.setUTCSeconds(
      claims.exp + (oauthClientConfig.tokenLeewaySeconds || 0)
    )
    if (now > tokenExpDate) {
      throw Error('jwt token is expired')
    }
    const nbf = new Date(0)
    nbf.setUTCSeconds(claims.nbf - (oauthClientConfig.tokenLeewaySeconds || 0))
    if (now < nbf) {
      throw Error('jwt token is not valid yet')
    }
  }
}

export const validateIdToken = (
  token: string,
  oauthClientConfig: OauthClientConfig
): void => {
  const { claims } = parseJwt(token)
  validateIdTokenClaims(claims, oauthClientConfig)
}

const requiredIdTokenClaims = <const>['iss', 'sub', 'aud', 'exp', 'iat']

export const validateIdTokenClaims = (
  claims: TokenPart,
  oauthClientConfig: OauthClientConfig
): void => {
  const missingClaim = requiredIdTokenClaims.find(
    requiredClaim =>
      !claims[requiredClaim] ||
      (Array.isArray(claims[requiredClaim]) &&
        claims[requiredClaim].length === 0)
  )
  if (missingClaim) {
    throw Error(`Required claim ${missingClaim} missing in id token`)
  }
  if (oauthClientConfig.useNonce && !claims.nonce) {
    throw Error('nonce is missing in id token')
  }
  if (oauthClientConfig.authenticationMaxAgeSeconds && !claims.auth_time) {
    throw Error('auth_time is missing in id token')
  }
  if (
    claims.aud &&
    !claims.aud.includes(oauthClientConfig.clientId) &&
    claims.azp !== oauthClientConfig.clientId
  ) {
    throw Error('clientId missing in both aud claim and azp claim in id token')
  }
  let singleAud: string | null = null
  if (Array.isArray(claims.aud) && claims.length === 1) {
    singleAud = claims.aud[0]
  }
  if (typeof claims.aud === 'string') {
    singleAud = claims.aud
  }
  if (singleAud && singleAud !== oauthClientConfig.clientId && !claims.azp) {
    throw Error('if id token aud is other than client_id azp is required')
  }
  if (claims.azp && claims.azp !== oauthClientConfig.clientId) {
    throw Error('if present, id token azp should be client_id')
  }
}
