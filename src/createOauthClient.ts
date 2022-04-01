import { getAccessToken, removeAccessToken } from './accessToken'
import { StorageModuleType, createStorageModule } from './createStorageModule'
import { EventSubscribeFn, createEventModule } from './createEventModule'
import createLogger from './logger'
import handleCallback from './handleCallback'
import signIn from './signIn'

const responseModes = <const>['fragment', 'query']
export type ResponseMode = typeof responseModes[number]

export interface OauthClientConfig {
  issuer: string
  clientId: string
  redirectUri: string
  scope?: string
  authorizationEndpoint?: string
  tokenEndpoint?: string
  tokenStorage?: StorageModuleType
  tokenLeewaySeconds?: number
  authenticationMaxAgeSeconds?: number
  responseMode?: ResponseMode
  debug?: boolean
}

export interface OauthClient {
  signIn: () => void
  handleCallback: () => void
  getAccessToken: () => string | null
  removeAccessToken: () => void
  getConfig: () => OauthClientConfig
  subscribe: EventSubscribeFn
  unsubscribe: EventSubscribeFn
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
    throw Error(`Required attribute ${missingAttribute} missing in config`)
  }

  return {
    scope: '',
    authorizationEndpoint: '/authorize',
    tokenEndpoint: '/token',
    debug: false,
    tokenLeewaySeconds: 60,
    ...configArg
  }
}

export default (configArg: OauthClientConfig): OauthClient => {
  const config = getOauthClientConfig(configArg)
  const storageModule = createStorageModule(config)
  const { subscribe, unsubscribe, publish } = createEventModule()
  const logger = createLogger(config)

  logger.log('Create oAuthClient')
  logger.log({ config })

  return {
    signIn: async (): Promise<void> => signIn(config, storageModule, logger),
    handleCallback: async (): Promise<void> =>
      handleCallback(config, storageModule, logger, publish),
    getAccessToken: (): string | null =>
      getAccessToken(config, storageModule, logger),
    removeAccessToken: (): void => removeAccessToken(storageModule, logger),
    getConfig: (): OauthClientConfig => config,
    subscribe,
    unsubscribe
  }
}
