import { ref } from 'vue'
import type { OauthClientConfig } from 'lionel-oauth-client'

import { getOauthClient } from './clientHelpers'

export default function useLionelOauthClient(config: OauthClientConfig) {
  const oauthClient = getOauthClient(config)
  const accessToken = ref<string | null>(null)
  accessToken.value = oauthClient.getAccessToken()
  const accessTokenExpires = ref<number | null>(null)
  accessTokenExpires.value = oauthClient.getAccessTokenExpires()

  oauthClient.subscribe('tokenLoaded', token => {
    accessToken.value = token
    accessTokenExpires.value = oauthClient.getAccessTokenExpires() * 1000
  })
  oauthClient.subscribe('tokenUnloaded', () => {
    accessToken.value = null
    accessTokenExpires.value = null
  })

  return {
    oauthClient,
    accessToken,
    accessTokenExpires
  }
}
