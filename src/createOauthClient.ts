import createLogger, { Logger } from './logger'
import { StorageModuleType, createStorageModule } from './createStorageModule'
import signIn from './signIn'
import handleCallback from './handleCallback'
import { getAccessToken, removeAccessToken } from './accessToken'
import { MetaData } from './metaData'

const responseModes = <const>['fragment', 'query']
export type ResponseMode = typeof responseModes[number]

const displays = <const>['page', 'popup', 'touch', 'wap']
export type Display = typeof displays[number]

const prompts = <const>['none', 'login', 'consent', 'select_account']
export type Prompt = typeof prompts[number]

export interface OauthClientConfig {
  issuer: string
  clientId: string
  redirectUri: string
  scopes?: string[]
  authorizationEndpoint?: string
  tokenEndpoint?: string
  tokenStorage?: StorageModuleType
  tokenLeewaySeconds?: number
  authenticationMaxAgeSeconds?: number
  responseMode?: ResponseMode
  metaData?: MetaData
  useNonce?: boolean
  display?: Display
  prompt?: Prompt
  maxAgeSeconds?: number
  uiLocales?: string[]
  acrValues?: string[]
  debug?: boolean
}

export interface OauthClient {
  signIn: () => void
  handleCallback: () => void
  getAccessToken: () => string | null
  removeAccessToken: () => void
  getConfig: () => OauthClientConfig
  logger: Logger
}

const requiredOauthClientAttributes = <const>[
  'issuer',
  'clientId',
  'redirectUri'
]

export const getOauthClientConfig = (
  configArg: OauthClientConfig
): OauthClientConfig => {
  const missingAttribute = requiredOauthClientAttributes.find(
    requiredAttribute => !configArg[requiredAttribute]
  )
  if (missingAttribute) {
    throw Error(`Required attribute ${missingAttribute} missing in config`)
  }

  return {
    scopes: [''],
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
  const logger = createLogger(config)

  logger.log('Create oAuthClient')
  logger.log({ config })

  return {
    signIn: async (): Promise<void> => signIn(config, storageModule, logger),
    handleCallback: async (): Promise<void> =>
      handleCallback(config, storageModule, logger),
    getAccessToken: (): string | null =>
      getAccessToken(config, storageModule, logger),
    removeAccessToken: (): void => removeAccessToken(storageModule, logger),
    getConfig: (): OauthClientConfig => config,
    logger
  }
}
