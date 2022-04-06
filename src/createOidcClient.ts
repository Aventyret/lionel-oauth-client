import createOauthClient, {
  OauthClient,
  OauthClientConfig,
  getOauthClientConfig
} from './createOauthClient'
import { createStorageModule } from './createStorageModule'
import { createEventModule } from './createEventModule'
import signIn, { SignInOptions } from './signIn'
import handleCallback from './handleCallback'
import { getMetaData } from './metaData'
import { User, getUser, removeUser } from './user'

export interface OidcClient extends OauthClient {
  getUser: () => Promise<User | null>
  removeUser: () => void
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
    useMetaData: true,
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
    getUser: async (): Promise<User | null> =>
      getUser(config, storageModule, client.logger),
    removeUser: (): void => removeUser(storageModule, client.logger),
    subscribe,
    unsubscribe
  }
}
