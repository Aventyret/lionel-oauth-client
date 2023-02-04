import { OauthClientConfig } from './createOauthClient'
import { StorageModule } from './createStorageModule'
import { Logger } from './logger'

export interface MetaData {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint?: string
  jwks_uri: string
  registration_endpoint?: string
  scopes_supported?: string[]
  response_types_supported: string[]
  response_modes_supported?: string[]
  grant_types_supported?: string[]
  acr_values_supported?: string[]
  subject_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
  id_token_encryption_alg_values_supported?: string[]
  id_token_encryption_enc_values_supported?: string[]
  userinfo_signing_alg_values_supported?: string[]
  userinfo_encryption_alg_values_supported?: string[]
  userinfo_encryption_enc_values_supported?: string[]
  request_object_signing_alg_values_supported?: string[]
  request_object_encryption_alg_values_supported?: string[]
  request_object_encryption_enc_values_supported?: string[]
  token_endpoint_auth_methods_supported?: string[]
  token_endpoint_auth_signing_alg_values_supported?: string[]
  display_values_supported?: string[]
  claim_types_supported?: string[]
  claims_supported?: string[]
  service_documentation?: string
  claims_locales_supported?: string[]
  ui_locales_supported?: string[]
  claims_parameter_supported?: boolean // Defaults to false
  request_parameter_supported?: boolean // Defaults to false
  request_uri_parameter_supported?: boolean // Defaults to true
  require_request_uri_registration?: boolean // Defaults to false
  op_policy_uri?: string
  op_tos_uri?: string
  check_session_iframe?: string
  end_session_endpoint?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const getMetaDataWithDefaults = (metaData: MetaData): MetaData => {
  return {
    response_modes_supported: ['query', 'fragment'],
    grant_types_supported: ['authorization_code'],
    token_endpoint_auth_signing_alg_values_supported: ['RS256'],
    claim_types_supported: ['normal'],
    claims_parameter_supported: false,
    request_parameter_supported: false,
    request_uri_parameter_supported: true,
    require_request_uri_registration: false,
    ...metaData
  }
}

const requiredMetaDataAttributes = <const>[
  'issuer',
  'authorization_endpoint',
  'token_endpoint',
  'jwks_uri',
  'response_types_supported',
  'subject_types_supported',
  'id_token_signing_alg_values_supported'
]

const openIdScopes = <const>['profile', 'email', 'address', 'phone']

export const validateMetaData = (
  metaData: MetaData,
  oauthClientConfig: OauthClientConfig,
  logger: Logger
): void => {
  const missingAttribute = requiredMetaDataAttributes.find(
    requiredAttribute =>
      !metaData[requiredAttribute] ||
      (Array.isArray(metaData[requiredAttribute]) &&
        !metaData[requiredAttribute].length)
  )
  if (missingAttribute) {
    throw Error(`Required attribute ${missingAttribute} missing in meta data`)
  }
  if (metaData.issuer != oauthClientConfig.issuer) {
    throw Error('Incorrect issuer in meta data')
  }
  if (
    metaData.userinfo_endpoint &&
    !metaData.userinfo_endpoint.startsWith('https://')
  ) {
    throw Error('userinfo_endpoint needs to utilize TLS')
  }
  // If scopes_supported is provided it needs to include openid
  if (
    metaData.scopes_supported &&
    !metaData.scopes_supported.includes('openid')
  ) {
    throw Error('Scope openid is missing in scopes_supported in meta data')
  }
  if (!metaData.response_types_supported.includes('code')) {
    throw Error(
      'code is missing in response_types_supported in meta data. Lionel oAuth Client only supports the PKCE flow.'
    )
  }
  // All scopes do not need to be stated in metaData.scopes_supported, but openid scopes that are supported SHOULD be declared
  openIdScopes.forEach(scope => {
    if (
      oauthClientConfig.scopes?.includes('scope') &&
      !metaData.scopes_supported?.includes(scope)
    ) {
      logger.warn(
        `Open id scope ${scope} is missing in scopes_supported in meta data`
      )
    }
  })
  // If grant_types_supported is provided it needs to include authorization_code
  if (
    metaData.grant_types_supported &&
    !metaData.grant_types_supported?.includes('authorization_code')
  ) {
    throw Error('authorization_code grant type not supported')
  }
  if (
    metaData.subject_types_supported.find(
      subjectType => !['pairwise', 'public'].includes(subjectType)
    )
  ) {
    throw Error('Invalid supported subject types in meta data')
  }
  if (!metaData.id_token_signing_alg_values_supported.includes('RS256')) {
    throw Error('RS256 missing as supported signing alg values in meta data')
  }
}

const requestMetaData = async (
  oauthClientConfig: OauthClientConfig
): Promise<MetaData> => {
  const uri = `${oauthClientConfig.issuer.replace(
    new RegExp(/\/$/),
    ''
  )}/.well-known/openid-configuration`
  const response = await fetch(uri, {
    method: 'GET'
  })
  if (response.status >= 200 && response.status < 300) {
    return await response.json()
  }
  throw Error(`Get meta data http status ${response.status}`)
}

export const getMetaData = async (
  oauthClientConfig: OauthClientConfig,
  storageModule: StorageModule,
  logger: Logger
): Promise<MetaData> => {
  logger.log('Get meta data')
  let metaData
  try {
    metaData = JSON.parse(storageModule.get('metaData'))
    logger.log('Meta data found in storage')
    return Promise.resolve(metaData)
  } catch {}
  metaData = oauthClientConfig.metaData
  if (!metaData) {
    logger.log('Request meta data from issuer')
    metaData = await requestMetaData(oauthClientConfig)
  }
  const metaDataWithDefaults = getMetaDataWithDefaults(metaData)
  validateMetaData(metaDataWithDefaults, oauthClientConfig, logger)
  logger.log('Valid metadata fetched')
  logger.log(metaDataWithDefaults)
  storageModule.set('metaData', JSON.stringify(metaDataWithDefaults))
  return Promise.resolve(metaDataWithDefaults)
}
