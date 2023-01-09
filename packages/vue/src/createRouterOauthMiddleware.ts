import type {
  OauthClient,
  OauthClientConfig,
  SignInOptions
} from 'lionel-oauth-client'
import type {
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext
} from 'vue-router'

import { AUTH_REDIRECT_KEY } from './constants'
import { getOauthClient, getOidcClient } from './clientHelpers'

const clientTypes = <const>['oauth', 'oidc']

type ClientType = (typeof clientTypes)[number]

const tokenTypes = <const>['accessToken', 'idToken']

type TokenType = (typeof tokenTypes)[number]

export type OauthMiddlewareSettings = {
  clientType: ClientType
  authenticateWith?: TokenType
  signInSilently?: boolean
}

const setDefaultSettings = (
  middleWareSettings: OauthMiddlewareSettings
): OauthMiddlewareSettings => {
  const settingsWithDefaults = { ...middleWareSettings }
  if (!settingsWithDefaults.authenticateWith) {
    settingsWithDefaults.authenticateWith =
      settingsWithDefaults.clientType === 'oidc' ? 'idToken' : 'accessToken'
  }
  if (typeof settingsWithDefaults.signInSilently === 'undefined') {
    settingsWithDefaults.signInSilently = true
  }
  return settingsWithDefaults
}

const getOidcCallbackPath = (
  oauthConfig: OauthClientConfig,
  routeBase = '/'
) => {
  const domainStartsAt = '://'
  const hostAndPath = oauthConfig.redirectUri.substr(
    oauthConfig.redirectUri.indexOf(domainStartsAt) + domainStartsAt.length
  )
  return hostAndPath
    .substr(hostAndPath.indexOf(routeBase) + routeBase.length - 1)
    .replace(/\/$/, '')
}

const routeIsOidcCallback = (
  oauthConfig: OauthClientConfig,
  route: RouteRecordRaw | RouteLocationNormalized
) => {
  if (
    route.path &&
    route.path.replace(/\/$/, '') === getOidcCallbackPath(oauthConfig)
  ) {
    return true
  }
  return false
}

const routeIsPublic = (route: RouteRecordRaw | RouteLocationNormalized) => {
  if (route.meta && route.meta.isPublic) {
    return true
  }
  if (
    route.meta &&
    Array.isArray(route.meta) &&
    route.meta.reduce((isPublic, meta) => meta.isPublic || isPublic, false)
  ) {
    return true
  }
  return false
}

const signInSilentlyOnRoute = (
  route: RouteRecordRaw | RouteLocationNormalized
) => {
  if (!route.meta) {
    return true
  }
  if (Array.isArray(route.meta) && route.meta.length === 0) {
    return true
  }
  if (
    Array.isArray(route.meta) &&
    route.meta.reduce(
      (enableSignInSilently, meta) =>
        !meta.disableSignInSilently || enableSignInSilently,
      false
    )
  ) {
    return true
  }
  return !route.meta.disableSignInSilently
}

const isAuthenticated = (
  oauthClient: OauthClient,
  middleWareSettings: OauthMiddlewareSettings
): boolean => {
  if (middleWareSettings.authenticateWith === 'idToken') {
    return !!oauthClient.getUser()
  }
  return !!oauthClient.getAccessToken()
}

export const createRouterOauthMiddleware =
  (
    oauthConfig: OauthClientConfig,
    middleWareSettings: OauthMiddlewareSettings,
    signInOptions: SignInOptions = {}
  ) =>
  (
    to: RouteLocationNormalized,
    // @ts-ignore
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    if (routeIsOidcCallback(oauthConfig, to)) {
      return next()
    }
    const settings = setDefaultSettings(middleWareSettings)
    const client =
      settings.clientType === 'oidc'
        ? getOidcClient(oauthConfig)
        : getOauthClient(oauthConfig)
    const authenticated = isAuthenticated(client, settings)

    if (routeIsPublic(to)) {
      if (
        !authenticated &&
        settings.signInSilently &&
        signInSilentlyOnRoute(to)
      ) {
        client.signInSilently(signInOptions)
      }
      return next()
    }
    if (authenticated) {
      return next()
    }
    const signInSilentlyPromise = settings.signInSilently
      ? client.signInSilently(signInOptions)
      : Promise.reject('Sign in silently is not enabled in middleware')
    signInSilentlyPromise
      .then(() => {
        return next()
      })
      .catch(() => {
        window.sessionStorage.setItem(AUTH_REDIRECT_KEY, to.fullPath)
        client.signIn(signInOptions)
      })
  }

export default createRouterOauthMiddleware
