import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { OauthClientConfig, SignInOptions } from 'lionel-oauth-client'

import { getOauthClient } from './clientHelpers'
import signInWithClient from './signIn'
import handleCallbackWithClient from './handleCallback'

export const useOauthClient = (config: OauthClientConfig) => {
  const router = useRouter()
  const route = useRoute()

  if (typeof window === 'undefined') {
    return {}
  }
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

  const signIn = (
    signInOptions: SignInOptions,
    routePathAfterSignIn: string | null = null
  ) => signInWithClient(oauthClient, route, signInOptions, routePathAfterSignIn)

  const handleCallback = (defaultRoutePathAfterSignIn = '/') =>
    handleCallbackWithClient(oauthClient, router, defaultRoutePathAfterSignIn)

  return {
    oauthClient,
    accessToken,
    accessTokenExpires,
    signIn,
    handleCallback
  }
}

export default useOauthClient
