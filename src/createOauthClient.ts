import createLogger, { Logger } from './logger'
import { getAccessToken, removeAccessToken } from './accessToken'
import { StorageModuleType, createStorageModule } from './createStorageModule'
import { EventSubscribeFn, createEventModule } from './createEventModule'
import signIn, { signInSilently, SignInOptions } from './signIn'
import handleCallback, {
  CallbackResponse,
  getCallbackType
} from './handleCallback'
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
  signInSilently: (
    options: SignInOptions
  ) => Promise<HandleCallbackResponse | null>
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

export interface HandleCallbackResponse extends CallbackResponse {
  user: User | null
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

const checkAuthenticationInStorage = (client: OauthClient): void => {
  window.setTimeout(() => {
    client.getAccessToken()
    if (client.getConfig()?.scopes?.includes('openid')) {
      client.getUser()
    }
  }, 0)
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

  const _tokenLoaded = (accessToken: string | null): void => {
    if (accessToken && accessToken != _accessToken) {
      _accessToken = accessToken
      publish('tokenLoaded', accessToken)
    }
  }

  const _userLoaded = (user: User | null): void => {
    if (user && user != _user) {
      _user = user
      publish('userLoaded', user)
    }
  }

  if (config.useMetaDataDiscovery) {
    getMetaData(config, storageModule, logger)
  }

  const client = {
    signIn: async (options: SignInOptions = {}): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, logger)
      return signIn(options, config, storageModule, metaData, logger)
    },
    signInSilently: async (
      options: SignInOptions = {}
    ): Promise<HandleCallbackResponse | null> => {
      const metaData = await getMetaData(config, storageModule, logger)
      let handleCallbackResponse
      try {
        handleCallbackResponse = await signInSilently(
          options,
          config,
          storageModule,
          metaData,
          logger
        )
      } catch (error) {
        logger.error(error)
        throw error
      }
      return handleCallbackResponse
    },
    handleCallback: async (): Promise<HandleCallbackResponse | null> => {
      const callbackType = getCallbackType(config)

      const _callbackFailed = (errorMessage: string): void => {
        if (callbackType === 'silent') {
          logger.error('Silent signin failed. Not signed in.')
          window.setTimeout(() => {
            if (!window.parent) {
              return
            }
            window.parent.postMessage({}, '*')
          }, 100)
        }
        throw Error(errorMessage)
      }

      const metaData = await getMetaData(config, storageModule, logger)
      let callbackResponse
      try {
        callbackResponse = await handleCallback(
          config,
          storageModule,
          metaData,
          logger
        )
      } catch (error: any) {
        _callbackFailed(error.toString())
        return null
      }
      const tokenResponse = callbackResponse?.tokenResponse
      if (tokenResponse?.accessToken) {
        storageModule.set('accessToken', tokenResponse.accessToken)
        _accessToken = tokenResponse.accessToken
        _tokenLoaded(tokenResponse.accessToken)
      }
      let user = null
      if (tokenResponse?.idToken) {
        user = await setUser(
          tokenResponse.idToken,
          tokenResponse.accessToken,
          config,
          storageModule,
          metaData,
          logger
        )
        _user = user
        _userLoaded(user)
      }
      if (!tokenResponse?.accessToken && !tokenResponse?.idToken) {
        _callbackFailed('Not signed in')
        return null
      }
      const handleCallbackResponse = {
        tokenResponse,
        callbackType,
        user
      }
      if (callbackType === 'silent' && window.parent) {
        window.parent.postMessage(
          {
            handleCallbackResponse
          },
          '*'
        )
      }
      return handleCallbackResponse
    },
    getAccessToken: (): string | null => {
      const accessToken = getAccessToken(config, storageModule, logger)
      _tokenLoaded(accessToken)
      return accessToken
    },
    removeAccessToken: (): void => {
      removeAccessToken(storageModule, logger)
      publish('tokenUnloaded')
    },
    getConfig: (): OauthClientConfig => config,
    getUser: async (): Promise<User | null> => {
      const user = getUser(config, storageModule, logger)
      _userLoaded(user)
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
  checkAuthenticationInStorage(client)
  return client
}

export const createOidcClient = (configArg: OauthClientConfig): OauthClient => {
  if (!configArg.metaData && configArg.useMetaDataDiscovery) {
    throw Error(
      'createOidcClient requires useMetaDataDiscovery to be true if you do not provide metaData in config'
    )
  }
  return createOauthClient(getOidcClientConfig(configArg))
}
