import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type {
  OauthClient,
  OauthClientConfig,
  SignInOptions,
  User
} from 'lionel-oauth-client'

import { getOidcClient } from './clientHelpers'
import signInWithClient from './signIn'
import handleCallbackWithClient from './handleCallback'

type SetupOidcClient = {
  oidcClient?: OauthClient
  accessToken?: Ref<string | null>
  accessTokenExpires?: Ref<number | null>
  user?: Ref<User | null>
  test?: Ref<object | null>
  signIn?: (
    routePathAfterSignIn?: string,
    signInOptions?: SignInOptions
  ) => void
  handleCallback?: (
    router: Router,
    defaultRoutePathAfterSignIn?: string
  ) => Promise<void>
}

export const useOidcClient = (config: OauthClientConfig): SetupOidcClient => {
  if (typeof window === 'undefined') {
    return {}
  }
  const oidcClient = getOidcClient(config)
  const accessToken = ref<string | null>(null)
  accessToken.value = oidcClient.getAccessToken()
  const accessTokenExpires = ref<number | null>(null)
  accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
  const user = ref<User | null>(null)
  const setUser = (u: User | null) => {
    console.log('set user', u)
    user.value = u
  }
  oidcClient.getUser().then(setUser)
  oidcClient.subscribe('tokenLoaded', token => {
    console.log('token loaded')
    accessToken.value = token
    accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
  })
  oidcClient.subscribe('tokenUnloaded', () => {
    console.log('token unloaded')
    accessToken.value = null
    accessTokenExpires.value = null
  })
  oidcClient.subscribe('userLoaded', setUser)
  oidcClient.subscribe('userUnloaded', () => setUser(null))

  const signIn = (
    routePathAfterSignIn = '/',
    signInOptions: SignInOptions = {}
  ) => signInWithClient(oidcClient, signInOptions, routePathAfterSignIn || '/')

  const handleCallback = (router: Router, defaultRoutePathAfterSignIn = '/') =>
    handleCallbackWithClient(oidcClient, router, defaultRoutePathAfterSignIn)

  const test = ref<object | null>({})
  oidcClient.subscribe('userLoaded', function (u) {
    test.value = u
  })

  return {
    oidcClient,
    accessToken,
    accessTokenExpires,
    user,
    signIn,
    handleCallback,
    test
  }
}

export default useOidcClient
