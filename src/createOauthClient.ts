import createLogger from './logger'
import {
  getAccessToken,
  getAccessTokenExpires,
  removeAccessToken
} from './accessToken'
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
import createTokenExpirationService from './createTokenExpirationService'

const responseModes = <const>['fragment', 'query']
export type ResponseMode = typeof responseModes[number]

const displays = <const>['page', 'popup', 'touch', 'wap']
export type Display = typeof displays[number]

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
  signInSilentlyTimeoutSeconds?: number
  autoRenewToken?: boolean
  tokenWillExpireSeconds?: number
  responseMode?: ResponseMode
  metaData?: MetaData
  useNonce?: boolean
  useMetaDataDiscovery?: boolean
  useUserInfoEndpoint?: boolean
  display?: Display
  uiLocales?: string[]
  acrValues?: string[]
  debug?: boolean
}

export interface OauthClient {
  signIn: (options: SignInOptions) => Promise<void>
  signInSilently: (
    options: SignInOptions
  ) => Promise<HandleCallbackResponse | null>
  handleCallback: () => Promise<HandleCallbackResponse | null>
  getConfig: () => OauthClientConfig
  getAccessToken: () => string | null
  getAccessTokenExpires: () => number
  removeAccessToken: () => void
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
    signInSilentlyTimeoutSeconds: 10,
    autoRenewToken: true,
    tokenWillExpireSeconds: 60,
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
  const logger = createLogger(config)
  const { subscribe, unsubscribe, publish } = createEventModule(logger)

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

  const signInFn = async (options: SignInOptions = {}): Promise<void> => {
    const metaData = await getMetaData(config, storageModule, logger)
    return signIn(options, config, storageModule, metaData, logger)
  }

  const signInSilentlyFn = async (
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
  }

  const getAccessTokenFn = (): string | null => {
    const accessToken = getAccessToken(storageModule, logger)
    _tokenLoaded(accessToken)
    return accessToken
  }

  const getAccessTokenExpiresFn = (): number =>
    getAccessTokenExpires(storageModule)

  const removeAccessTokenFn = (): void => {
    _accessToken = null
    removeAccessToken(storageModule, logger)
    publish('tokenUnloaded')
  }

  const getUserFn = async (): Promise<User | null> => {
    const user = getUser(config, storageModule, logger)
    _userLoaded(user)
    return user
  }

  const getUserInfoFn = async (): Promise<User | null> => {
    const metaData = await getMetaData(config, storageModule, logger)
    return getUserInfo(config, storageModule, metaData, logger)
  }

  const removeUserFn = (): void => {
    _accessToken = null
    _user = null
    removeAccessToken(storageModule, logger)
    publish('tokenUnloaded')
    removeUser(storageModule, logger)
    publish('userUnloaded')
  }

  const signOutFn = async (options: SignOutOptions = {}): Promise<void> => {
    _user = null
    const metaData = await getMetaData(config, storageModule, logger)
    return signOut(options, config, metaData, storageModule, logger)
  }

  const tokenExpirationService = createTokenExpirationService(
    config,
    storageModule,
    publish,
    logger
  )

  subscribe('tokenLoaded', tokenExpirationService.start)
  subscribe('tokenUnloaded', tokenExpirationService.stop)

  subscribe('tokenDidExpire', removeAccessTokenFn)
  subscribe('tokenDidExpire', removeUserFn)

  if (config.autoRenewToken) {
    subscribe('tokenWillExpire', signInSilentlyFn)
  }

  const client = {
    signIn: signInFn,
    signInSilently: signInSilentlyFn,
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
        storageModule.set(
          'accessTokenExpires',
          tokenResponse.expires.toString()
        )
        if (callbackType !== 'silent') {
          _tokenLoaded(tokenResponse.accessToken)
        }
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
        if (callbackType !== 'silent') {
          _userLoaded(user)
        }
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
    getConfig: (): OauthClientConfig => config,
    getAccessToken: getAccessTokenFn,
    getAccessTokenExpires: getAccessTokenExpiresFn,
    removeAccessToken: removeAccessTokenFn,
    getUser: getUserFn,
    getUserInfo: getUserInfoFn,
    removeUser: removeUserFn,
    signOut: signOutFn,
    subscribe,
    unsubscribe
  }
  checkAuthenticationInStorage(client)
  return client
}

export const createOidcClient = (configArg: OauthClientConfig): OauthClient => {
  const config = getOidcClientConfig(configArg)
  if (!config.metaData && !config.useMetaDataDiscovery) {
    throw Error(
      'createOidcClient requires useMetaDataDiscovery to be true if you do not provide metaData in config'
    )
  }
  return createOauthClient(config)
}
