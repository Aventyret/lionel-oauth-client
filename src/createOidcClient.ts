import createOauthClient, {
  OauthClient,
  OauthClientConfig,
  getOauthClientConfig
} from './createOauthClient'
import { getMetaData, MetaData } from './metaData'

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

const setConfigEndpointsFromMetaData = (
  config: OauthClientConfig,
  metaData: MetaData
) => {
  return {
    ...config,
    authorizationEndpoint: metaData.authorization_endpoint.replace(
      new RegExp(`^${config.issuer}`),
      ''
    ),
    tokenEndpoint: metaData.token_endpoint.replace(
      new RegExp(`^${config.issuer}`),
      ''
    )
  }
}

export default (configArg: OauthClientConfig): OidcClient => {
  const client = createOauthClient(configArg)
  let config = getOidcClientConfig(configArg)

  client.logger.log('Create OidcClient')

  if (config.metaData) {
    config = setConfigEndpointsFromMetaData(config, config.metaData)
  }

  getMetaData(config, client.logger)
    .then(metaData => {
      config.metaData = metaData
      config = setConfigEndpointsFromMetaData(config, metaData)
      client.logger.log({ config })
    })
    .catch(error => {
      client.logger.error('Could not request meta data with discovery')
      console.error(error)
    })

  return {
    ...client,
    getConfig: (): OauthClientConfig => config,
    getUser: async (): Promise<unknown> => Promise.resolve({})
  }
}
