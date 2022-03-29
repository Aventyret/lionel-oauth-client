import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'

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

interface TokenPart {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule
): void => {
  const decodedToken = parseJwt(token)
  validateJwtHeader(decodedToken.header)
  validateJwtClaims(decodedToken.claims, oauthClientConfig, storageModule)
  validateJwtSignature(decodedToken.signature)
}

export const validateJwtHeader = (header: TokenPart) => {
  if (!header.alg) {
    throw Error('Missing alg in jwt header')
  }
  if (!header.typ) {
    throw Error('Missing typ in jwt header')
  }
  if (!allowedSigningAlgs.includes(header.alg)) {
    throw Error(`${header.alg} is not an allowed signing alg`)
  }
}

export const validateJwtClaims = (
  claims: TokenPart,
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule
) => {
  if (claims.iss && claims.iss !== oauthClientConfig.issuer) {
    throw Error('Incorrect iss in jwt claims')
  }
  if (claims.nonce) {
    let nonce
    try {
      nonce = storageModule.get('nonce')
    } catch {}
    if (nonce !== claims.nonce) {
      throw Error('Nonce in jwt do not match nonce in client')
    }
  }
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
  }
  if (oauthClientConfig.authenticationMaxAgeSeconds && claims.auth_time) {
    if (isNaN(claims.auth_time)) {
      throw Error(`Invalid auth_time, ${claims.auth_time} is not a number`)
    }
    const tokenEndDate = new Date(0)
    tokenEndDate.setUTCSeconds(
      claims.auth_time + (oauthClientConfig.tokenLeewaySeconds || 0)
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
