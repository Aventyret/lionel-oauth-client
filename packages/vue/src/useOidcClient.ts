import { ref } from 'vue'
import type { OauthClientConfig, User } from 'lionel-oauth-client'

import { getOidcClient } from './clientHelpers'

export default function useLionelOidcClient(config: OauthClientConfig) {
  const oidcClient = getOidcClient(config)
  const accessToken = ref<string | null>(null)
  accessToken.value = oidcClient.getAccessToken()
  const accessTokenExpires = ref<number | null>(null)
  accessTokenExpires.value = oidcClient.getAccessTokenExpires()
  const user = ref<User | null>(null)
  oidcClient.getUser().then(u => (user.value = u))
  oidcClient.subscribe('tokenLoaded', token => {
    accessToken.value = token
    accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
  })
  oidcClient.subscribe('tokenUnloaded', () => {
    accessToken.value = null
    accessTokenExpires.value = null
  })
  oidcClient.subscribe('userLoaded', user => {
    user.value = user
  })
  oidcClient.subscribe('userUnloaded', () => {
    user.value = null
  })

  return {
    oidcClient,
    accessToken,
    accessTokenExpires,
    user
  }
}
