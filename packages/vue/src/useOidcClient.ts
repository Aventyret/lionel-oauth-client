import { ref } from 'vue'
import type { Router } from 'vue-router'
import type {
  OauthClientConfig,
  SignInOptions,
  User
} from 'lionel-oauth-client'

import { getOidcClient } from './clientHelpers'
import signInWithClient from './signIn'
import handleCallbackWithClient from './handleCallback'

export const useOidcClient = (config: OauthClientConfig) => {
  if (typeof window === 'undefined') {
    return {}
  }
  const oidcClient = getOidcClient(config)
  const accessToken = ref<string | null>(null)
  accessToken.value = oidcClient.getAccessToken()
  const accessTokenExpires = ref<number | null>(null)
  accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
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
  oidcClient.subscribe('userLoaded', u => {
    user.value = u
  })
  oidcClient.subscribe('userUnloaded', () => {
    user.value = null
  })

  const signIn = (
    routePathAfterSignIn = '/',
    signInOptions: SignInOptions = {}
  ) => signInWithClient(oidcClient, signInOptions, routePathAfterSignIn || '/')

  const handleCallback = (router: Router, defaultRoutePathAfterSignIn = '/') =>
    handleCallbackWithClient(oidcClient, router, defaultRoutePathAfterSignIn)

  return {
    oidcClient,
    accessToken,
    accessTokenExpires,
    user,
    signIn,
    handleCallback
  }
}

export default useOidcClient
