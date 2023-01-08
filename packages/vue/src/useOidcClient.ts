import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type {
  OauthClientConfig,
  SignInOptions,
  User
} from 'lionel-oauth-client'

import { getOidcClient } from './clientHelpers'
import signInWithClient from './signIn'
import handleCallbackWithClient from './handleCallback'

export const useOidcClient = (config: OauthClientConfig) => {
  const router = useRouter()
  const route = useRoute()

  if (typeof window === 'undefined') {
    return {}
  }
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

  const signIn = (
    signInOptions: SignInOptions,
    routePathAfterSignIn: string | null = null
  ) => signInWithClient(oidcClient, route, signInOptions, routePathAfterSignIn)

  const handleCallback = (defaultRoutePathAfterSignIn = '/') =>
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
