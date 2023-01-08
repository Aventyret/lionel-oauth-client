import type { OauthClientConfig, OauthClient } from 'lionel-oauth-client'
import { createOauthClient, createOidcClient } from 'lionel-oauth-client'

interface OauthClients {
  [key: string]: OauthClient
}

const clients = {} as OauthClients

export const getOauthClient = (config: OauthClientConfig): OauthClient => {
  const clientKey = `oauth_${JSON.stringify(config)}`
  if (typeof clients[clientKey] === 'undefined') {
    clients[clientKey] = createOauthClient(config)
  }
  return clients[clientKey]
}

export const getOidcClient = (config: OauthClientConfig): OauthClient => {
  const clientKey = `oidc_${JSON.stringify(config)}`
  if (typeof clients[clientKey] === 'undefined') {
    clients[clientKey] = createOidcClient(config)
  }
  return clients[clientKey]
}
