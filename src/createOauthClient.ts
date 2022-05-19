import createLogger, { Logger } from './logger'
import { getAccessToken, removeAccessToken } from './accessToken'
import { StorageModuleType, createStorageModule } from './createStorageModule'
import { EventSubscribeFn, createEventModule } from './createEventModule'
import signIn, { signInSilently, SignInOptions } from './signIn'
import handleCallback from './handleCallback'
import signOut, { SignOutOptions } from './signOut'
import { MetaData, getMetaData } from './metaData'
import { User, getUser, getUserInfo, setUser, removeUser } from './user'

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
  useMetaDataDiscovery?: boolean
  useUserInfoEndpoint?: boolean
  display?: Display
  prompt?: Prompt
  uiLocales?: string[]
  acrValues?: string[]
  postLogoutRedirectUri?: string
  debug?: boolean
}

export interface OauthClient {
  signIn: (options: SignInOptions) => Promise<void>
  signInSilently: (options: SignInOptions) => Promise<void>
  handleCallback: () => void
  getAccessToken: () => string | null
  removeAccessToken: () => void
  getConfig: () => OauthClientConfig
  logger: Logger
  subscribe: EventSubscribeFn
  unsubscribe: EventSubscribeFn
  getUser: () => Promise<User | null>
  getUserInfo: () => Promise<User | null>
  removeUser: () => void
  signOut: (options: SignOutOptions) => Promise<void>
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
    authorizationEndpoint: configArg.useMetaDataDiscovery ? '' : '/authorize',
    tokenEndpoint: configArg.useMetaDataDiscovery ? '' : '/token',
    debug: false,
    tokenLeewaySeconds: 60,
    ...configArg
  }
}

const getOidcClientConfig = (
  configArg: OauthClientConfig
): OauthClientConfig => {
  const config = getOauthClientConfig(configArg)
  config.scopes = config.scopes || []
  if (!config.scopes.includes('openid')) {
    config.scopes.push('openid')
  }
  return {
    useNonce: true,
    useMetaDataDiscovery: true,
    useUserInfoEndpoint: true,
    ...config
  }
}

export const createOauthClient = (
  configArg: OauthClientConfig
): OauthClient => {
  const config = getOauthClientConfig(configArg)
  const storageModule = createStorageModule(config)
  const { subscribe, unsubscribe, publish } = createEventModule()
  const logger = createLogger(config)

  logger.log('Create oAuthClient')
  logger.log({ config })

  let _accessToken: string | null = null
  let _user: User | null = null

  if (config.useMetaDataDiscovery) {
    getMetaData(config, storageModule, logger)
  }

  return {
    signIn: async (options: SignInOptions = {}): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, logger)
      return signIn(options, config, storageModule, metaData, logger)
    },
    signInSilently: async (options: SignInOptions = {}): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, logger)
      try {
        const tokenResponse = await signInSilently(
          options,
          config,
          storageModule,
          metaData,
          logger
        )
        console.log(tokenResponse)
      } catch (error) {
        logger.error(error)
      }
    },
    handleCallback: async (): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, logger)
      let callbackResponse
      try {
        callbackResponse = await handleCallback(
          config,
          storageModule,
          metaData,
          logger
        )
      } catch (error) {
        throw error
      }
      const tokens = callbackResponse?.tokenResponse
      if (tokens?.accessToken) {
        storageModule.set('accessToken', tokens.accessToken)
        _accessToken = tokens.accessToken
        publish('tokenLoaded', tokens.accessToken)
      }
      if (tokens?.idToken) {
        const user = await setUser(
          tokens.idToken,
          tokens.accessToken,
          config,
          storageModule,
          metaData,
          logger
        )
        _user = user
        publish('userLoaded', user)
      }
      if (callbackResponse.callbackType === 'silent') {
        window.postMessage(
          {
            tokens
          },
          config.redirectUri
        )
      }
    },
    getAccessToken: (): string | null => {
      const accessToken = getAccessToken(config, storageModule, logger)
      if (accessToken && accessToken != _accessToken) {
        _accessToken = accessToken
        publish('tokenLoaded')
      }
      return accessToken
    },
    removeAccessToken: (): void => {
      removeAccessToken(storageModule, logger)
      publish('tokenUnloaded')
    },
    getConfig: (): OauthClientConfig => config,
    getUser: async (): Promise<User | null> => {
      const user = getUser(config, storageModule, logger)
      if (user && user != _user) {
        _user = user
        publish('userLoaded')
      }
      return user
    },
    getUserInfo: async (): Promise<User | null> => {
      const metaData = await getMetaData(config, storageModule, logger)
      return getUserInfo(config, storageModule, metaData, logger)
    },
    removeUser: (): void => {
      _user = null
      removeUser(storageModule, logger)
      publish('userUnloaded')
    },
    signOut: async (options: SignOutOptions = {}): Promise<void> => {
      _user = null
      const metaData = await getMetaData(config, storageModule, logger)
      return signOut(options, config, metaData, storageModule, logger)
    },
    logger,
    subscribe,
    unsubscribe
  }
}

export const createOidcClient = (configArg: OauthClientConfig): OauthClient => {
  if (!configArg.metaData && configArg.useMetaDataDiscovery) {
    throw Error(
      'createOidcClient requires useMetaDataDiscovery to be true if you do not provide metaData in config'
    )
  }
  return createOauthClient(getOidcClientConfig(configArg))
}
