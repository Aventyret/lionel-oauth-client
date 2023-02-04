import type { OauthClient, SignInOptions } from 'lionel-oauth-client'

import { AUTH_REDIRECT_KEY } from './constants'

export const signIn = (
  oauthClient: OauthClient,
  signInOptions: SignInOptions,
  routePathAfterSignIn: string
) => {
  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, routePathAfterSignIn)
  oauthClient.signIn(signInOptions)
}

export default signIn
