import type { Router } from 'vue-router'
import type { OauthClient } from 'lionel-oauth-client'

import { AUTH_REDIRECT_KEY } from './constants'

export const handleCallback = async (
  oauthClient: OauthClient,
  router: Router,
  defaultRoutePathAfterSignIn: string
) => {
  await oauthClient.handleCallback()
  router.push(
    window.sessionStorage.getItem(AUTH_REDIRECT_KEY) ||
      defaultRoutePathAfterSignIn
  )
}

export default handleCallback
