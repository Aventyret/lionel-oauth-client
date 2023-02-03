import { ref } from '@vue/runtime-core'
import type { Ref } from '@vue/runtime-core'
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
  const accessTokenExpires = ref<number | null>(null)
  const user = ref<User | null>(null)
  oidcClient.subscribe('tokenLoaded', token => {
    console.log('token loaded')
    accessToken.value = token
    accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
  })
  accessToken.value = oidcClient.getAccessToken()
  accessTokenExpires.value = oidcClient.getAccessTokenExpires() * 1000
  const setUser = (u: User | null) => {
    console.log('set user', u)
    user.value = u
  }
  oidcClient.getUser().then(setUser)
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
