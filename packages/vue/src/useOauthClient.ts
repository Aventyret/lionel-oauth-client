import { ref } from '@vue/runtime-core'
import type { Router } from 'vue-router'
import type { OauthClientConfig, SignInOptions } from 'lionel-oauth-client'

import { getOauthClient } from './clientHelpers'
import signInWithClient from './signIn'
import handleCallbackWithClient from './handleCallback'

export const useOauthClient = (config: OauthClientConfig) => {
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
    routePathAfterSignIn = '/',
    signInOptions: SignInOptions = {}
  ) => signInWithClient(oauthClient, signInOptions, routePathAfterSignIn || '/')

  const handleCallback = (router: Router, defaultRoutePathAfterSignIn = '/') =>
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
