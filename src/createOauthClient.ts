import createLogger from './logger'
import { StorageModuleType, createStorageModule } from './createStorageModule'
import signIn from './signIn'
import handleCallback from './handleCallback'
import getAccessToken from './getAccessToken'

export interface OauthClientConfig {
  issuer: string
  clientId: string
  redirectUri: string
  scope?: string
  authorizationEndpoint?: string
  tokenEndpoint?: string
  tokenStorage?: StorageModuleType
  debug?: boolean
}

export interface OauthClient {
  signIn: () => void
  handleCallback: () => void
  getAccessToken: () => string
}

const requiredOauthClientAttributes = <const>[
  'issuer',
  'clientId',
  'redirectUri'
]

const getOauthClientConfig = (
  configArg: OauthClientConfig
): OauthClientConfig => {
  const missingAttribute = requiredOauthClientAttributes.find(
    requiredAttribute => !configArg[requiredAttribute]
  )
  if (missingAttribute) {
    throw new Error(`Required attribute ${missingAttribute} missing in config`)
  }

  return {
    scope: '',
    authorizationEndpoint: '/authorize',
    tokenEndpoint: '/token',
    debug: false,
    ...configArg
  }
}

export default (configArg: OauthClientConfig): OauthClient => {
  const config = getOauthClientConfig(configArg)
  const storageModule = createStorageModule(config.tokenStorage)
  const logger = createLogger(config)

  logger.log('Create oAuthClient')
  logger.log({ config })

  return {
    signIn: (): void => signIn(config, storageModule, logger),
    handleCallback: (): void => handleCallback(config, storageModule, logger),
    getAccessToken: (): string => getAccessToken(storageModule, logger)
  }
}