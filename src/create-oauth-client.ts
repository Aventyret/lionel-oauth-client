import logger from './logger'

export interface OauthClientConfig {
  issuer: string
  clientId: string
  redirectUri: string
}

export default (config: OauthClientConfig): object => {
  logger.log('Create oauth client')
  logger.log({ config })
  return {}
}
