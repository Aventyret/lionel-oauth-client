import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import type { OauthClient, SignInOptions } from 'lionel-oauth-client'

import { AUTH_REDIRECT_KEY } from './constants'

export const signIn = (
  oauthClient: OauthClient,
  route: RouteRecordRaw | RouteLocationNormalized,
  signInOptions: SignInOptions,
  routePathAfterSignIn: string | null
) => {
  window.sessionStorage.setItem(
    AUTH_REDIRECT_KEY,
    routePathAfterSignIn || route.path
  )
  oauthClient.signIn(signInOptions)
}

export default signIn
