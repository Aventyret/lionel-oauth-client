import createOauthClient, {
  OauthClient,
  OauthClientConfig,
  getOauthClientConfig
} from './createOauthClient'
import { getMetaData } from './metaData'

export interface OidcClient extends OauthClient {
  getUser: () => Promise<unknown>
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
    ...config
  }
}

export default async (configArg: OauthClientConfig): Promise<OidcClient> => {
  const client = createOauthClient(configArg)
  const config = getOidcClientConfig(configArg)

  client.logger.log('Create OidcClient')
  client.logger.log({ config })

  config.metaData = await getMetaData(config, client.logger)
  config.authorizationEndpoint = config.metaData.authorization_endpoint.replace(
    new RegExp(`^${config.issuer}`),
    ''
  )
  config.tokenEndpoint = config.metaData.token_endpoint.replace(
    new RegExp(`^${config.issuer}`),
    ''
  )

  return Promise.resolve({
    ...client,
    getConfig: (): OauthClientConfig => config,
    getUser: async (): Promise<unknown> => await Promise.resolve({})
  })
}
