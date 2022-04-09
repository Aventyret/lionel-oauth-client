import createOauthClient, {
  OauthClient,
  OauthClientConfig,
  getOauthClientConfig
} from './createOauthClient'
import { createStorageModule } from './createStorageModule'
import { createEventModule } from './createEventModule'
import signIn, { SignInOptions } from './signIn'
import signOut, { SignOutOptions } from './signOut'
import handleCallback from './handleCallback'
import { getMetaData } from './metaData'
import { User, getUser, getUserInfo, removeUser } from './user'

export interface OidcClient extends OauthClient {
  getUser: () => Promise<User | null>
  getUserInfo: () => Promise<User | null>
  removeUser: () => void
  signOut: (options: SignOutOptions) => Promise<void>
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

export default (configArg: OauthClientConfig): OidcClient => {
  const client = createOauthClient(configArg)
  const config = getOidcClientConfig(configArg)
  const storageModule = createStorageModule(config)
  const { subscribe, unsubscribe, publish } = createEventModule()

  client.logger.log('Create OidcClient')
  client.logger.log({ config })

  getMetaData(config, storageModule, client.logger)

  let _user: User | null = null

  return {
    ...client,
    signIn: async (options: SignInOptions = {}): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, client.logger)
      return signIn(options, config, storageModule, metaData, client.logger)
    },
    handleCallback: async (): Promise<void> => {
      const metaData = await getMetaData(config, storageModule, client.logger)
      return handleCallback(
        config,
        storageModule,
        metaData,
        client.logger,
        publish
      )
    },
    getConfig: (): OauthClientConfig => config,
    getUser: async (): Promise<User | null> => {
      const user = getUser(config, storageModule, client.logger, publish)
      if (user && user != _user) {
        _user = user
        publish('userLoaded')
      }
      return user
    },
    getUserInfo: async (): Promise<User | null> => {
      const metaData = await getMetaData(config, storageModule, client.logger)
      return getUserInfo(
        config,
        storageModule,
        metaData,
        client.logger,
        publish
      )
    },
    removeUser: (): void => {
      _user = null
      removeUser(storageModule, client.logger, publish)
    },
    signOut: async (options: SignOutOptions = {}): Promise<void> => {
      _user = null
      const metaData = await getMetaData(config, storageModule, client.logger)
      return signOut(
        options,
        config,
        metaData,
        storageModule,
        client.logger,
        publish
      )
    },
    subscribe,
    unsubscribe
  }
}
